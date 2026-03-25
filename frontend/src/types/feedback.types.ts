export type FeedbackSeverity = 'BUG' | 'UI_ISSUE' | 'SUGGESTION' | 'IMPROVEMENT' | 'QUESTION';

export type FeedbackCategory = 'UI' | 'PERFORMANCE' | 'LOGIC' | 'FEATURE' | 'SECURITY' | 'DATA';

export type FeedbackStatus = 'NEW' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'WONT_FIX';

export type SelectionMode = 'idle' | 'selecting' | 'selected' | 'submitting';

export interface FeedbackPayload {
  pageRoute: string;
  pageTitle: string;
  section: string;
  browser: string;
  screenSize: string;
  severity: FeedbackSeverity;
  category: FeedbackCategory;
  subject: string;
  description: string;
  stepsToReproduce?: string;
  screenshotUrl?: string;
}

export interface ElementSelection {
  cssSelector: string;
  nthChildIndex: number[];
  boundingBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  semanticLabel: string;
  visibleText: string;
  elementPath: string;
}

export interface BetaFeedback extends FeedbackPayload {
  id: number;
  userId: number;
  testerName: string;
  testerEmail: string;
  testerRole: string;
  status: FeedbackStatus;
  priorityScore?: number;
  adminNotes?: string;
  submittedAt: string;
  sessionId: string;
  elementPath?: string;
  elementSelector?: string;
  elementNthChild?: string;
  elementSemanticLabel?: string;
  elementBoundingBox?: string;
}

export interface ElementFeedbackPayload extends FeedbackPayload {
  elementSelection: ElementSelection;
  reporterId?: number;
  timestamp: string;
}

export interface PendingFeedback extends FeedbackPayload {
  timestamp: number;
  sessionId: string;
  userId?: number;
  userName?: string;
  userEmail?: string;
  elementSelection?: ElementSelection;
}

export interface FeedbackStats {
  totalCount: number;
  bugCount: number;
  uiIssueCount: number;
  suggestionCount: number;
  improvementCount: number;
  questionCount: number;
  openCount: number;
  resolvedCount: number;
  byPage: Record<string, number>;
  byCategory: Record<FeedbackCategory, number>;
  bySeverity: Record<FeedbackSeverity, number>;
  byStatus: Record<FeedbackStatus, number>;
}

export interface PageFeedbackBreakdown {
  pageRoute: string;
  totalIssues: number;
  bugCount: number;
  uiIssueCount: number;
  suggestionCount: number;
  improvementCount: number;
  questionCount: number;
  healthScore: number;
}

export interface UpdateFeedbackStatusRequest {
  status: FeedbackStatus;
  priorityScore?: number;
  adminNotes?: string;
}