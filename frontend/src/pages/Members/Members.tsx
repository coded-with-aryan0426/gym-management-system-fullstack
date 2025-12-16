"use client"

import type React from "react"
import { useEffect, useState, useMemo, useCallback } from "react"
import { FiMoreVertical, FiSearch, FiFilter, FiX } from "react-icons/fi"
import { toast } from "react-hot-toast"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button, Badge, getStatusVariant, Avatar, DataTable, CreateUserModal, type Column } from "../../components"
import EnhancedMemberActionModal from "../../components/MemberActionModal/EnhancedMemberActionModal"
import api from "../../services/api"
import type { User, MemberDTO } from "../../types/user"
import { useMembers } from "../../contexts/MembersContext"
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
  // Use Global State
  const { members, loading, refreshMembers, stats: globalStats } = useMembers()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMember, setSelectedMember] = useState<MemberDTO | null>(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleActionClick = (member: MemberDTO) => {
    setSelectedMember(member)
    setIsActionModalOpen(true)
  }

  const handleCloseActionModal = () => {
    setIsActionModalOpen(false)
    setSelectedMember(null)
  }

  // V1 Manual Entry & Global Search Navigation
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    // Handle 'create' action
    if (searchParams.get('action') === 'create') {
      setIsCreateModalOpen(true);
    }

    // Handle 'userId' from Global Search
    const userId = searchParams.get('userId')
    if (userId && members.length > 0) {
      const member = members.find(m => m.userId.toString() === userId)
      if (member) {
        handleActionClick(member)
      }
    }
  }, [searchParams, members]);


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
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [isSticky, setIsSticky] = useState(false)

  // Scroll listener for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 60)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Live Stats Calculation (derived from Filtered or Global)
  // Replaced loadMembers with refreshMembers from context

  // Filter members based on search and filters
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // 1. Search Query (Name/Email)
      const matchesSearch =
        member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())

      // 2. Status Filter
      const matchesStatus = filters.status.length === 0 ||
        filters.status.some(s => s.toLowerCase() === (member.status || "inactive").toLowerCase())

      // 3. Plan Filter
      const matchesPlan = filters.plan.length === 0 ||
        filters.plan.some(p => {
          const name = (member.planName || "").toLowerCase()
          return name.includes(p.toLowerCase())
        })

      // 4. Month Filter (Start Date)
      // Check if start month matches filter (1-12)
      const matchesMonth = filters.month === "" ||
        (member.startDate && new Date(member.startDate).getMonth() + 1 === Number(filters.month))

      // 5. Plan Duration Filter (Smart Parsing for Days/Months)
      let matchesDuration = true
      if (filters.planDuration !== "") {
        const raw = (member.planDuration || "").toLowerCase()
        const num = parseInt(raw) || 0
        let months = 0

        if (raw.includes('day')) months = Math.round(num / 30)
        else if (raw.includes('year')) months = num * 12
        else months = num // Default to months if unit missing or 'month' present

        // Strict equality on normalized months
        matchesDuration = months === Number(filters.planDuration)
      }

      // 6. Join Date / Last Visit Filter
      let matchesDate = true

      // Use efficient date checking
      const dateStr = member.joinDate || member.startDate || member.createdAt
      if (dateStr) {
        const joinDate = new Date(dateStr)
        const today = new Date()

        switch (filters.lastVisit) {
          case "today": {
            const startOfDay = new Date(today.setHours(0, 0, 0, 0))
            matchesDate = joinDate >= startOfDay
            break
          }
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
          default:
            matchesDate = true
        }
      } else if (filters.lastVisit) {
        matchesDate = false // Filter active but no date -> exclude
      }

      // STRICT AND LOGIC
      return matchesSearch && matchesStatus && matchesPlan && matchesMonth && matchesDuration && matchesDate
    })
  }, [members, searchQuery, filters])

  // Stats Logic: If filters active, show filtered counts. Else show global.
  // Note: activeFilterCount calculation needs to be here or above
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.status.length > 0) count++
    if (filters.plan.length > 0) count++
    if (filters.lastVisit) count++
    if (filters.planDuration) count++
    return count
  }, [filters])

  const stats = useMemo(() => {
    if (activeFilterCount > 0) {
      return {
        total: filteredMembers.length,
        active: filteredMembers.filter(m => (m.status || 'Inactive').toLowerCase() === 'active').length,
        inactive: filteredMembers.filter(m => (m.status || 'Inactive').toLowerCase() !== 'active').length
      }
    }
    // Check if globalStats is loaded, else fallback
    return {
      total: globalStats.total,
      active: globalStats.active,
      inactive: globalStats.inactive || (globalStats.total - globalStats.active)
    }
  }, [activeFilterCount, filteredMembers, globalStats])

  // Callbacks replacing manual load
  const handleEditProfile = async (member: MemberDTO) => {
    refreshMembers()
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
        refreshMembers() // Refresh list but keep modal open
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
        <div
          className="member-cell"
          onClick={(e) => { e.stopPropagation(); handleActionClick(member) }}
          style={{ cursor: 'pointer' }}
        >
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



  return (
    <div className="members-page">
      {/* 2. Members Directory Header – Compact & Powerful */}
      <div className="members-page__header">
        <div className="members-page__title-section">
          <h1 className="members-page__title">Members</h1>
          <span className="members-page__subtitle">Manage, filter, and act on all members</span>
        </div>

        <div className="members-page__header-right">
          {/* Filter Toggle Button */}
          <button
            className={`btn-filters ${activeFilterCount > 0 ? 'btn-filters--active' : ''}`}
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          >
            <FiFilter />
            Filters
            {activeFilterCount > 0 && ` (${activeFilterCount})`}
          </button>

          <div className="members-stats-badge">
            <button
              className={`stat-pill stat-pill--active ${filters.status.includes('Active') ? 'selected' : ''}`}
              onClick={() => setFilters(prev => ({ ...prev, status: ['Active'] }))}
              style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
            >
              <span className="stat-dot active"></span>
              <span>{stats.active} Active</span>
            </button>
            <div className="stat-divider"></div>
            <button
              className={`stat-pill ${filters.status.includes('Inactive') ? 'selected' : ''}`}
              onClick={() => setFilters(prev => ({ ...prev, status: ['Inactive'] }))}
              style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
            >
              <span className="stat-dot inactive"></span>
              <span>{stats.inactive} Inactive</span>
            </button>
            <div className="stat-divider"></div>
            <button
              className={`stat-pill ${filters.status.length === 0 ? 'selected' : ''}`}
              onClick={() => setFilters(prev => ({ ...prev, status: [] }))}
              style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
            >
              <span>{stats.total} Total</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Filter Panel – On Demand */}
      {isFilterPanelOpen && (
        <div className="members-filter-panel">
          <div className="members-filter-panel__row">
            {/* Status Filter */}
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
              <option value="Expired">Expired</option>
            </select>

            {/* Plan Filter */}
            <select
              className={`filter-pill filter-select ${filters.plan.length > 0 ? 'filter-pill--active' : ''}`}
              value={filters.plan[0] || ""}
              onChange={(e) => {
                const val = e.target.value
                setFilters(prev => ({ ...prev, plan: val ? [val] : [] }))
              }}
            >
              <option value="" disabled>Plan</option>
              <option value="Basic">Basic</option>
              <option value="Premium">Premium</option>
              <option value="Standard">Standard</option>
            </select>

            {/* Join Date Filter */}
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

            {/* Duration Filter */}
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

          {activeFilterCount > 0 && (
            <button className="btn-clear-all" onClick={handleResetFilters}>
              Clear all
            </button>
          )}
        </div>
      )}

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
          refreshMembers()
          toast.success("Member added successfully")
        }}
        initialRole="CUSTOMER"
      />
    </div>
  )
}

export default Members
