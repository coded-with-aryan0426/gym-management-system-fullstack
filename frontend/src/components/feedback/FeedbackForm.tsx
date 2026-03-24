import { useState, useEffect } from 'react';
import type { FeedbackSeverity, FeedbackCategory } from '../../types/feedback.types';
import { getFeedbackContext } from '../../utils/feedback.utils';

interface FeedbackFormProps {
  section: string;
  onSubmit: (data: {
    severity: FeedbackSeverity;
    category: FeedbackCategory;
    subject: string;
    description: string;
    stepsToReproduce?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const SEVERITY_OPTIONS: { value: FeedbackSeverity; label: string; color: string }[] = [
  { value: 'BUG', label: 'Bug', color: '#ef4444' },
  { value: 'UI_ISSUE', label: 'UI Issue', color: '#f97316' },
  { value: 'SUGGESTION', label: 'Suggestion', color: '#22c55e' },
  { value: 'IMPROVEMENT', label: 'Improvement', color: '#3b82f6' },
  { value: 'QUESTION', label: 'Question', color: '#8b5cf6' },
];

const CATEGORY_OPTIONS: { value: FeedbackCategory; label: string }[] = [
  { value: 'UI', label: 'User Interface' },
  { value: 'PERFORMANCE', label: 'Performance' },
  { value: 'LOGIC', label: 'Logic / Functionality' },
  { value: 'FEATURE', label: 'Feature Request' },
  { value: 'SECURITY', label: 'Security' },
  { value: 'DATA', label: 'Data / Storage' },
];

export function FeedbackForm({ section, onSubmit, onCancel, isSubmitting }: FeedbackFormProps) {
  const [severity, setSeverity] = useState<FeedbackSeverity>('BUG');
  const [category, setCategory] = useState<FeedbackCategory>('UI');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [context, setContext] = useState({
    pageRoute: '',
    pageTitle: '',
    browser: '',
    screenSize: '',
  });

  useEffect(() => {
    const ctx = getFeedbackContext();
    setContext({
      pageRoute: ctx.pageRoute,
      pageTitle: ctx.pageTitle,
      browser: ctx.browser.substring(0, 50) + (ctx.browser.length > 50 ? '...' : ''),
      screenSize: ctx.screenSize,
    });
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!subject.trim()) newErrors.subject = 'Subject is required';
    if (subject.length > 200) newErrors.subject = 'Subject must be 200 characters or less';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (description.length > 2000) newErrors.description = 'Description must be 2000 characters or less';
    if (severity === 'BUG' && !stepsToReproduce.trim()) {
      newErrors.stepsToReproduce = 'Steps to reproduce are required for bugs';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ severity, category, subject, description, stepsToReproduce: stepsToReproduce || undefined });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px' }}>
        <div>
          <span style={{ color: '#64748b', fontWeight: 500 }}>Page:</span>
          <span style={{ marginLeft: '8px', color: '#1e293b' }}>{context.pageRoute}</span>
        </div>
        <div>
          <span style={{ color: '#64748b', fontWeight: 500 }}>Section:</span>
          <span style={{ marginLeft: '8px', color: '#1e293b' }}>{section || 'N/A'}</span>
        </div>
        <div>
          <span style={{ color: '#64748b', fontWeight: 500 }}>Browser:</span>
          <span style={{ marginLeft: '8px', color: '#1e293b' }}>{context.browser}</span>
        </div>
        <div>
          <span style={{ color: '#64748b', fontWeight: 500 }}>Screen:</span>
          <span style={{ marginLeft: '8px', color: '#1e293b' }}>{context.screenSize}</span>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#1e293b' }}>
          Severity *
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {SEVERITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSeverity(option.value)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: `2px solid ${severity === option.value ? option.color : '#e2e8f0'}`,
                background: severity === option.value ? `${option.color}15` : 'white',
                color: severity === option.value ? option.color : '#64748b',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#1e293b' }}>
          Category *
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '14px',
            color: '#1e293b',
            background: 'white',
            cursor: 'pointer',
          }}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#1e293b' }}>
          Subject * ({subject.length}/200)
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={200}
          placeholder="Brief summary of the issue"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: `1px solid ${errors.subject ? '#ef4444' : '#e2e8f0'}`,
            fontSize: '14px',
            color: '#1e293b',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {errors.subject && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.subject}</span>}
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#1e293b' }}>
          Description * ({description.length}/2000)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Describe the issue in detail..."
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: `1px solid ${errors.description ? '#ef4444' : '#e2e8f0'}`,
            fontSize: '14px',
            color: '#1e293b',
            outline: 'none',
            resize: 'vertical',
            minHeight: '80px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
        {errors.description && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.description}</span>}
      </div>

      {severity === 'BUG' && (
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#1e293b' }}>
            Steps to Reproduce * ({stepsToReproduce.length}/500)
          </label>
          <textarea
            value={stepsToReproduce}
            onChange={(e) => setStepsToReproduce(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: `1px solid ${errors.stepsToReproduce ? '#ef4444' : '#e2e8f0'}`,
              fontSize: '14px',
              color: '#1e293b',
              outline: 'none',
              resize: 'vertical',
              minHeight: '60px',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          {errors.stepsToReproduce && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.stepsToReproduce}</span>}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: 'white',
            color: '#64748b',
            fontSize: '14px',
            fontWeight: 500,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.6 : 1,
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>
    </form>
  );
}

export default FeedbackForm;