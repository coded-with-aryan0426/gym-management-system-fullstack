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

  return (
    <div className="members-page">
      {/* Header */}
      <div className="members-page__header">
        <div className="members-page__title-section">
          <h1 className="members-page__title">Members Directory</h1>
        </div>
        <div className="members-page__actions">
          <span className="members-page__count">Total Members: {members.length}</span>
        </div>
      </div>

      {/* Main Content with Fixed Filter Panel */}
      <div className="members-page__content">
        {/* Main Content Area: Table + Filter Panel */}
        <div className="members-page__table-container" style={{ width: '100%' }}>
          {/* Compact Filter Bar */}
          <div className="filters-bar" style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1rem',
            alignItems: 'flex-end',
            padding: '1rem',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            width: '100%',
            position: 'sticky',
            top: '0',
            zIndex: 10,
            borderBottom: '1px solid var(--border-color)'
          }}>

            {/* Month Filter */}
            <div className="filter-group" style={{ flex: '0 0 150px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Join Month</label>
              <select
                className="form-select"
                value={filters.month}
                onChange={(e) => handleFilterChange("month", e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={String(m)}>
                    {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="filter-group" style={{ flex: '0 0 150px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Status</label>
              <select
                className="form-select"
                value={filters.status.length > 0 ? filters.status[0] : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilters(prev => ({ ...prev, status: val ? [val] : [] }))
                }}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="PENDING">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Plan Filter */}
            <div className="filter-group" style={{ flex: '0 0 150px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Plan</label>
              <select
                className="form-select"
                value={filters.plan.length > 0 ? filters.plan[0] : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilters(prev => ({ ...prev, plan: val ? [val] : [] }))
                }}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
              >
                <option value="">All Plans</option>
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            {/* Plan Duration Filter (Replaces Date Range) */}
            <div className="filter-group" style={{ flex: '0 0 150px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Duration</label>
              <select
                className="form-select"
                value={filters.planDuration}
                onChange={(e) => handleFilterChange("planDuration", e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
              >
                <option value="">All Durations</option>
                <option value="1">1 Month</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
                <option value="36">36 Months</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="filter-group" style={{ flex: '0 0 auto' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', visibility: 'hidden' }}>Reset</label>
              <button
                onClick={handleResetFilters}
                className="btn"
                style={{
                  height: '38px',
                  padding: '0 1.5rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 500
                }}
              >
                Reset
              </button>
            </div>
          </div>

          <DataTable
            columns={columns as any} // Cast to any to avoid strict Column<T> mismatches if User is hardcoded in base
            data={filteredMembers}
            keyExtractor={(member: MemberDTO) => member.userId}
            loading={loading}
            emptyMessage="No members found"
          />
        </div>


        {
          isActionModalOpen && selectedMember && (
            <EnhancedMemberActionModal
              isOpen={isActionModalOpen}
              onClose={handleCloseActionModal}
              member={selectedMember as any}
              onEditProfile={(updatedMember) => handleEditProfile(updatedMember as unknown as MemberDTO)}
              onRenewPlan={(member, packageId, amount, customDuration, skipTransaction) => handleRenewPlan(member as unknown as MemberDTO, packageId, amount, customDuration, skipTransaction)}
              onSendMessage={() => handleSendMessage(selectedMember)}
            />
          )
        }

        {/* V1 Manual Member Entry Modal */}
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            // Remove query param
            setSearchParams(prev => {
              const newParams = new URLSearchParams(prev);
              newParams.delete('action');
              return newParams;
            });
          }}
          onSuccess={() => {
            loadMembers();
            toast.success("Member added successfully");
          }}
          initialRole="CUSTOMER"
        />

      </div>
    </div>
  )
}

export default Members
