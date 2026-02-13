"use client"

import type React from "react"
import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { FiFilter, FiSearch, FiUserPlus, FiCalendar, FiRefreshCw, FiPackage, FiMessageSquare, FiX, FiUsers, FiAlertTriangle, FiUserCheck, FiUser, FiPercent } from "react-icons/fi"
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
import "../../styles/page-common.css"
import "./Members.css"

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
  const [planNames, setPlanNames] = useState<string[]>([])

  // Fetch dynamic plan names for filter dropdown
  useEffect(() => {
    api.getMemberPlanNames()
      .then(names => setPlanNames(names))
      .catch(err => console.error('[Members] Failed to load plan names:', err))
  }, [])

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
  }, [debouncedSearch, filters, activeStatusFilter])

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

  // Determine if we're using a tab filter that requires all members (unified list)
  const isUsingTabFilter = activeStatusFilter !== 'all'

  const filteredMembers = useMemo(() => {
    // When a tab filter is active, use allMembers to get a unified list across all pages
    // When 'all' tab, use the server-paginated members
    let result = isUsingTabFilter ? [...allMembers] : members

    // Apply search filter when using allMembers (tab filter mode)
    if (isUsingTabFilter && debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter(m =>
        m.fullName?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q)
      )
    }

    // Apply server-side filters when using allMembers
    if (isUsingTabFilter && filters.status.length > 0) {
      result = result.filter(m => m.status?.toUpperCase() === filters.status[0].toUpperCase())
    }
    if (isUsingTabFilter && filters.plan.length > 0) {
      result = result.filter(m => m.planName?.toLowerCase() === filters.plan[0].toLowerCase())
    }

    // Apply status tab filter
    if (isUsingTabFilter) {
      result = result.filter(m => {
        const { daysLeft, isExpired } = getExpiryInfo(m)
        switch (activeStatusFilter) {
          case 'active':
            return (m.status || '').toLowerCase() === 'active' && !isExpired
          case 'expiring':
            return !isExpired && daysLeft !== null && daysLeft <= 7 && daysLeft > 0
          case 'inactive':
            return (m.status || '').toLowerCase() === 'expired' || 
                   (m.status || '').toLowerCase() === 'inactive' || 
                   isExpired
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
  }, [members, allMembers, isUsingTabFilter, debouncedSearch, filters.status, filters.plan, filters.planDuration, filters.expiryStatus, filters.joinedPeriod, activeStatusFilter])

  // Client-side pagination for tab-filtered results
  const paginatedFilteredMembers = useMemo(() => {
    if (!isUsingTabFilter) return filteredMembers
    const start = currentPage * pageSize
    return filteredMembers.slice(start, start + pageSize)
  }, [filteredMembers, isUsingTabFilter, currentPage, pageSize])

  // Total count and pages for tab-filtered mode
  const tabFilterTotalCount = isUsingTabFilter ? filteredMembers.length : totalCount
  const tabFilterTotalPages = isUsingTabFilter
    ? Math.ceil(filteredMembers.length / pageSize)
    : totalPages

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
    
    // Active: status is active AND not expired
    const activeCount = allMembers.filter(m => {
      const { isExpired } = getExpiryInfo(m)
      return (m.status || '').toLowerCase() === 'active' && !isExpired
    }).length

    const expiringSoon = allMembers.filter(m => {
      const { daysLeft, isExpired } = getExpiryInfo(m)
      return !isExpired && daysLeft !== null && daysLeft <= 7 && daysLeft > 0
    }).length

    // Inactive: expired status, inactive status, or membership date expired
    const inactiveCount = allMembers.filter(m => {
      const { isExpired } = getExpiryInfo(m)
      return (m.status || '').toLowerCase() === 'expired' || 
             (m.status || '').toLowerCase() === 'inactive' || 
             isExpired
    }).length

    const newThisMonth = allMembers.filter(m => {
      const dateStr = (m as any).joinDate || (m as any).createdAt || m.startDate
      if (!dateStr) return false
      return new Date(dateStr) >= startOfMonth
    }).length

    const retentionRate = (activeCount + inactiveCount) > 0
      ? Math.round((activeCount / (activeCount + inactiveCount)) * 100)
      : 100

    return {
      activeCount,
      expiredCount: inactiveCount,
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
    if (plan.includes('premium') || plan.includes('vip')) return '💎'
    if (plan.includes('standard') || plan.includes('gold')) return '⭐'
    if (plan.includes('basic') || plan.includes('starter')) return '📦'
    if (plan.includes('student')) return '🎓'
    if (plan.includes('corporate')) return '🏢'
    return '📋'
  }

  const getPlanClass = (planName: string | undefined) => {
    const plan = (planName || '').toLowerCase()
    if (plan.includes('premium') || plan.includes('vip')) return 'member-plan--premium'
    if (plan.includes('standard') || plan.includes('gold')) return 'member-plan--standard'
    return 'member-plan--basic'
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
          return (
            <div className="member-plan-cell">
              <span className={`member-plan-badge ${getPlanClass(member.planName)}`}>
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
      <div className="pg-page">
          {/* Header */}
            <header className="pg-header">
              <div className="pg-header__row-1">
                <div className="pg-header__title-group">
                  <div className="pg-header__icon">
                    <FiUsers size={18} />
                  </div>
                  <div>
                    <h1 className="pg-header__title">Members</h1>
                    <span className="pg-header__subtitle">{stats.total} total &middot; {stats.newThisMonth} new this month</span>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="pg-stats">
                  <button
                    className={`pg-stat-card ${activeStatusFilter === 'all' ? 'pg-stat-card--active' : ''}`}
                    onClick={() => setActiveStatusFilter('all')}
                  >
                    <div className="pg-stat-card__icon pg-stat-card__icon--total"><FiUsers size={14} /></div>
                    <div className="pg-stat-card__data">
                      <span className="pg-stat-card__value">{stats.total}</span>
                      <span className="pg-stat-card__label">Total</span>
                    </div>
                  </button>
                  <button
                    className={`pg-stat-card ${activeStatusFilter === 'active' ? 'pg-stat-card--active' : ''}`}
                    onClick={() => setActiveStatusFilter('active')}
                  >
                    <div className="pg-stat-card__icon pg-stat-card__icon--active"><FiUserCheck size={14} /></div>
                    <div className="pg-stat-card__data">
                      <span className="pg-stat-card__value pg-stat-card__value--green">{stats.activeCount}</span>
                      <span className="pg-stat-card__label">Active</span>
                    </div>
                  </button>
                  <button
                    className={`pg-stat-card ${activeStatusFilter === 'expiring' ? 'pg-stat-card--active' : ''}`}
                    onClick={() => setActiveStatusFilter('expiring')}
                  >
                    <div className="pg-stat-card__icon pg-stat-card__icon--expiring"><FiAlertTriangle size={14} /></div>
                    <div className="pg-stat-card__data">
                      <span className="pg-stat-card__value pg-stat-card__value--amber">{stats.expiringSoon}</span>
                      <span className="pg-stat-card__label">Expiring</span>
                    </div>
                    {stats.expiringSoon > 0 && <span className="pg-stat-card__pulse" />}
                  </button>
                  <button
                    className={`pg-stat-card ${activeStatusFilter === 'inactive' ? 'pg-stat-card--active' : ''}`}
                    onClick={() => setActiveStatusFilter('inactive')}
                  >
                    <div className="pg-stat-card__icon pg-stat-card__icon--inactive"><FiUser size={14} /></div>
                    <div className="pg-stat-card__data">
                      <span className="pg-stat-card__value pg-stat-card__value--red">{stats.expiredCount}</span>
                      <span className="pg-stat-card__label">Inactive</span>
                    </div>
                  </button>
                  <div className="pg-stat-card pg-stat-card--no-click">
                    <div className="pg-stat-card__icon pg-stat-card__icon--special"><FiPercent size={14} /></div>
                    <div className="pg-stat-card__data">
                      <span className="pg-stat-card__value pg-stat-card__value--indigo">{stats.retentionRate}%</span>
                      <span className="pg-stat-card__label">Retention</span>
                    </div>
                  </div>
                </div>

                <div className="pg-header__actions">
                  <button className="pg-btn pg-btn--secondary" onClick={() => setIsMembershipModalOpen(true)}>
                    <FiPackage size={14} />
                    <span>Plans</span>
                  </button>
                  <button className="pg-btn pg-btn--primary" onClick={() => setIsCreateModalOpen(true)}>
                    <FiUserPlus size={14} />
                    <span>Add Member</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Tabs + Search + Filters */}
              <div className="pg-header__row-2">
                <div className="pg-tabs">
                  <button
                    className={`pg-tab ${activeStatusFilter === 'all' ? 'pg-tab--active' : ''}`}
                    onClick={() => setActiveStatusFilter('all')}
                  >
                    All
                    <span className="pg-tab__count">{stats.total}</span>
                  </button>
                  <button
                    className={`pg-tab ${activeStatusFilter === 'active' ? 'pg-tab--active' : ''}`}
                    onClick={() => setActiveStatusFilter('active')}
                  >
                    Active
                    <span className="pg-tab__count pg-tab__count--active">{stats.activeCount}</span>
                  </button>
                  <button
                    className={`pg-tab ${activeStatusFilter === 'expiring' ? 'pg-tab--active' : ''}`}
                    onClick={() => setActiveStatusFilter('expiring')}
                  >
                    Expiring
                    {stats.expiringSoon > 0 && (
                      <span className="pg-tab__count pg-tab__count--warning">{stats.expiringSoon}</span>
                    )}
                  </button>
                  <button
                    className={`pg-tab ${activeStatusFilter === 'inactive' ? 'pg-tab--active' : ''}`}
                    onClick={() => setActiveStatusFilter('inactive')}
                  >
                    Inactive
                    {stats.expiredCount > 0 && (
                      <span className="pg-tab__count pg-tab__count--muted">{stats.expiredCount}</span>
                    )}
                  </button>
                </div>

                <div className="pg-header__right">
                  <div className="pg-search">
                    <FiSearch className="pg-search__icon" />
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pg-search__input"
                    />
                    {searchQuery && (
                      <button className="pg-search__clear" onClick={() => setSearchQuery('')}>
                        <FiX size={14} />
                      </button>
                    )}
                  </div>

                  <div className="pg-filter-wrap" ref={filterPanelRef}>
                    <button
                      className={`pg-btn pg-btn--icon ${isFilterPanelOpen ? 'pg-btn--active' : ''} ${activeFilterCount > 0 ? 'pg-btn--has-filter' : ''}`}
                      onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                    >
                      <FiFilter size={14} />
                      {activeFilterCount > 0 && <span className="pg-btn__badge">{activeFilterCount}</span>}
                    </button>

                    {isFilterPanelOpen && (
                      <div className="pg-filter-dropdown">
                        <div className="pg-filter-dropdown__header">
                          <span>Filters</span>
                          {activeFilterCount > 0 && (
                            <button className="pg-filter-dropdown__clear" onClick={handleResetFilters}>
                              Clear
                            </button>
                          )}
                        </div>

                        <div className="pg-filter-dropdown__body">
                          <div className="pg-filter-dropdown__row">
                            <label className="pg-filter-dropdown__label">Status</label>
                            <select
                              className="pg-filter-dropdown__select"
                              value={filters.status[0] || ''}
                              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value ? [e.target.value] : [] }))}
                            >
                              <option value="">All</option>
                              <option value="Active">Active</option>
                              <option value="Expired">Expired</option>
                            </select>
                          </div>

                          <div className="pg-filter-dropdown__row">
                            <label className="pg-filter-dropdown__label">Plan</label>
                            <select
                              className="pg-filter-dropdown__select"
                              value={filters.plan[0] || ''}
                              onChange={(e) => setFilters(prev => ({ ...prev, plan: e.target.value ? [e.target.value] : [] }))}
                            >
                              <option value="">All</option>
                              {planNames.map(name => (
                                <option key={name} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="pg-filter-dropdown__row">
                            <label className="pg-filter-dropdown__label">Duration</label>
                            <select
                              className="pg-filter-dropdown__select"
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

                          <div className="pg-filter-dropdown__row">
                            <label className="pg-filter-dropdown__label">Joined</label>
                            <select
                              className="pg-filter-dropdown__select"
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

                  <button
                    className="pg-btn pg-btn--icon"
                    onClick={() => { loadMembersPaginated(); refreshMembers(); }}
                    title="Refresh"
                  >
                    <FiRefreshCw size={14} />
                  </button>
                </div>
              </div>
            </header>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="pg-chips">
            {filters.status.length > 0 && (
              <span className="pg-chip">
                Status: {filters.status[0]}
                <button onClick={() => setFilters(prev => ({ ...prev, status: [] }))}>
                  &times;
                </button>
              </span>
            )}
            {filters.plan.length > 0 && (
              <span className="pg-chip">
                Plan: {filters.plan[0]}
                <button onClick={() => setFilters(prev => ({ ...prev, plan: [] }))}>
                  &times;
                </button>
              </span>
            )}
            {filters.planDuration && (
              <span className="pg-chip">
                Duration: {filters.planDuration}
                <button onClick={() => setFilters(prev => ({ ...prev, planDuration: "" }))}>
                  &times;
                </button>
              </span>
            )}
            {filters.joinedPeriod && (
              <span className="pg-chip">
                Joined: {filters.joinedPeriod.replace(/-/g, ' ')}
                <button onClick={() => setFilters(prev => ({ ...prev, joinedPeriod: "" }))}>
                  &times;
                </button>
              </span>
            )}
            <button className="pg-chips__clear" onClick={handleResetFilters}>
              Clear All
            </button>
          </div>
        )}

        {/* Batch Actions Bar */}
        {selectedMemberIds.size > 0 && (
          <div className="pg-batch">
            <span className="pg-batch__count">{selectedMemberIds.size} selected</span>
            <button className="pg-batch__btn" onClick={() => {
              showToast(`Messaging ${selectedMemberIds.size} members`, 'success')
              setSelectedMemberIds(new Set())
            }}>
              Message
            </button>
            <button className="pg-batch__btn pg-batch__btn--danger" onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${selectedMemberIds.size} members?`)) {
                showToast(`Deleted ${selectedMemberIds.size} members`, 'success')
                setSelectedMemberIds(new Set())
              }
            }}>
              Delete
            </button>
            <button className="pg-batch__clear" onClick={() => setSelectedMemberIds(new Set())}>&times;</button>
          </div>
        )}

        {/* Main Table */}
        <div className="pg-table-wrap members-table-wrapper">
            <DataTable
                data={paginatedFilteredMembers}
                keyExtractor={(member) => member.userId}
                columns={columns as Column<MemberDTO>[]}
                loading={isUsingTabFilter ? allMembersLoading : loading}
                onRowClick={handleActionClick}
                emptyMessage={
                  debouncedSearch || activeFilterCount > 0 || isUsingTabFilter
                    ? "No members match your filters"
                    : "No members found. Add your first member!"
                }
                pagination={hasClientSideFilters && !isUsingTabFilter ? undefined : {
                  currentPage,
                  totalPages: tabFilterTotalPages,
                  totalCount: tabFilterTotalCount,
                  pageSize,
                  pageSizeOptions: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                  onPageChange: setCurrentPage,
                  onPageSizeChange: (size) => {
                    setPageSize(size)
                    setCurrentPage(0)
                  },
                }}
              compact
              selectable
              stickyHeader
              showRowNumbers
              hideCheckboxUntilHover
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
            api.getMemberPlanNames().then(setPlanNames).catch(() => {})
          }}
        />
    </div>
  )
}

export default Members
