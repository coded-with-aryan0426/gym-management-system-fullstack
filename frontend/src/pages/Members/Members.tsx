"use client"

import type React from "react"
import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { FiFilter, FiSearch, FiUserPlus, FiCalendar, FiRefreshCw, FiPackage, FiMessageSquare, FiX, FiUsers, FiTrendingUp, FiAlertTriangle, FiUserCheck, FiUser, FiCreditCard, FiClock, FiActivity } from "react-icons/fi"
import { showToast } from "../../utils/showToast"
import { useSearchParams } from "react-router-dom"
import { Button, Badge, getStatusVariant, Avatar, DataTable, type Column } from "../../components"
import CreateActionModal from "../../components/CreateActionModal/CreateActionModal"
import TieredPlanManagement from "../../components/admin/TieredPlanManagement"
import { ActionMenuButton } from "../../components/shared"
import { useClickOutside } from "../../hooks"
import EnhancedMemberActionModal from "../../components/MemberActionModal/EnhancedMemberActionModal"
import api from "../../services/api"
import type { MemberDTO, User } from "../../types"
import { useMembers } from "../../contexts/MembersContext"
import "./Members.css"
import Editable from "../../components/editor/Editable"

interface FilterState {
  status: string[]
  plan: string[]
  planDuration: string
  expiryStatus: string
  joinedPeriod: string
}

type StatusFilter = 'all' | 'active' | 'expiring' | 'inactive'

