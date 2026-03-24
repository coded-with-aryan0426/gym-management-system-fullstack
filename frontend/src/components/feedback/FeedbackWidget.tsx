import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useFeature } from '../../hooks/useFeature';
import { FeedbackButton } from './FeedbackButton';
import { FeedbackModal } from './FeedbackModal';
import {
  buildFeedbackPayload,
  getPendingFeedback,
  clearPendingFeedback,
  generateSessionId,
} from '../../utils/feedback.utils';
import api from '../../services/api';
import type { FeedbackSeverity, FeedbackCategory, PendingFeedback } from '../../types/feedback.types';

interface FeedbackWidgetProps {
  section?: string;
}

export function FeedbackWidget({ section = '' }: FeedbackWidgetProps) {
  const isEnabled = useFeature('feedback_widget');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    generateSessionId();
  }, []);

  useEffect(() => {
    const pending = getPendingFeedback();
    setPendingCount(pending.length);
  }, [isModalOpen]);

  const retryPendingFeedback = useCallback(async () => {
    const pending = getPendingFeedback();
    if (pending.length === 0) return;

    for (const feedback of pending) {
      try {
        await api.addBetaFeedback({
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
        console.warn('Failed to retry feedback:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (isEnabled) {
      retryPendingFeedback();
    }
  }, [isEnabled, retryPendingFeedback]);

  const handleSubmit = async (data: {
    severity: FeedbackSeverity;
    category: FeedbackCategory;
    subject: string;
    description: string;
    stepsToReproduce?: string;
  }) => {
    setIsSubmitting(true);
    try {
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

      try {
        await api.addBetaFeedback({
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
        });
        localStorage.removeItem(key);
        setPendingCount((prev) => Math.max(0, prev - 1));
        toast.success('Feedback submitted successfully!');
        setIsModalOpen(false);
      } catch (apiError) {
        console.warn('API submission failed, saved locally:', apiError);
        toast.success('Feedback saved locally - will retry when online');
        setIsModalOpen(false);
      }
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
        onClick={() => setIsModalOpen(true)}
        pendingCount={pendingCount}
      />
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        section={section}
        isSubmitting={isSubmitting}
      />
    </>
  );
}

export default FeedbackWidget;