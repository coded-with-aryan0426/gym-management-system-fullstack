// Enhanced API Service with Real-Time Capabilities

import api from './api';
// Removed direct import to avoid circular dependencies - using dynamic imports instead
import type { 
  RealTimeUserData, 
  Relationship, 
  AuditEntry, 
  DataConflict,
  VersionedEntity,
  SearchOptions,
  SearchResult
} from '../types/modalEnhancement';
import type { User } from '../types/user';

// Enhanced API that extends the existing API with real-time features
class EnhancedApiService {
  // Real-time data methods
  async getRealTimeUserData(userId: number): Promise<RealTimeUserData> {
    try {
      // Get base user data
      const user = await api.getUserById(userId);
      
      // Get relationships
      const relationships = await this.getUserRelationships(userId);
      
      // Get audit trail
      const auditTrail = await this.getUserAuditTrail(userId);
      
      return {
        user: {
          ...user,
          // version: 1, // This would come from the server - commented out as it's not in User type
          // lastModified: new Date(),
          // modifiedBy: 'system',
          // auditTrail,
          // relationships: {
          //   trainers: relationships.filter(r => r.trainerId !== userId).map(r => ({ userId: r.trainerId } as User)),
          //   customers: relationships.filter(r => r.customerId !== userId).map(r => ({ userId: r.customerId } as User))
          // },
          // metadata: {
          //   isOnline: true,
          //   lastSeen: new Date()
          // }
        } as any, // Cast to any to avoid type issues with extended properties
        relationships,
        lastUpdated: new Date(),
        version: 1
      };
    } catch (error) {
      console.error('[EnhancedApiService] Failed to get real-time user data:', error);
      throw error;
    }
  }

  async getUserRelationships(userId: number): Promise<Relationship[]> {
    try {
      // Get trainer relationships
      const trainers = await api.getCustomerTrainers(userId);
      const customers = await api.getTrainerCustomers(userId);
      
      const relationships: Relationship[] = [];
      
      // Convert trainer relationships
      trainers.forEach(trainer => {
        relationships.push({
          id: `trainer_${trainer.userId}_customer_${userId}`,
          trainerId: trainer.userId,
          customerId: userId,
          assignedDate: new Date(), // This would come from the server
          assignedBy: 'system',
          status: 'active'
        });
      });
      
      // Convert customer relationships
      customers.forEach(customer => {
        relationships.push({
          id: `trainer_${userId}_customer_${customer.userId}`,
          trainerId: userId,
          customerId: customer.userId,
          assignedDate: new Date(), // This would come from the server
          assignedBy: 'system',
          status: 'active'
        });
      });
      
      return relationships;
    } catch (error) {
      console.error('[EnhancedApiService] Failed to get user relationships:', error);
      return [];
    }
  }

  async getUserAuditTrail(userId: number): Promise<AuditEntry[]> {
    try {
      // This would be a real API call in production
      // For now, return mock data
      return [
        {
          id: `audit_${Date.now()}`,
          userId,
          action: 'update',
          field: 'fullName',
          oldValue: 'Old Name',
          newValue: 'New Name',
          timestamp: new Date(),
          performedBy: 'admin',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...'
        }
      ];
    } catch (error) {
      console.error('[EnhancedApiService] Failed to get user audit trail:', error);
      return [];
    }
  }

  // Enhanced search with real-time filtering
  async searchUsersEnhanced(options: SearchOptions): Promise<SearchResult<User>> {
    try {
      const { query, filters, excludeIds = [], sortBy, sortOrder } = options;
      
      // Use existing search API
      const role = filters.role || '';
      let users = await api.searchUsers(role, query);
      
      // Apply additional filtering
      if (excludeIds.length > 0) {
        users = users.filter(user => !excludeIds.includes(user.userId));
      }
      
      // Apply sorting
      if (sortBy) {
        users.sort((a, b) => {
          const aValue = (a as any)[sortBy];
          const bValue = (b as any)[sortBy];
          const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          return sortOrder === 'desc' ? -comparison : comparison;
        });
      }
      
      return {
        items: users,
        total: users.length,
        hasMore: false // For simplicity, assuming no pagination for now
      };
    } catch (error) {
      console.error('[EnhancedApiService] Enhanced search failed:', error);
      throw error;
    }
  }

