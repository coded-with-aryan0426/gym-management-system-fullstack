"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import ReactDOM from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import type { User } from "../../types/user"
import type { Relationship } from "../../types/modalEnhancement"
import api from "../../services/api"
import { relationshipFilterService, enhancedApi, optimisticLockingService } from "../../services"
import { useRealTimeData, useOptimisticUpdates, useMicroInteractions } from "../../hooks"
import { showToast } from "../../utils/toast"
import {
  RoleBadge,
  ScheduleAvailability,
  PerformanceMetrics,
  QuickActionsToolbar,
  CustomerAssignmentProgress,
  ContextualHelp,
  NotificationBell
} from "./StaffMicroInteractionComponents"
import "./StaffActionModal.css"



interface EnhancedStaffActionModalProps {
  isOpen: boolean
  onClose: () => void
  staff: User | null
  onEditProfile: (staff: User) => void
  onScheduleSession: (staff: User) => void
  onMessageStaff: (staff: User) => void
  realTimeEnabled?: boolean
  optimisticUpdates?: boolean
}

const EnhancedStaffActionModal: React.FC<EnhancedStaffActionModalProps> = ({
  isOpen,
  onClose,
  staff,
  onEditProfile,
  onScheduleSession,
  onMessageStaff,
  realTimeEnabled = true,
  optimisticUpdates = true,
}) => {
  // Debug log to confirm enhanced modal is being used
  console.log('🚀 EnhancedStaffActionModal loaded!', { staff, isOpen });
  const [activeSubModal, setActiveSubModal] = useState<"edit" | "schedule" | "message" | null>(null)
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [availableCustomers, setAvailableCustomers] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCustomers, setSelectedCustomers] = useState<Set<number>>(new Set())
  const [showBatchActions, setShowBatchActions] = useState(false)

  // Real-time data hook - TEMPORARILY DISABLED to fix infinite refresh
  const {
    userData,
    isLoading: isRealTimeLoading,
    isConnected,
    error: realTimeError,
    refetch
  } = useRealTimeData({
    userId: staff?.userId || 0,
    enabled: false, // Disabled to prevent infinite refresh
    onError: (error) => {
      console.error('[EnhancedStaffActionModal] Real-time data error:', error);
      showToast.error(`Real-time connection error: ${error.message}`);
    }
  });

  // Optimistic updates hook - SIMPLIFIED to prevent infinite refresh
  const {
    performUpdate,
    revertUpdate,
    isOperationPending
  } = {
    performUpdate: (operation: any) => `operation_${Date.now()}`,
    revertUpdate: (operationId: string) => {},
    isOperationPending: (key: string) => false
  };

  // Micro-interactions hook - SIMPLIFIED to prevent infinite refresh
  const {
    triggerHover,
    showLoading,
    showSuccess,
    showError,
    clearLoading,
    isLoading,
    successStates
  } = {
    triggerHover: (element: any) => {},
    showLoading: (key: string) => {},
    showSuccess: (message: string) => showToast.success(message),
    showError: (error: any) => showToast.error(error.message || 'Operation failed'),
    clearLoading: (key: string) => {},
    isLoading: (key: string) => false,
    successStates: {} as any
  };

  // Form states
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    notes: "",
  })

  const [scheduleForm, setScheduleForm] = useState({
    memberName: "",
    date: "",
    time: "",
    duration: "60",
  })

  const [messageForm, setMessageForm] = useState({
    subject: "",
    body: "",
  })

  // Assigned customers state
  const [assignedCustomers, setAssignedCustomers] = useState<User[]>([])

  // Staff-specific state
  const [performanceMetrics, setPerformanceMetrics] = useState({
    sessionsThisWeek: 0,
    customerSatisfaction: 0,
    attendanceRate: 0
  })
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false)
  const [notifications, setNotifications] = useState<Array<{
    id: string
    message: string
    type: 'info' | 'warning' | 'success' | 'error'
    timestamp: Date
  }>>([])

  // Load assigned customers using real API
  const loadAssignedCustomers = useCallback(async () => {
    if (!staff) return

    try {
      // Use the real API to get trainer's customers
      const customers = await api.getTrainerCustomers(staff.userId);
      setAssignedCustomers(customers);
    } catch (error) {
      console.error('[EnhancedStaffActionModal] Failed to load customers:', error)
    }
  }, [staff])

  // Search for available customers using real API
  const searchAvailableCustomers = useCallback(async (query: string) => {
    if (!staff) return

    try {
      setIsSearching(true)
      
      // Use the real API to search for customers
      const customers = await api.searchUsers('CUSTOMER', query);
      setAvailableCustomers(customers);
    } catch (error) {
      console.error('[EnhancedStaffActionModal] Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }, [staff])

  // Debounced search effect
  useEffect(() => {
    if (!showCustomerSearch) return

    const timeoutId = setTimeout(() => {
      searchAvailableCustomers(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, showCustomerSearch, searchAvailableCustomers])

  // Load performance metrics
  const loadPerformanceMetrics = useCallback(async () => {
    if (!staff) return

    try {
      setIsLoadingMetrics(true)
      
      // Try to get real performance data from API
      try {
        // This would be a real API call in production
        // const metricsData = await api.get(`/staff/${staff.userId}/metrics`)
        
        // For now, use some realistic defaults based on staff data
        setPerformanceMetrics({
          sessionsThisWeek: assignedCustomers.length > 0 ? Math.min(assignedCustomers.length * 2, 15) : 0,
          customerSatisfaction: 92, // Default high satisfaction
          attendanceRate: 88 // Default good attendance
        })
      } catch (apiError) {
        // Fallback to defaults if API fails
        setPerformanceMetrics({
          sessionsThisWeek: assignedCustomers.length > 0 ? Math.min(assignedCustomers.length * 2, 15) : 0,
          customerSatisfaction: 92,
          attendanceRate: 88
        })
      }
    } catch (error) {
      console.error('[EnhancedStaffActionModal] Failed to load metrics:', error)
    } finally {
      setIsLoadingMetrics(false)
    }
  }, [staff, assignedCustomers.length])

  // Load initial data
  useEffect(() => {
    if (isOpen && staff) {
      loadAssignedCustomers()
      loadPerformanceMetrics()
      
      // Initialize form data
      setEditForm({
        fullName: staff.fullName,
        email: staff.email,
        phone: staff.phoneNumber || "+1 555 0100",
        notes: "",
      })

      // Initialize sample notifications
      setNotifications([
        {
          id: '1',
          message: 'New customer assignment request',
          type: 'info',
          timestamp: new Date(Date.now() - 5 * 60 * 1000)
        },
        {
          id: '2',
          message: 'Session completed successfully',
          type: 'success',
          timestamp: new Date(Date.now() - 15 * 60 * 1000)
        }
      ])
    }
  }, [isOpen, staff, loadAssignedCustomers, loadPerformanceMetrics])

  // Handle customer assignment - SIMPLIFIED to prevent infinite refresh
  const handleAddCustomer = async (customer: User) => {
    if (!staff) return

    // Check if customer is already assigned
    const isAlreadyAssigned = assignedCustomers.some(c => c.userId === customer.userId)
    if (isAlreadyAssigned) {
      showError('Customer is already assigned to this trainer')
      return
    }

    try {
      // Optimistically add customer to the list
      setAssignedCustomers(prev => [...prev, customer])
      setShowCustomerSearch(false)
      setSearchQuery("")
      
      // Perform actual assignment
      await api.assignCustomerToTrainer(staff.userId, customer.userId)
      
      showSuccess('Customer assigned successfully')
    } catch (error: any) {
      // Revert optimistic update on failure
      setAssignedCustomers(prev => prev.filter(c => c.userId !== customer.userId))
      showError('Failed to assign customer')
    }
  }

  // Handle batch customer assignment
  const handleBatchAssignCustomers = async () => {
    if (!staff || selectedCustomers.size === 0) return

    const customersToAssign = availableCustomers.filter(c => selectedCustomers.has(c.userId))
    const operationIds: string[] = []

    try {
      showLoading('batch-assign')
      
      // Create optimistic updates for all selected customers
      for (const customer of customersToAssign) {
        const operationId = performUpdate({
          type: 'create',
          entity: 'relationship',
          data: { trainerId: staff.userId, customerId: customer.userId },
          optimistic: true
        })
        operationIds.push(operationId)
      }

      // Optimistically add all customers to the list
      setAssignedCustomers(prev => [...prev, ...customersToAssign])
      setSelectedCustomers(new Set())
      setShowCustomerSearch(false)
      
      // Perform batch assignment
      const results = await Promise.allSettled(
        customersToAssign.map(customer =>
          relationshipFilterService.assignUserToUser(
            staff.userId,
            customer.userId,
            'trainer'
          )
        )
      )

      // Handle results
      const failed = results.filter(r => r.status === 'rejected')
      if (failed.length > 0) {
        // Revert failed assignments
        const failedCustomers = customersToAssign.filter((_, i) => results[i].status === 'rejected')
        setAssignedCustomers(prev => 
          prev.filter(c => !failedCustomers.some(fc => fc.userId === c.userId))
        )
        
        showError({
          code: 'BATCH_ASSIGNMENT_PARTIAL_FAILURE',
          message: `${failed.length} of ${customersToAssign.length} assignments failed`,
          recoverable: true,
          retryable: true
        })
      } else {
        showSuccess(`Successfully assigned ${customersToAssign.length} customers`)
      }
    } catch (error) {
      // Revert all optimistic updates on complete failure
      operationIds.forEach(id => revertUpdate(id))
      setAssignedCustomers(prev => 
        prev.filter(c => !customersToAssign.some(ca => ca.userId === c.userId))
      )
      
      showError({
        code: 'BATCH_ASSIGNMENT_FAILED',
        message: 'Failed to assign customers',
        recoverable: true,
        retryable: true
      })
    } finally {
      clearLoading('batch-assign')
    }
  }

  // Handle customer removal - SIMPLIFIED to prevent infinite refresh
  const handleRemoveCustomer = async (customerId: number) => {
    if (!staff) return

    const customerToRemove = assignedCustomers.find(c => c.userId === customerId)
    if (!customerToRemove) return

    try {
      // Optimistically remove customer from the list
      setAssignedCustomers(prev => prev.filter(c => c.userId !== customerId))
      
      // Perform actual removal
      await api.removeCustomerFromTrainer(staff.userId, customerId)
      
      showSuccess('Customer removed successfully')
    } catch (error: any) {
      // Revert optimistic update on failure
      setAssignedCustomers(prev => [...prev, customerToRemove])
      showError('Failed to remove customer')
    }
  }

  // Handle batch customer removal
  const handleBatchRemoveCustomers = async () => {
    if (!staff || selectedCustomers.size === 0) return

    const customersToRemove = assignedCustomers.filter(c => selectedCustomers.has(c.userId))
    const operationIds: string[] = []

    try {
      showLoading('batch-remove')
      
      // Create optimistic updates for all selected customers
      for (const customer of customersToRemove) {
        const operationId = performUpdate({
          type: 'delete',
          entity: 'relationship',
          data: { trainerId: staff.userId, customerId: customer.userId },
          optimistic: true
        })
        operationIds.push(operationId)
      }

      // Optimistically remove all customers from the list
      setAssignedCustomers(prev => 
        prev.filter(c => !selectedCustomers.has(c.userId))
      )
      setSelectedCustomers(new Set())
      
      // Perform batch removal
      const results = await Promise.allSettled(
        customersToRemove.map(customer =>
          relationshipFilterService.removeUserFromUser(
            staff.userId,
            customer.userId,
            'trainer'
          )
        )
      )

      // Handle results
      const failed = results.filter(r => r.status === 'rejected')
      if (failed.length > 0) {
        // Restore failed removals
        const failedCustomers = customersToRemove.filter((_, i) => results[i].status === 'rejected')
        setAssignedCustomers(prev => [...prev, ...failedCustomers])
        
        showError({
          code: 'BATCH_REMOVAL_PARTIAL_FAILURE',
          message: `${failed.length} of ${customersToRemove.length} removals failed`,
          recoverable: true,
          retryable: true
        })
      } else {
        showSuccess(`Successfully removed ${customersToRemove.length} customers`)
      }
    } catch (error) {
      // Revert all optimistic updates on complete failure
      operationIds.forEach(id => revertUpdate(id))
      setAssignedCustomers(prev => [...prev, ...customersToRemove])
      
      showError({
        code: 'BATCH_REMOVAL_FAILED',
        message: 'Failed to remove customers',
        recoverable: true,
        retryable: true
      })
    } finally {
      clearLoading('batch-remove')
    }
  }

  // Handle customer selection for batch operations
  const handleCustomerSelection = (customerId: number, selected: boolean) => {
    setSelectedCustomers(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(customerId)
      } else {
        newSet.delete(customerId)
      }
      return newSet
    })
  }

  // Handle select all customers
  const handleSelectAllCustomers = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedCustomers(new Set(assignedCustomers.map(c => c.userId)))
    } else {
      setSelectedCustomers(new Set())
    }
  }

  // Handle notification actions
  const handleNotificationClick = (notificationId: string) => {
    console.log('[EnhancedStaffActionModal] Notification clicked:', notificationId)
    // Remove the clicked notification
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const handleClearAllNotifications = () => {
    setNotifications([])
  }

  // Handle profile editing
  const handleEditProfile = () => {
    if (staff) {
      setEditForm({
        fullName: staff.fullName,
        email: staff.email,
        phone: staff.phoneNumber || "+1 555 0100",
        notes: "",
      })
    }
    setActiveSubModal("edit")
  }

  const handleSaveProfile = async () => {
    if (!staff) return

    try {
      showLoading('save-profile')
      
      const updatedUser = await enhancedApi.updateUserWithVersion(
        staff.userId,
        {
          fullName: editForm.fullName,
          email: editForm.email,
          phoneNumber: editForm.phone
        },
        1 // Version would come from real data
      )
      
      onEditProfile(updatedUser)
      setActiveSubModal(null)
      showSuccess('Profile updated successfully')
    } catch (error) {
      showError({
        code: 'PROFILE_UPDATE_FAILED',
        message: 'Failed to update profile',
        recoverable: true,
        retryable: true
      })
    } finally {
      clearLoading('save-profile')
    }
  }

  // Other handlers
  const handleScheduleSession = () => setActiveSubModal("schedule")
  const handleMessageStaff = () => {
    setActiveSubModal("message")
    setMessageForm({ subject: "", body: "" })
  }

  const handleConfirmSchedule = () => {
    if (staff) {
      onScheduleSession(staff)
    }
    setActiveSubModal(null)
  }

  const handleSendMessage = async () => {
    if (!staff) return

    try {
      showLoading('send-message')
      
      // Simulate message sending (in real app, this would be an API call)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onMessageStaff(staff)
      setActiveSubModal(null)
      showSuccess(`Message sent to ${staff.fullName}`)
    } catch (error) {
      showError({
        code: 'MESSAGE_SEND_FAILED',
        message: 'Failed to send message',
        recoverable: true,
        retryable: true
      })
    } finally {
      clearLoading('send-message')
    }
  }

  // Helper functions
  const getRoleForStaff = () => {
    // For now, return a default role since Role interface only has roleId
    // In a real implementation, you'd map roleId to role names
    return "TRAINER"
  }

  const getStatusForStaff = () => "Active"

  // Quick actions configuration
  const quickActions = [
    {
      id: 'edit',
      label: 'Edit',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
      onClick: handleEditProfile,
      disabled: isLoading('save-profile')
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      onClick: handleScheduleSession
    },
    {
      id: 'message',
      label: 'Message',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      onClick: handleMessageStaff,
      badge: notifications.length
    }
  ]

  if (!staff) return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="staff-action-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="staff-action-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Modal Header */}
            <div className="staff-action-modal__header">
              <h2>Manage Staff: {staff.fullName}</h2>
              <div className="header-status">
                <button className="staff-action-modal__close" onClick={onClose}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Staff Info Section */}
            <div className="staff-action-modal__info">
              <div className="staff-info__avatar">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.fullName}`} alt={staff.fullName} />
                {isRealTimeLoading && <div className="avatar-loading-overlay">
                  <div className="loading-spinner"></div>
                </div>}
              </div>
              <div className="staff-info__details">
                <h3 className="staff-info__name">{staff.fullName}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <RoleBadge role={getRoleForStaff()} isActive={true} />
                  <ContextualHelp content="Staff role determines access permissions and available actions">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9,9h0a3,3,0,0,1,5.12,2.12c0,1.5-1.5,2.5-1.5,2.5"/>
                      <circle cx="12" cy="17" r=".5"/>
                    </svg>
                  </ContextualHelp>
                </div>

              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <span className={`staff-info__status staff-info__status--${getStatusForStaff().toLowerCase()}`}>
                  {getStatusForStaff()}
                </span>
                <ScheduleAvailability
                  isAvailable={assignedCustomers.length < 10} // Available if not overloaded
                  nextAvailableSlot={assignedCustomers.length >= 10 ? "2:00 PM" : undefined}
                  currentSession={assignedCustomers.length > 5 ? {
                    memberName: assignedCustomers[0]?.fullName || "Current Session",
                    endTime: "1:30 PM"
                  } : undefined}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="staff-action-modal__actions">
              <h4>Quick Actions</h4>
              <QuickActionsToolbar actions={quickActions} />
            </div>

            {/* Performance Metrics */}
            <div className="staff-action-modal__performance">
              <PerformanceMetrics 
                metrics={performanceMetrics}
                isLoading={isLoadingMetrics}
              />
            </div>

            {/* Customer Assignment Progress */}
            <div className="staff-action-modal__progress">
              <CustomerAssignmentProgress
                totalCustomers={assignedCustomers.length}
                assignedCustomers={assignedCustomers.length}
                maxCapacity={15} // Example max capacity
              />
            </div>

            {/* Assigned Customers */}
            <div className="staff-action-modal__customers">
              <div className="customers-header">
                <h4>
                  Assigned Customers ({assignedCustomers.length})
                  {isLoading('load-customers') && <span className="loading-text"> Loading...</span>}
                </h4>
                {assignedCustomers.length > 0 && (
                  <div className="batch-controls">
                    <label className="batch-select-all">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.size === assignedCustomers.length && assignedCustomers.length > 0}
                        onChange={(e) => handleSelectAllCustomers(e.target.checked)}
                      />
                      Select All
                    </label>
                    {selectedCustomers.size > 0 && (
                      <button 
                        className="batch-remove-btn"
                        onClick={handleBatchRemoveCustomers}
                        disabled={isLoading('batch-remove')}
                      >
                        {isLoading('batch-remove') ? 'Removing...' : `Remove Selected (${selectedCustomers.size})`}
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="customers-list">
                {isLoading('load-customers') ? (
                  <div className="skeleton-loader">
                    {Array.from({ length: 2 }, (_, i) => (
                      <div key={i} className="customer-item-skeleton">
                        <div className="skeleton-avatar"></div>
                        <div className="skeleton-text"></div>
                      </div>
                    ))}
                  </div>
                ) : assignedCustomers.length === 0 ? (
                  <div className="empty-state">No customers assigned</div>
                ) : (
                  assignedCustomers.map((customer) => (
                    <div key={customer.userId} className="customer-item">
                      <div className="customer-item__checkbox">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.has(customer.userId)}
                          onChange={(e) => handleCustomerSelection(customer.userId, e.target.checked)}
                        />
                      </div>
                      <div className="customer-item__info">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span className="customer-item__name">{customer.fullName}</span>
                        <span className="customer-item__role">(Customer)</span>
                      </div>
                      <button 
                        className="customer-item__remove" 
                        onClick={() => handleRemoveCustomer(customer.userId)}
                        disabled={isOperationPending(`customer_${customer.userId}`)}
                      >
                        {isOperationPending(`customer_${customer.userId}`) ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Customer Section */}
              <div className="add-customer-section">
                <div className="add-customer-controls">
                  <button 
                    className="add-customer-btn" 
                    onClick={() => setShowCustomerSearch(!showCustomerSearch)}
                    onMouseEnter={(e) => triggerHover(e.currentTarget)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Customer
                  </button>
                  
                  {showCustomerSearch && (
                    <button 
                      className="batch-mode-btn" 
                      onClick={() => setShowBatchActions(!showBatchActions)}
                      onMouseEnter={(e) => triggerHover(e.currentTarget)}
                    >
                      {showBatchActions ? 'Single Mode' : 'Batch Mode'}
                    </button>
                  )}
                </div>

                {showCustomerSearch && (
                  <div className="customer-search">
                    <input
                      type="text"
                      className="customer-search__input"
                      placeholder="Search customers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    
                    {isSearching && <div className="search-loading">Searching...</div>}
                    
                    {availableCustomers.length > 0 && (
                      <div className="search-results">
                        {showBatchActions && selectedCustomers.size > 0 && (
                          <div className="batch-assign-controls">
                            <button 
                              className="batch-assign-btn"
                              onClick={handleBatchAssignCustomers}
                              disabled={isLoading('batch-assign')}
                            >
                              {isLoading('batch-assign') ? 'Assigning...' : `Assign Selected (${selectedCustomers.size})`}
                            </button>
                          </div>
                        )}
                        
                        {availableCustomers.map((customer) => (
                          <div 
                            key={customer.userId} 
                            className={`search-result-item ${showBatchActions ? 'batch-mode' : ''}`}
                            onClick={() => showBatchActions ? 
                              handleCustomerSelection(customer.userId, !selectedCustomers.has(customer.userId)) :
                              handleAddCustomer(customer)
                            }
                          >
                            {showBatchActions && (
                              <input
                                type="checkbox"
                                checked={selectedCustomers.has(customer.userId)}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  handleCustomerSelection(customer.userId, e.target.checked)
                                }}
                              />
                            )}
                            <div className="customer-info">
                              <span>{customer.fullName}</span>
                              <span className="customer-email">({customer.email})</span>
                            </div>
                            {!showBatchActions && (
                              <button 
                                className="add-single-btn"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAddCustomer(customer)
                                }}
                              >
                                Add
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="staff-action-modal__footer">
              <button className="btn btn--secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </motion.div>

          {/* Edit Profile Sub-Modal */}
          <AnimatePresence>
            {activeSubModal === "edit" && (
              <motion.div
                className="sub-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveSubModal(null)}
              >
                <motion.div
                  className="sub-modal"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, scale: 0.95, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 20 }}
                >
                  <div className="sub-modal__header">
                    <h3>Edit Profile: {staff.fullName}</h3>
                    <button className="sub-modal__close" onClick={() => setActiveSubModal(null)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <div className="sub-modal__body">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        className="form-input"
                        disabled={isLoading('save-profile')}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="form-input"
                        disabled={isLoading('save-profile')}
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="form-input"
                        disabled={isLoading('save-profile')}
                      />
                    </div>
                  </div>
                  <div className="sub-modal__footer">
                    <button 
                      className="btn btn--secondary" 
                      onClick={() => setActiveSubModal(null)}
                      disabled={isLoading('save-profile')}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn--primary" 
                      onClick={handleSaveProfile}
                      disabled={isLoading('save-profile')}
                    >
                      {isLoading('save-profile') ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Schedule Session Sub-Modal */}
          <AnimatePresence>
            {activeSubModal === "schedule" && (
              <motion.div
                className="sub-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveSubModal(null)}
              >
                <motion.div
                  className="sub-modal"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, scale: 0.95, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 20 }}
                >
                  <div className="sub-modal__header">
                    <h3>Schedule Session: {staff.fullName}</h3>
                    <button className="sub-modal__close" onClick={() => setActiveSubModal(null)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <div className="sub-modal__body">
                    <div className="form-group">
                      <label>Member Name</label>
                      <input
                        type="text"
                        value={scheduleForm.memberName}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, memberName: e.target.value })}
                        className="form-input"
                        placeholder="Enter member name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        value={scheduleForm.date}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Time</label>
                      <input
                        type="time"
                        value={scheduleForm.time}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Duration</label>
                      <select
                        value={scheduleForm.duration}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, duration: e.target.value })}
                        className="form-select"
                      >
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="90">90 minutes</option>
                      </select>
                    </div>
                  </div>
                  <div className="sub-modal__footer">
                    <button className="btn btn--secondary" onClick={() => setActiveSubModal(null)}>
                      Cancel
                    </button>
                    <button className="btn btn--primary" onClick={handleConfirmSchedule}>
                      Schedule Session
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message Staff Sub-Modal */}
          <AnimatePresence>
            {activeSubModal === "message" && (
              <motion.div
                className="sub-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveSubModal(null)}
              >
                <motion.div
                  className="sub-modal"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, scale: 0.95, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 20 }}
                >
                  <div className="sub-modal__header">
                    <h3>Message Staff: {staff.fullName}</h3>
                    <button className="sub-modal__close" onClick={() => setActiveSubModal(null)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <div className="sub-modal__body">
                    <div className="form-group">
                      <label>Subject</label>
                      <input
                        type="text"
                        value={messageForm.subject}
                        onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                        className="form-input"
                        placeholder="Enter subject..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Message Body</label>
                      <textarea
                        value={messageForm.body}
                        onChange={(e) => setMessageForm({ ...messageForm, body: e.target.value })}
                        className="form-textarea"
                        rows={6}
                        placeholder="Write your message..."
                      />
                    </div>
                  </div>
                  <div className="sub-modal__footer">
                    <button 
                      className="btn btn--primary" 
                      onClick={handleSendMessage}
                      disabled={isLoading('send-message')}
                    >
                      {isLoading('send-message') ? 'Sending...' : 'Send Message'}
                    </button>
                    <button className="btn btn--secondary" onClick={() => setActiveSubModal(null)}>
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return ReactDOM.createPortal(modalContent, document.body)
}

export default EnhancedStaffActionModal