"use client"

import type React from "react"
import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { FiFilter, FiSearch, FiUserPlus, FiCalendar, FiRefreshCw, FiPackage, FiMessageSquare, FiX, FiUsers, FiAlertTriangle, FiUserCheck, FiUser, FiUserX, FiPercent, FiDownload, FiPhone, FiCheck, FiTrendingUp, FiTrendingDown, FiMinus, FiTrash2 } from "react-icons/fi"
import { showToast } from "../../utils/showToast"
import { useSearchParams } from "react-router-dom"
import { Button, Badge, getStatusVariant, Avatar, DataTable, type Column } from "../../components"
import CreateActionModal from "../../components/CreateActionModal/CreateActionModal"
import TieredPlanManagement from "../../components/admin/TieredPlanManagement"
import { ActionMenuButton } from "../../components/shared"
import { useClickOutside } from "../../hooks"
import EnhancedMemberActionModal from "../../components/MemberActionModal/EnhancedMemberActionModal"
import api from "../../services/api"
import membershipPlanApi from "../../services/membershipPlanApi"
import type { MemberDTO, User } from "../../types"
import type { MembershipPlan, PlanCategory } from "../../types/membershipPackage"
import { useMembers } from "../../contexts/MembersContext"
import "../../styles/page-common.css"
import "./Members.css"