  // Relationship management with optimistic updates
  async assignTrainerToCustomer(trainerId: number, customerId: number): Promise<Relationship> {
    try {
      // Use existing API
      await api.assignCustomerToTrainer(trainerId, customerId);
      
      // Return the relationship object
      const relationship: Relationship = {
        id: `trainer_${trainerId}_customer_${customerId}`,
        trainerId,
        customerId,
        assignedDate: new Date(),
        assignedBy: 'current_user', // This would be the actual user
        status: 'active'
      };
      
      // Notify real-time service of the change
      this.notifyRelationshipChange(trainerId, customerId, 'assign');
      
      return relationship;
    } catch (error) {
      console.error('[EnhancedApiService] Failed to assign trainer to customer:', error);
      throw error;
    }
  }

  async removeTrainerFromCustomer(trainerId: number, customerId: number): Promise<void> {
    try {
      // Use existing API
      await api.removeCustomerFromTrainer(trainerId, customerId);
      
      // Notify real-time service of the change
      this.notifyRelationshipChange(trainerId, customerId, 'remove');
    } catch (error) {
      console.error('[EnhancedApiService] Failed to remove trainer from customer:', error);
      throw error;
    }
  }

  // User update with version control
  async updateUserWithVersion(userId: number, updates: Partial<User>, expectedVersion: number): Promise<User> {
    try {
      // In a real implementation, this would include version checking
      const updatedUser = await api.updateUser(userId, updates);
      
      // Create audit entry
      await this.createAuditEntry({
        userId,
        action: 'update',
        timestamp: new Date(),
        performedBy: 'current_user',
        ipAddress: '0.0.0.0', // This would be actual IP
        userAgent: navigator.userAgent
      });
      
      return updatedUser;
    } catch (error) {
      console.error('[EnhancedApiService] Failed to update user with version:', error);
      throw error;
    }
  }

  // Conflict detection and resolution
  async detectConflicts(userId: number, updates: Partial<User>, currentVersion: number): Promise<DataConflict[]> {
    try {
      // Get latest user data
      const latestUser = await api.getUserById(userId);
      const conflicts: DataConflict[] = [];
      
      // Check for version conflicts (simplified)
      if ((latestUser as any).version && (latestUser as any).version > currentVersion) {
        Object.keys(updates).forEach(field => {
          if ((latestUser as any)[field] !== (updates as any)[field]) {
            conflicts.push({
              id: `conflict_${Date.now()}_${field}`,
              type: 'concurrent_modification',
              field,
              currentValue: (latestUser as any)[field],
              incomingValue: (updates as any)[field],
              timestamp: new Date(),
              conflictingUser: 'unknown' // This would be tracked in a real system
            });
          }
        });
      }
      
      return conflicts;
    } catch (error) {
      console.error('[EnhancedApiService] Failed to detect conflicts:', error);
      return [];
    }
  }

  // Audit trail management
  async createAuditEntry(entry: Omit<AuditEntry, 'id'>): Promise<AuditEntry> {
    try {
      const auditEntry: AuditEntry = {
        ...entry,
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      // In a real implementation, this would be sent to the server
      console.log('[EnhancedApiService] Audit entry created:', auditEntry);
      
      return auditEntry;
    } catch (error) {
      console.error('[EnhancedApiService] Failed to create audit entry:', error);
      throw error;
    }
  }

  // Real-time notification helpers
  private notifyRelationshipChange(trainerId: number, customerId: number, action: 'assign' | 'remove'): void {
    // This would trigger real-time updates to connected clients
    console.log(`[EnhancedApiService] Relationship ${action}:`, { trainerId, customerId });
    
    // In a real implementation, this would send WebSocket messages
    // For now, we'll just log the action
  }

  // Subscription management
  subscribeToUserUpdates(userId: number) {
    // Import dynamically to avoid circular dependencies
    return import('./realTimeDataService').then(({ realTimeDataService }) => 
      realTimeDataService.subscribeToUserUpdates(userId)
    );
  }

  subscribeToRelationshipUpdates(userId: number) {
    // Import dynamically to avoid circular dependencies
    return import('./realTimeDataService').then(({ realTimeDataService }) => 
      realTimeDataService.subscribeToRelationshipUpdates(userId)
    );
  }

  unsubscribe(subscriptionId: string) {
    // Import dynamically to avoid circular dependencies
    return import('./realTimeDataService').then(({ realTimeDataService }) => 
      realTimeDataService.unsubscribe(subscriptionId)
    );
  }

  // Connection status
  isRealTimeConnected(): boolean {
    // For now, always return true since we're using polling
    return true;
  }
}

// Create and export singleton instance
export const enhancedApi = new EnhancedApiService();
export default enhancedApi;