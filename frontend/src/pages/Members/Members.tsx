"use client"

import type React from "react"
import { useEffect, useState, useMemo, useCallback } from "react"
import { Button, Badge, getStatusVariant, Avatar, DataTable, MemberActionModal, type Column } from "../../components"
import api from "../../services/api"
import type { User } from "../../types/user"
import "./Members.css"

interface FilterState {
  status: string[]
  plan: string[]
  lastVisit: string
  dateFrom: string
  dateTo: string
}

const Members: React.FC = () => {
  const [members, setMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery] = useState("")
  const [selectedMember, setSelectedMember] = useState<User | null>(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState<FilterState>({
    status: [],
    plan: [],
    lastVisit: "today",
    dateFrom: "",
    dateTo: "",
  })

  const loadMembers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getUsers("CUSTOMER")
      // Use real data from backend with proper type mapping
      const enhancedData = data.map((member: User) => ({
        ...member,
        plan: member.plan?.name || 'No Plan',
        status: member.plan ? 'Active' : 'Inactive',
        lastVisit: 'N/A',
      })) as unknown as User[]
      setMembers(enhancedData)
    } catch (err) {
      console.error("[Beta] Failed to load members from backend:", err)
      // For beta testing: show empty state instead of mock data
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  const handleActionClick = (member: User) => {
    setSelectedMember(member)
    setIsActionModalOpen(true)
  }

  const handleCloseActionModal = () => {
    setIsActionModalOpen(false)
    setSelectedMember(null)
  }

  const handleEditProfile = async (member: User) => {
    try {
      await api.updateUser(member.userId, {
        fullName: member.fullName,
        email: member.email,
        phoneNumber: member.phoneNumber,
      })
      loadMembers() // Refresh list
      handleCloseActionModal()
    } catch (err) {
      console.log("[v0] Profile update would be saved to backend")
    }
  }

  const handleRenewPlan = async (member: User) => {
    console.log("[v0] Renew plan for:", member.fullName)
    // In a real app, this would create a payment and update membership
    handleCloseActionModal()
  }

  const handleSendMessage = async (member: User) => {
    console.log("[v0] Send message to:", member.fullName)
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

  const handleApplyFilters = () => {
    console.log("[v0] Applying filters:", filters)
    setShowFilters(false)
  }

  const handleResetFilters = () => {
    setFilters({
      status: [],
      plan: [],
      lastVisit: "today",
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

      const memberStatus = (member as any).status || "Active"
      const memberPlan = (member as any).plan || "Gold"

      const matchesStatus = filters.status.length === 0 || filters.status.includes(memberStatus)
      const matchesPlan = filters.plan.length === 0 || filters.plan.includes(memberPlan)

      return matchesSearch && matchesStatus && matchesPlan
    })
  }, [members, searchQuery, filters])

  // Table columns definition
  const columns: Column<User>[] = [
    {
      key: "member",
      header: "Name",
      render: (member) => (
        <div className="member-cell">
          <Avatar name={member.fullName} size="md" />
          <span className="member-name">{member.fullName}</span>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      render: (member) => <span className="member-plan">{(member as any).plan || "Gold"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (member) => {
        const status = (member as any).status || "Active"
        return <Badge variant={getStatusVariant(status)}>{status}</Badge>
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
          <span className="members-page__count">Total Members: {members.length}</span>
        </div>
        <div className="members-page__actions">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
            }
          >
            Filter
          </Button>
        </div>
      </div>

      {/* Main Content with Filter Panel */}
      <div className={`members-page__content ${showFilters ? "members-page__content--with-filters" : ""}`}>
        {/* Left Side - Member Details Card */}
        <div className="members-page__details-card">
          <div className="details-card">
            <div className="details-card__header">
              <span className="details-card__label">Total Members: {members.length}</span>
            </div>
            <div className="details-card__body">
              <div className="form-group">
                <label>Name</label>
                <input type="text" className="form-input" value="John Doe" readOnly />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-input" value="john.doe@apexgym.com" readOnly />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" className="form-input" value="(902) 456-7770" readOnly />
              </div>
            </div>
            <div className="details-card__billing">
              <h4>Billing & Payments</h4>
              <div className="billing-item">
                <div className="billing-item__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <div className="billing-item__content">
                  <span className="billing-item__title">Plan</span>
                  <span className="billing-item__subtitle">Plan details: 2 months</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <div className="billing-item">
                <div className="billing-item__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <div className="billing-item__content">
                  <span className="billing-item__title">Payment Method</span>
                  <span className="billing-item__subtitle">Payment method, pay mound.</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <div className="billing-item">
                <div className="billing-item__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="billing-item__content">
                  <span className="billing-item__title">Billing History</span>
                  <span className="billing-item__subtitle">Billing history, method, details....</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Filters Panel */}
        {showFilters && (
          <div className="members-page__filters-panel">
            <div className="filters-panel">
              {/* Status Filters */}
              <div className="filter-section">
                <h4>Status Filters</h4>
                <div className="filter-checkboxes">
                  <label className="filter-checkbox filter-checkbox--green">
                    <input
                      type="checkbox"
                      checked={filters.status.includes("Active")}
                      onChange={() => handleStatusFilter("Active")}
                    />
                    <span className="filter-checkbox__label">Active</span>
                    <span className="filter-checkbox__color">(Green)</span>
                  </label>
                  <label className="filter-checkbox filter-checkbox--red">
                    <input
                      type="checkbox"
                      checked={filters.status.includes("Expired")}
                      onChange={() => handleStatusFilter("Expired")}
                    />
                    <span className="filter-checkbox__label">Expired</span>
                    <span className="filter-checkbox__color">(Red)</span>
                  </label>
                  <label className="filter-checkbox filter-checkbox--amber">
                    <input
                      type="checkbox"
                      checked={filters.status.includes("Pending")}
                      onChange={() => handleStatusFilter("Pending")}
                    />
                    <span className="filter-checkbox__label">Pending</span>
                    <span className="filter-checkbox__color">(Amber)</span>
                  </label>
                </div>
              </div>

              {/* Plan Filters */}
              <div className="filter-section">
                <h4>Plan Filters</h4>
                <div className="filter-checkboxes">
                  <label className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.plan.includes("Gold")}
                      onChange={() => handlePlanFilter("Gold")}
                    />
                    <span className="filter-checkbox__label">Gold</span>
                  </label>
                  <label className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.plan.includes("Silver")}
                      onChange={() => handlePlanFilter("Silver")}
                    />
                    <span className="filter-checkbox__label">Silver</span>
                  </label>
                  <label className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.plan.includes("Student")}
                      onChange={() => handlePlanFilter("Student")}
                    />
                    <span className="filter-checkbox__label">Student</span>
                  </label>
                </div>
              </div>

              {/* Last Visit Filters */}
              <div className="filter-section">
                <h4>Last Visit Filters</h4>
                <div className="filter-radios">
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
                <button className="btn btn--primary" onClick={handleApplyFilters}>
                  Apply Filters
                </button>
                <button className="btn btn--secondary" onClick={handleResetFilters}>
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="members-page__table-container">
        <DataTable
          columns={columns}
          data={filteredMembers}
          keyExtractor={(member: User) => member.userId}
          loading={loading}
          emptyMessage="No members found"
        />
      </div>

      {/* Member Action Modal */}
      <MemberActionModal
        isOpen={isActionModalOpen}
        onClose={handleCloseActionModal}
        member={selectedMember}
        onEditProfile={handleEditProfile}
        onRenewPlan={handleRenewPlan}
        onSendMessage={handleSendMessage}
      />
    </div>
  )
}

export default Members
