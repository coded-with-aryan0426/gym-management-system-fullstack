/**
 * Smart GMS Diagram Download Utility
 * Provides PNG download functionality for SVG diagrams in the report
 * 
 * Features:
 * - Client-side SVG to PNG conversion using Canvas API
 * - Support for high-resolution (2x) exports
 * - Proper filename generation from figure title
 * - Both SVG-generated and pre-rendered PNG download options
 */

class DiagramDownloader {
    constructor() {
        this.pngMapping = this.initializePngMapping();
        this.init();
    }

    /**
     * Map figure IDs to pre-rendered PNG files
     */
    initializePngMapping() {
        return {
            // UML Diagrams
            'fig-6-1': 'mermaid_uml_diagrams_0.png',
            'fig-6-2': 'mermaid_uml_diagrams_1.png',
            'fig-6-3': 'mermaid_uml_diagrams_2.png',
            'fig-6-4': 'mermaid_uml_diagrams_3.png',
            'fig-6-5': 'mermaid_uml_diagrams_4.png',
            'fig-6-6': 'mermaid_uml_diagrams_5.png',
            'fig-6-7': 'mermaid_uml_diagrams_6.png',
            'fig-6-8': 'mermaid_uml_diagrams_7.png',
            'fig-6-9': 'mermaid_uml_diagrams_8.png',
            'fig-6-10': 'mermaid_uml_diagrams_9.png',
            'fig-6-11': 'mermaid_uml_diagrams_10.png',
            
            // ER Diagrams
            'fig-5-1': 'mermaid_er_diagram_0.png',
            'fig-5-2': 'mermaid_er_diagram_1.png',
            'fig-5-3': 'mermaid_er_diagram_2.png',
            'fig-5-4': 'mermaid_er_diagram_3.png',
            'fig-5-5': 'mermaid_er_diagram_4.png',
            'fig-5-6': 'mermaid_er_diagram_5.png',
            'fig-5-7': 'mermaid_er_diagram_6.png',
            
            // DFD Diagrams
            'fig-7-1': 'mermaid_dfd_diagrams_0.png',
            'fig-7-2': 'mermaid_dfd_diagrams_1.png',
            'fig-7-3': 'mermaid_dfd_diagrams_2.png',
            'fig-7-4': 'mermaid_dfd_diagrams_3.png',
            'fig-7-5': 'mermaid_dfd_diagrams_4.png',
            'fig-7-6': 'mermaid_dfd_diagrams_5.png',
            'fig-7-7': 'mermaid_dfd_diagrams_6.png',
            
            // System Architecture
            'fig-4-1': 'mermaid_system_architecture_0.png',
            'fig-4-2': 'mermaid_system_architecture_1.png',
            'fig-4-3': 'mermaid_system_architecture_2.png',
            'fig-4-4': 'mermaid_system_architecture_3.png',
            
            // Workflows
            'fig-8-1': 'mermaid_workflows_0.png',
            'fig-8-2': 'mermaid_workflows_1.png',
            'fig-8-3': 'mermaid_workflows_2.png',
            'fig-8-4': 'mermaid_workflows_3.png',
            'fig-8-5': 'mermaid_workflows_4.png',
            'fig-8-6': 'mermaid_workflows_5.png',
            'fig-8-7': 'mermaid_workflows_6.png',
            'fig-8-8': 'mermaid_workflows_7.png',
            'fig-8-9': 'mermaid_workflows_8.png',
            'fig-8-10': 'mermaid_workflows_9.png',
            'fig-8-11': 'mermaid_workflows_10.png',
            'fig-8-12': 'mermaid_workflows_11.png',
        };
    }

    /**
     * Initialize download buttons for all diagrams
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.attachDownloadButtons();
            this.addDownloadAllButton();
        });
    }

    /**
     * Attach download buttons to each diagram card
     */
    attachDownloadButtons() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const cardHeader = card.querySelector('.card-hd');
            if (!cardHeader) return;