const Members: React.FC = () => {
  const { members: allMembers, loading: allMembersLoading, refreshMembers } = useMembers()

  const [selectedMember, setSelectedMember] = useState<MemberDTO | null>(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false)

  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [sortType, setSortType] = useState<'newest' | 'alphabetical'>('newest')

  const [members, setMembers] = useState<MemberDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string | number>>(new Set())
  const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilter>('all')
  const [hoveredRowId, setHoveredRowId] = useState<string | number | null>(null)

  const handleActionClick = (member: MemberDTO) => {
    setSelectedMember(member)
    setIsActionModalOpen(true)
  }

  const handleCloseActionModal = () => {
    setIsActionModalOpen(false)
    setSelectedMember(null)
  }

  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsCreateModalOpen(true)
    }

    const userId = searchParams.get('userId')
    if (userId) {
      const memberInList = members.find(m => m.userId.toString() === userId)
      if (memberInList) {
        handleActionClick(memberInList)
      } else {
        api.getUserById(parseInt(userId))
          .then(user => {
            handleActionClick(user as unknown as MemberDTO)
          })
          .catch(err => {
            console.error("Failed to load member from URL", err)
          })
      }
    }
  }, [searchParams, members])

  const [filters, setFilters] = useState<FilterState>({
    status: [],
    plan: [],
    planDuration: "",
    expiryStatus: "",
    joinedPeriod: "",
  })

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const filterPanelRef = useRef<HTMLDivElement>(null)

  useClickOutside(filterPanelRef as React.RefObject<HTMLElement>, () => setIsFilterPanelOpen(false), isFilterPanelOpen)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const hasClientSideFilters = filters.planDuration || filters.expiryStatus || filters.joinedPeriod

  const loadMembersPaginated = useCallback(async () => {
    setLoading(true)
    try {
      const statusFilter = filters.status.length > 0 ? filters.status[0] : undefined
      const planFilter = filters.plan.length > 0 ? filters.plan[0] : undefined

      const fetchSize = hasClientSideFilters ? 500 : pageSize
      const fetchPage = hasClientSideFilters ? 0 : currentPage

      try {
        const response = await api.getMembersPaginated(
          fetchPage,
          fetchSize,
          debouncedSearch || undefined,
          statusFilter,
          planFilter
        )
        setMembers(response.content)
        setTotalCount(hasClientSideFilters ? response.content.length : response.totalCount)
        setSortType(response.sortType as 'newest' | 'alphabetical')
      } catch {
        const allMembers = await api.getMembers()
        let filtered = allMembers
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase()
          filtered = filtered.filter(m =>
            m.fullName?.toLowerCase().includes(q) ||
            m.email?.toLowerCase().includes(q)
          )
        }
        if (statusFilter) {
          filtered = filtered.filter(m => m.status?.toUpperCase() === statusFilter.toUpperCase())
        }
        if (planFilter) {
          filtered = filtered.filter(m => m.planName?.toLowerCase() === planFilter.toLowerCase())
        }
        const start = currentPage * pageSize
        const paged = filtered.slice(start, start + pageSize)
        setMembers(paged)
        setTotalCount(filtered.length)
      }
    } catch (err) {
      console.error('[Members] Failed to load members:', err)
      showToast('Failed to load members', 'error')
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, debouncedSearch, filters.status, filters.plan, hasClientSideFilters])

  useEffect(() => {
    loadMembersPaginated()
  }, [loadMembersPaginated])

  useEffect(() => {
    setCurrentPage(0)
  }, [debouncedSearch, filters])

  const totalPages = useMemo(() => {
    if (hasClientSideFilters) {
      return 1
    }
    return Math.ceil(totalCount / pageSize)
  }, [totalCount, pageSize, hasClientSideFilters])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.status.length > 0) count++
    if (filters.plan.length > 0) count++
    if (filters.planDuration) count++
    if (filters.expiryStatus) count++
    if (filters.joinedPeriod) count++
    return count
  }, [filters])

  const getExpiryInfo = (member: MemberDTO) => {
    const startDate = member.startDate ? new Date(member.startDate) : null
    if (!startDate || !member.planDuration) return { date: null, daysLeft: null, isExpired: false }

    const durationStr = member.planDuration.toLowerCase()
    let expiryDate = new Date(startDate)

    if (durationStr.includes('year')) {
      const years = parseInt(durationStr) || 1
      expiryDate.setMonth(expiryDate.getMonth() + years * 12)
    } else if (durationStr.includes('month')) {
      const months = parseInt(durationStr) || 1
      expiryDate.setMonth(expiryDate.getMonth() + months)
    } else if (durationStr.includes('day')) {
      const days = parseInt(durationStr) || 30
      expiryDate.setDate(expiryDate.getDate() + days)
    }

    const now = new Date()
    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isExpired = daysLeft < 0

    return { date: expiryDate, daysLeft, isExpired }
  }

  const filteredMembers = useMemo(() => {
    let result = members

    // Apply status tab filter
    if (activeStatusFilter !== 'all') {
      result = result.filter(m => {
        const { daysLeft, isExpired } = getExpiryInfo(m)
        switch (activeStatusFilter) {
          case 'active':
            return (m.status || '').toLowerCase() === 'active' && !isExpired
          case 'expiring':
            return !isExpired && daysLeft !== null && daysLeft <= 7 && daysLeft > 0
          case 'inactive':
            return (m.status || '').toLowerCase() === 'expired' || isExpired
          default:
            return true
        }
      })
    }

    if (filters.planDuration) {
      result = result.filter(m => m.planDuration === filters.planDuration)
    }

    if (filters.expiryStatus) {
      const now = new Date()
      result = result.filter(m => {
        if (!m.startDate || !m.planDuration) return false

        const startDate = new Date(m.startDate)
        const durationStr = m.planDuration.toLowerCase()
        let expiryDate = new Date(startDate)

        if (durationStr.includes('year')) {
          const years = parseInt(durationStr) || 1
          expiryDate.setMonth(expiryDate.getMonth() + years * 12)
        } else if (durationStr.includes('month')) {
          const months = parseInt(durationStr) || 1
          expiryDate.setMonth(expiryDate.getMonth() + months)
        } else if (durationStr.includes('day')) {
          const days = parseInt(durationStr) || 30
          expiryDate.setDate(expiryDate.getDate() + days)
        }

        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        switch (filters.expiryStatus) {
          case 'expiring-soon':
            return daysUntilExpiry > 0 && daysUntilExpiry <= 7
          case 'expiring-month':
            return daysUntilExpiry > 0 && daysUntilExpiry <= 30
          case 'already-expired':
            return daysUntilExpiry < 0
          default:
            return true
        }
      })
    }

    if (filters.joinedPeriod) {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      result = result.filter(m => {
        if (!m.startDate) return false
        const joinDate = new Date(m.startDate)

        switch (filters.joinedPeriod) {
          case 'today':
            return joinDate >= startOfDay
          case 'this-week': {
            const weekAgo = new Date(startOfDay)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return joinDate >= weekAgo
          }
          case 'this-month': {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
            return joinDate >= monthStart
          }
          case 'last-3-months': {
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
            return joinDate >= threeMonthsAgo
          }
          default:
            return true
        }
      })
    }

    return result
  }, [members, filters.planDuration, filters.expiryStatus, filters.joinedPeriod, activeStatusFilter])

  const handleRenewPlan = async (member: MemberDTO, packageId?: number, amount?: number, customDuration?: number, skipTransaction?: boolean) => {
    try {
      if (packageId) {
        await api.renewMembership(member.userId, packageId, customDuration)

        if (amount && !skipTransaction) {
          try {
            await api.createTransaction({
              userId: member.userId,
              amount: amount,
              type: "MEMBERSHIP_RENEWAL",
              description: `Membership renewal for ${member.fullName}`,
            })
          } catch (txErr) {
            console.error("Transaction creation failed:", txErr)
          }
        }

        loadMembersPaginated()
        refreshMembers()
      }
    } catch (err) {
      console.error("Failed to renew membership:", err)
      showToast('Failed to process renewal', 'error', 'Please try again')
    }
  }

  const handleSendMessage = async (member: MemberDTO) => {
    showToast(`Message sent to ${member.fullName}`, 'success')
  }

  const handleResetFilters = () => {
    setFilters({
      status: [],
      plan: [],
      planDuration: "",
      expiryStatus: "",
      joinedPeriod: "",
    })
    setActiveStatusFilter('all')
  }

  const stats = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const activeCount = allMembers.filter(m => (m.status || '').toLowerCase() === 'active').length
    const expiredCount = allMembers.filter(m => (m.status || '').toLowerCase() === 'expired').length

    const expiringSoon = allMembers.filter(m => {
      const { daysLeft, isExpired } = getExpiryInfo(m)
      return !isExpired && daysLeft !== null && daysLeft <= 7 && daysLeft > 0
    }).length

    const newThisMonth = allMembers.filter(m => {
      const dateStr = (m as any).joinDate || (m as any).createdAt || m.startDate
      if (!dateStr) return false
      return new Date(dateStr) >= startOfMonth
    }).length

    // Retention rate = active / (active + expired) * 100
    const retentionRate = (activeCount + expiredCount) > 0
      ? Math.round((activeCount / (activeCount + expiredCount)) * 100)
      : 100

    return {
      activeCount,
      expiredCount,
      expiringSoon,
      newThisMonth,
      total: allMembers.length,
      retentionRate
    }
  }, [allMembers])

  const getStatusDotClass = (member: MemberDTO) => {
    const { daysLeft, isExpired } = getExpiryInfo(member)
    if (isExpired || (member.status || '').toLowerCase() === 'expired') {
      return 'status-dot--expired'
    }
    if (daysLeft !== null && daysLeft <= 7 && daysLeft > 0) {
      return 'status-dot--expiring'
    }
    if ((member.status || '').toLowerCase() === 'active') {
      return 'status-dot--active'
    }
    return 'status-dot--inactive'
  }

  const getPlanIcon = (planName: string | undefined) => {
    const plan = (planName || '').toLowerCase()
    if (plan === 'premium') return '💎'
    if (plan === 'standard') return '⭐'
    return '📦'
  }

  const columns: Column<MemberDTO>[] = [
    {
      key: "fullName",
      header: "Member",
      width: "auto",
      render: (member) => (
        <div
          className="member-cell"
          onClick={(e) => { e.stopPropagation(); handleActionClick(member) }}
          style={{ cursor: 'pointer' }}
        >
          <div className="member-avatar-wrapper">
            <span className={`status-dot ${getStatusDotClass(member)}`} />
            <Avatar
              name={member.fullName}
              size="sm"
              avatarId={localStorage.getItem(`avatar_${member.userId}`) || (member as any).avatarId}
              userId={member.userId}
            />
          </div>
          <div className="member-cell__info">
            <span className="member-name">{member.fullName}</span>
            <span className="member-email">{member.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "planName",
      header: "Membership",
      width: "150px",
      render: (member) => {
        const planClass = member.planName?.toLowerCase() === 'premium' ? 'member-plan--premium'
          : member.planName?.toLowerCase() === 'standard' ? 'member-plan--standard'
            : 'member-plan--basic'
        return (
          <div className="member-plan-cell">
            <span className={`member-plan-badge ${planClass}`}>
              <span className="plan-icon">{getPlanIcon(member.planName)}</span>
              {member.planName || 'No Plan'}
            </span>
          </div>
        )
      },
    },
    {
      key: "expiryDate",
      header: "Validity",
      width: "130px",
      render: (member) => {
        const { date, daysLeft, isExpired } = getExpiryInfo(member)
        if (!date) return <span className="member-date member-date--none">No plan</span>

        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

        return (
          <div className="member-expiry-cell">
            <span className={`member-days-left ${isExpired ? 'member-days-left--expired' : daysLeft !== null && daysLeft <= 7 ? 'member-days-left--warning' : ''}`}>
              {isExpired ? `${Math.abs(daysLeft || 0)}d overdue` : `${daysLeft}d left`}
            </span>
            <span className="member-expiry-date">{dateStr}</span>
          </div>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      width: "120px",
      render: (member) => {
        const { isExpired, daysLeft } = getExpiryInfo(member)
        let statusText = member.status || 'Unknown'
        let statusClass = 'status-badge'

        if (isExpired) {
          statusText = 'Lapsed'
          statusClass += ' status-badge--danger'
        } else if (daysLeft !== null && daysLeft <= 7 && daysLeft > 0) {
          statusText = 'Expiring'
          statusClass += ' status-badge--warning'
        } else if ((member.status || '').toLowerCase() === 'active') {
          statusText = 'Active'
          statusClass += ' status-badge--success'
        } else {
          statusText = 'Inactive'
          statusClass += ' status-badge--muted'
        }

        return (
          <div className="member-status-cell">
            <span className={statusClass}>
              <span className="status-badge__dot" />
              {statusText}
            </span>
          </div>
        )
      },
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (member) => {
        const isHovered = hoveredRowId === member.userId
        return (
          <div className="member-actions">
            <div className={`quick-actions ${isHovered ? 'quick-actions--visible' : ''}`}>
              <button
                className="quick-action-btn quick-action-btn--renew"
                onClick={(e) => { e.stopPropagation(); handleActionClick(member); }}
                title="Renew Plan"
              >
                <FiCalendar size={14} />
              </button>
              <button
                className="quick-action-btn quick-action-btn--message"
                onClick={(e) => { e.stopPropagation(); handleSendMessage(member); }}
                title="Send Message"
              >
                <FiMessageSquare size={14} />
              </button>
            </div>
            <ActionMenuButton onClick={(e) => { e.stopPropagation(); handleActionClick(member); }} />
          </div>
        )
      },
    },
  ]

  return (
    <div className="members-page">
        {/* Unified Header - Single Line */}
        <Editable id="members-page-header" config={{ allowLayout: true, allowStyle: true, allowVisibility: true }}>
          <header className="members-header">
            <h1 className="members-header__title">Members</h1>

            <div className="members-tabs">
              <button
                className={`members-tab ${activeStatusFilter === 'all' ? 'members-tab--active' : ''}`}
                onClick={() => setActiveStatusFilter('all')}
              >
                All
                <span className="members-tab__count">{stats.total}</span>
              </button>
              <button
                className={`members-tab ${activeStatusFilter === 'active' ? 'members-tab--active' : ''}`}
                onClick={() => setActiveStatusFilter('active')}
              >
                Active
                <span className="members-tab__count members-tab__count--active">{stats.activeCount}</span>
              </button>
              <button
                className={`members-tab ${activeStatusFilter === 'expiring' ? 'members-tab--active' : ''}`}
                onClick={() => setActiveStatusFilter('expiring')}
              >
                Expiring
                {stats.expiringSoon > 0 && (
                  <span className="members-tab__count members-tab__count--warning">{stats.expiringSoon}</span>
                )}
              </button>
              <button
                className={`members-tab ${activeStatusFilter === 'inactive' ? 'members-tab--active' : ''}`}
                onClick={() => setActiveStatusFilter('inactive')}
              >
                Inactive
                {stats.expiredCount > 0 && (
                  <span className="members-tab__count members-tab__count--inactive">{stats.expiredCount}</span>
                )}
              </button>
            </div>

            <div className="members-header__right">
              <div className="members-search">
                <FiSearch className="members-search__icon" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="members-search__input"
                />
                {searchQuery && (
                  <button className="members-search__clear" onClick={() => setSearchQuery('')}>
                    <FiX size={14} />
                  </button>
                )}
              </div>

              <div className="members-filter-container" ref={filterPanelRef}>
                  <button
                    className={`members-filter-btn ${isFilterPanelOpen ? 'members-filter-btn--open' : ''} ${activeFilterCount > 0 ? 'members-filter-btn--active' : ''}`}
                    onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                  >
                    <FiFilter size={14} />
                    {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
                  </button>

                  {isFilterPanelOpen && (
                    <div className="filter-dropdown">
                      <div className="filter-dropdown__header">
                        <span className="filter-dropdown__title">Filters</span>
                        {activeFilterCount > 0 && (
                          <button className="filter-dropdown__clear" onClick={handleResetFilters}>
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="filter-dropdown__body">
                        <div className="filter-dropdown__row">
                          <label className="filter-dropdown__label">Status</label>
                          <select
                            className="filter-dropdown__select"
                            value={filters.status[0] || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value ? [e.target.value] : [] }))}
                          >
                            <option value="">All</option>
                            <option value="Active">Active</option>
                            <option value="Expired">Expired</option>
                          </select>
                        </div>

                        <div className="filter-dropdown__row">
                          <label className="filter-dropdown__label">Plan</label>
                          <select
                            className="filter-dropdown__select"
                            value={filters.plan[0] || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, plan: e.target.value ? [e.target.value] : [] }))}
                          >
                            <option value="">All</option>
                            <option value="Premium">Premium</option>
                            <option value="Standard">Standard</option>
                            <option value="Basic">Basic</option>
                          </select>
                        </div>

                        <div className="filter-dropdown__row">
                          <label className="filter-dropdown__label">Duration</label>
                          <select
                            className="filter-dropdown__select"
                            value={filters.planDuration}
                            onChange={(e) => setFilters(prev => ({ ...prev, planDuration: e.target.value }))}
                          >
                            <option value="">All</option>
                            <option value="1 Month">1 Month</option>
                            <option value="3 Months">3 Months</option>
                            <option value="6 Months">6 Months</option>
                            <option value="12 Months">12 Months</option>
                          </select>
                        </div>

                        <div className="filter-dropdown__row">
                          <label className="filter-dropdown__label">Joined</label>
                          <select
                            className="filter-dropdown__select"
                            value={filters.joinedPeriod}
                            onChange={(e) => setFilters(prev => ({ ...prev, joinedPeriod: e.target.value }))}
                          >
                            <option value="">All Time</option>
                            <option value="today">Today</option>
                            <option value="this-week">This Week</option>
                            <option value="this-month">This Month</option>
                            <option value="last-3-months">Last 3 Months</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              <button className="members-btn members-btn--membership" onClick={() => setIsMembershipModalOpen(true)}>
                  <FiPackage size={14} />
                  <span>Plans</span>
                </button>

                <button className="members-btn members-btn--primary" onClick={() => setIsCreateModalOpen(true)}>
                  <FiUserPlus size={14} />
                  <span>Add</span>
                </button>
            </div>
          </header>
        </Editable>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="active-filters">
          {filters.status.length > 0 && (
            <span className="active-filter">
              Status: {filters.status[0]}
              <button onClick={() => setFilters(prev => ({ ...prev, status: [] }))}>
                <FiX size={12} />
              </button>
            </span>
          )}
          {filters.plan.length > 0 && (
            <span className="active-filter">
              Plan: {filters.plan[0]}
              <button onClick={() => setFilters(prev => ({ ...prev, plan: [] }))}>
                <FiX size={12} />
              </button>
            </span>
          )}
          {filters.planDuration && (
            <span className="active-filter">
              Duration: {filters.planDuration}
              <button onClick={() => setFilters(prev => ({ ...prev, planDuration: "" }))}>
                <FiX size={12} />
              </button>
            </span>
          )}
          {filters.joinedPeriod && (
            <span className="active-filter">
              Joined: {filters.joinedPeriod.replace(/-/g, ' ')}
              <button onClick={() => setFilters(prev => ({ ...prev, joinedPeriod: "" }))}>
                <FiX size={12} />
              </button>
            </span>
          )}
          <button className="active-filters__clear" onClick={handleResetFilters}>
            Clear All
          </button>
        </div>
      )}

      {/* Batch Actions Bar */}
      {selectedMemberIds.size > 0 && (
        <div className="batch-bar">
          <div className="batch-bar__left">
            <span className="batch-bar__count">{selectedMemberIds.size} selected</span>
            <button className="batch-bar__clear" onClick={() => setSelectedMemberIds(new Set())}>
              Clear
            </button>
          </div>
          <div className="batch-bar__actions">
            <button className="batch-action batch-action--message" onClick={() => {
              showToast(`Messaging ${selectedMemberIds.size} members`, 'success')
              setSelectedMemberIds(new Set())
            }}>
              <FiMessageSquare size={16} />
              Message
            </button>
            <button className="batch-action batch-action--delete" onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${selectedMemberIds.size} members?`)) {
                showToast(`Deleted ${selectedMemberIds.size} members`, 'success')
                setSelectedMemberIds(new Set())
              }
            }}>
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="members-table-wrapper">
        <Editable id="members-page-table" config={{ allowLayout: true, allowStyle: true, allowVisibility: true }}>
          <DataTable
            data={filteredMembers}
            keyExtractor={(member) => member.userId}
            columns={columns as Column<MemberDTO>[]}
            loading={loading}
            onRowClick={handleActionClick}
            emptyMessage={
              debouncedSearch || activeFilterCount > 0
                ? "No members match your filters"
                : "No members found. Add your first member!"
            }
            pagination={hasClientSideFilters ? undefined : {
              currentPage,
              totalPages,
              totalCount,
              pageSize,
              onPageChange: setCurrentPage,
              onPageSizeChange: (size) => {
                setPageSize(size)
                setCurrentPage(0)
              },
            }}
            compact
            selectable
            stickyHeader
            selectedIds={selectedMemberIds}
            onSelectionChange={setSelectedMemberIds}
            mobileCardRender={(member, index) => {
              const { daysLeft, isExpired } = getExpiryInfo(member)
              return (
                <div className="member-card">
                  <div className="member-card__header">
                    <div className="member-card__user">
                      <div className="member-avatar-wrapper">
                        <span className={`status-dot ${getStatusDotClass(member)}`} />
                        <Avatar name={member.fullName} size="md" />
                      </div>
                      <div className="member-card__info">
                        <span className="member-card__name">{member.fullName}</span>
                        <span className="member-card__plan">
                          {getPlanIcon(member.planName)} {member.planName || 'No Plan'}
                          {daysLeft !== null && (
                            <span className={`member-card__expiry ${isExpired ? 'member-card__expiry--expired' : daysLeft <= 7 ? 'member-card__expiry--warning' : ''}`}>
                              {isExpired ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(member.status)}>{member.status}</Badge>
                  </div>
                  <div className="member-card__actions">
                    <button className="member-card__action" onClick={(e) => { e.stopPropagation(); handleActionClick(member); }}>
                      <FiCalendar size={16} />
                      Renew
                    </button>
                    <button className="member-card__action" onClick={(e) => { e.stopPropagation(); handleSendMessage(member); }}>
                      <FiMessageSquare size={16} />
                      Message
                    </button>
                    <ActionMenuButton onClick={(e) => { e.stopPropagation(); handleActionClick(member); }} />
                  </div>
                </div>
              )
            }}
          />
        </Editable>
      </div>

      {/* Modals */}
      {isActionModalOpen && selectedMember && (
        <EnhancedMemberActionModal
          isOpen={isActionModalOpen}
          onClose={handleCloseActionModal}
          member={selectedMember as unknown as User}
          onEditProfile={() => { loadMembersPaginated(); refreshMembers(); }}
          onRenewPlan={(member, packageId, amount, customDuration, skipTransaction) =>
            handleRenewPlan(member as unknown as MemberDTO, packageId, amount, customDuration, skipTransaction)
          }
          onSendMessage={() => handleSendMessage(selectedMember)}
        />
      )}

      <CreateActionModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setSearchParams(prev => {
            const newParams = new URLSearchParams(prev)
            newParams.delete('action')
            return newParams
          })
          loadMembersPaginated()
          refreshMembers()
        }}
        initialView="memberForm"
      />

      <TieredPlanManagement
        isOpen={isMembershipModalOpen}
        onClose={() => setIsMembershipModalOpen(false)}
        onSuccess={() => {
          refreshMembers()
        }}
      />
    </div>
  )
}

export default Members
