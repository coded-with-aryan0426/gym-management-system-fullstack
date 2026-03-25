import React, { useEffect, useRef, useCallback, useState } from 'react';
import { X, Upload, Camera, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import type { ElementSelection, FeedbackSeverity } from '../../types/feedback.types';
import { captureElementScreenshot } from '../../contexts/SelectionContext';

interface ElementFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    severity: FeedbackSeverity;
    subject: string;
    description: string;
    screenshotUrl?: string;
  }) => Promise<void>;
  elementSelection: ElementSelection;
  isSubmitting?: boolean;
}

const SEVERITY_OPTIONS: { value: FeedbackSeverity; label: string; color: string }[] = [
  { value: 'BUG', label: 'Low', color: '#22c55e' },
  { value: 'UI_ISSUE', label: 'Medium', color: '#f59e0b' },
  { value: 'SUGGESTION', label: 'High', color: '#f97316' },
  { value: 'IMPROVEMENT', label: 'Critical', color: '#ef4444' },
];

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function ElementFeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  elementSelection,
  isSubmitting,
}: ElementFeedbackModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [severity, setSeverity] = useState<FeedbackSeverity>('BUG');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCapturing, setIsCapturing] = useState(false);

  const bgColor = isDark ? '#1e293b' : 'white';
  const textColor = isDark ? '#f1f5f9' : '#1e293b';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const inputBg = isDark ? '#0f172a' : '#f8fafc';

  useEffect(() => {
    if (isOpen && elementSelection) {
      captureScreenshot();
    }
  }, [isOpen, elementSelection]);

  const captureScreenshot = async () => {
    setIsCapturing(true);
    try {
      const element = document.querySelector(elementSelection.elementPath) as HTMLElement;
      if (element) {
        const dataUrl = await captureElementScreenshot(element);
        if (dataUrl) {
          setScreenshotUrl(dataUrl);
        }
      }
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, file: 'Only JPG, PNG, and MP4 files are allowed' }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, file: 'File size must be less than 5 MB' }));
      return;
    }

    setUploadedFile(file);
    setErrors((prev) => ({ ...prev, file: '' }));

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (subject.length > 200) {
      newErrors.subject = 'Subject must be 200 characters or less';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    } else if (description.length > 2000) {
      newErrors.description = 'Description must be 2000 characters or less';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      severity,
      subject,
      description,
      screenshotUrl: screenshotUrl || undefined,
    });
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);

      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="element-feedback-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10001,
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        ref={modalRef}
        style={{
          background: bgColor,
          borderRadius: '16px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <h2
            id="element-feedback-modal-title"
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: textColor,
            }}
          >
            Element Feedback
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              background: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
              color: mutedColor,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              padding: '12px',
              background: inputBg,
              borderRadius: '8px',
              fontSize: '12px',
              border: `1px solid ${borderColor}`,
            }}
          >
            <div>
              <span style={{ color: mutedColor, fontWeight: 500 }}>Page:</span>
              <span style={{ marginLeft: '8px', color: textColor }}>{window.location.pathname}</span>
            </div>
            <div>
              <span style={{ color: mutedColor, fontWeight: 500 }}>Section:</span>
              <span style={{ marginLeft: '8px', color: textColor }}>{elementSelection.semanticLabel}</span>
            </div>
            <div>
              <span style={{ color: mutedColor, fontWeight: 500 }}>Browser:</span>
              <span style={{ marginLeft: '8px', color: textColor, fontSize: '11px' }}>
                {navigator.userAgent.substring(0, 40)}...
              </span>
            </div>
            <div>
              <span style={{ color: mutedColor, fontWeight: 500 }}>Screen:</span>
              <span style={{ marginLeft: '8px', color: textColor }}>{window.screen.width} x {window.screen.height}</span>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <span style={{ color: mutedColor, fontWeight: 500 }}>Element path:</span>
              <span
                style={{
                  marginLeft: '8px',
                  color: textColor,
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  wordBreak: 'break-all',
                }}
                title={elementSelection.elementPath}
              >
                {elementSelection.elementPath}
              </span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: textColor }}>
              Severity *
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {SEVERITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSeverity(option.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: `2px solid ${severity === option.value ? option.color : borderColor}`,
                    background: severity === option.value ? `${option.color}20` : bgColor,
                    color: severity === option.value ? option.color : mutedColor,
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
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: textColor }}>
              Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue"
              maxLength={200}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${errors.subject ? '#ef4444' : borderColor}`,
                background: inputBg,
                color: textColor,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {errors.subject && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.subject}</p>
            )}
          </div>

          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: textColor }}>
              <span>Describe the issue or suggestion *</span>
              <span style={{ color: mutedColor, fontSize: '12px' }}>
                {description.length}/2000
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the issue in detail (minimum 20 characters)"
              rows={5}
              maxLength={2000}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${errors.description ? '#ef4444' : borderColor}`,
                background: inputBg,
                color: textColor,
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                minHeight: '100px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            {errors.description && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.description}</p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: textColor }}>
              Screenshot (optional)
            </label>
            <div
              style={{
                border: `2px dashed ${errors.file ? '#ef4444' : borderColor}`,
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: inputBg,
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_FILE_TYPES.join(',')}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              {screenshotUrl || uploadedFile ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  {isCapturing ? (
                    <Camera size={32} color={mutedColor} />
                  ) : (
                    <img
                      src={screenshotUrl || undefined}
                      alt="Screenshot preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '150px',
                        borderRadius: '4px',
                        objectFit: 'contain',
                      }}
                    />
                  )}
                  {uploadedFile && (
                    <span style={{ fontSize: '12px', color: mutedColor }}>
                      {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                  <span style={{ fontSize: '12px', color: '#3b82f6' }}>Click to change file</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Upload size={32} color={mutedColor} />
                  <span style={{ color: mutedColor, fontSize: '13px' }}>
                    Click to upload JPG, PNG, or MP4 (max 5 MB)
                  </span>
                  <span style={{ color: mutedColor, fontSize: '12px' }}>
                    A screenshot of the selected element will be captured automatically
                  </span>
                </div>
              )}
            </div>
            {errors.file && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.file}</p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: `1px solid ${borderColor}`,
                background: bgColor,
                color: textColor,
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                fontSize: '14px',
                fontWeight: 500,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default ElementFeedbackModal;