            const figElement = cardHeader.querySelector('.fig');
            if (!figElement) return;

            const figText = figElement.textContent.trim();
            const titleElement = cardHeader.querySelector('.title');
            const title = titleElement ? titleElement.textContent.trim() : 'Diagram';
            
            // Create figure ID for mapping
            const figId = figText.toLowerCase().replace(/\s+/g, '-').replace(/fig/, 'fig');
            
            // Create download button
            const downloadBtn = this.createDownloadButton(card, figText, title, figId);
            cardHeader.appendChild(downloadBtn);
        });
    }

    /**
     * Create download button with dropdown
     */
    createDownloadButton(card, figText, title, figId) {
        const btnContainer = document.createElement('div');
        btnContainer.className = 'download-btn-container';
        btnContainer.style.cssText = 'margin-left: auto; position: relative;';
        
        const btn = document.createElement('button');
        btn.className = 'download-btn';
        btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
        `;
        btn.title = 'Download diagram as PNG';
        btn.style.cssText = `
            background: var(--primary);
            color: white;
            border: none;
            padding: 6px 10px;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;
            font-weight: 600;
            transition: all 0.2s;
        `;
        
        btn.onmouseenter = () => btn.style.background = '#1d4ed8';
        btn.onmouseleave = () => btn.style.background = 'var(--primary)';
        
        // Create dropdown menu
        const dropdown = this.createDropdownMenu(card, figText, title, figId);
        
        btn.onclick = (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        };
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });
        
        btnContainer.appendChild(btn);
        btnContainer.appendChild(dropdown);
        
        return btnContainer;
    }

    /**
     * Create dropdown menu with download options
     */
    createDropdownMenu(card, figText, title, figId) {
        const dropdown = document.createElement('div');
        dropdown.className = 'download-dropdown';
        dropdown.style.cssText = `
            display: none;
            position: absolute;
            right: 0;
            top: 100%;
            margin-top: 4px;
            background: white;
            border: 1px solid var(--border);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 1000;
            min-width: 220px;
        `;
        
        // Option 1: Generate high-res PNG from SVG
        const svgOption = document.createElement('div');
        svgOption.className = 'dropdown-item';
        svgOption.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
            </svg>
            <span>Download SVG-PNG (High-Res)</span>
        `;
        svgOption.style.cssText = `
            padding: 10px 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-size: 12px;
            transition: background 0.2s;
        `;
        svgOption.onmouseenter = () => svgOption.style.background = 'var(--card)';
        svgOption.onmouseleave = () => svgOption.style.background = 'white';
        svgOption.onclick = (e) => {
            e.stopPropagation();
            this.downloadSvgAsPng(card, figText, title, 2);
            dropdown.style.display = 'none';
        };
        
        // Option 2: Download pre-rendered PNG
        const prerenderedOption = document.createElement('div');
        prerenderedOption.className = 'dropdown-item';
        prerenderedOption.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span>Download Pre-Rendered PNG</span>
        `;
        prerenderedOption.style.cssText = svgOption.style.cssText;
        prerenderedOption.onmouseenter = () => prerenderedOption.style.background = 'var(--card)';
        prerenderedOption.onmouseleave = () => prerenderedOption.style.background = 'white';
        prerenderedOption.onclick = (e) => {
            e.stopPropagation();
            this.downloadPrerenderedPng(figId, figText, title);
            dropdown.style.display = 'none';
        };
        
        // Add divider
        const divider = document.createElement('div');
        divider.style.cssText = 'height: 1px; background: var(--border); margin: 4px 0;';
        
        dropdown.appendChild(svgOption);
        dropdown.appendChild(divider);
        dropdown.appendChild(prerenderedOption);
        
        return dropdown;
    }

    /**
     * Download SVG as PNG (client-side conversion)
     */
    async downloadSvgAsPng(card, figText, title, scale = 2) {
        const svgElement = card.querySelector('svg');
        if (!svgElement) {
            this.showToast('No SVG found in this diagram', 'error');
            return;
        }

        this.showToast('Generating PNG...', 'info');

        try {
            // Clone SVG to avoid modifying original
            const svgClone = svgElement.cloneNode(true);
            
            // Get SVG dimensions
            const bbox = svgElement.getBoundingClientRect();
            const width = bbox.width * scale;
            const height = bbox.height * scale;
            
            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // Fill white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            
            // Convert SVG to data URL
            const svgString = new XMLSerializer().serializeToString(svgClone);
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            
            // Load and draw image
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, width, height);
                URL.revokeObjectURL(url);
                
                // Convert to PNG and download
                canvas.toBlob((blob) => {
                    const filename = this.generateFilename(figText, title);
                    this.downloadBlob(blob, filename);
                    this.showToast('PNG downloaded successfully!', 'success');
                }, 'image/png');
            };
            
            img.onerror = () => {
                this.showToast('Error generating PNG', 'error');
                URL.revokeObjectURL(url);
            };
            
            img.src = url;
        } catch (error) {
            console.error('PNG generation error:', error);
            this.showToast('Error generating PNG', 'error');
        }
    }

    /**
     * Download pre-rendered PNG file
     */
    downloadPrerenderedPng(figId, figText, title) {
        const pngFile = this.pngMapping[figId];
        
        if (!pngFile) {
            this.showToast('Pre-rendered PNG not available for this diagram', 'warning');
            return;
        }
        
        const filename = this.generateFilename(figText, title);
        const link = document.createElement('a');
        link.href = pngFile;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('PNG downloaded successfully!', 'success');
    }

    /**
     * Generate filename from figure text and title
     */
    generateFilename(figText, title) {
        // Remove special characters and format
        const figPart = figText.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
        const titlePart = title
            .replace(/[^a-zA-Z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '_')
            .substring(0, 50);
        
        return `${figPart}_${titlePart}.png`;
    }

    /**
     * Download blob as file
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Add "Download All" button to header
     */
    addDownloadAllButton() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        const downloadAllBtn = document.createElement('button');
        downloadAllBtn.className = 'download-all-btn';
        downloadAllBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download All Diagrams
        `;
        downloadAllBtn.style.cssText = `
            background: var(--primary);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 600;
            margin-top: 14px;
            transition: all 0.2s;
        `;
        
        downloadAllBtn.onmouseenter = () => downloadAllBtn.style.background = '#1d4ed8';
        downloadAllBtn.onmouseleave = () => downloadAllBtn.style.background = 'var(--primary)';
        
        downloadAllBtn.onclick = () => this.downloadAll();
        
        header.appendChild(downloadAllBtn);
    }

    /**
     * Download all diagrams as ZIP (simplified: sequential downloads)
     */
    async downloadAll() {
        this.showToast('Starting batch download...', 'info');
        
        const cards = document.querySelectorAll('.card');
        let count = 0;
        
        for (const card of cards) {
            const figElement = card.querySelector('.fig');
            const titleElement = card.querySelector('.title');
            
            if (figElement && titleElement) {
                const figText = figElement.textContent.trim();
                const title = titleElement.textContent.trim();
                
                // Small delay between downloads
                await new Promise(resolve => setTimeout(resolve, 500));
                await this.downloadSvgAsPng(card, figText, title, 2);
                count++;
            }
        }
        
        this.showToast(`Downloaded ${count} diagrams successfully!`, 'success');
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Remove existing toasts
        const existing = document.querySelectorAll('.toast-notification');
        existing.forEach(t => t.remove());
        
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        
        const colors = {
            info: '#2563eb',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444'
        };
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 12px 18px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 13px;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
        `;
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .download-dropdown {
        animation: fadeIn 0.2s ease-out;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Initialize downloader
const downloader = new DiagramDownloader();
