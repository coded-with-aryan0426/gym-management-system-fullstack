"use client"

import type React from "react"
import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { FiFilter, FiSearch, FiUserPlus, FiCalendar, FiClock, FiRefreshCw } from "react-icons/fi"
import { toast } from "react-hot-toast"
import { useSearchParams } from "react-router-dom"
import { Button, Badge, getStatusVariant, Avatar, DataTable, CreateUserModal, type Column } from "../../components"
import { ActionMenuButton, SortButton } from "../../components/shared"
import { useClickOutside } from "../../hooks"
import EnhancedMemberActionModal from "../../components/MemberActionModal/EnhancedMemberActionModal"
import api from "../../services/api"
import type { MemberDTO, User } from "../../types/user"
import { useMembers } from "../../contexts/MembersContext"
import "./Members.css"

interface FilterState {
  status: string[]
  plan: string[]
  planDuration: string
  expiryStatus: string
  joinedPeriod: string
}

const Members: React.FC = () => {
  const { stats: globalStats, refreshMembers } = useMembers()

  const [selectedMember, setSelectedMember] = useState<MemberDTO | null>(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [sortType, setSortType] = useState<'newest' | 'alphabetical'>('newest')

  const [members, setMembers] = useState<MemberDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

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
    } catch (err) {
      console.error('[Members] Failed to load paginated members:', err)
      toast.error('Failed to load members')
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

  const filteredMembers = useMemo(() => {
    let result = members

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
  }, [members, filters.planDuration, filters.expiryStatus, filters.joinedPeriod])

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

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleResetFilters = () => {
    setFilters({
      status: [],
      plan: [],
      planDuration: "",
      expiryStatus: "",
      joinedPeriod: "",
    })
  }

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

  const stats = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    const activeCount = members.filter(m => m.status === 'Active').length
    const expiredCount = members.filter(m => m.status === 'Expired').length
    
    const expiringSoon = members.filter(m => {
      const { daysLeft, isExpired } = getExpiryInfo(m)
      return !isExpired && daysLeft !== null && daysLeft <= 7 && daysLeft > 0
    }).length
    
    const newThisMonth = members.filter(m => {
      if (!m.startDate) return false
      return new Date(m.startDate) >= startOfMonth
    }).length
    
    const todayJoined = members.filter(m => {
      if (!m.startDate) return false
      return new Date(m.startDate) >= startOfToday
    }).length

    return { activeCount, expiredCount, expiringSoon, newThisMonth, todayJoined, total: members.length }
  }, [members])

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
      header: "Member",
      width: "auto",
      render: (member) => (
        <div
          className="member-cell"
          onClick={(e) => { e.stopPropagation(); handleActionClick(member) }}
          style={{ cursor: 'pointer' }}
        >
          <Avatar
            name={member.fullName}
            size="md"
            avatarId={localStorage.getItem(`avatar_${member.userId}`) || (member as any).avatarId}
            userId={member.userId}
          />
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
      width: "140px",
      render: (member) => {
        const planClass = member.planName?.toLowerCase() === 'premium' ? 'member-plan--premium' 
          : member.planName?.toLowerCase() === 'standard' ? 'member-plan--standard' 
          : 'member-plan--basic'
        return (
          <div className="member-plan-cell">
            <span className={`member-plan-badge ${planClass}`}>{member.planName}</span>
            <span className="member-plan-duration">{member.planDuration || "-"}</span>
          </div>
        )
      },
    },
    {
      key: "joinDate",
      header: "Joined",
      width: "100px",
      render: (member) => {
        const date = member.startDate ? new Date(member.startDate) : null
        if (!date) return <span className="member-date">-</span>
        const day = date.getDate().toString().padStart(2, '0')
        const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
        const year = date.getFullYear()
        return (
          <span className="member-date">{day} {month} {year}</span>
        )
      },
    },
    {
      key: "expiryDate",
      header: "Expires",
      width: "140px",
      render: (member) => {
        const { date, daysLeft, isExpired } = getExpiryInfo(member)
        if (!date) return <span className="member-date">-</span>

        const day = date.getDate().toString().padStart(2, '0')
        const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
        const year = date.getFullYear()

        return (
          <div className="member-expiry-cell">
            <span className={`member-date ${isExpired ? 'member-date--expired' : ''}`}>
              {day} {month} {year}
            </span>
            {daysLeft !== null && (
              <span className={`member-days-left ${isExpired ? 'member-days-left--expired' : daysLeft <= 7 ? 'member-days-left--warning' : ''}`}>
                {isExpired ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      width: "100px",
      render: (member) => {
        return <Badge variant={getStatusVariant(member.status)}>{member.status}</Badge>
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
      {/* Header with Search and Actions */}
      <div className="members-page__header">
        <div className="members-page__title-section">
          <h1 className="members-page__title">Members</h1>
          <div className="members-page__sort-indicator">
            {sortType === 'newest' ? (
              <span className="sort-badge sort-badge--newest">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                New First
              </span>
            ) : (
              <span className="sort-badge sort-badge--alpha">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 6h18M3 12h12M3 18h6" />
                </svg>
                A → Z
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions - Moved here between title and search */}
        <div className="members-quick-actions">
          <button 
            className={`members-quick-btn ${filters.expiryStatus === 'expiring-soon' ? 'members-quick-btn--active' : ''}`}
            onClick={() => setFilters(prev => ({ 
              ...prev, 
              expiryStatus: prev.expiryStatus === 'expiring-soon' ? '' : 'expiring-soon' 
            }))}
          >
            <FiClock size={13} />
            <span>Expiring Soon</span>
            {stats.expiringSoon > 0 && <span className="members-quick-btn__count">{stats.expiringSoon}</span>}
          </button>
          <button 
            className={`members-quick-btn ${filters.joinedPeriod === 'today' ? 'members-quick-btn--active' : ''}`}
            onClick={() => setFilters(prev => ({ 
              ...prev, 
              joinedPeriod: prev.joinedPeriod === 'today' ? '' : 'today' 
            }))}
          >
            <FiCalendar size={13} />
            <span>Joined Today</span>
            {stats.todayJoined > 0 && <span className="members-quick-btn__count">{stats.todayJoined}</span>}
          </button>
          <button 
            className={`members-quick-btn ${filters.status[0] === 'Expired' ? 'members-quick-btn--active' : ''}`}
            onClick={() => setFilters(prev => ({ 
              ...prev, 
              status: prev.status[0] === 'Expired' ? [] : ['Expired']
            }))}
          >
            <FiRefreshCw size={13} />
            <span>Need Renewal</span>
            {stats.expiredCount > 0 && <span className="members-quick-btn__count members-quick-btn__count--warning">{stats.expiredCount}</span>}
          </button>
        </div>

        <div className="members-page__search-actions">
          <div className="members-search-box">
            <FiSearch className="members-search-box__icon" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="members-search-box__input"
            />
          </div>

          <div className="members-page__header-right">
            <div className="members-filter-container" ref={filterPanelRef}>
              <button
                className={`btn-filters ${isFilterPanelOpen ? 'btn-filters--active' : ''} ${activeFilterCount > 0 ? 'btn-filters--has-filters' : ''}`}
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              >
                <FiFilter size={12} />
                Filters
                {activeFilterCount > 0 && ` (${activeFilterCount})`}
              </button>

              {isFilterPanelOpen && (
                <div className="members-filter-panel">
                  <div className="filter-panel__header">
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                      <button className="filter-clear-btn" onClick={handleResetFilters}>
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="filter-panel__content">
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
                      </select>
                    </div>

                    <div className="filter-group">
                      <label className="filter-label">Plan</label>
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

                    <div className="filter-group">
                      <label className="filter-label">Plan Duration</label>
                      <select
                        className="filter-select"
                        value={filters.planDuration}
                        onChange={(e) => setFilters(prev => ({ ...prev, planDuration: e.target.value }))}
                      >
                        <option value="">All Durations</option>
                        <option value="1 Month">1 Month</option>
                        <option value="3 Months">3 Months</option>
                        <option value="6 Months">6 Months</option>
                        <option value="12 Months">12 Months</option>
                      </select>
                    </div>

                    <div className="filter-group">
                      <label className="filter-label">Expiry Status</label>
                      <select
                        className="filter-select"
                        value={filters.expiryStatus}
                        onChange={(e) => setFilters(prev => ({ ...prev, expiryStatus: e.target.value }))}
                      >
                        <option value="">All</option>
                        <option value="expiring-soon">Expiring Soon (7 days)</option>
                        <option value="expiring-month">Expiring This Month</option>
                        <option value="already-expired">Already Expired</option>
                      </select>
                    </div>

                    <div className="filter-group">
                      <label className="filter-label">Joined</label>
                      <select
                        className="filter-select"
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

            <button className="members-action-btn" onClick={() => setIsCreateModalOpen(true)}>
              <FiUserPlus size={14} />
              <span>Add Member</span>
            </button>
          </div>
        </div>
      </div>



      {activeFilterCount > 0 && (
        <div className="members-active-filters">
          {filters.status.length > 0 && (
            <span className="filter-chip">
              Status: {filters.status[0]}
              <button onClick={() => setFilters(prev => ({ ...prev, status: [] }))}>×</button>
            </span>
          )}
          {filters.plan.length > 0 && (
            <span className="filter-chip">
              Plan: {filters.plan[0]}
              <button onClick={() => setFilters(prev => ({ ...prev, plan: [] }))}>×</button>
            </span>
          )}
          {filters.planDuration && (
            <span className="filter-chip">
              Duration: {filters.planDuration}
              <button onClick={() => setFilters(prev => ({ ...prev, planDuration: "" }))}>×</button>
            </span>
          )}
          {filters.expiryStatus && (
            <span className="filter-chip">
              Expiry: {filters.expiryStatus.replace(/-/g, ' ')}
              <button onClick={() => setFilters(prev => ({ ...prev, expiryStatus: "" }))}>×</button>
            </span>
          )}
          {filters.joinedPeriod && (
            <span className="filter-chip">
              Joined: {filters.joinedPeriod.replace(/-/g, ' ')}
              <button onClick={() => setFilters(prev => ({ ...prev, joinedPeriod: "" }))}>×</button>
            </span>
          )}
          <button className="filter-clear-all" onClick={handleResetFilters}>Clear All</button>
        </div>
      )}

      <div className="members-page__content">
        <div className="members-page__table-container">
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
            mobileCardRender={(member, index) => {
              const date = member.startDate ? new Date(member.startDate) : null
              const dateStr = date
                ? `${date.getDate().toString().padStart(2, '0')} ${date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${date.getFullYear()}`
                : '-'
              const { daysLeft, isExpired } = getExpiryInfo(member)
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
                    {daysLeft !== null && (
                      <div className="mobile-card__detail">
                        <span className="mobile-card__detail-label">Expires</span>
                        <span className={`mobile-card__detail-value ${isExpired ? 'text-red' : daysLeft <= 7 ? 'text-warning' : ''}`}>
                          {isExpired ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                        </span>
                      </div>
                    )}
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
          member={selectedMember as unknown as User}
          onEditProfile={() => { loadMembersPaginated(); refreshMembers(); }}
          onRenewPlan={(member, packageId, amount, customDuration, skipTransaction) =>
            handleRenewPlan(member as unknown as MemberDTO, packageId, amount, customDuration, skipTransaction)
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
