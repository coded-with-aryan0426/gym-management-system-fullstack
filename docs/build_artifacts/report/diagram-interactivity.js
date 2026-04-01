/**
 * Smart GMS Diagram Interactivity Enhancement
 * Adds zoom, pan, tooltips, and click interactions to existing Mermaid SVG diagrams
 * Uses D3.js for smooth interactions without rebuilding diagrams
 */

class DiagramInteractivity {
  constructor() {
    this.tooltip = null;
    this.activeHighlights = new Set();
    this.init();
  }

  init() {
    // Load D3.js dynamically if not present
    if (typeof d3 === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://d3js.org/d3.v7.min.js';
      script.onload = () => this.enhance();
      document.head.appendChild(script);
    } else {
      this.enhance();
    }
  }

  enhance() {
    // Create tooltip element
    this.createTooltip();
    
    // Enhance all diagram cards
    document.querySelectorAll('.card').forEach(card => {
      this.enhanceCard(card);
    });

    // Add global search functionality
    this.addSearchFeature();
    
    console.log('✓ Diagram interactivity enhanced');
  }

  createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'diagram-tooltip';
    this.tooltip.style.cssText = `
      position: fixed;
      background: rgba(15, 23, 42, 0.95);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
      z-index: 10000;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
    `;
    document.body.appendChild(this.tooltip);
  }

  enhanceCard(card) {
    const svg = card.querySelector('svg');
    if (!svg) return;

    const cardBd = card.querySelector('.card-bd');
    if (!cardBd) return;

    // Get diagram title for context
    const titleEl = card.querySelector('.card-hd .title');
    const diagramTitle = titleEl ? titleEl.textContent.trim() : 'Diagram';

    // Wrap SVG in zoomable container
    const container = document.createElement('div');
    container.className = 'zoom-container';
    container.style.cssText = 'position: relative; cursor: grab; overflow: hidden;';
    
    svg.parentNode.insertBefore(container, svg);
    container.appendChild(svg);

    // Add zoom/pan with D3
    this.addZoomPan(container, svg, diagramTitle);

    // Add tooltips to interactive elements
    this.addTooltips(svg, diagramTitle);

    // Add click highlighting
    this.addClickHighlight(svg);

    // Add reset button
    this.addResetButton(card, container, svg);
  }

  addZoomPan(container, svg, title) {
    const d3Container = d3.select(container);
    const d3Svg = d3.select(svg);

    // Create a group for transformations
    const g = d3Svg.select('g');
    let zoomGroup;
    
    if (g.empty()) {
      // Wrap all content in a group
      const content = svg.innerHTML;
      svg.innerHTML = '';
      zoomGroup = d3Svg.append('g').html(content);
    } else {
      zoomGroup = g;
    }

    // Define zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 4])  // 50% to 400% zoom
      .on('zoom', (event) => {
        zoomGroup.attr('transform', event.transform);
        container.style.cursor = event.transform.k > 1 ? 'move' : 'grab';
      });

    // Apply zoom to SVG
    d3Svg.call(zoom);

    // Double-click to reset
    d3Svg.on('dblclick.zoom', () => {
      d3Svg.transition()
        .duration(500)
        .call(zoom.transform, d3.zoomIdentity);
    });

    // Store zoom behavior for reset
    container._zoomBehavior = zoom;
    container._d3Svg = d3Svg;
  }

  addTooltips(svg, diagramTitle) {
    const elements = svg.querySelectorAll('rect, circle, ellipse, path, polygon');
    
    elements.forEach(el => {
      // Skip decorative elements
      if (el.getAttribute('fill') === 'none' && !el.getAttribute('stroke')) return;

      el.style.transition = 'opacity 0.2s ease, filter 0.2s ease';
      
      el.addEventListener('mouseenter', (e) => {
        // Get element info
        const info = this.getElementInfo(el, svg, diagramTitle);
        if (!info) return;

        // Highlight element
        el.style.filter = 'brightness(1.2) drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))';
        
        // Show tooltip
        this.showTooltip(info, e);
      });

      el.addEventListener('mousemove', (e) => {
        this.tooltip.style.left = e.clientX + 15 + 'px';
        this.tooltip.style.top = e.clientY + 15 + 'px';
      });

      el.addEventListener('mouseleave', () => {
        el.style.filter = '';
        this.hideTooltip();
      });
    });

    // Text elements - show content
    svg.querySelectorAll('text').forEach(text => {
      const content = text.textContent.trim();
      if (!content || content.length < 2) return;

      text.style.cursor = 'help';
      
      text.addEventListener('mouseenter', (e) => {
        const parent = text.closest('g');
        const info = `<strong>${content}</strong>`;
        this.showTooltip(info, e);
        
        if (parent) {
          parent.style.filter = 'brightness(1.15)';
        }
      });

      text.addEventListener('mousemove', (e) => {
        this.tooltip.style.left = e.clientX + 15 + 'px';
        this.tooltip.style.top = e.clientY + 15 + 'px';
      });

      text.addEventListener('mouseleave', () => {
        const parent = text.closest('g');
        if (parent) parent.style.filter = '';
        this.hideTooltip();
      });
    });
  }

  getElementInfo(el, svg, diagramTitle) {
    const tagName = el.tagName.toLowerCase();
    const siblings = el.parentElement?.querySelectorAll(tagName) || [];
    const index = Array.from(siblings).indexOf(el);
    
    // Try to find associated text
    let label = '';
    const parent = el.parentElement;
    if (parent) {
      const textEl = parent.querySelector('text');
      if (textEl) label = textEl.textContent.trim();
    }

    // Get element type based on styling
    let type = 'Element';
    const fill = el.getAttribute('fill') || '';
    const stroke = el.getAttribute('stroke') || '';
    
    if (fill.includes('f3f4f6') || fill.includes('eff6ff')) type = 'Component';
    else if (fill.includes('ecfdf5') || fill.includes('d1fae5')) type = 'Active State';
    else if (fill.includes('fef3c7') || fill.includes('fef08a')) type = 'Process';
    else if (fill.includes('ddd6fe') || fill.includes('e9d5ff')) type = 'Entity';
    else if (stroke && !fill) type = 'Connection';

    let info = `<div style="font-weight:600;margin-bottom:4px">${type}</div>`;
    if (label) info += `<div style="color:#93c5fd">${label}</div>`;
    info += `<div style="font-size:11px;color:#94a3b8;margin-top:4px">Click to highlight connections</div>`;
    
    return info;
  }

  showTooltip(content, event) {
    this.tooltip.innerHTML = content;
    this.tooltip.style.left = event.clientX + 15 + 'px';
    this.tooltip.style.top = event.clientY + 15 + 'px';
    this.tooltip.style.opacity = '1';
  }

  hideTooltip() {
    this.tooltip.style.opacity = '0';
  }

  addClickHighlight(svg) {
    const elements = svg.querySelectorAll('rect, circle, ellipse');
    
    elements.forEach(el => {
      el.style.cursor = 'pointer';
      
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Clear previous highlights
        this.clearHighlights(svg);
        
        // Highlight clicked element
        el.classList.add('highlighted');
        this.activeHighlights.add(el);
        
        // Find and highlight connected elements
        this.highlightConnections(el, svg);
      });
    });

    // Click on SVG background to clear
    svg.addEventListener('click', () => {
      this.clearHighlights(svg);
    });
  }

  highlightConnections(element, svg) {
    const bbox = element.getBBox();
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;
    
    // Find nearby elements (connections)
    const allElements = svg.querySelectorAll('rect, circle, ellipse, line, path');
    
    allElements.forEach(other => {
      if (other === element) return;
      
      try {
        const otherBbox = other.getBBox();
        const otherCenterX = otherBbox.x + otherBbox.width / 2;
        const otherCenterY = otherBbox.y + otherBbox.height / 2;
        
        const distance = Math.sqrt(
          Math.pow(centerX - otherCenterX, 2) + 
          Math.pow(centerY - otherCenterY, 2)
        );
        
        // If within connection distance, highlight
        if (distance < 200 && distance > 0) {
          other.classList.add('connected');
          this.activeHighlights.add(other);
        }
      } catch (e) {
        // Skip elements without bbox
      }
    });

    // Add CSS for highlights if not exists
    if (!document.getElementById('highlight-styles')) {
      const style = document.createElement('style');
      style.id = 'highlight-styles';
      style.textContent = `
        .highlighted {
          filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.8)) brightness(1.2) !important;
          stroke: #3b82f6 !important;
          stroke-width: 2.5 !important;
        }
        .connected {
          filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.6)) brightness(1.15) !important;
          stroke: #a855f7 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  clearHighlights(svg) {
    this.activeHighlights.forEach(el => {
      el.classList.remove('highlighted', 'connected');
    });
    this.activeHighlights.clear();
  }

  addResetButton(card, container, svg) {
    const controls = document.createElement('div');
    controls.className = 'diagram-controls';
    controls.style.cssText = `
      position: absolute;
      bottom: 12px;
      right: 12px;
      display: flex;
      gap: 8px;
      z-index: 100;
    `;

    const resetBtn = document.createElement('button');
    resetBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
      </svg>
      <span>Reset View</span>
    `;
    resetBtn.className = 'diagram-control-btn';
    resetBtn.style.cssText = `
      background: rgba(255,255,255,0.95);
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 500;
      color: #475569;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;

    resetBtn.addEventListener('mouseenter', () => {
      resetBtn.style.background = '#3b82f6';
      resetBtn.style.color = 'white';
      resetBtn.style.borderColor = '#3b82f6';
      resetBtn.style.transform = 'translateY(-1px)';
      resetBtn.style.boxShadow = '0 4px 8px rgba(59,130,246,0.3)';
    });

    resetBtn.addEventListener('mouseleave', () => {
      resetBtn.style.background = 'rgba(255,255,255,0.95)';
      resetBtn.style.color = '#475569';
      resetBtn.style.borderColor = '#e2e8f0';
      resetBtn.style.transform = '';
      resetBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    });

    resetBtn.addEventListener('click', () => {
      if (container._zoomBehavior && container._d3Svg) {
        container._d3Svg.transition()
          .duration(500)
          .call(container._zoomBehavior.transform, d3.zoomIdentity);
      }
      this.clearHighlights(svg);
    });

    controls.appendChild(resetBtn);
    container.style.position = 'relative';
    container.appendChild(controls);
  }

  addSearchFeature() {
    // Add search bar to header
    const header = document.querySelector('.page > .section');
    if (!header) return;

    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = `
      margin-top: 24px;
      padding: 16px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    `;

    searchContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; max-width: 600px; margin: 0 auto;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input 
          type="text" 
          id="diagram-search" 
          placeholder="Search diagrams... (e.g., 'User', 'Authentication', 'Database')"
          style="
            flex: 1;
            padding: 10px 16px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            transition: all 0.2s ease;
          "
        />
        <button id="clear-search" style="
          padding: 10px 20px;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
        ">Clear</button>
      </div>
      <div id="search-results" style="
        margin-top: 12px;
        font-size: 12px;
        color: #64748b;
        text-align: center;
      "></div>
    `;

    header.appendChild(searchContainer);

    const searchInput = document.getElementById('diagram-search');
    const clearBtn = document.getElementById('clear-search');
    const results = document.getElementById('search-results');

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.performSearch(e.target.value, results);
      }, 300);
    });

    searchInput.addEventListener('focus', () => {
      searchInput.style.borderColor = '#3b82f6';
      searchInput.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
    });

    searchInput.addEventListener('blur', () => {
      searchInput.style.borderColor = '#cbd5e1';
      searchInput.style.boxShadow = 'none';
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      this.performSearch('', results);
      document.querySelectorAll('.search-highlight').forEach(el => {
        el.classList.remove('search-highlight');
      });
    });

    clearBtn.addEventListener('mouseenter', () => {
      clearBtn.style.background = '#e2e8f0';
    });

    clearBtn.addEventListener('mouseleave', () => {
      clearBtn.style.background = '#f1f5f9';
    });
  }

  performSearch(query, resultsEl) {
    // Clear previous highlights
    document.querySelectorAll('.search-highlight').forEach(el => {
      el.classList.remove('search-highlight');
      el.style.scrollMargin = '';
    });

    if (!query || query.length < 2) {
      resultsEl.textContent = '';
      return;
    }

    const lowerQuery = query.toLowerCase();
    let matchCount = 0;
    let firstMatch = null;

    // Search in card titles
    document.querySelectorAll('.card').forEach(card => {
      const title = card.querySelector('.card-hd .title');
      const subtitle = card.querySelector('.card-hd .sub');
      
      if (title && title.textContent.toLowerCase().includes(lowerQuery)) {
        card.classList.add('search-highlight');
        card.style.scrollMargin = '100px';
        matchCount++;
        if (!firstMatch) firstMatch = card;
      } else if (subtitle && subtitle.textContent.toLowerCase().includes(lowerQuery)) {
        card.classList.add('search-highlight');
        card.style.scrollMargin = '100px';
        matchCount++;
        if (!firstMatch) firstMatch = card;
      }

      // Search in text elements within SVG
      const svg = card.querySelector('svg');
      if (svg) {
        const texts = svg.querySelectorAll('text');
        texts.forEach(text => {
          if (text.textContent.toLowerCase().includes(lowerQuery)) {
            card.classList.add('search-highlight');
            card.style.scrollMargin = '100px';
            if (!firstMatch) firstMatch = card;
            matchCount++;
          }
        });
      }
    });

    // Update results
    if (matchCount > 0) {
      resultsEl.innerHTML = `✓ Found <strong>${matchCount}</strong> diagram${matchCount > 1 ? 's' : ''} matching "${query}"`;
      resultsEl.style.color = '#10b981';
      
      // Scroll to first match
      if (firstMatch) {
        setTimeout(() => {
          firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    } else {
      resultsEl.innerHTML = `No diagrams found matching "${query}"`;
      resultsEl.style.color = '#ef4444';
    }

    // Add highlight style if not exists
    if (!document.getElementById('search-highlight-styles')) {
      const style = document.createElement('style');
      style.id = 'search-highlight-styles';
      style.textContent = `
        .search-highlight {
          animation: highlight-pulse 1.5s ease-in-out;
          outline: 3px solid #3b82f6;
          outline-offset: 4px;
          border-radius: 12px;
        }
        @keyframes highlight-pulse {
          0%, 100% { outline-color: #3b82f6; }
          50% { outline-color: #60a5fa; }
        }
      `;
      document.head.appendChild(style);
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new DiagramInteractivity();
  });
} else {
  new DiagramInteractivity();
}
