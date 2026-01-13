import React, { useEffect, useRef } from 'react';
import { X, Download, FileText, Image, Video, File } from 'lucide-react';
import './DocumentPreviewModal.css';

export interface PreviewDocument {
    name: string;
    type: string;
    url: string;
    uploadedAt?: string;
}

interface DocumentPreviewModalProps {
    document: PreviewDocument | null;
    onClose: () => void;
}

const getFileType = (filename: string, mimeType?: string): 'pdf' | 'image' | 'video' | 'document' | 'unknown' => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    if (ext === 'pdf' || mimeType?.includes('pdf')) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) || mimeType?.startsWith('image/')) return 'image';
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext) || mimeType?.startsWith('video/')) return 'video';
    if (['doc', 'docx', 'ppt', 'pptx', 'txt', 'rtf'].includes(ext)) return 'document';

    return 'unknown';
};

const getFileIcon = (type: ReturnType<typeof getFileType>) => {
    switch (type) {
        case 'pdf': return FileText;
        case 'image': return Image;
        case 'video': return Video;
        default: return File;
    }
};

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
    document,
    onClose
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Focus trap and escape key
    useEffect(() => {
        if (!document) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        // Focus close button on open
        closeButtonRef.current?.focus();
        document.body?.classList.add('modal-open');
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body?.classList.remove('modal-open');
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [document, onClose]);

    if (!document) return null;

    const fileType = getFileType(document.name, document.type);
    const FileIcon = getFileIcon(fileType);

    const renderPreview = () => {
        switch (fileType) {
            case 'pdf':
                return (
                    <iframe
                        src={document.url}
                        className="dpm__iframe"
                        title={`Preview of ${document.name}`}
                    />
                );
            case 'image':
                return (
                    <img
                        src={document.url}
                        alt={document.name}
                        className="dpm__image"
                    />
                );
            case 'video':
                return (
                    <video
                        src={document.url}
                        controls
                        className="dpm__video"
                        aria-label={`Video: ${document.name}`}
                    >
                        Your browser does not support video playback.
                    </video>
                );
            case 'document':
                return (
                    <div className="dpm__unsupported">
                        <FileIcon size={48} />
                        <p>Preview unavailable for this file type</p>
                        <a
                            href={document.url}
                            download={document.name}
                            className="dpm__download-btn"
                        >
                            <Download size={16} /> Download to view
                        </a>
                    </div>
                );
            default:
                return (
                    <div className="dpm__unsupported">
                        <File size={48} />
                        <p>Preview not available</p>
                        <a
                            href={document.url}
                            download={document.name}
                            className="dpm__download-btn"
                        >
                            <Download size={16} /> Download file
                        </a>
                    </div>
                );
        }
    };

    return (
        <div
            className="dpm__overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dpm-title"
        >
            <div
                ref={modalRef}
                className="dpm__modal"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="dpm__header">
                    <div className="dpm__title-row">
                        <FileIcon size={18} className="dpm__file-icon" />
                        <div className="dpm__title-info">
                            <h2 id="dpm-title" className="dpm__title">{document.name}</h2>
                            <span className="dpm__meta">
                                {fileType.toUpperCase()}
                                {document.uploadedAt && ` • Uploaded ${document.uploadedAt}`}
                            </span>
                        </div>
                    </div>
                    <div className="dpm__actions">
                        <a
                            href={document.url}
                            download={document.name}
                            className="dpm__action-btn"
                            aria-label="Download file"
                        >
                            <Download size={16} />
                        </a>
                        <button
                            ref={closeButtonRef}
                            className="dpm__action-btn dpm__action-btn--close"
                            onClick={onClose}
                            aria-label="Close preview"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </header>
                <div className="dpm__content">
                    {renderPreview()}
                </div>
            </div>
        </div>
    );
};

export default DocumentPreviewModal;
