"use client"

import type React from "react"
import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { FiFilter, FiSearch, FiUserPlus, FiRefreshCw, FiPackage, FiMessageSquare, FiX, FiUsers, FiAlertTriangle, FiUserCheck, FiPercent, FiTrash2 } from "react-icons/fi"
import { showToast } from "../../utils/showToast"
import { useSearchParams } from "react-router-dom"
import { Button, Badge, getStatusVariant, Avatar, DataTable, type Column } from "../../components"
import CreateActionModal from "../../components/CreateActionModal/CreateActionModal"
import TieredPlanManagement from "../../components/admin/TieredPlanManagement"
import { ActionMenuButton } from "../../components/shared"
import { SendMessageModal, ConfirmDeleteModal, type UserActionTarget } from "../../components/shared/UserActionModals"
import { useClickOutside } from "../../hooks"
import EnhancedMemberActionModal from "../../components/MemberActionModal/EnhancedMemberActionModal"
import api from "../../services/api"
import type { MemberDTO, User } from "../../types"
import { getOrCreateAppId } from "../../utils/appId"
import { useMembers } from "../../contexts/MembersContext"
import { useAllAvatars } from "../../hooks/useAvatarStore"
import "../../styles/page-common.css"
import "../../styles/page-list-common.css"
import "./MemberList.css"

interface FilterState {
  status: string[]
  plan: string[]
  planDuration: string
  expiryStatus: string
  joinedPeriod: string
}

type StatusFilter = 'all' | 'active' | 'expiring' | 'inactive'

