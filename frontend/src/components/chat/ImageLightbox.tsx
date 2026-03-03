import React, { useEffect, useCallback } from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

interface ImageLightboxProps {
    url: string;
    onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ url, onClose }) => {
    const [scale, setScale] = useState(1);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="lightbox-backdrop" onClick={handleBackdropClick}>
            <div className="lightbox-toolbar">
                <button
                    className="lightbox-btn"
                    onClick={() => setScale(s => Math.min(s + 0.25, 3))}
                    title="Zoom in"
                >
                    <ZoomIn size={20} />
                </button>
                <button
                    className="lightbox-btn"
                    onClick={() => setScale(s => Math.max(s - 0.25, 0.25))}
                    title="Zoom out"
                >
                    <ZoomOut size={20} />
                </button>
                <a
                    href={url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="lightbox-btn"
                    title="Download"
                >
                    <Download size={20} />
                </a>
                <button className="lightbox-btn lightbox-btn--close" onClick={onClose} title="Close">
                    <X size={20} />
                </button>
            </div>
            <div className="lightbox-content" onClick={handleBackdropClick}>
                <img
                    src={url}
                    alt="Full size"
                    className="lightbox-img"
                    style={{ transform: `scale(${scale})` }}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    );
};

export default ImageLightbox;
