"use client"

import type React from "react"
import { useEffect, useState, useMemo, useCallback } from "react"
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
  })

  const loadMembers = useCallback(async () => {
    setLoading(true)
    try {
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
    try {
      await api.updateUser(member.userId, {
        fullName: member.fullName,
        email: member.email,
        phoneNumber: member.phone,
      })
      toast.success(`Profile updated for ${member.fullName}`)
      loadMembers() 
      handleCloseActionModal()
    } catch (err) {
      console.error("Failed to update profile:", err)
      toast.error("Failed to update profile. Please try again.")
    }
  }

  const handleRenewPlan = async (member: MemberDTO) => {
    try {
      await api.createTransaction({
        userId: member.userId,
        amount: 79999,
        type: "MEMBERSHIP_RENEWAL",
        description: `Membership renewal for ${member.fullName}`,
      })
      toast.success(`Membership renewed for ${member.fullName}`)
      loadMembers()
      handleCloseActionModal()
    } catch (err) {
      console.error("Failed to renew membership:", err)
      toast.error("Failed to process renewal. Please try again.")
      handleCloseActionModal()
    }
  }

  const handleSendMessage = async (member: MemberDTO) => {
    toast.success(`Message sent to ${member.fullName}`)
    handleCloseActionModal()
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
    })
  }

  // Filter members based on search and filters
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = filters.status.length === 0 || filters.status.includes(member.status || "Inactive")
      const matchesPlan = filters.plan.length === 0 || filters.plan.includes(member.planName || "No Plan")

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

      return matchesSearch && matchesStatus && matchesPlan && matchesDate
    })
  }, [members, searchQuery, filters])

  // Table columns definition
  // Note: DataTable probably expects Generic. Casting for safety if needed.
  const columns: Column<MemberDTO>[] = [
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
        <div className="members-page__table-container">
          <DataTable
            columns={columns as any} // Cast to any to avoid strict Column<T> mismatches if User is hardcoded in base
            data={filteredMembers}
            keyExtractor={(member: MemberDTO) => member.userId}
            loading={loading}
            emptyMessage="No members found"
          />
        </div>

        {/* Right Side - Filters Panel */}
        <div className="members-page__filters-panel">
            <div className="filters-panel">
              {/* Status Filters */}
              <div className="filter-section">
                <h4>Status Filters</h4>
                <div className="filter-checkboxes">
                <label className="filter-checkbox" data-variant="success">
                    <input
                      type="checkbox"
                    checked={filters.status.includes("ACTIVE")}
                    onChange={() => handleStatusFilter("ACTIVE")}
                    />
                  <span className="filter-text">Active</span>
                  </label>
                <label className="filter-checkbox" data-variant="error">
                    <input
                      type="checkbox"
                    checked={filters.status.includes("EXPIRED")}
                    onChange={() => handleStatusFilter("EXPIRED")}
                    />
                  <span className="filter-text">Expired</span>
                  </label>
                <label className="filter-checkbox" data-variant="warning">
                    <input
                      type="checkbox"
                    checked={filters.status.includes("PENDING")}
                    onChange={() => handleStatusFilter("PENDING")}
                    />
                  <span className="filter-text">Pending</span>
                </label>
                <label className="filter-checkbox" data-variant="neutral">
                  <input
                    type="checkbox"
                    checked={filters.status.includes("Inactive")}
                    onChange={() => handleStatusFilter("Inactive")}
                  />
                  <span className="filter-text">Inactive</span>
                  </label>
                </div>
              </div>

              {/* Plan Filters */}
              <div className="filter-section">
                <h4>Plan Filters</h4>
                <div className="filter-checkboxes">
                <label className="filter-checkbox" data-variant="plan-basic">
                    <input
                      type="checkbox"
                    checked={filters.plan.includes("Basic Plan")}
                    onChange={() => handlePlanFilter("Basic Plan")}
                    />
                  <span className="filter-text">Basic</span>
                  </label>
                <label className="filter-checkbox" data-variant="plan-silver">
                    <input
                      type="checkbox"
                    checked={filters.plan.includes("Silver Plan")}
                    onChange={() => handlePlanFilter("Silver Plan")}
                    />
                  <span className="filter-text">Silver</span>
                  </label>
                <label className="filter-checkbox" data-variant="plan-gold">
                    <input
                      type="checkbox"
                    checked={filters.plan.includes("Gold Plan")}
                    onChange={() => handlePlanFilter("Gold Plan")}
                    />
                  <span className="filter-text">Gold</span>
                </label>
                <label className="filter-checkbox" data-variant="plan-platinum">
                  <input
                    type="checkbox"
                    checked={filters.plan.includes("Platinum Plan")}
                    onChange={() => handlePlanFilter("Platinum Plan")}
                  />
                  <span className="filter-text">Platinum</span>
                  </label>
                </div>
              </div>

            {/* Join Date Filters */}
              <div className="filter-section">
              <h4>Join Date Filters</h4>
                <div className="filter-radios">
                  <label className="filter-radio">
                    <input
                      type="radio"
                      name="lastVisit"
                    checked={filters.lastVisit === ""}
                    onChange={() => handleFilterChange("lastVisit", "")}
                  />
                  <span className="filter-radio__label">All Time</span>
                </label>
                <label className="filter-radio">
                  <input
                    type="radio"
                    name="lastVisit"
                      checked={filters.lastVisit === "today"}
                      onChange={() => handleFilterChange("lastVisit", "today")}
                    />
                    <span className="filter-radio__label">Today</span>
                  </label>
                  <label className="filter-radio">
                    <input
                      type="radio"
                      name="lastVisit"
                      checked={filters.lastVisit === "week"}
                      onChange={() => handleFilterChange("lastVisit", "week")}
                    />
                    <span className="filter-radio__label">This Week</span>
                  </label>
                  <label className="filter-radio">
                    <input
                      type="radio"
                      name="lastVisit"
                      checked={filters.lastVisit === "month"}
                      onChange={() => handleFilterChange("lastVisit", "month")}
                    />
                    <span className="filter-radio__label">This Month</span>
                  </label>
                  <label className="filter-radio">
                    <input
                      type="radio"
                      name="lastVisit"
                      checked={filters.lastVisit === "custom"}
                      onChange={() => handleFilterChange("lastVisit", "custom")}
                    />
                    <span className="filter-radio__label">Custom Range</span>
                  </label>
                </div>

                {filters.lastVisit === "custom" && (
                  <div className="date-range">
                    <div className="date-input">
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="date-input">
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Actions */}
              <div className="filter-actions">
              <button className="btn btn--danger" onClick={handleResetFilters}>
                  Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {isActionModalOpen && selectedMember && (
        <EnhancedMemberActionModal
          isOpen={isActionModalOpen}
          onClose={handleCloseActionModal}
          member={selectedMember as any}
          onEditProfile={() => handleEditProfile(selectedMember)}
          onRenewPlan={() => handleRenewPlan(selectedMember)}
          onSendMessage={() => handleSendMessage(selectedMember)}
        />
      )}

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
  )
}

export default Members