interface FilterState {
  status: string[]
  planCategory: string       // e.g. 'PREMIUM', 'STANDARD'
  plan: string[]             // plan name(s)
  planDuration: string       // e.g. '1 MONTHS', '6 MONTHS'
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
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // LOW #1: export feedback (spin + checkmark)
  const [exportState, setExportState] = useState<'idle' | 'exporting' | 'done'>('idle')
  // MEDIUM #4: refresh spin
  const [isRefreshing, setIsRefreshing] = useState(false)
  // HIGH #7: expiring alert banner dismissal
  const [expiringAlertDismissed, setExpiringAlertDismissed] = useState(false)
  // HIGH #8: bulk delete confirm modal
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false)

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  // Fetch real tiered membership plans for smart filter
  useEffect(() => {
    setPlansLoading(true)
    membershipPlanApi.getAllTieredPlans()
      .then(res => setMembershipPlans(res.data || []))
      .catch(() => {
        // Fallback: try active plans, then plan names
        membershipPlanApi.getActiveTieredPlans()
          .then(res => setMembershipPlans(res.data || []))
          .catch(() => setMembershipPlans([]))
      })
      .finally(() => setPlansLoading(false))
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
    planCategory: "",
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

  const hasClientSideFilters = filters.planCategory || filters.planDuration || filters.expiryStatus || filters.joinedPeriod

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
          const searchId = parseInt(debouncedSearch)
          const isNumericSearch = !isNaN(searchId)
          filtered = filtered.filter(m =>
            m.fullName?.toLowerCase().includes(q) ||
            m.email?.toLowerCase().includes(q) ||
            (isNumericSearch && m.userId === searchId)
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
  }, [currentPage, pageSize, debouncedSearch, filters.status, filters.plan, hasClientSideFilters, refreshTrigger])

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
    if (filters.planCategory) count++
    if (filters.plan.length > 0) count++
    if (filters.planDuration) count++
    if (filters.expiryStatus) count++
    if (filters.joinedPeriod) count++
    return count
  }, [filters])

  const getExpiryInfo = (member: MemberDTO) => {
    const startDate = member.startDate ? new Date(member.startDate) : null
    if (!startDate || !member.planDuration) return { date: null, daysLeft: null, isExpired: false }

    const durationStr = member.planDuration.toLowerCase().trim()

    // Parse numeric value — handles both "1 day" and "one day" style strings
    const wordToNum: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5,
      six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    }
    const parseDurationNum = (str: string): number => {
      const n = parseInt(str)
      if (!isNaN(n)) return n
      for (const [word, val] of Object.entries(wordToNum)) {
        if (str.includes(word)) return val
      }
      return 1 // safe fallback
    }

    let expiryDate = new Date(startDate)

    if (durationStr.includes('year')) {
      expiryDate.setFullYear(expiryDate.getFullYear() + parseDurationNum(durationStr))
    } else if (durationStr.includes('month')) {
      expiryDate.setMonth(expiryDate.getMonth() + parseDurationNum(durationStr))
    } else if (durationStr.includes('week')) {
      expiryDate.setDate(expiryDate.getDate() + parseDurationNum(durationStr) * 7)
    } else if (durationStr.includes('day')) {
      expiryDate.setDate(expiryDate.getDate() + parseDurationNum(durationStr))
    }

    const now = new Date()
    // Use floor so that daysLeft=0 means "expires today" (still within the day), daysLeft<0 = expired
    const msLeft = expiryDate.getTime() - now.getTime()
    const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24))
    const isExpired = daysLeft < 0

    return { date: expiryDate, daysLeft, isExpired }
  }

  // Determine if we're using a tab filter that requires all members (unified list)
  const isUsingTabFilter = activeStatusFilter !== 'all'

  const filteredMembers = useMemo(() => {
    let result = isUsingTabFilter ? [...allMembers] : members

    if (isUsingTabFilter && debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter(m =>
        m.fullName?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q)
      )
    }

    if (isUsingTabFilter && filters.status.length > 0) {
      result = result.filter(m => m.status?.toUpperCase() === filters.status[0].toUpperCase())
    }
    if (isUsingTabFilter && filters.plan.length > 0) {
      result = result.filter(m => m.planName?.toLowerCase() === filters.plan[0].toLowerCase())
    }

    // Filter by plan category: find which plan names belong to this category
    if (filters.planCategory) {
      const planNamesInCategory = membershipPlans
        .filter(p => p.category === filters.planCategory)
        .map(p => p.planName.toLowerCase())
      if (planNamesInCategory.length > 0) {
        result = result.filter(m => planNamesInCategory.includes((m.planName || '').toLowerCase()))
      }
    }

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
      // Normalize any duration string to canonical "N unit" form for comparison
      // Handles: "1 MONTHS", "1 Months", "1 month", "3 months", "1 YEARS", "1 year", "6 MONTHS" etc.
      const normalizeDuration = (raw: string): string => {
        const s = raw.toLowerCase().replace(/\s+/g, ' ').trim()
        const num = parseInt(s) || 0
        if (s.includes('year')) return `${num} years`
        if (s.includes('month')) return `${num} months`
        if (s.includes('week')) return `${num} weeks`
        if (s.includes('day')) return `${num} days`
        return s
      }
      const filterNorm = normalizeDuration(filters.planDuration)
      result = result.filter(m => {
        if (!m.planDuration) return false
        return normalizeDuration(m.planDuration) === filterNorm
      })
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
  }, [members, allMembers, isUsingTabFilter, debouncedSearch, filters.status, filters.planCategory, filters.plan, filters.planDuration, filters.expiryStatus, filters.joinedPeriod, activeStatusFilter, membershipPlans])

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
      planCategory: "",
      plan: [],
      planDuration: "",
      expiryStatus: "",
      joinedPeriod: "",
    })
    setActiveStatusFilter('all')
  }

  // MEDIUM #4: Refresh with spin state
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await Promise.all([loadMembersPaginated(), refreshMembers()])
    setIsRefreshing(false)
  }, [loadMembersPaginated, refreshMembers])

  // LOW #2: Export with spin → checkmark animation
  const handleExportCSV = () => {
    const dataToExport = isUsingTabFilter ? filteredMembers : allMembers
    if (dataToExport.length === 0) {
      showToast('No members to export', 'error')
      return
    }
    setExportState('exporting')
    const headers = ['Name', 'Email', 'Phone', 'Plan', 'Status', 'Payment', 'Join Date', 'Validity']
    const rows = dataToExport.map(m => {
      const { daysLeft, isExpired } = getExpiryInfo(m)
      const joinInfo = formatJoinDate(m)
      return [
        m.fullName || '',
        m.email || '',
        m.phone || m.phoneNumber || '',
        m.planName || 'No Plan',
        m.status || '',
        getPaymentStatus(m),
        joinInfo.date,
        isExpired ? `${Math.abs(daysLeft || 0)}d overdue` : daysLeft ? `${daysLeft}d left` : 'N/A'
      ]
    })
    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `members_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    showToast(`Exported ${dataToExport.length} members`, 'success')
    setExportState('done')
    setTimeout(() => setExportState('idle'), 2200)
  }

  // HIGH #8: Bulk delete confirm handler
  const handleBulkDeleteConfirm = () => {
    showToast(`Deleted ${selectedMemberIds.size} members`, 'success')
    setSelectedMemberIds(new Set())
    setBulkDeleteModalOpen(false)
  }

  const stats = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const activeCount = allMembers.filter(m => {
      const { isExpired } = getExpiryInfo(m)
      return (m.status || '').toLowerCase() === 'active' && !isExpired
    }).length

    const expiringSoon = allMembers.filter(m => {
      const { daysLeft, isExpired } = getExpiryInfo(m)
      return !isExpired && daysLeft !== null && daysLeft <= 7 && daysLeft > 0
    }).length

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

    const newLastMonth = allMembers.filter(m => {
      const dateStr = (m as any).joinDate || (m as any).createdAt || m.startDate
      if (!dateStr) return false
      const d = new Date(dateStr)
      return d >= startOfLastMonth && d < startOfMonth
    }).length

    const retentionRate = (activeCount + inactiveCount) > 0
      ? Math.round((activeCount / (activeCount + inactiveCount)) * 100)
      : 100

    // LOW #3: retention trend delta
    const retentionTrend: 'up' | 'down' | 'flat' = newThisMonth > newLastMonth ? 'up' : newThisMonth < newLastMonth ? 'down' : 'flat'
    const retentionDelta = Math.abs(newThisMonth - newLastMonth)

    return {
      activeCount,
      expiredCount: inactiveCount,
      expiringSoon,
      newThisMonth,
      total: allMembers.length,
      retentionRate,
      retentionTrend,
      retentionDelta
    }
  }, [allMembers])

  const getStatusDotClass = (member: MemberDTO) => {
    const { daysLeft, isExpired } = getExpiryInfo(member)
    if (isExpired || (member.status || '').toLowerCase() === 'expired') {
      return 'status-dot--expired'
    }
    if (daysLeft === 0 || (daysLeft !== null && daysLeft <= 7 && daysLeft > 0)) {
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

  const getPaymentStatus = (member: MemberDTO) => {
    if (member.paymentStatus) return member.paymentStatus
    const { isExpired, daysLeft } = getExpiryInfo(member)
    if (!member.planName) return 'unpaid'
    if (isExpired) return 'overdue'
    if (daysLeft !== null && daysLeft <= 7 && daysLeft > 0) return 'partial'
    if ((member.status || '').toLowerCase() === 'active') return 'paid'
    return 'unpaid'
  }

  const getPaymentBadgeClass = (status: string) => {
    switch (status) {
      case 'paid': return 'payment-badge--paid'
      case 'overdue': return 'payment-badge--overdue'
      case 'partial': return 'payment-badge--partial'
      default: return 'payment-badge--unpaid'
    }
  }

  const formatCheckIn = (member: MemberDTO) => {
    const dateStr = member.lastCheckInDate || (member as any).lastVisit
    if (!dateStr) return { text: 'Never', className: 'checkin--never' }
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    const diffDays = Math.floor(diffHours / 24)
    if (diffHours < 24) {
      const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      return { text: `Today ${timeStr}`, className: 'checkin--recent' }
    }
    if (diffDays <= 7) return { text: `${diffDays}d ago`, className: 'checkin--week' }
    return { text: `${diffDays}d ago`, className: 'checkin--old' }
  }

  const formatJoinDate = (member: MemberDTO) => {
    const dateStr = member.joinDate || member.createdAt || member.startDate
    if (!dateStr) return { date: '—', tenure: '' }
    const d = new Date(dateStr)
    const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const now = new Date()
    const months = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 30))
    const tenure = months < 1 ? 'New' : months < 12 ? `${months}mo` : `${Math.floor(months / 12)}y ${months % 12}mo`
    return { date: dateFormatted, tenure }
  }

  // -----------------------------------------------------------------------
  // Derived filter data from real membership plans
  // -----------------------------------------------------------------------

  // All unique categories that have at least one plan
  const planCategories = useMemo(() => {
    const cats = new Set(membershipPlans.map(p => p.category))
    return Array.from(cats) as PlanCategory[]
  }, [membershipPlans])

  // Plans filtered by selected category (or all)
  const plansForFilter = useMemo(() => {
    if (!filters.planCategory) return membershipPlans
    return membershipPlans.filter(p => p.category === filters.planCategory)
  }, [membershipPlans, filters.planCategory])

  // Unique duration options derived from the visible plans' variants
  const durationOptions = useMemo(() => {
    const seen = new Set<string>()
    const opts: { label: string; value: string }[] = []
    const planPool = filters.plan.length > 0
      ? membershipPlans.filter(p => filters.plan.includes(p.planName))
      : plansForFilter
    planPool.forEach(plan => {
      (plan.variants || []).forEach(v => {
        if (!v.isActive) return
        const key = `${v.durationValue} ${v.durationUnit}`
        if (!seen.has(key)) {
          seen.add(key)
          const unitLabel = v.durationUnit === 'MONTHS'
            ? (v.durationValue === 1 ? 'Month' : 'Months')
            : v.durationUnit === 'YEARS'
              ? (v.durationValue === 1 ? 'Year' : 'Years')
              : v.durationUnit === 'DAYS'
                ? (v.durationValue === 1 ? 'Day' : 'Days')
                : v.durationUnit
          opts.push({ label: `${v.durationValue} ${unitLabel}`, value: key })
        }
      })
    })
    // Sort: days asc, then months asc, then years asc
    opts.sort((a, b) => {
      const toMonths = (val: string) => {
        const [num, unit] = val.split(' ')
        const n = parseInt(num)
        if (unit === 'DAYS') return n / 30
        if (unit === 'MONTHS') return n
        if (unit === 'YEARS') return n * 12
        return n
      }
      return toMonths(a.value) - toMonths(b.value)
    })
    return opts
  }, [membershipPlans, plansForFilter, filters.plan])

  const categoryLabels: Record<string, string> = {
    STANDARD: 'Standard', PREMIUM: 'Premium', VIP: 'VIP Elite',
    CORPORATE: 'Corporate', STUDENT: 'Student', CUSTOM: 'Custom',
  }

  const categoryColors: Record<string, string> = {
    STANDARD: '#3B82F6', PREMIUM: '#8B5CF6', VIP: '#F59E0B',
    CORPORATE: '#10B981', STUDENT: '#6366F1', CUSTOM: '#EC4899',
  }

  const columns: Column<MemberDTO>[] = [
    {
      key: "userId",
      header: "ID",
      width: "70px",
      render: (member) => (
        <button
          className="member-id-copy"
          onClick={(e) => {
            e.stopPropagation()
            navigator.clipboard.writeText(member.userId.toString())
            showToast(`ID ${member.userId} copied`, 'success')
          }}
          title="Click to copy ID"
        >
          #{member.userId}
        </button>
      ),
    },
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
            <div className="member-cell__sub">
              <span className="member-email">{member.email}</span>
              {member.planName && (
                <span className={`member-inline-plan ${getPlanClass(member.planName)}`}>
                  {member.planName}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
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
      key: "phone",
      header: "Phone",
      width: "130px",
      render: (member) => {
        const phone = member.phone || member.phoneNumber || (member as any).phoneNumber
        if (!phone) return <span className="member-phone member-phone--none">—</span>
        return (
          <a href={`tel:${phone}`} className="member-phone" onClick={(e) => e.stopPropagation()}>
            <FiPhone size={12} />
            <span>{phone}</span>
          </a>
        )
      },
    },
    {
      key: "paymentStatus",
      header: "Payment",
      width: "100px",
      render: (member) => {
        const status = getPaymentStatus(member)
        return (
          <div className="member-payment-cell">
            <span className={`payment-badge ${getPaymentBadgeClass(status)}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        )
      },
    },
    {
      key: "expiryDate",
      header: "Validity",
      width: "110px",
      render: (member) => {
        const { date, daysLeft, isExpired } = getExpiryInfo(member)
        if (!date) return <span className="member-date member-date--none">No plan</span>

        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

        let validityLabel: string
        let validityClass = 'member-days-left'
        if (isExpired) {
          validityLabel = `${Math.abs(daysLeft!)}d overdue`
          validityClass += ' member-days-left--expired'
        } else if (daysLeft === 0) {
          validityLabel = 'Expires today'
          validityClass += ' member-days-left--warning'
        } else if (daysLeft !== null && daysLeft <= 7) {
          validityLabel = `${daysLeft}d left`
          validityClass += ' member-days-left--warning'
        } else {
          validityLabel = `${daysLeft}d left`
        }

        return (
          <div className="member-expiry-cell">
            <span className={validityClass}>{validityLabel}</span>
            <span className="member-expiry-date">{dateStr}</span>
          </div>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      width: "110px",
      render: (member) => {
        const { isExpired, daysLeft } = getExpiryInfo(member)
        let statusText = member.status || 'Unknown'
        let statusClass = 'status-badge'

        if (isExpired) {
          statusText = 'Expired'
          statusClass += ' status-badge--danger'
        } else if (daysLeft === 0) {
          statusText = 'Expires Today'
          statusClass += ' status-badge--warning'
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
      key: "lastCheckIn",
      header: "Last Check-in",
      // MEDIUM #5: hide at <1100px via className on the cell + CSS
      width: "110px",
      render: (member) => {
        const { text, className } = formatCheckIn(member)
        return (
          <div className="member-checkin-cell col-hide-1100">
            <span className={`checkin-text ${className}`}>{text}</span>
          </div>
        )
      },
    },
    {
      key: "joinDate",
      header: "Joined",
      width: "110px",
      render: (member) => {
        const { date, tenure } = formatJoinDate(member)
        return (
          <div className="member-join-cell col-hide-1100">
            <span className="join-date">{date}</span>
            {tenure && <span className="join-tenure">{tenure}</span>}
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
                title="Manage Plan"
              >
                <FiPackage size={14} />
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

  // LOW #3: Retention trend icon + color
  const RetentionTrendIcon = stats.retentionTrend === 'up'
    ? <FiTrendingUp size={10} />
    : stats.retentionTrend === 'down'
      ? <FiTrendingDown size={10} />
      : <FiMinus size={10} />

  const retentionTrendClass = stats.retentionTrend === 'up'
    ? 'retention-trend--up'
    : stats.retentionTrend === 'down'
      ? 'retention-trend--down'
      : 'retention-trend--flat'

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
              {/* HIGH #9: removed redundant total count, keep only "new this month" */}
              <span className="pg-header__subtitle">{stats.newThisMonth} new this month</span>
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
              <div className="pg-stat-card__icon pg-stat-card__icon--expired"><FiUserX size={14} /></div>
              <div className="pg-stat-card__data">
                <span className="pg-stat-card__value pg-stat-card__value--red">{stats.expiredCount}</span>
                <span className="pg-stat-card__label">Expired</span>
              </div>
            </button>
            {/* LOW #3: retention card with trend delta */}
            <div className="pg-stat-card pg-stat-card--no-click">
              <div className="pg-stat-card__icon pg-stat-card__icon--special"><FiPercent size={14} /></div>
              <div className="pg-stat-card__data">
                <span className="pg-stat-card__value pg-stat-card__value--indigo">{stats.retentionRate}%</span>
                <span className="pg-stat-card__label">Retention</span>
              </div>
              {stats.retentionDelta > 0 && (
                <span className={`retention-trend ${retentionTrendClass}`}>
                  {RetentionTrendIcon}
                  {stats.retentionDelta}
                </span>
              )}
            </div>
          </div>

          <div className="pg-header__actions">
            {/* LOW #2: export button with spin → checkmark */}
            <button
              className={`pg-btn pg-btn--icon export-btn ${exportState === 'exporting' ? 'pg-btn--spin' : ''} ${exportState === 'done' ? 'export-btn--done' : ''}`}
              onClick={handleExportCSV}
              title="Export as CSV"
              disabled={exportState === 'exporting'}
            >
              {exportState === 'done' ? <FiCheck size={14} /> : <FiDownload size={14} />}
            </button>
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

        {/* Row 2: Search + Filters */}
        <div className="pg-header__row-2">
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

            {/* MEDIUM #6: styled filter panel with pill chips for Status */}
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
                    {/* ── STATUS ── pill chips */}
                    <div className="pg-filter-dropdown__row pg-filter-dropdown__row--col">
                      <label className="pg-filter-dropdown__label">Status</label>
                      <div className="pg-filter-pills">
                        {['', 'Active', 'Expired'].map(val => (
                          <button
                            key={val}
                            className={`pg-filter-pill ${(filters.status[0] || '') === val ? 'pg-filter-pill--active' : ''}`}
                            onClick={() => setFilters(prev => ({ ...prev, status: val ? [val] : [] }))}
                          >
                            {val || 'All'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── CATEGORY ── derived from real plans */}
                    {planCategories.length > 0 && (
                      <div className="pg-filter-dropdown__row pg-filter-dropdown__row--col">
                        <label className="pg-filter-dropdown__label">
                          Category
                          {plansLoading && <span className="pg-filter-label__loading" />}
                        </label>
                        <div className="pg-filter-pills">
                          <button
                            className={`pg-filter-pill ${!filters.planCategory ? 'pg-filter-pill--active' : ''}`}
                            onClick={() => setFilters(prev => ({ ...prev, planCategory: "", plan: [], planDuration: "" }))}
                          >
                            All
                          </button>
                          {planCategories.map(cat => (
                            <button
                              key={cat}
                              className={`pg-filter-pill pg-filter-pill--category ${filters.planCategory === cat ? 'pg-filter-pill--active' : ''}`}
                              style={{ '--cat-color': categoryColors[cat] || '#6366F1' } as React.CSSProperties}
                              onClick={() => setFilters(prev => ({
                                ...prev,
                                planCategory: prev.planCategory === cat ? "" : cat,
                                plan: [],
                                planDuration: "",
                              }))}
                            >
                              {categoryLabels[cat] || cat}
                              <span className="pg-filter-pill__count">
                                {membershipPlans.filter(p => p.category === cat).length}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── PLAN ── pills with color dot + icon from real plans */}
                    <div className="pg-filter-dropdown__row pg-filter-dropdown__row--col">
                      <label className="pg-filter-dropdown__label">Plan</label>
                      {plansLoading ? (
                        <div className="pg-filter-plans-loading">
                          <span className="pg-filter-skeleton" />
                          <span className="pg-filter-skeleton pg-filter-skeleton--sm" />
                        </div>
                      ) : plansForFilter.length > 0 ? (
                        <div className="pg-filter-pills pg-filter-pills--plans">
                          <button
                            className={`pg-filter-pill ${filters.plan.length === 0 ? 'pg-filter-pill--active' : ''}`}
                            onClick={() => setFilters(prev => ({ ...prev, plan: [], planDuration: "" }))}
                          >
                            All
                          </button>
                          {plansForFilter.map(plan => (
                            <button
                              key={plan.planId ?? plan.planName}
                              className={`pg-filter-pill pg-filter-pill--plan ${filters.plan.includes(plan.planName) ? 'pg-filter-pill--plan-active' : ''}`}
                              style={{ '--plan-color': plan.planColor || '#6366F1' } as React.CSSProperties}
                              onClick={() => setFilters(prev => ({
                                ...prev,
                                plan: prev.plan.includes(plan.planName) ? [] : [plan.planName],
                                planDuration: "",
                              }))}
                              title={plan.description || plan.planName}
                            >
                              {plan.iconName && <span className="pg-filter-pill__icon">{plan.iconName}</span>}
                              {plan.planName}
                              {plan.memberCount != null && (
                                <span className="pg-filter-pill__count">{plan.memberCount}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="pg-filter-empty-hint">No plans configured yet</span>
                      )}
                    </div>

                    {/* ── DURATION ── derived from selected plan's real variants */}
                    <div className="pg-filter-dropdown__row pg-filter-dropdown__row--col">
                      <label className="pg-filter-dropdown__label">
                        Duration
                        {filters.plan.length > 0 && (
                          <span className="pg-filter-label__sub"> · {filters.plan[0]}</span>
                        )}
                      </label>
                      {durationOptions.length > 0 ? (
                        <div className="pg-filter-pills">
                          <button
                            className={`pg-filter-pill ${!filters.planDuration ? 'pg-filter-pill--active' : ''}`}
                            onClick={() => setFilters(prev => ({ ...prev, planDuration: "" }))}
                          >
                            Any
                          </button>
                          {durationOptions.map(opt => (
                            <button
                              key={opt.value}
                              className={`pg-filter-pill ${filters.planDuration === opt.value ? 'pg-filter-pill--active' : ''}`}
                              onClick={() => setFilters(prev => ({ ...prev, planDuration: prev.planDuration === opt.value ? "" : opt.value }))}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="pg-filter-pills">
                          {['', '1 MONTHS', '3 MONTHS', '6 MONTHS', '12 MONTHS', '1 YEARS'].map(val => (
                            <button
                              key={val}
                              className={`pg-filter-pill ${filters.planDuration === val ? 'pg-filter-pill--active' : ''}`}
                              onClick={() => setFilters(prev => ({ ...prev, planDuration: val }))}
                            >
                              {val === '' ? 'Any'
                                : val === '12 MONTHS' ? '1 Year'
                                  : val.replace(' MONTHS', ' Mo').replace(' YEARS', ' Yr')}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ── JOINED ── select */}
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

            {/* MEDIUM #4: refresh button with spin while loading */}
            <button
              className={`pg-btn pg-btn--icon ${isRefreshing ? 'pg-btn--spin' : ''}`}
              onClick={handleRefresh}
              title="Refresh"
              disabled={isRefreshing}
            >
              <FiRefreshCw size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* HIGH #7: Expiring Soon alert banner */}
      {stats.expiringSoon > 0 && !expiringAlertDismissed && (
        <div className="members-expiry-alert">
          <FiAlertTriangle size={14} className="members-expiry-alert__icon" />
          <span>
            <strong>{stats.expiringSoon} membership{stats.expiringSoon > 1 ? 's' : ''}</strong> expiring within 7 days
          </span>
          <button
            className="members-expiry-alert__action"
            onClick={() => { setActiveStatusFilter('expiring'); setExpiringAlertDismissed(true) }}
          >
            View & Renew
          </button>
          <button className="members-expiry-alert__dismiss" onClick={() => setExpiringAlertDismissed(true)}>
            <FiX size={12} />
          </button>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="pg-chips">
          {filters.status.length > 0 && (
            <span className="pg-chip">
              Status: {filters.status[0]}
              <button onClick={() => setFilters(prev => ({ ...prev, status: [] }))}>&times;</button>
            </span>
          )}
          {filters.planCategory && (
            <span className="pg-chip pg-chip--category" style={{ '--cat-color': categoryColors[filters.planCategory] || '#6366F1' } as React.CSSProperties}>
              {categoryLabels[filters.planCategory] || filters.planCategory}
              <button onClick={() => setFilters(prev => ({ ...prev, planCategory: "", plan: [], planDuration: "" }))}>&times;</button>
            </span>
          )}
          {filters.plan.length > 0 && (
            <span className="pg-chip pg-chip--plan">
              {filters.plan[0]}
              <button onClick={() => setFilters(prev => ({ ...prev, plan: [], planDuration: "" }))}>&times;</button>
            </span>
          )}
          {filters.planDuration && (
            <span className="pg-chip">
              {durationOptions.find(d => d.value === filters.planDuration)?.label || filters.planDuration}
              <button onClick={() => setFilters(prev => ({ ...prev, planDuration: "" }))}>&times;</button>
            </span>
          )}
          {filters.joinedPeriod && (
            <span className="pg-chip">
              Joined: {filters.joinedPeriod.replace(/-/g, ' ')}
              <button onClick={() => setFilters(prev => ({ ...prev, joinedPeriod: "" }))}>&times;</button>
            </span>
          )}
          <button className="pg-chips__clear" onClick={handleResetFilters}>Clear All</button>
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
          {/* HIGH #8: open in-app modal instead of window.confirm */}
          <button className="pg-batch__btn pg-batch__btn--danger" onClick={() => setBulkDeleteModalOpen(true)}>
            Delete
          </button>
          <button className="pg-batch__clear" onClick={() => setSelectedMemberIds(new Set())}>&times;</button>
        </div>
      )}

      {/* Main Table */}
      <div className="pg-table-wrap members-table-wrapper">
        {/* LOW #1: Rich empty state */}
        {!loading && !allMembersLoading && paginatedFilteredMembers.length === 0 ? (
          <div className="members-empty-state">
            <div className="members-empty-state__icon">
              <FiUsers size={32} />
            </div>
            <h3 className="members-empty-state__title">
              {debouncedSearch || activeFilterCount > 0 || isUsingTabFilter
                ? 'No members match your filters'
                : 'No members yet'}
            </h3>
            <p className="members-empty-state__desc">
              {debouncedSearch || activeFilterCount > 0 || isUsingTabFilter
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Add your first member to get started tracking memberships.'}
            </p>
            {debouncedSearch || activeFilterCount > 0 || isUsingTabFilter ? (
              <button className="members-empty-state__btn members-empty-state__btn--secondary" onClick={handleResetFilters}>
                <FiX size={14} /> Clear Filters
              </button>
            ) : (
              <button className="members-empty-state__btn members-empty-state__btn--primary" onClick={() => setIsCreateModalOpen(true)}>
                <FiUserPlus size={14} /> Add Member
              </button>
            )}
          </div>
        ) : (
          <DataTable
            data={paginatedFilteredMembers}
            keyExtractor={(member) => member.userId}
            columns={columns as Column<MemberDTO>[]}
            loading={isUsingTabFilter ? allMembersLoading : loading}
            onRowClick={handleActionClick}
            emptyMessage=""
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
            mobileCardRender={(member) => {
              const { daysLeft, isExpired } = getExpiryInfo(member)
              const paymentStat = getPaymentStatus(member)
              const memberPhone = member.phone || member.phoneNumber || (member as any).phoneNumber

              // Compute display status same way as the table column
              let mobileStatusText: string
              let mobileStatusVariant: 'success' | 'warning' | 'danger' | 'default'
              if (isExpired) {
                mobileStatusText = 'Expired'
                mobileStatusVariant = 'danger'
              } else if (daysLeft === 0) {
                mobileStatusText = 'Expires Today'
                mobileStatusVariant = 'warning'
              } else if (daysLeft !== null && daysLeft <= 7 && daysLeft > 0) {
                mobileStatusText = 'Expiring'
                mobileStatusVariant = 'warning'
              } else if ((member.status || '').toLowerCase() === 'active') {
                mobileStatusText = 'Active'
                mobileStatusVariant = 'success'
              } else {
                mobileStatusText = 'Inactive'
                mobileStatusVariant = 'default'
              }
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
                              {isExpired
                                ? `${Math.abs(daysLeft)}d overdue`
                                : daysLeft === 0
                                  ? 'Expires today'
                                  : `${daysLeft}d left`}
                            </span>
                          )}
                        </span>
                        {memberPhone && (
                          <a href={`tel:${memberPhone}`} className="member-card__phone" onClick={(e) => e.stopPropagation()}>
                            <FiPhone size={12} /> {memberPhone}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="member-card__badges">
                      <span className={`payment-badge ${getPaymentBadgeClass(paymentStat)}`}>
                        {paymentStat.charAt(0).toUpperCase() + paymentStat.slice(1)}
                      </span>
                      <Badge variant={mobileStatusVariant}>{mobileStatusText}</Badge>
                    </div>
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
        )}
      </div>

      {/* HIGH #8: In-app bulk delete confirmation modal */}
      {bulkDeleteModalOpen && (
        <div className="members-confirm-overlay" onClick={() => setBulkDeleteModalOpen(false)}>
          <div className="members-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="members-confirm-modal__icon">
              <FiTrash2 size={24} />
            </div>
            <h3 className="members-confirm-modal__title">Delete {selectedMemberIds.size} member{selectedMemberIds.size > 1 ? 's' : ''}?</h3>
            <p className="members-confirm-modal__desc">
              This action cannot be undone. The selected {selectedMemberIds.size > 1 ? 'members' : 'member'} and all associated data will be permanently removed.
            </p>
            <div className="members-confirm-modal__actions">
              <button className="members-confirm-modal__btn members-confirm-modal__btn--cancel" onClick={() => setBulkDeleteModalOpen(false)}>
                Cancel
              </button>
              <button className="members-confirm-modal__btn members-confirm-modal__btn--confirm" onClick={handleBulkDeleteConfirm}>
                <FiTrash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isActionModalOpen && selectedMember && (
        <EnhancedMemberActionModal
          isOpen={isActionModalOpen}
          onClose={handleCloseActionModal}
          member={selectedMember as unknown as User}
          onEditProfile={() => { triggerRefresh(); refreshMembers(); }}
          onRenewPlan={(member, packageId, amount, customDuration, skipTransaction) => {
            handleRenewPlan(member as unknown as MemberDTO, packageId, amount, customDuration, skipTransaction);
            triggerRefresh();
          }}
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
          triggerRefresh()
          refreshMembers()
        }}
        initialView="memberForm"
      />

      <TieredPlanManagement
        isOpen={isMembershipModalOpen}
        onClose={() => setIsMembershipModalOpen(false)}
        onSuccess={() => {
          triggerRefresh()
          refreshMembers()
          api.getMemberPlanNames().then(() => { }).catch(() => { })
          membershipPlanApi.getAllTieredPlans()
            .then(res => setMembershipPlans(res.data || []))
            .catch(() => { })
        }}
      />
    </div>
  )
}

export default Members
