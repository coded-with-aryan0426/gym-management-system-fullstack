import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useFeature } from '../../hooks/useFeature';
import { FeedbackButton } from './FeedbackButton';
import { FeedbackModal } from './FeedbackModal';
import { ElementSelector } from './ElementSelector';
import { ElementFeedbackModal } from './ElementFeedbackModal';
import {
  buildFeedbackPayload,
  getPendingFeedback,
  clearPendingFeedback,
  generateSessionId,
  getSessionId,
} from '../../utils/feedback.utils';
import { useSelection } from '../../contexts/SelectionContext';
import type { FeedbackSeverity, FeedbackCategory, ElementSelection } from '../../types/feedback.types';
import api from '../../services/api';

export function FeedbackWidget() {
  const isEnabled = useFeature('feedback_widget');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { mode, selectedElement, startSelection, clearSelection } = useSelection();

  useEffect(() => {
    generateSessionId();
  }, []);

  useEffect(() => {
    const pending = getPendingFeedback();
    setPendingCount(pending.length);
  }, [isModalOpen]);

  const getCurrentUser = () => {
    try {
      const port = typeof window !== 'undefined' ? window.location.port || '5173' : '5173';
      const userStr = localStorage.getItem(`user_port_${port}`) || localStorage.getItem('authUser');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch {
    }
    return null;
  };

  const retryPendingFeedback = useCallback(async () => {
    const pending = getPendingFeedback();
    if (pending.length === 0) return;
    const user = getCurrentUser();

    for (const feedback of pending) {
      try {
        await api.addBetaFeedback({
          userId: user?.id || null,
          testerName: user?.fullName || user?.name || 'Anonymous',
          testerEmail: user?.email || 'anonymous@gym.com',
          testerRole: user?.role || 'MEMBER',
          pageRoute: feedback.pageRoute,
          pageTitle: feedback.pageTitle,
          section: feedback.section,
          browser: feedback.browser,
          screenSize: feedback.screenSize,
          severity: feedback.severity,
          category: feedback.category,
          subject: feedback.subject,
          description: feedback.description,
          stepsToReproduce: feedback.stepsToReproduce,
          screenshotUrl: feedback.screenshotUrl,
        });
        const key = `feedback_pending_${feedback.timestamp}`;
        clearPendingFeedback(key);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 400 || status === 401 || status === 403) {
            const key = `feedback_pending_${feedback.timestamp}`;
            clearPendingFeedback(key);
            setPendingCount((prev) => Math.max(0, prev - 1));
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isEnabled) {
      retryPendingFeedback();
    }
  }, [isEnabled, retryPendingFeedback]);

  const handleButtonClick = () => {
    if (mode === 'idle') {
      startSelection();
      setIsModalOpen(true);
    } else if (mode === 'selecting' || mode === 'selected') {
      setIsModalOpen(true);
    }
  };

  const handleElementConfirm = (selection: ElementSelection) => {
    setIsModalOpen(true);
  };

  const handleElementSelectionCancel = () => {
    clearSelection();
    setIsModalOpen(false);
  };

  const handleSubmit = async (data: {
    severity: FeedbackSeverity;
    category: FeedbackCategory;
    subject: string;
    description: string;
    stepsToReproduce?: string;
  }) => {
    setIsSubmitting(true);
    try {
      const section = selectedElement ? selectedElement.semanticLabel : '';
      const payload = buildFeedbackPayload(
        section,
        data.severity,
        data.category,
        data.subject,
        data.description,
        data.stepsToReproduce
      );

      const key = `feedback_pending_${Date.now()}`;
      localStorage.setItem(key, JSON.stringify({ ...payload, timestamp: Date.now() }));
      setPendingCount((prev) => prev + 1);
      const currentUser = getCurrentUser();
      const userId = Number(currentUser?.id ?? payload.userId);

      try {
        if (!Number.isFinite(userId)) {
          throw new Error('User not authenticated');
        }
        await api.addBetaFeedback({
          userId,
          testerName: currentUser?.fullName || currentUser?.name || payload.userName || 'Anonymous',
          testerEmail: currentUser?.email || payload.userEmail || 'anonymous@gym.com',
          testerRole: currentUser?.role || 'MEMBER',
          pageRoute: payload.pageRoute,
          pageTitle: payload.pageTitle,
          section: payload.section,
          browser: payload.browser,
          screenSize: payload.screenSize,
          severity: payload.severity,
          category: payload.category,
          subject: payload.subject,
          description: payload.description,
          stepsToReproduce: payload.stepsToReproduce,
          screenshotUrl: payload.screenshotUrl,
          elementPath: selectedElement?.elementPath,
          elementSelector: selectedElement?.cssSelector,
          elementNthChild: selectedElement?.nthChildIndex,
          elementSemanticLabel: selectedElement?.semanticLabel,
          elementBoundingBox: selectedElement?.boundingBox,
        });
        localStorage.removeItem(key);
        setPendingCount((prev) => Math.max(0, prev - 1));
        toast.success('Feedback submitted successfully!');
        clearSelection();
        setIsModalOpen(false);
      } catch (apiError) {
        if (axios.isAxiosError(apiError)) {
          const status = apiError.response?.status;
          if (status === 400 || status === 401 || status === 403) {
            localStorage.removeItem(key);
            setPendingCount((prev) => Math.max(0, prev - 1));
            toast.error('Feedback submission was rejected. Please login again and try.');
            setIsModalOpen(false);
            return;
          }
        }
        toast.success('Feedback saved locally - will retry when online');
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleElementSubmit = async (data: {
    severity: FeedbackSeverity;
    subject: string;
    description: string;
    screenshotUrl?: string;
  }) => {
    if (!selectedElement) return;

    setIsSubmitting(true);
    try {
      const currentUser = getCurrentUser();
      const userId = Number(currentUser?.id);

      const payload = {
        userId: Number.isFinite(userId) ? userId : null,
        testerName: currentUser?.fullName || currentUser?.name || 'Anonymous',
        testerEmail: currentUser?.email || 'anonymous@gym.com',
        testerRole: currentUser?.role || 'MEMBER',
        pageRoute: window.location.pathname,
        pageTitle: document.title,
        section: selectedElement.semanticLabel,
        browser: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        severity: data.severity,
        category: 'UI' as FeedbackCategory,
        subject: data.subject,
        description: data.description,
        screenshotUrl: data.screenshotUrl,
        elementPath: selectedElement.elementPath,
        elementSelector: selectedElement.cssSelector,
        elementNthChild: selectedElement.nthChildIndex.join(','),
        elementSemanticLabel: selectedElement.semanticLabel,
        elementBoundingBox: JSON.stringify(selectedElement.boundingBox),
        sessionId: getSessionId(),
      };

      const response = await api.addBetaFeedback(payload);
      const ticketId = (response as any)?.data?.id || Date.now();
      toast.success(`Feedback submitted! Ticket ID: ${ticketId}`);
      clearSelection();
      setIsModalOpen(false);

      setTimeout(() => {
        toast.success('Thank you for your feedback!');
      }, 100);
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      <FeedbackButton
        onClick={handleButtonClick}
        pendingCount={pendingCount}
      />
      {mode !== 'idle' && selectedElement && (
        <ElementFeedbackModal
          isOpen={isModalOpen && mode === 'selected'}
          onClose={() => {
            setIsModalOpen(false);
          }}
          onSubmit={handleElementSubmit}
          elementSelection={selectedElement}
          isSubmitting={isSubmitting}
        />
      )}
      {mode === 'selecting' && (
        <ElementSelector
          onConfirm={handleElementConfirm}
          onCancel={handleElementSelectionCancel}
        />
      )}
    </>
  );
}

export default FeedbackWidget;