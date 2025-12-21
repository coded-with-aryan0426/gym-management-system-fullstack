"use client"

import type React from "react"
import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { FiFilter } from "react-icons/fi"
import { toast } from "react-hot-toast"
import { useSearchParams } from "react-router-dom"
import { Button, Badge, getStatusVariant, Avatar, DataTable, CreateUserModal, type Column } from "../../components"
import { ActionMenuButton, SortButton } from "../../components/shared"
import { useClickOutside } from "../../hooks"
import EnhancedMemberActionModal from "../../components/MemberActionModal/EnhancedMemberActionModal"
import api from "../../services/api"
import type { MemberDTO } from "../../types/user"
import { useMembers } from "../../contexts/MembersContext"
import "./Members.css"

interface FilterState {
  status: string[]
  plan: string[]
  duration: string
  date: string
}

const Members: React.FC = () => {
  const { stats: globalStats, refreshMembers } = useMembers()

  const [selectedMember, setSelectedMember] = useState<MemberDTO | null>(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [sortType, setSortType] = useState<'advanced' | 'alphabetical'>('advanced')
  
  const [members, setMembers] = useState<MemberDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [filters, setFilters] = useState<FilterState>({
    status: [],
    plan: [],
    duration: "",
    date: "",
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

  const loadMembersPaginated = useCallback(async () => {
    setLoading(true)
    try {
      const statusFilter = filters.status.length > 0 ? filters.status[0] : undefined
      const planFilter = filters.plan.length > 0 ? filters.plan[0] : undefined
      
      const response = await api.getMembersPaginated(
        currentPage,
        pageSize,
        debouncedSearch || undefined,
        statusFilter,
        planFilter,
        filters.duration || undefined,
        filters.date || undefined
      )
      
      setMembers(response.content)
      setTotalCount(response.totalCount)
      setSortType(response.sortType as any)
    } catch (err) {
      console.error('[Members] Failed to load paginated members:', err)
      toast.error('Failed to load members')
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, debouncedSearch, filters])

  useEffect(() => {
    loadMembersPaginated()
  }, [loadMembersPaginated])

  useEffect(() => {
    setCurrentPage(0)
  }, [debouncedSearch, filters])

  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / pageSize)
  }, [totalCount, pageSize])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.status.length > 0) count++
    if (filters.plan.length > 0) count++
    if (filters.duration) count++
    if (filters.date) count++
    return count
  }, [filters])

  const stats = useMemo(() => {
    return {
      total: globalStats.total,
      active: globalStats.active,
      inactive: globalStats.inactive || (globalStats.total - globalStats.active)
    }
  }, [globalStats])

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
      toast.error("Failed to process renewal. Please try again.")
    }
  }

  const handleSendMessage = async (member: MemberDTO) => {
    toast.success(`Message sent to ${member.fullName}`)
  }

  const handleResetFilters = () => {
    setFilters({
      status: [],
      plan: [],
      duration: "",
      date: "",
    })
  }

  const columns: Column<MemberDTO>[] = [
    {
      key: "index",
      header: "#",
      width: "50px",
      render: (_, index) => (
        <span className="member-index">{currentPage * pageSize + index + 1}</span>
      ),
    },
    {
      key: "fullName",
      header: "Member Name",
      width: "auto",
      render: (member) => (
        <div
          className="member-cell"
          onClick={(e) => { e.stopPropagation(); handleActionClick(member) }}
          style={{ cursor: 'pointer' }}
        >
          <Avatar name={member.fullName} size="md" />
          <div className="member-cell__info">
            <span className="member-name">{member.fullName}</span>
            <span className="member-email">{member.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "planName",
      header: "Plan",
      width: "120px",
      render: (member) => <span className="member-plan">{member.planName}</span>,
    },
    {
      key: "planDuration",
      header: "Duration",
      width: "120px",
      render: (member) => <span className="member-plan-duration">{member.planDuration || "-"}</span>,
    },
      {
        key: "joinDate",
        header: "Join Date",
        width: "140px",
        render: (member) => {
          const date = member.createdAt ? new Date(member.createdAt) : null
          if (!date) return <span className="member-date">-</span>
          const day = date.getDate().toString().padStart(2, '0')
          const month = date.toLocaleDateString('en-US', { month: 'short' })
          const year = date.getFullYear()
          return (
            <span className="member-date">{day} {month} {year}</span>
          )
        },
      },
    {
      key: "status",
      header: "Status",
      width: "110px",
      render: (member) => {
        return <Badge variant={getStatusVariant(member.status)} className="status-badge--compact">{member.status}</Badge>
      },
    },
    {
      key: "actions",
      header: "",
      width: "60px",
      render: (member) => (
        <div className="member-actions">
          <ActionMenuButton onClick={(e) => { e.stopPropagation(); handleActionClick(member); }} />
        </div>
      ),
    },
  ]

  return (
    <div className="members-page">
      <div className="members-page__header">
        <div className="members-page__title-section">
          <h1 className="members-page__title">Members</h1>
          <div className="members-page__sort-indicator">
            <span className="sort-badge sort-badge--advanced">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Auto-Sorted
            </span>
          </div>
        </div>

        <div className="members-page__header-right">
          <div className="members-filter-container" ref={filterPanelRef}>
            <button
              className={`btn-filters ${isFilterPanelOpen ? 'btn-filters--active' : ''} ${activeFilterCount > 0 ? 'btn-filters--has-filters' : ''}`}
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            >
              <FiFilter size={14} />
              Filter
              {activeFilterCount > 0 && <span className="filter-count-badge">{activeFilterCount}</span>}
            </button>

            {isFilterPanelOpen && (
              <div className="members-filter-panel animate-in">
                <div className="filter-panel__header">
                  <h3>Filters</h3>
                  {activeFilterCount > 0 && (
                    <button className="filter-clear-btn" onClick={handleResetFilters}>
                      Clear Filter
                    </button>
                  )}
                </div>

                <div className="filter-panel__content">
                  <div className="filter-section">
                    <span className="filter-section__title">Membership</span>
                    <div className="filter-group">
                      <label className="filter-label">Status</label>
                      <select
                        className="filter-select"
                        value={filters.status[0] || ""}
                        onChange={(e) => {
                          const val = e.target.value
                          setFilters(prev => ({ ...prev, status: val ? [val] : [] }))
                        }}
                      >
                        <option value="">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Expired">Expired</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="filter-group">
                      <label className="filter-label">Plan Type</label>
                      <select
                        className="filter-select"
                        value={filters.plan[0] || ""}
                        onChange={(e) => {
                          const val = e.target.value
                          setFilters(prev => ({ ...prev, plan: val ? [val] : [] }))
                        }}
                      >
                        <option value="">All Plans</option>
                        <option value="Basic">Basic</option>
                        <option value="Premium">Premium</option>
                        <option value="Standard">Standard</option>
                      </select>
                    </div>
                  </div>

                  <div className="filter-section">
                    <span className="filter-section__title">Duration & Date</span>
                    <div className="filter-group">
                      <label className="filter-label">Duration</label>
                      <select
                        className="filter-select"
                        value={filters.duration}
                        onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
                      >
                        <option value="">All Durations</option>
                        <option value="1 Month">1 Month</option>
                        <option value="3 Months">3 Months</option>
                        <option value="6 Months">6 Months</option>
                        <option value="12 Months">12 Months</option>
                        <option value="Expired">Expired</option>
                      </select>
                    </div>

                    <div className="filter-group">
                      <label className="filter-label">Join Date (DD/MM/YYYY)</label>
                      <input
                        type="text"
                        className="filter-input"
                        placeholder="e.g. 2025 or 03/2025"
                        value={filters.date}
                        onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="members-stats-badge">
            <button
              className={`stat-pill stat-pill--active ${filters.status.includes('Active') ? 'selected' : ''}`}
              onClick={() => setFilters(prev => ({ ...prev, status: ['Active'] }))}
            >
              <span className="stat-dot active"></span>
              <span>{stats.active} Active</span>
            </button>
            <div className="stat-divider"></div>
            <button
              className={`stat-pill ${filters.status.includes('Inactive') ? 'selected' : ''}`}
              onClick={() => setFilters(prev => ({ ...prev, status: ['Inactive'] }))}
            >
              <span className="stat-dot inactive"></span>
              <span>{stats.inactive} Inactive</span>
            </button>
            <div className="stat-divider"></div>
            <button
              className={`stat-pill ${filters.status.length === 0 ? 'selected' : ''}`}
              onClick={() => setFilters(prev => ({ ...prev, status: [] }))}
            >
              <span>{stats.total} Total</span>
            </button>
          </div>
        </div>
      </div>

      <div className="members-page__content">
        {activeFilterCount > 0 && (
          <div className="applied-filters-bar">
            <span className="applied-filters-label">Applied Filters:</span>
            {filters.status.length > 0 && (
              <span className="filter-tag">
                Status: {filters.status[0]}
                <button onClick={() => setFilters(prev => ({ ...prev, status: [] }))}>×</button>
              </span>
            )}
            {filters.plan.length > 0 && (
              <span className="filter-tag">
                Plan: {filters.plan[0]}
                <button onClick={() => setFilters(prev => ({ ...prev, plan: [] }))}>×</button>
              </span>
            )}
            {filters.duration && (
              <span className="filter-tag">
                Duration: {filters.duration}
                <button onClick={() => setFilters(prev => ({ ...prev, duration: "" }))}>×</button>
              </span>
            )}
            {filters.date && (
              <span className="filter-tag">
                Date: {filters.date}
                <button onClick={() => setFilters(prev => ({ ...prev, date: "" }))}>×</button>
              </span>
            )}
            <button className="clear-all-link" onClick={handleResetFilters}>Clear all</button>
          </div>
        )}

        <div className="members-page__table-container">
            <DataTable
              data={members}
              keyExtractor={(member) => member.userId}
              columns={columns as Column<MemberDTO>[]}
              loading={loading}
              onRowClick={handleActionClick}
              emptyMessage={
                debouncedSearch || activeFilterCount > 0
                  ? "No members match your filters"
                  : "No members found. Add your first member!"
              }
              pagination={{
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
              mobileCardRender={(member, index) => {
                const date = member.startDate ? new Date(member.startDate) : null
                const dateStr = date 
                  ? `${date.getDate().toString().padStart(2, '0')} ${date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${date.getFullYear()}`
                  : '-'
                return (
                  <div className="mobile-card">
                    <div className="mobile-card__header">
                      <div className="mobile-card__user">
                        <Avatar name={member.fullName} size="md" />
                        <div className="mobile-card__info">
                          <span className="mobile-card__name">{member.fullName}</span>
                          <span className="mobile-card__email">{member.email}</span>
                        </div>
                      </div>
                      <div className="mobile-card__status">
                        <Badge variant={getStatusVariant(member.status)}>{member.status}</Badge>
                      </div>
                    </div>
                    <div className="mobile-card__details">
                      <div className="mobile-card__detail">
                        <span className="mobile-card__detail-label">Plan</span>
                        <span className="mobile-card__detail-value">{member.planName || '-'}</span>
                      </div>
                      <div className="mobile-card__detail">
                        <span className="mobile-card__detail-label">Duration</span>
                        <span className="mobile-card__detail-value">{member.planDuration || '-'}</span>
                      </div>
                      <div className="mobile-card__detail">
                        <span className="mobile-card__detail-label">Joined</span>
                        <span className="mobile-card__detail-value">{dateStr}</span>
                      </div>
                    </div>
                    <div className="mobile-card__actions">
                      <ActionMenuButton onClick={(e) => { e.stopPropagation(); handleActionClick(member); }} />
                    </div>
                  </div>
                )
              }}
            />
          </div>
        </div>

      {isActionModalOpen && selectedMember && (
        <EnhancedMemberActionModal
          isOpen={isActionModalOpen}
          onClose={handleCloseActionModal}
          member={selectedMember as MemberDTO}
          onEditProfile={() => { loadMembersPaginated(); refreshMembers(); }}
          onRenewPlan={(member, packageId, amount, customDuration, skipTransaction) => 
            handleRenewPlan(member as MemberDTO, packageId, amount, customDuration, skipTransaction)
          }
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
          loadMembersPaginated()
          refreshMembers()
          toast.success("Member added successfully")
        }}
        initialRole="CUSTOMER"
      />
    </div>
  )
}

export default Members
