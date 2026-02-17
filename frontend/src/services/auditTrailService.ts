// Audit Trail Service for Enhanced User Action Modals

import type { AuditEntry } from '../types/modalEnhancement';
import { enhancedApi } from './enhancedApi';

interface AuditFilter {
  action?: 'create' | 'update' | 'delete' | 'assign' | 'unassign';
  field?: string;
  performedBy?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

interface AuditExportOptions {
  format: 'json' | 'csv' | 'pdf';
  includeMetadata?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export class AuditTrailService {
  private cache: Map<string, { entries: AuditEntry[]; timestamp: Date }> = new Map();
  private cacheTimeout = 2 * 60 * 1000; // 2 minutes

  // Get audit trail for a user
  async getUserAuditTrail(
    userId: number, 
    filter?: AuditFilter
  ): Promise<AuditEntry[]> {
    const cacheKey = this.getCacheKey(userId, filter);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp.getTime()) < this.cacheTimeout) {
      return cached.entries;
    }

    try {
      // Get audit entries from API
      let entries = await enhancedApi.getUserAuditTrail(userId);
      
      // Apply filters
      if (filter) {
        entries = this.applyFilters(entries, filter);
      }
      
      // Sort by timestamp (newest first)
      entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Cache the results
      this.cache.set(cacheKey, {
        entries,
        timestamp: new Date()
      });
      
      return entries;
    } catch (error) {
      console.error('[AuditTrailService] Failed to get audit trail:', error);
      throw error;
    }
  }

  // Create a new audit entry
  async createAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<AuditEntry> {
    try {
      const auditEntry = await enhancedApi.createAuditEntry({
        ...entry,
        timestamp: new Date(),
        ipAddress: await this.getCurrentIP(),
        userAgent: navigator.userAgent
      });
      
      // Invalidate cache for this user
      this.invalidateUserCache(entry.userId);
      
      return auditEntry;
    } catch (error) {
      console.error('[AuditTrailService] Failed to create audit entry:', error);
      throw error;
    }
  }

  // Get audit statistics
  async getAuditStatistics(userId: number, days: number = 30): Promise<{
    totalEntries: number;
    actionBreakdown: Record<string, number>;
    dailyActivity: Array<{ date: string; count: number }>;
    topFields: Array<{ field: string; count: number }>;
  }> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const entries = await this.getUserAuditTrail(userId, {
        startDate,
        endDate
      });
      
      // Calculate statistics
      const actionBreakdown: Record<string, number> = {};
      const fieldCounts: Record<string, number> = {};
      const dailyActivity: Record<string, number> = {};
      
      entries.forEach(entry => {
        // Action breakdown
        actionBreakdown[entry.action] = (actionBreakdown[entry.action] || 0) + 1;
        
        // Field counts
        if (entry.field) {
          fieldCounts[entry.field] = (fieldCounts[entry.field] || 0) + 1;
        }
        
        // Daily activity
        const dateKey = new Date(entry.timestamp).toISOString().split('T')[0];
        dailyActivity[dateKey] = (dailyActivity[dateKey] || 0) + 1;
      });
      
