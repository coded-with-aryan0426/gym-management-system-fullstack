"use client"

import type React from "react"
import { useEffect, useState, useMemo, useCallback } from "react"
import { FiMoreVertical, FiSearch } from "react-icons/fi"
import { toast } from "react-hot-toast"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button, Badge, getStatusVariant, Avatar, DataTable, CreateUserModal, type Column } from "../../components"
import EnhancedMemberActionModal from "../../components/MemberActionModal/EnhancedMemberActionModal"
import api from "../../services/api"
import type { User, MemberDTO } from "../../types/user"
import "./Members.css"

interface FilterState {
  status: string[]
  plan: string[]
  lastVisit: string
  dateFrom: string
  dateTo: string

  month: string
  planDuration: string
}

const Members: React.FC = () => {
  const [members, setMembers] = useState<MemberDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMember, setSelectedMember] = useState<MemberDTO | null>(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // V1 Manual Entry: Check query param for auto-open
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);


  const [filters, setFilters] = useState<FilterState>({
    status: [],
    plan: [],
    lastVisit: "",
    dateFrom: "",
    dateTo: "",
    month: "",
    planDuration: "",
  })

  // Redesign State
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [isSticky, setIsSticky] = useState(false)

  // Scroll listener for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 60)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Live Stats Calculation
  const stats = useMemo(() => {
    const total = members.length
    const active = members.filter(m => m.status === 'Active').length
    const inactive = total - active
    return { total, active, inactive }
  }, [members])

  const loadMembers = useCallback(async () => {
    setLoading(true)
    try {
      // V1: Load all members directly (no gym checks)
      const data = await api.getMembers()
      console.log("[Debug] Real Member Data:", data[0]);
      setMembers(data)
    } catch (err) {
      console.error("[Beta] Failed to load members from backend:", err)
      toast.error("Failed to load members")
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  const handleActionClick = (member: MemberDTO) => {
    setSelectedMember(member)
    setIsActionModalOpen(true)
  }

  const handleCloseActionModal = () => {
    setIsActionModalOpen(false)
    setSelectedMember(null)
  }

  const handleEditProfile = async (member: MemberDTO) => {
    // API call already made in EnhancedMemberActionModal, just refresh the list
    loadMembers() // Refresh list but keep modal open
  }

  const handleRenewPlan = async (member: MemberDTO, packageId?: number, amount?: number, customDuration?: number, skipTransaction?: boolean) => {
    try {
      if (packageId) {
        // Call API
        await api.renewMembership(member.userId, packageId, customDuration)

        // Create transaction record for history if not skipped
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

        // toast.success(`Membership renewed${skipTransaction ? '' : ' and payment recorded'} for ${member.fullName}`) -> Handled in modal
        console.log(`Membership renewed for ${member.fullName}`)
        loadMembers() // Refresh list but keep modal open
      } else {
        console.warn("Renew plan called without packageId")
      }
    } catch (err) {
      console.error("Failed to renew membership:", err)
      toast.error("Failed to process renewal. Please try again.")
    }
  }

  const handleSendMessage = async (member: MemberDTO) => {
    toast.success(`Message sent to ${member.fullName}`)
    // Keep modal open after sending message
  }

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status) ? prev.status.filter((s) => s !== status) : [...prev.status, status],
    }))
  }

  const handlePlanFilter = (plan: string) => {
    setFilters((prev) => ({
      ...prev,
      plan: prev.plan.includes(plan) ? prev.plan.filter((p) => p !== plan) : [...prev.plan, plan],
    }))
  }

  const handleResetFilters = () => {
    setFilters({
      status: [],
      plan: [],
      lastVisit: "",
      dateFrom: "",
      dateTo: "",
      month: "",
      planDuration: "",
    })
  }

  // Filter members based on search and filters
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = filters.status.length === 0 || filters.status.includes(member.status || "Inactive")
      const matchesPlan = filters.plan.length === 0 || filters.plan.some(p => (member.planName || "").includes(p))

      const matchesMonth = filters.month === "" || (member.startDate && new Date(member.startDate).getMonth() + 1 === Number(filters.month))

      const matchesDuration = filters.planDuration === "" || (member.planDuration && String(member.planDuration).includes(filters.planDuration))


      // Date Filter Implementation (targeting startDate / Join Date)
      let matchesDate = true
      if (member.startDate) {
        const joinDate = new Date(member.startDate)
        const today = new Date()
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        switch (filters.lastVisit) {
          case "today":
            matchesDate = joinDate >= startOfDay && joinDate < new Date(startOfDay.getTime() + 86400000)
            break
          case "week": {
            const firstDay = new Date(today.setDate(today.getDate() - today.getDay())) // Sunday
            firstDay.setHours(0, 0, 0, 0)
            matchesDate = joinDate >= firstDay
            break
          }
          case "month": {
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
            matchesDate = joinDate >= firstDayOfMonth
            break
          }
          case "custom":
            if (filters.dateFrom && filters.dateTo) {
              const from = new Date(filters.dateFrom)
              from.setHours(0, 0, 0, 0)
              const to = new Date(filters.dateTo)
              to.setHours(23, 59, 59, 999)
              matchesDate = joinDate >= from && joinDate <= to
            }
            break
          default:
            matchesDate = true // "all" or empty
        }
      } else if (filters.lastVisit && filters.lastVisit !== "") {
        // If member has no date but filter is active, exclude them
        matchesDate = false
      }

      return matchesSearch && matchesStatus && matchesPlan && matchesMonth && matchesDuration
    })
  }, [members, searchQuery, filters])

  // Table columns definition
  // Note: DataTable probably expects Generic. Casting for safety if needed.
  const columns: Column<MemberDTO>[] = [
    {
      key: "index",
      header: "#",
      width: "50px",
      render: (_, index) => <span className="member-index" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>{index + 1}</span>,
    },
    {
      key: "fullName",
      header: "Name",
      render: (member) => (
        <div className="member-cell">
          <Avatar name={member.fullName} size="md" />
          <span className="member-name">{member.fullName}</span>
        </div>
      ),
    },
    {
      key: "planName",
      header: "Plan",
      render: (member) => <span className="member-plan">{member.planName}</span>,
    },
    {
      key: "planDuration",
      header: "Duration",
      render: (member) => <span className="member-plan-duration">{member.planDuration || "-"}</span>,
    },
    {
      key: "joinDate",
      header: "Join Date",
      render: (member) => (
        <span className="member-date">
          {member.startDate ? new Date(member.startDate).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (member) => {
        return <Badge variant={getStatusVariant(member.status)}>{member.status}</Badge>
      },
    },
    {
      key: "actions",
      header: "",
      width: "80px",
      render: (member) => (
        <div className="member-actions">
          <button className="action-menu-btn" title="Actions" onClick={() => handleActionClick(member)}>
            •••
          </button>
        </div>
      ),
    },
  ]

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.status.length > 0) count++
    if (filters.plan.length > 0) count++
    if (filters.lastVisit) count++
    if (filters.dateFrom) count++
    if (filters.planDuration) count++
    return count
  }, [filters])

  return (
    <div className="members-page">
      {/* 2. Members Directory Header – Compact & Powerful */}
      <div className="members-page__header">
        <div className="members-page__title-section">
          <h1 className="members-page__title">Members</h1>
          <span className="members-page__subtitle">Manage, filter, and act on all members</span>
        </div>

        <div className="members-page__header-right">
          <div className="members-stats-badge">
            <div className="stat-pill stat-pill--active">
              <span className="stat-dot active"></span>
              <span>{stats.active} Active</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-pill">
              <span className="stat-dot inactive"></span>
              <span>{stats.inactive} Inactive</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-pill">
              <span>{stats.total} Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Smart Filter Bar – Sticky & Intelligent */}
      <div className={`smart-filter-bar ${isSticky ? 'smart-filter-bar--stuck' : ''}`}>
        <div className="filter-controls">
          <div className="filter-primary-row">
            {/* Search */}
            <div className="filter-search-wrapper">
              <FiSearch className="filter-search-icon" />
              <input
                type="text"
                className="filter-search-input"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter Pill */}
            <select
              className={`filter-pill filter-select ${filters.status.length > 0 ? 'filter-pill--active' : ''}`}
              value={filters.status[0] || ""}
              onChange={(e) => {
                const val = e.target.value
                setFilters(prev => ({ ...prev, status: val ? [val] : [] }))
              }}
            >
              <option value="" disabled>Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>

            {/* Plan Filter Pill */}
            <select
              className={`filter-pill filter-select ${filters.plan.length > 0 ? 'filter-pill--active' : ''}`}
              value={filters.plan[0] || ""}
              onChange={(e) => {
                const val = e.target.value
                setFilters(prev => ({ ...prev, plan: val ? [val] : [] }))
              }}
            >
              <option value="" disabled>Plan</option>
              <option value="Gold">Gold Plan</option>
              <option value="Silver">Silver Plan</option>
              <option value="Platinum">Platinum Plan</option>
            </select>

            {/* More Filters Toggle */}
            <button
              className="btn-more-filters"
              onClick={() => setShowMoreFilters(!showMoreFilters)}
            >
              <FiMoreVertical />
              {showMoreFilters ? 'Less Filters' : 'More Filters'}
            </button>

            {/* Reset/Clear */}
            {(activeFilterCount > 0 || searchQuery) && (
              <button className="btn-clear-filters" onClick={() => {
                handleResetFilters()
                setSearchQuery("")
              }}>
                Clear Filters
              </button>
            )}
          </div>

          {/* Collapsible Secondary Filters */}
          {showMoreFilters && (
            <div className="filter-secondary-row">
              <select
                className={`filter-pill filter-select ${filters.lastVisit ? 'filter-pill--active' : ''}`}
                value={filters.lastVisit}
                onChange={(e) => handleFilterChange('lastVisit', e.target.value)}
              >
                <option value="">Join Date</option>
                <option value="today">Joined Today</option>
                <option value="week">Joined This Week</option>
                <option value="month">Joined This Month</option>
              </select>

              <select
                className={`filter-pill filter-select ${filters.planDuration ? 'filter-pill--active' : ''}`}
                value={filters.planDuration}
                onChange={(e) => handleFilterChange('planDuration', e.target.value)}
              >
                <option value="">Duration</option>
                <option value="1">1 Month</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
              </select>
            </div>
          )}

          {/* 5. Insight Row */}
          <div className="filter-insight-row">
            Showing <span className="highlight-count">{filteredMembers.length}</span> of <span className="highlight-count">{members.length}</span> members
            {(activeFilterCount > 0 || searchQuery) && " (Filtered)"}
          </div>
        </div>
      </div>

      <div className="members-page__content">
        <div className="members-page__table-container">
          <DataTable
            data={filteredMembers}
            keyExtractor={(member) => member.userId}
            columns={columns as any}
            loading={loading}
            onRowClick={handleActionClick as any}
            emptyMessage={
              searchQuery || activeFilterCount > 0
                ? "No members match your filters"
                : "No members found. Add your first member!"
            }
          />
        </div>
      </div>

      {isActionModalOpen && selectedMember && (
        <EnhancedMemberActionModal
          isOpen={isActionModalOpen}
          onClose={handleCloseActionModal}
          member={selectedMember as any}
          onEditProfile={(updatedMember) => handleEditProfile(updatedMember as unknown as MemberDTO)}
          onRenewPlan={(member, packageId, amount, customDuration, skipTransaction) => handleRenewPlan(member as unknown as MemberDTO, packageId, amount, customDuration, skipTransaction)}
          onSendMessage={() => handleSendMessage(selectedMember)}
        />
      )}

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setSearchParams(prev => {
            const newParams = new URLSearchParams(prev)
            newParams.delete('action')
            return newParams
          })
        }}
        onSuccess={() => {
          loadMembers()
          toast.success("Member added successfully")
        }}
        initialRole="CUSTOMER"
      />
    </div>
  )
}

export default Members
