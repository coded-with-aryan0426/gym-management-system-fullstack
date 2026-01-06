// Relationship Filter Service for Enhanced User Action Modals

import type { User } from '../types/user';
import type { 
  Relationship, 
  SearchOptions, 
  SearchResult 
} from '../types/modalEnhancement';
import { enhancedApi } from './enhancedApi';
import { searchService } from './searchService';

interface RelationshipFilterOptions extends SearchOptions {
  userType: 'trainer' | 'customer';
  currentUserId: number;
  includeAssigned?: boolean;
  relationshipStatus?: 'active' | 'inactive' | 'pending' | 'all';
  specializations?: string[];
}

interface FilteredUserResult extends SearchResult<User> {
  assignedUsers: User[];
  availableUsers: User[];
  relationships: Relationship[];
}

export class RelationshipFilterService {
  private relationshipCache: Map<number, Relationship[]> = new Map();
  private cacheTimeout = 2 * 60 * 1000; // 2 minutes
  private cacheTimestamps: Map<number, Date> = new Map();

  // Main filtering method
  async filterUsersForRelationships(
    options: RelationshipFilterOptions
  ): Promise<FilteredUserResult> {
    try {
      console.log('[RelationshipFilterService] Filtering users:', options);
      
      // Get current user's relationships
      const relationships = await this.getUserRelationships(options.currentUserId);
      
      // Get all users based on search criteria
      const searchResults = await searchService.search({
        query: options.query,
        filters: {
          ...options.filters,
          role: this.getTargetRole(options.userType)
        },
        sortBy: options.sortBy,
        sortOrder: options.sortOrder
      });
      
      // Separate assigned and available users
      const { assignedUsers, availableUsers } = this.separateUsersByAssignment(
        searchResults.items,
        relationships,
        options
      );
      
      // Apply relationship-specific filters
      const filteredAssigned = this.applyRelationshipFilters(assignedUsers, relationships, options);
      const filteredAvailable = this.applyRelationshipFilters(availableUsers, relationships, options);
      
      // Combine results based on includeAssigned flag
      let finalUsers: User[] = [];
      if (options.includeAssigned) {
        finalUsers = [...filteredAssigned, ...filteredAvailable];
      } else {
        finalUsers = filteredAvailable;
      }
      
      // Apply exclusion filters
      if (options.excludeIds && options.excludeIds.length > 0) {
        finalUsers = finalUsers.filter(user => 
          !options.excludeIds!.includes(user.userId)
        );
      }
      
      return {
        items: finalUsers,
        total: finalUsers.length,
        hasMore: false,
        assignedUsers: filteredAssigned,
        availableUsers: filteredAvailable,
        relationships: relationships.filter(r => 
          this.isRelationshipRelevant(r, options.currentUserId, options.userType)
        )
      };
    } catch (error) {
      console.error('[RelationshipFilterService] Filtering failed:', error);
      throw error;
    }
  }

  // Get available trainers for a customer
  async getAvailableTrainers(
    customerId: number,
    searchQuery: string = '',
    filters: Record<string, any> = {}
  ): Promise<SearchResult<User>> {
    return this.filterUsersForRelationships({
      query: searchQuery,
      filters,
      userType: 'customer',
      currentUserId: customerId,
      includeAssigned: false,
      relationshipStatus: 'active'
    });
  }

  // Get available customers for a trainer
  async getAvailableCustomers(
    trainerId: number,
    searchQuery: string = '',
    filters: Record<string, any> = {}
  ): Promise<SearchResult<User>> {
    return this.filterUsersForRelationships({
      query: searchQuery,
      filters,
      userType: 'trainer',
      currentUserId: trainerId,
      includeAssigned: false,
      relationshipStatus: 'active'
    });
  }

  // Get assigned trainers for a customer
  async getAssignedTrainers(
    customerId: number,
    searchQuery: string = '',
    filters: Record<string, any> = {}
  ): Promise<SearchResult<User>> {
    const result = await this.filterUsersForRelationships({
      query: searchQuery,
      filters,
      userType: 'customer',
      currentUserId: customerId,
      includeAssigned: true,
      relationshipStatus: 'active'
    });
    
    return {
      items: result.assignedUsers,
      total: result.assignedUsers.length,
      hasMore: false
    };
  }

  // Get assigned customers for a trainer
  async getAssignedCustomers(
    trainerId: number,
    searchQuery: string = '',
    filters: Record<string, any> = {}
  ): Promise<SearchResult<User>> {
    const result = await this.filterUsersForRelationships({
      query: searchQuery,
      filters,
      userType: 'trainer',
      currentUserId: trainerId,
      includeAssigned: true,
      relationshipStatus: 'active'
    });
    
    return {
      items: result.assignedUsers,
      total: result.assignedUsers.length,
      hasMore: false
    };
  }

  // Relationship management
  async assignUserToUser(
    sourceUserId: number,
    targetUserId: number,
    sourceUserType: 'trainer' | 'customer'
  ): Promise<Relationship> {
    try {
      let relationship: Relationship;
      
      if (sourceUserType === 'trainer') {
        // Trainer assigning customer
        relationship = await enhancedApi.assignTrainerToCustomer(sourceUserId, targetUserId);
      } else {
        // Customer assigning trainer
        relationship = await enhancedApi.assignTrainerToCustomer(targetUserId, sourceUserId);
      }
      
      // Invalidate cache
      this.invalidateRelationshipCache(sourceUserId);
      this.invalidateRelationshipCache(targetUserId);
      
      return relationship;
    } catch (error) {
      console.error('[RelationshipFilterService] Assignment failed:', error);
      throw error;
    }
  }