      // Convert daily activity to array
      const dailyActivityArray = Object.entries(dailyActivity)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      // Get top fields
      const topFields = Object.entries(fieldCounts)
        .map(([field, count]) => ({ field, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      return {
        totalEntries: entries.length,
        actionBreakdown,
        dailyActivity: dailyActivityArray,
        topFields
      };
    } catch (error) {
      console.error('[AuditTrailService] Failed to get audit statistics:', error);
      throw error;
    }
  }

  // Export audit trail
  async exportAuditTrail(
    userId: number, 
    options: AuditExportOptions
  ): Promise<Blob> {
    try {
      const filter: AuditFilter = {};
      
      if (options.dateRange) {
        filter.startDate = options.dateRange.start;
        filter.endDate = options.dateRange.end;
      }
      
      const entries = await this.getUserAuditTrail(userId, filter);
      
      switch (options.format) {
        case 'json':
          return this.exportAsJSON(entries, options.includeMetadata);
        case 'csv':
          return this.exportAsCSV(entries, options.includeMetadata);
        case 'pdf':
          return this.exportAsPDF(entries, options.includeMetadata);
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    } catch (error) {
      console.error('[AuditTrailService] Failed to export audit trail:', error);
      throw error;
    }
  }

  // Search audit entries
  async searchAuditEntries(
    userId: number,
    searchTerm: string,
    filter?: AuditFilter
  ): Promise<AuditEntry[]> {
    try {
      const entries = await this.getUserAuditTrail(userId, filter);
      
      const searchLower = searchTerm.toLowerCase();
      
      return entries.filter(entry => {
        return (
          entry.action.toLowerCase().includes(searchLower) ||
          entry.field?.toLowerCase().includes(searchLower) ||
          entry.performedBy.toLowerCase().includes(searchLower) ||
          entry.oldValue?.toString().toLowerCase().includes(searchLower) ||
          entry.newValue?.toString().toLowerCase().includes(searchLower)
        );
      });
    } catch (error) {
      console.error('[AuditTrailService] Failed to search audit entries:', error);
      throw error;
    }
  }

  // Private helper methods
  private applyFilters(entries: AuditEntry[], filter: AuditFilter): AuditEntry[] {
    return entries.filter(entry => {
      if (filter.action && entry.action !== filter.action) {
        return false;
      }
      
      if (filter.field && entry.field !== filter.field) {
        return false;
      }
      
      if (filter.performedBy && entry.performedBy !== filter.performedBy) {
        return false;
      }
      
      if (filter.startDate && new Date(entry.timestamp) < filter.startDate) {
        return false;
      }
      
      if (filter.endDate && new Date(entry.timestamp) > filter.endDate) {
        return false;
      }
      
      return true;
    }).slice(0, filter.limit || 100);
  }

  private getCacheKey(userId: number, filter?: AuditFilter): string {
    return `audit_${userId}_${JSON.stringify(filter || {})}`;
  }

  private invalidateUserCache(userId: number): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (key.startsWith(`audit_${userId}_`)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private async getCurrentIP(): Promise<string> {
    try {
      // In a real implementation, this would get the actual client IP
      return '0.0.0.0';
    } catch {
      return 'unknown';
    }
  }

  private exportAsJSON(entries: AuditEntry[], includeMetadata?: boolean): Blob {
    const data = includeMetadata ? {
      metadata: {
        exportDate: new Date().toISOString(),
        totalEntries: entries.length,
        format: 'json'
      },
      entries
    } : entries;
    
    return new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
  }

  private exportAsCSV(entries: AuditEntry[], includeMetadata?: boolean): Blob {
    const headers = [
      'ID',
      'User ID',
      'Action',
      'Field',
      'Old Value',
      'New Value',
      'Timestamp',
      'Performed By',
      'IP Address',
      'User Agent'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    if (includeMetadata) {
      csvContent += `# Export Date: ${new Date().toISOString()}\n`;
      csvContent += `# Total Entries: ${entries.length}\n`;
      csvContent += `# Format: CSV\n`;
    }
    
    entries.forEach(entry => {
      const row = [
        entry.id,
        entry.userId,
        entry.action,
        entry.field || '',
        entry.oldValue || '',
        entry.newValue || '',
        new Date(entry.timestamp).toISOString(),
        entry.performedBy,
        entry.ipAddress || '',
        entry.userAgent || ''
      ].map(value => `"${String(value).replace(/"/g, '""')}"`);
      
      csvContent += row.join(',') + '\n';
    });
    
    return new Blob([csvContent], {
      type: 'text/csv'
    });
  }

  private exportAsPDF(entries: AuditEntry[], includeMetadata?: boolean): Blob {
    // In a real implementation, this would use a PDF library like jsPDF
    // For now, we'll create a simple text representation
    let content = 'AUDIT TRAIL REPORT\n';
    content += '==================\n\n';
    
    if (includeMetadata) {
      content += `Export Date: ${new Date().toISOString()}\n`;
      content += `Total Entries: ${entries.length}\n`;
      content += `Format: PDF\n\n`;
    }
    
    entries.forEach((entry, index) => {
      content += `${index + 1}. ${entry.action.toUpperCase()}\n`;
      content += `   Timestamp: ${new Date(entry.timestamp).toLocaleString()}\n`;
      content += `   Performed By: ${entry.performedBy}\n`;
      if (entry.field) {
        content += `   Field: ${entry.field}\n`;
      }
      if (entry.oldValue) {
        content += `   Old Value: ${entry.oldValue}\n`;
      }
      if (entry.newValue) {
        content += `   New Value: ${entry.newValue}\n`;
      }
      content += '\n';
    });
    
    return new Blob([content], {
      type: 'application/pdf'
    });
  }

  // Cleanup method
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): {
    size: number;
    keys: string[];
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Singleton instance
export const auditTrailService = new AuditTrailService();