const MemberList: React.FC = () => {
  const { members: allMembers, loading: allMembersLoading, refreshMembers } = useMembers()
  const storedAvatars = useAllAvatars()

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
  const [selectMode, setSelectMode] = useState(false)
  const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilter>('all')
  const [planNames, setPlanNames] = useState<string[]>([])

  // Message / Delete modal state
  const [messageTarget, setMessageTarget] = useState<UserActionTarget | null>(null)
  const [messageTargets, setMessageTargets] = useState<UserActionTarget[]>([])
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<UserActionTarget | null>(null)
  const [deleteTargets, setDeleteTargets] = useState<UserActionTarget[]>([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const openMessageSingle = (member: MemberDTO) => {
    setMessageTargets([])
    setMessageTarget({ userId: member.userId, fullName: member.fullName, email: member.email, userType: 'member' })
    setIsMsgModalOpen(true)
  }

  const openMessageBatch = (allPaginated: MemberDTO[]) => {
    const targets = allPaginated
      .filter(m => selectedMemberIds.has(m.userId))
      .map(m => ({ userId: m.userId, fullName: m.fullName, email: m.email, userType: 'member' as const }))
    setMessageTarget(null)
    setMessageTargets(targets)
    setIsMsgModalOpen(true)
  }

  const openDeleteBatch = (allPaginated: MemberDTO[]) => {
    const targets = allPaginated
      .filter(m => selectedMemberIds.has(m.userId))
      .map(m => ({ userId: m.userId, fullName: m.fullName, email: m.email, userType: 'member' as const }))
    setDeleteTarget(null)
    setDeleteTargets(targets)
    setIsDeleteModalOpen(true)
  }

  const openDeleteSingle = (member: MemberDTO) => {
    setDeleteTargets([])
    setDeleteTarget({ userId: member.userId, fullName: member.fullName, email: member.email, userType: 'member' })
    setIsDeleteModalOpen(true)
  }

  const toggleSelectMode = () => {
    setSelectMode(prev => {
      if (prev) setSelectedMemberIds(new Set())
      return !prev
    })
  }

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
          .then(user => { handleActionClick(user as unknown as MemberDTO) })
          .catch(err => { console.error("Failed to load member from URL", err) })
      }
    }
  }, [searchParams, members])

  const [filters, setFilters] = useState<FilterState>({
    status: [], plan: [], planDuration: "", expiryStatus: "", joinedPeriod: "",
  })

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const filterPanelRef = useRef<HTMLDivElement>(null)
  useClickOutside(filterPanelRef as React.RefObject<HTMLElement>, () => setIsFilterPanelOpen(false), isFilterPanelOpen)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
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
        const response = await api.getMembersPaginated(fetchPage, fetchSize, debouncedSearch || undefined, statusFilter, planFilter)
        setMembers(response.content)
        setTotalCount(hasClientSideFilters ? response.content.length : response.totalCount)
        setSortType(response.sortType as 'newest' | 'alphabetical')
      } catch {
        const allM = await api.getMembers()
        let filtered = allM
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase()
          filtered = filtered.filter(m => m.fullName?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q))
        }
        if (statusFilter) filtered = filtered.filter(m => m.status?.toUpperCase() === statusFilter.toUpperCase())
        if (planFilter) filtered = filtered.filter(m => m.planName?.toLowerCase() === planFilter.toLowerCase())
        const start = currentPage * pageSize
        setMembers(filtered.slice(start, start + pageSize))
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

  useEffect(() => { loadMembersPaginated() }, [loadMembersPaginated])
  useEffect(() => { setCurrentPage(0) }, [debouncedSearch, filters, activeStatusFilter])

  const totalPages = useMemo(() => {
    if (hasClientSideFilters) return 1
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
    const endDate = member.endDate ? new Date(member.endDate) : null
    if (!endDate) {
      const startDate = member.startDate ? new Date(member.startDate) : null
      if (!startDate || !member.planDuration) return { date: null, daysLeft: null, isExpired: false }
      const durationStr = member.planDuration.toLowerCase()
      let expiryDate = new Date(startDate)
      if (durationStr.includes('year')) expiryDate.setMonth(expiryDate.getMonth() + (parseInt(durationStr) || 1) * 12)
      else if (durationStr.includes('month')) expiryDate.setMonth(expiryDate.getMonth() + (parseInt(durationStr) || 1))
      else if (durationStr.includes('week')) expiryDate.setDate(expiryDate.getDate() + (parseInt(durationStr) || 1) * 7)
      else if (durationStr.includes('day')) expiryDate.setDate(expiryDate.getDate() + (parseInt(durationStr) || 30))
      const daysLeft = Math.ceil((expiryDate.getTime() - new Date().getTime()) / 86400000)
      return { date: expiryDate, daysLeft, isExpired: daysLeft < 0 }
    }
    const now = new Date(); now.setHours(0,0,0,0)
    const target = new Date(endDate); target.setHours(0,0,0,0)
    const daysLeft = Math.ceil((target.getTime() - now.getTime()) / 86400000)
    return { date: endDate, daysLeft, isExpired: daysLeft < 0 }
  }

  const isUsingTabFilter = activeStatusFilter !== 'all'

  const filteredMembers = useMemo(() => {
    let result = isUsingTabFilter ? [...allMembers] : members
    if (isUsingTabFilter && debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter(m => m.fullName?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q))
    }
    if (isUsingTabFilter && filters.status.length > 0)
      result = result.filter(m => m.status?.toUpperCase() === filters.status[0].toUpperCase())
    if (isUsingTabFilter && filters.plan.length > 0)
      result = result.filter(m => m.planName?.toLowerCase() === filters.plan[0].toLowerCase())
    if (isUsingTabFilter) {
      result = result.filter(m => {
        const { daysLeft, isExpired } = getExpiryInfo(m)
        switch (activeStatusFilter) {
          case 'active': return (m.status || '').toLowerCase() === 'active' && !isExpired
          case 'expiring': return !isExpired && daysLeft !== null && daysLeft <= 7 && daysLeft > 0
          case 'inactive': return (m.status || '').toLowerCase() === 'expired' || (m.status || '').toLowerCase() === 'inactive' || isExpired
          default: return true
        }
      })
    }
    if (filters.planDuration) result = result.filter(m => m.planDuration === filters.planDuration)
    if (filters.expiryStatus) {
      result = result.filter(m => {
        const { daysLeft, isExpired } = getExpiryInfo(m)
        if (daysLeft === null) return false
        switch (filters.expiryStatus) {
          case 'expiring-soon': return !isExpired && daysLeft > 0 && daysLeft <= 7
          case 'expiring-month': return !isExpired && daysLeft > 0 && daysLeft <= 30
          case 'already-expired': return isExpired
          default: return true
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
          case 'today': return joinDate >= startOfDay
          case 'this-week': { const w = new Date(startOfDay); w.setDate(w.getDate()-7); return joinDate >= w }
          case 'this-month': return joinDate >= new Date(now.getFullYear(), now.getMonth(), 1)
          case 'last-3-months': return joinDate >= new Date(now.getFullYear(), now.getMonth()-3, 1)
          default: return true
        }
      })
    }
    return result
  }, [members, allMembers, isUsingTabFilter, debouncedSearch, filters, activeStatusFilter])

  const paginatedFilteredMembers = useMemo(() => {
    if (!isUsingTabFilter) return filteredMembers
    const start = currentPage * pageSize
    return filteredMembers.slice(start, start + pageSize)
  }, [filteredMembers, isUsingTabFilter, currentPage, pageSize])

  const tabFilterTotalCount = isUsingTabFilter ? filteredMembers.length : totalCount
  const tabFilterTotalPages = isUsingTabFilter ? Math.ceil(filteredMembers.length / pageSize) : totalPages

  const handleRenewPlan = async (member: MemberDTO, packageId?: number, amount?: number, customDuration?: number, skipTransaction?: boolean) => {
    try {
      if (packageId) {
        await api.renewMembership(member.userId, packageId, customDuration)
        if (amount && !skipTransaction) {
          try {
            await api.createTransaction({ userId: member.userId, amount, type: "MEMBERSHIP_RENEWAL", description: `Membership renewal for ${member.fullName}` })
          } catch (txErr) { console.error("Transaction creation failed:", txErr) }
        }
        loadMembersPaginated(); refreshMembers()
      }
    } catch (err) {
      console.error("Failed to renew membership:", err)
      showToast('Failed to process renewal', 'error', 'Please try again')
    }
  }

  const handleSendMessage = (member: MemberDTO) => { openMessageSingle(member) }

  const handleResetFilters = () => {
    setFilters({ status: [], plan: [], planDuration: "", expiryStatus: "", joinedPeriod: "" })
    setActiveStatusFilter('all')
  }

  const stats = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const activeCount = allMembers.filter(m => { const { isExpired } = getExpiryInfo(m); return (m.status||'').toLowerCase()==='active' && !isExpired }).length
    const expiringSoon = allMembers.filter(m => { const { daysLeft, isExpired } = getExpiryInfo(m); return !isExpired && daysLeft !== null && daysLeft <= 7 && daysLeft > 0 }).length
    const inactiveCount = allMembers.filter(m => { const { isExpired } = getExpiryInfo(m); return (m.status||'').toLowerCase()==='expired'||(m.status||'').toLowerCase()==='inactive'||isExpired }).length
    const newThisMonth = allMembers.filter(m => { const d = (m as any).joinDate||(m as any).createdAt||m.startDate; return d && new Date(d) >= startOfMonth }).length
    const retentionRate = (activeCount + inactiveCount) > 0 ? Math.round((activeCount/(activeCount+inactiveCount))*100) : 100
    return { activeCount, expiredCount: inactiveCount, expiringSoon, newThisMonth, total: allMembers.length, retentionRate }
  }, [allMembers])

  /* ── Status dot class for member ── */
  const getDotClass = (member: MemberDTO) => {
    const { daysLeft, isExpired } = getExpiryInfo(member)
    if (isExpired || (member.status||'').toLowerCase()==='expired') return 'pl-dot--expired'
    if (daysLeft !== null && daysLeft <= 7 && daysLeft > 0) return 'pl-dot--expiring'
    if ((member.status||'').toLowerCase()==='active') return 'pl-dot--active'
    return 'pl-dot--inactive'
  }

  /* ── Plan badge helpers ── */
  const getPlanIcon = (planName: string | undefined) => {
    const plan = (planName || '').toLowerCase()
    if (plan.includes('platinum') || plan.includes('elite')) return '👑'
    if (plan.includes('premium') || plan.includes('vip')) return '💎'
    if (plan.includes('gold')) return '⭐'
    if (plan.includes('standard')) return '🏅'
    if (plan.includes('corporate')) return '🏢'
    if (plan.includes('student')) return '🎓'
    if (plan.includes('basic') || plan.includes('starter')) return '📦'
    if (!planName || plan === 'no plan') return ''
    return '🏋️'
  }

  const getPlanClass = (planName: string | undefined) => {
    const plan = (planName || '').toLowerCase()
    if (!planName || plan === 'no plan') return 'member-plan--none'
    if (plan.includes('platinum') || plan.includes('elite')) return 'member-plan--platinum'
    if (plan.includes('premium') || plan.includes('vip')) return 'member-plan--premium'
    if (plan.includes('gold')) return 'member-plan--gold'
    if (plan.includes('corporate')) return 'member-plan--corporate'
    if (plan.includes('student')) return 'member-plan--student'
    if (plan.includes('standard')) return 'member-plan--standard'
    if (plan.includes('basic') || plan.includes('starter')) return 'member-plan--basic'
    return 'member-plan--default'
  }

  /* ── Status badge class ── */
  const getStatusBadgeClass = (member: MemberDTO) => {
    const { isExpired, daysLeft } = getExpiryInfo(member)
    if (isExpired) return 'pl-status pl-status--danger'
    if (daysLeft !== null && daysLeft <= 7 && daysLeft > 0) return 'pl-status pl-status--warning'
    if ((member.status||'').toLowerCase()==='active') return 'pl-status pl-status--active'
    return 'pl-status pl-status--inactive'
  }

  const getStatusLabel = (member: MemberDTO) => {
    const { isExpired, daysLeft } = getExpiryInfo(member)
    if (isExpired) return 'Expired'
    if (daysLeft !== null && daysLeft <= 7 && daysLeft > 0) return 'Expiring'
    if ((member.status||'').toLowerCase()==='active') return 'Active'
    return 'Inactive'
  }

  /* ── Table columns ── */
  const columns: Column<MemberDTO>[] = [
    {
      key: "fullName",
      header: "Member",
        width: "280px",
        render: (member) => (
          <div className="pl-user-cell" onClick={(e) => { e.stopPropagation(); handleActionClick(member) }}>
          <div className="pl-user-cell__avatar-wrap">
            <span className={`pl-dot ${getDotClass(member)}`} />
            <Avatar name={member.fullName} size="sm" avatarId={storedAvatars[member.userId] || (member as any).avatarId} userId={member.userId} />
          </div>
          <div className="pl-user-cell__info">
            <span className="pl-user-cell__name">{member.fullName}</span>
            <span className="pl-user-cell__sub">{member.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "appId",
      header: "Member ID",
      width: "140px",
      render: (member) => {
        const id = getOrCreateAppId(member.userId, 'MEMBER', member.createdAt)
        return <span className="app-id-badge" title={id}>{id}</span>
      },
    },
    {
      key: "planName",
      header: "Membership",
      width: "150px",
      render: (member) => (
        <div className="member-plan-cell">
          <span className={`member-plan-badge ${getPlanClass(member.planName)}`}>
            <span className="plan-icon">{getPlanIcon(member.planName)}</span>
            {member.planName || 'No Plan'}
          </span>
        </div>
      ),
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
      render: (member) => (
        <div className="member-status-cell">
          <span className={getStatusBadgeClass(member)}>
            <span className="pl-status__dot" />
            {getStatusLabel(member)}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: (
        <button
          className={`dt-select-toggle-btn${selectMode ? ' dt-select-toggle-btn--active' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleSelectMode() }}
          title={selectMode ? 'Exit selection mode' : 'Select rows'}
        >
          {selectMode ? '✕ Done' : '☑ Select'}
        </button>
      ),
      width: "100px",
      render: (member) => {
        if (selectMode) {
          const isChecked = selectedMemberIds.has(member.userId)
          return (
            <div className="pl-actions pl-actions--checkbox" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                className="pl-row-checkbox"
                checked={isChecked}
                onChange={() => {
                  setSelectedMemberIds(prev => {
                    const next = new Set(prev)
                    isChecked ? next.delete(member.userId) : next.add(member.userId)
                    return next
                  })
                }}
              />
            </div>
          )
        }
        return (
          <div className="pl-actions">
            <div className="pl-quick-actions">
              <button className="pl-quick-btn pl-quick-btn--indigo" onClick={(e) => { e.stopPropagation(); openMessageSingle(member) }} title="Send Message">
                <FiMessageSquare size={14} />
              </button>
              <button className="pl-quick-btn pl-quick-btn--danger" onClick={(e) => { e.stopPropagation(); openDeleteSingle(member) }} title="Delete Member">
                <FiTrash2 size={14} />
              </button>
            </div>
            <ActionMenuButton onClick={(e) => { e.stopPropagation(); handleActionClick(member) }} />
          </div>
        )
      },
    },
  ]

  return (
    <div className="pg-page">
      {/* ── Single-line header ── */}
      <header className="pg-header pg-header--single-line">
        <div className="pg-header__title-group">
          <div className="pg-header__icon"><FiUsers size={16} /></div>
          <div className="pg-header__title-stack">
            <h1 className="pg-header__title">Members</h1>
            <span className="pg-header__month-badge">+{stats.newThisMonth} this month</span>
          </div>
        </div>

        <div className="pg-stats">
          <button className={`pg-stat-card ${activeStatusFilter==='all' ? 'pg-stat-card--active' : ''}`} onClick={() => setActiveStatusFilter('all')}>
            <div className="pg-stat-card__icon pg-stat-card__icon--total"><FiUsers size={13} /></div>
            <div className="pg-stat-card__data">
              <span className="pg-stat-card__value">{stats.total}</span>
              <span className="pg-stat-card__label">Total</span>
            </div>
          </button>
          <button className={`pg-stat-card ${activeStatusFilter==='active' ? 'pg-stat-card--active' : ''}`} onClick={() => setActiveStatusFilter('active')}>
            <div className="pg-stat-card__icon pg-stat-card__icon--active"><FiUserCheck size={13} /></div>
            <div className="pg-stat-card__data">
              <span className="pg-stat-card__value pg-stat-card__value--green">{stats.activeCount}</span>
              <span className="pg-stat-card__label">Active</span>
            </div>
          </button>
          <button className={`pg-stat-card ${activeStatusFilter==='expiring' ? 'pg-stat-card--active' : ''}`} onClick={() => setActiveStatusFilter('expiring')}>
            <div className="pg-stat-card__icon pg-stat-card__icon--expiring"><FiAlertTriangle size={13} /></div>
            <div className="pg-stat-card__data">
              <span className="pg-stat-card__value pg-stat-card__value--amber">{stats.expiringSoon}</span>
              <span className="pg-stat-card__label">Expiring</span>
            </div>
            {stats.expiringSoon > 0 && <span className="pg-stat-card__pulse" />}
          </button>
          <div className="pg-stat-card pg-stat-card--no-click">
            <div className="pg-stat-card__icon pg-stat-card__icon--special"><FiPercent size={13} /></div>
            <div className="pg-stat-card__data">
              <span className="pg-stat-card__value pg-stat-card__value--indigo">{stats.retentionRate}%</span>
              <span className="pg-stat-card__label">Retention</span>
            </div>
          </div>
        </div>

        <div className="pg-search">
          <FiSearch className="pg-search__icon" />
          <input type="text" placeholder="Search members..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pg-search__input" />
          {searchQuery && <button className="pg-search__clear" onClick={() => setSearchQuery('')}><FiX size={14} /></button>}
        </div>

        <div className="pg-filter-wrap" ref={filterPanelRef}>
          <button className={`pg-btn pg-btn--icon ${isFilterPanelOpen ? 'pg-btn--active' : ''} ${activeFilterCount > 0 ? 'pg-btn--has-filter' : ''}`} onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}>
            <FiFilter size={14} />
            {activeFilterCount > 0 && <span className="pg-btn__badge">{activeFilterCount}</span>}
          </button>
          {isFilterPanelOpen && (
            <div className="pg-filter-dropdown">
              <div className="pg-filter-dropdown__header">
                <span>Filters</span>
                {activeFilterCount > 0 && <button className="pg-filter-dropdown__clear" onClick={handleResetFilters}>Clear</button>}
              </div>
              <div className="pg-filter-dropdown__body">
                <div className="pg-filter-dropdown__row">
                  <label className="pg-filter-dropdown__label">Status</label>
                  <select className="pg-filter-dropdown__select" value={filters.status[0]||''} onChange={(e) => setFilters(p => ({ ...p, status: e.target.value ? [e.target.value] : [] }))}>
                    <option value="">All</option><option value="Active">Active</option><option value="Expired">Expired</option>
                  </select>
                </div>
                <div className="pg-filter-dropdown__row">
                  <label className="pg-filter-dropdown__label">Plan</label>
                  <select className="pg-filter-dropdown__select" value={filters.plan[0]||''} onChange={(e) => setFilters(p => ({ ...p, plan: e.target.value ? [e.target.value] : [] }))}>
                    <option value="">All</option>
                    {planNames.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>
                <div className="pg-filter-dropdown__row">
                  <label className="pg-filter-dropdown__label">Duration</label>
                  <select className="pg-filter-dropdown__select" value={filters.planDuration} onChange={(e) => setFilters(p => ({ ...p, planDuration: e.target.value }))}>
                    <option value="">All</option><option value="1 Month">1 Month</option><option value="3 Months">3 Months</option><option value="6 Months">6 Months</option><option value="12 Months">12 Months</option>
                  </select>
                </div>
                <div className="pg-filter-dropdown__row">
                  <label className="pg-filter-dropdown__label">Joined</label>
                  <select className="pg-filter-dropdown__select" value={filters.joinedPeriod} onChange={(e) => setFilters(p => ({ ...p, joinedPeriod: e.target.value }))}>
                    <option value="">All Time</option><option value="today">Today</option><option value="this-week">This Week</option><option value="this-month">This Month</option><option value="last-3-months">Last 3 Months</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          </div>

          <button className="pg-btn pg-btn--icon" onClick={() => { loadMembersPaginated(); refreshMembers() }} title="Refresh"><FiRefreshCw size={14} /></button>

          <div className="pg-header__actions">
            <button className="pg-btn pg-btn--secondary" onClick={() => setIsMembershipModalOpen(true)}><FiPackage size={14} /><span>Plans</span></button>
            <button className="pg-btn pg-btn--primary" onClick={() => setIsCreateModalOpen(true)}><FiUserPlus size={14} /><span>Add Member</span></button>
          </div>
        </header>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="pg-chips">
            {filters.status.length > 0 && <span className="pg-chip">Status: {filters.status[0]}<button onClick={() => setFilters(p => ({ ...p, status: [] }))}>&times;</button></span>}
            {filters.plan.length > 0 && <span className="pg-chip">Plan: {filters.plan[0]}<button onClick={() => setFilters(p => ({ ...p, plan: [] }))}>&times;</button></span>}
            {filters.planDuration && <span className="pg-chip">Duration: {filters.planDuration}<button onClick={() => setFilters(p => ({ ...p, planDuration: "" }))}>&times;</button></span>}
            {filters.joinedPeriod && <span className="pg-chip">Joined: {filters.joinedPeriod.replace(/-/g,' ')}<button onClick={() => setFilters(p => ({ ...p, joinedPeriod: "" }))}>&times;</button></span>}
            <button className="pg-chips__clear" onClick={handleResetFilters}>Clear All</button>
          </div>
        )}

        {/* Batch actions — only when in select mode and rows are selected */}
        {selectMode && selectedMemberIds.size > 0 && (
          <div className="pg-batch">
            <span className="pg-batch__count">{selectedMemberIds.size} selected</span>
            <button className="pg-batch__btn" onClick={() => openMessageBatch(paginatedFilteredMembers)}>
              <FiMessageSquare size={13} /> Message
            </button>
            <button className="pg-batch__btn pg-batch__btn--danger" onClick={() => openDeleteBatch(paginatedFilteredMembers)}>
              <FiTrash2 size={13} /> Delete
            </button>
            <button className="pg-batch__clear" onClick={() => setSelectedMemberIds(new Set())}>&times;</button>
          </div>
        )}

        {/* Table */}
        <div className="pg-table-wrap pl-table-wrap">
          <DataTable
            data={paginatedFilteredMembers}
            keyExtractor={(member) => member.userId}
            columns={columns as Column<MemberDTO>[]}
            loading={isUsingTabFilter ? allMembersLoading : loading}
            onRowClick={handleActionClick}
            emptyMessage={debouncedSearch || activeFilterCount > 0 || isUsingTabFilter ? "No members match your filters" : "No members found. Add your first member!"}
            pagination={hasClientSideFilters && !isUsingTabFilter ? undefined : {
              currentPage, totalPages: tabFilterTotalPages, totalCount: tabFilterTotalCount, pageSize,
              pageSizeOptions: [10,20,30,40,50,60,70,80,90,100],
              onPageChange: setCurrentPage,
              onPageSizeChange: (size) => { setPageSize(size); setCurrentPage(0) },
            }}
            compact stickyHeader showRowNumbers
            mobileCardRender={(member) => {
              const { daysLeft, isExpired } = getExpiryInfo(member)
              const appId = getOrCreateAppId(member.userId, 'MEMBER', member.createdAt)
              return (
                <div className="pl-mobile-card">
                  <div className="pl-mobile-card__top">
                    <div className="pl-user-cell__avatar-wrap">
                      <span className={`pl-dot ${getDotClass(member)}`} />
                      <Avatar name={member.fullName} size="md" avatarId={storedAvatars[member.userId] || (member as any).avatarId} userId={member.userId} />
                    </div>
                    <div className="pl-mobile-card__info">
                      <span className="pl-mobile-card__name">{member.fullName}</span>
                      <span className="app-id-badge app-id-badge--card">{appId}</span>
                      <span className="pl-mobile-card__sub">
                        {getPlanIcon(member.planName)} {member.planName || 'No Plan'}
                        {daysLeft !== null && (
                          <span className={`member-card__expiry ${isExpired ? 'member-card__expiry--expired' : daysLeft <= 7 ? 'member-card__expiry--warning' : ''}`}>
                            {' '}{isExpired ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                          </span>
                        )}
                      </span>
                    </div>
                    <span className={getStatusBadgeClass(member)}><span className="pl-status__dot" />{getStatusLabel(member)}</span>
                  </div>
                  <div className="pl-mobile-card__actions">
                    
                    <button className="pl-mobile-card__action" onClick={(e) => { e.stopPropagation(); openMessageSingle(member) }}><FiMessageSquare size={16} />Message</button>
                    <ActionMenuButton onClick={(e) => { e.stopPropagation(); handleActionClick(member) }} />
                  </div>
                </div>
              )
            }}
          />
        </div>

        {/* Modals */}
        {isActionModalOpen && selectedMember && (
          <EnhancedMemberActionModal
            isOpen={isActionModalOpen} onClose={handleCloseActionModal}
            member={selectedMember as unknown as User}
            onEditProfile={() => { loadMembersPaginated(); refreshMembers() }}
            onRenewPlan={(member, packageId, amount, customDuration, skipTransaction) => handleRenewPlan(member as unknown as MemberDTO, packageId, amount, customDuration, skipTransaction)}
            onSendMessage={() => openMessageSingle(selectedMember)}
          />
        )}
        <CreateActionModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false)
            setSearchParams(prev => { const p = new URLSearchParams(prev); p.delete('action'); return p })
            loadMembersPaginated(); refreshMembers()
          }}
          initialView="memberForm"
        />
        <TieredPlanManagement
          isOpen={isMembershipModalOpen}
          onClose={() => setIsMembershipModalOpen(false)}
          onSuccess={() => { refreshMembers(); api.getMemberPlanNames().then(setPlanNames).catch(() => {}) }}
        />

        {/* Send Message Modal */}
        <SendMessageModal
          isOpen={isMsgModalOpen}
          onClose={() => setIsMsgModalOpen(false)}
          target={messageTarget}
          targets={messageTargets.length > 0 ? messageTargets : undefined}
        />

        {/* Confirm Delete Modal */}
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          target={deleteTarget}
          targets={deleteTargets.length > 0 ? deleteTargets : undefined}
          onDeleted={() => { loadMembersPaginated(); refreshMembers(); setSelectedMemberIds(new Set()); setSelectMode(false) }}
        />
      </div>
    )
  }

  export default MemberList