  async removeUserFromUser(
    sourceUserId: number,
    targetUserId: number,
    sourceUserType: 'trainer' | 'customer'
  ): Promise<void> {
    try {
      if (sourceUserType === 'trainer') {
        // Trainer removing customer
        await enhancedApi.removeTrainerFromCustomer(sourceUserId, targetUserId);
      } else {
        // Customer removing trainer
        await enhancedApi.removeTrainerFromCustomer(targetUserId, sourceUserId);
      }
      
      // Invalidate cache
      this.invalidateRelationshipCache(sourceUserId);
      this.invalidateRelationshipCache(targetUserId);
    } catch (error) {
      console.error('[RelationshipFilterService] Removal failed:', error);
      throw error;
    }
  }

  // Private helper methods
  private async getUserRelationships(userId: number): Promise<Relationship[]> {
    // Check cache first
    const cached = this.relationshipCache.get(userId);
    const cacheTimestamp = this.cacheTimestamps.get(userId);
    
    if (cached && cacheTimestamp && 
        (Date.now() - cacheTimestamp.getTime()) < this.cacheTimeout) {
      return cached;
    }
    
    // Fetch from API
    try {
      const relationships = await enhancedApi.getUserRelationships(userId);
      
      // Update cache
      this.relationshipCache.set(userId, relationships);
      this.cacheTimestamps.set(userId, new Date());
      
      return relationships;
    } catch (error) {
      console.error('[RelationshipFilterService] Failed to get relationships:', error);
      return [];
    }
  }

  private separateUsersByAssignment(
    users: User[],
    relationships: Relationship[],
    options: RelationshipFilterOptions
  ): { assignedUsers: User[]; availableUsers: User[] } {
    const assignedUserIds = new Set<number>();
    
    // Get assigned user IDs based on user type
    relationships.forEach(relationship => {
      if (options.userType === 'trainer') {
        // Current user is trainer, get assigned customers
        if (relationship.trainerId === options.currentUserId) {
          assignedUserIds.add(relationship.customerId);
        }
      } else {
        // Current user is customer, get assigned trainers
        if (relationship.customerId === options.currentUserId) {
          assignedUserIds.add(relationship.trainerId);
        }
      }
    });
    
    const assignedUsers: User[] = [];
    const availableUsers: User[] = [];
    
    users.forEach(user => {
      if (assignedUserIds.has(user.userId)) {
        assignedUsers.push(user);
      } else {
        availableUsers.push(user);
      }
    });
    
    return { assignedUsers, availableUsers };
  }

  private applyRelationshipFilters(
    users: User[],
    relationships: Relationship[],
    options: RelationshipFilterOptions
  ): User[] {
    let filteredUsers = [...users];
    
    // Filter by relationship status
    if (options.relationshipStatus && options.relationshipStatus !== 'all') {
      filteredUsers = filteredUsers.filter(user => {
        const userRelationships = relationships.filter(r => 
          this.isUserInRelationship(user.userId, r, options.userType, options.currentUserId)
        );
        
        return userRelationships.some(r => r.status === options.relationshipStatus);
      });
    }
    
    // Filter by specializations (if applicable)
    if (options.specializations && options.specializations.length > 0) {
      filteredUsers = filteredUsers.filter(user => {
        const userRelationships = relationships.filter(r => 
          this.isUserInRelationship(user.userId, r, options.userType, options.currentUserId)
        );
        
        return userRelationships.some(r => 
          r.metadata?.specializations?.some(spec => 
            options.specializations!.includes(spec)
          )
        );
      });
    }
    
    return filteredUsers;
  }

  private isUserInRelationship(
    userId: number,
    relationship: Relationship,
    userType: 'trainer' | 'customer',
    currentUserId: number
  ): boolean {
    if (userType === 'trainer') {
      // Current user is trainer, check if userId is a customer
      return relationship.trainerId === currentUserId && relationship.customerId === userId;
    } else {
      // Current user is customer, check if userId is a trainer
      return relationship.customerId === currentUserId && relationship.trainerId === userId;
    }
  }

  private isRelationshipRelevant(
    relationship: Relationship,
    currentUserId: number,
    userType: 'trainer' | 'customer'
  ): boolean {
    if (userType === 'trainer') {
      return relationship.trainerId === currentUserId;
    } else {
      return relationship.customerId === currentUserId;
    }
  }

  private getTargetRole(userType: 'trainer' | 'customer'): string {
    // If current user is trainer, we want to find customers
    // If current user is customer, we want to find trainers
    return userType === 'trainer' ? 'CUSTOMER' : 'TRAINER';
  }

  // Cache management
  private invalidateRelationshipCache(userId: number): void {
    this.relationshipCache.delete(userId);
    this.cacheTimestamps.delete(userId);
    console.log(`[RelationshipFilterService] Cache invalidated for user: ${userId}`);
  }

  invalidateAllCache(): void {
    this.relationshipCache.clear();
    this.cacheTimestamps.clear();
    console.log('[RelationshipFilterService] All cache invalidated');
  }

  // Utility methods
  getRelationshipStats(userId: number): Promise<{
    totalTrainers: number;
    totalCustomers: number;
    activeRelationships: number;
    pendingRelationships: number;
  }> {
    return this.getUserRelationships(userId).then(relationships => {
      const trainers = new Set<number>();
      const customers = new Set<number>();
      let active = 0;
      let pending = 0;
      
      relationships.forEach(r => {
        trainers.add(r.trainerId);
        customers.add(r.customerId);
        
        if (r.status === 'active') active++;
        if (r.status === 'pending') pending++;
      });
      
      return {
        totalTrainers: trainers.size,
        totalCustomers: customers.size,
        activeRelationships: active,
        pendingRelationships: pending
      };
    });
  }
}

// Singleton instance
export const relationshipFilterService = new RelationshipFilterService();