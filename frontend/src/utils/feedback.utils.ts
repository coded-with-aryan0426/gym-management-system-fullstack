import type { PendingFeedback } from '../types/feedback.types';

const PENDING_FEEDBACK_PREFIX = 'feedback_pending_';
const SESSION_ID_KEY = 'feedback_session_id';

export function generateSessionId(): string {
  const existing = localStorage.getItem(SESSION_ID_KEY);
  if (existing) return existing;

  const sessionId = crypto.randomUUID();
  localStorage.setItem(SESSION_ID_KEY, sessionId);
  return sessionId;
}

export function getSessionId(): string {
  return localStorage.getItem(SESSION_ID_KEY) || generateSessionId();
}

export function savePendingFeedback(feedback: Omit<PendingFeedback, 'timestamp'>): string {
  const timestamp = Date.now();
  const key = `${PENDING_FEEDBACK_PREFIX}${timestamp}`;
  const pendingFeedback: PendingFeedback = {
    ...feedback,
    timestamp,
  };
  localStorage.setItem(key, JSON.stringify(pendingFeedback));
  return key;
}

export function getPendingFeedback(): PendingFeedback[] {
  const pending: PendingFeedback[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PENDING_FEEDBACK_PREFIX)) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          pending.push(JSON.parse(data));
        }
      } catch {
        console.warn(`Failed to parse pending feedback: ${key}`);
      }
    }
  }
  return pending.sort((a, b) => a.timestamp - b.timestamp);
}

export function clearPendingFeedback(key: string): void {
  localStorage.removeItem(key);
}

export function clearAllPendingFeedback(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PENDING_FEEDBACK_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

export function getPendingFeedbackCount(): number {
  let count = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PENDING_FEEDBACK_PREFIX)) {
      count++;
    }
  }
  return count;
}

export function captureScreenshot(element?: HTMLElement): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const target = element || document.documentElement;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        resolve(null);
        return;
      }

      canvas.width = target.scrollWidth;
      canvas.height = target.scrollHeight;

      const image = new Image();
      const svgData = new XMLSerializer().serializeToString(document.documentElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      image.onload = () => {
        context.drawImage(image, 0, 0);
        URL.revokeObjectURL(url);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };

      image.src = url;

      setTimeout(() => resolve(null), 5000);
    } catch {
      resolve(null);
    }
  });
}

export function getFeedbackContext() {
  return {
    pageRoute: window.location.pathname,
    pageTitle: document.title,
    browser: navigator.userAgent,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    sessionId: getSessionId(),
  };
}

export function extractUserInfoFromToken(): { userId?: number; userName?: string; userEmail?: string } {
  try {
    const storageKey = (key: string): string => {
      const port = typeof window !== 'undefined' ? window.location.port || '5173' : '5173';
      return `${key}_port_${port}`;
    };
    const token = localStorage.getItem(storageKey('token'));
    if (!token) return {};

    const parts = token.split('.');
    if (parts.length !== 3) return {};

    const payload = JSON.parse(atob(parts[1]));
    const rawUserId = payload.id ?? payload.userId ?? payload.sub;
    const parsedUserId = typeof rawUserId === 'number' ? rawUserId : Number(rawUserId);
    return {
      userId: Number.isFinite(parsedUserId) ? parsedUserId : undefined,
      userName: payload.fullName || payload.name || payload.username,
      userEmail: payload.email,
    };
  } catch {
    return {};
  }
}

export function buildFeedbackPayload(
  section: string,
  severity: PendingFeedback['severity'],
  category: PendingFeedback['category'],
  subject: string,
  description: string,
  stepsToReproduce?: string,
  screenshotUrl?: string
): Omit<PendingFeedback, 'timestamp'> {
  const context = getFeedbackContext();
  const userInfo = extractUserInfoFromToken();

  return {
    ...context,
    section,
    severity,
    category,
    subject,
    description,
    stepsToReproduce,
    screenshotUrl,
    ...userInfo,
  };
}
