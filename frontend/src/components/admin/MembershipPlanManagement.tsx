import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Edit, Trash2, Eye, TrendingUp, Users, Calendar, IndianRupee } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge, Button } from '../ui';
import { Input } from '../base';
import type { MembershipPackageDTO } from '../../types/membershipPackage';
import membershipPlanApi from '../../services/membershipPlanApi';

interface MembershipPlanManagementProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onPlanSelect?: (plan: MembershipPackageDTO) => void;
  mode?: 'management' | 'selection';
}

const MembershipPlanManagement: React.FC<MembershipPlanManagementProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onPlanSelect,
  mode = 'management'
}) => {
  const [plans, setPlans] = useState<MembershipPackageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPackageDTO | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    packageName: '',
    price: '',
    durationDays: '',
    includedPTSessions: '',
    isActive: true
  });

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
      if (mode === 'management') {
        fetchAnalytics();
      }
    }
  }, [isOpen, mode]);

  // Handle escape key and click outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = mode === 'selection' 
        ? await membershipPlanApi.getActivePlans()
        : await membershipPlanApi.getAllPlans();
      setPlans(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch membership plans');
      toast.error('Failed to fetch membership plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await membershipPlanApi.getAnalytics();
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const planData = {
        ...formData,
        price: parseFloat(formData.price),
        durationDays: parseInt(formData.durationDays),
        includedPTSessions: parseInt(formData.includedPTSessions)
      };

      if (editingPlan && editingPlan.packageId !== undefined) {
        await membershipPlanApi.updatePlan(editingPlan.packageId, planData);
        toast.success('Membership plan updated successfully');
      } else {
        await membershipPlanApi.createPlan(planData);
        toast.success('Membership plan created successfully');
      }
      
      resetForm();
      fetchPlans();
      fetchAnalytics();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save membership plan');
    }
  };

  const handleEdit = (plan: MembershipPackageDTO) => {
    setEditingPlan(plan);
    setFormData({
      packageName: plan.packageName,
      price: plan.price.toString(),
      durationDays: plan.durationDays.toString(),
      includedPTSessions: plan.includedPTSessions.toString(),
      isActive: plan.isActive ?? true
    });
    setShowForm(true);
  };

  const handleDelete = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this membership plan?')) return;
    
    try {
      await membershipPlanApi.deletePlan(planId);
      toast.success('Membership plan deleted successfully');
      fetchPlans();
      fetchAnalytics();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete membership plan');
    }
  };

  const handleToggleStatus = async (plan: MembershipPackageDTO) => {
    try {
      if (plan.packageId === undefined) return;
      if (plan.isActive) {
        await membershipPlanApi.deactivatePlan(plan.packageId);
        toast.success('Membership plan deactivated');
      } else {
        await membershipPlanApi.activatePlan(plan.packageId);
        toast.success('Membership plan activated');
      }
      fetchPlans();
      fetchAnalytics();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update plan status');
    }
  };

  const resetForm = () => {
    setFormData({
      packageName: '',
      price: '',
      durationDays: '',
      includedPTSessions: '',
      isActive: true
    });
    setEditingPlan(null);
    setShowForm(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDuration = (days: number) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      return `${years} year${years > 1 ? 's' : ''}`;
    } else if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}
      >
        <div
          ref={modalRef}
          style={{
            background: 'var(--bg-secondary, #1A1A1A)',
            borderRadius: 16,
            width: '100%',
            maxWidth: 900,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.9), 0 0 40px rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(255,255,255,0.08)',
            animation: 'modalSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            position: 'sticky',
            top: 0,
            background: 'var(--bg-secondary, #1A1A1A)',
            zIndex: 10,
          }}>
            <div>
              <h2 style={{ 
                fontSize: 18, 
                fontWeight: 700, 
                color: 'var(--text-primary, #F9FAFB)', 
                margin: 0,
                letterSpacing: '-0.3px'
              }}>
                Membership Plans
              </h2>
              <p style={{
                fontSize: 13,
                color: 'var(--text-secondary, #9CA3AF)',
                margin: '4px 0 0 0',
              }}>
                Create and manage your gym membership packages
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                color: 'var(--text-tertiary, #6B7280)',
                cursor: 'pointer',
                padding: 8,
                display: 'flex',
                borderRadius: 8,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '20px' }}>
            {/* Analytics Cards */}
            {mode === 'management' && analytics && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
                marginBottom: 20,
              }}>
                <StatCard 
                  icon={<Calendar size={20} />}
                  label="Total Plans"
                  value={analytics.totalPlans || 0}
                  color="#3B82F6"
                />
                <StatCard 
                  icon={<Users size={20} />}
                  label="Active Plans"
                  value={analytics.activePlans || 0}
                  color="#10B981"
                />
                <StatCard 
                  icon={<IndianRupee size={20} />}
                  label="Avg Price"
                  value={formatPrice(analytics.averagePrice || 0)}
                  color="#F59E0B"
                />
                <StatCard 
                  icon={<TrendingUp size={20} />}
                  label="Total Revenue"
                  value={formatPrice(analytics.totalRevenue || 0)}
                  color="#8B5CF6"
                />
              </div>
            )}

            {/* Action Bar */}
            {mode === 'management' && !showForm && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: 16,
              }}>
                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                    border: 'none',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                  }}
                >
                  <Plus size={16} />
                  Create Plan
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 0',
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  border: '3px solid rgba(220, 38, 38, 0.2)',
                  borderTopColor: '#DC2626',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#DC2626',
              }}>
                <p>{error}</p>
                <button
                  onClick={fetchPlans}
                  style={{
                    marginTop: 12,
                    padding: '8px 16px',
                    background: 'rgba(220, 38, 38, 0.1)',
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                    borderRadius: 6,
                    color: '#DC2626',
                    cursor: 'pointer',
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Create/Edit Form */}
            {showForm && !loading && (
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: 20,
                marginBottom: 20,
              }}>
                <h3 style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--text-primary, #F9FAFB)',
                  marginBottom: 16,
                }}>
                  {editingPlan ? 'Edit Membership Plan' : 'Create New Plan'}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 16,
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--text-secondary, #9CA3AF)',
                        marginBottom: 6,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Plan Name
                      </label>
                      <input
                        type="text"
                        value={formData.packageName}
                        onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                        placeholder="e.g., Premium Monthly"
                        required
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 8,
                          color: 'var(--text-primary, #F9FAFB)',
                          fontSize: 14,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--text-secondary, #9CA3AF)',
                        marginBottom: 6,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="1999"
                        required
                        min="0"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 8,
                          color: 'var(--text-primary, #F9FAFB)',
                          fontSize: 14,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--text-secondary, #9CA3AF)',
                        marginBottom: 6,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Duration (Days)
                      </label>
                      <input
                        type="number"
                        value={formData.durationDays}
                        onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                        placeholder="30"
                        required
                        min="1"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 8,
                          color: 'var(--text-primary, #F9FAFB)',
                          fontSize: 14,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--text-secondary, #9CA3AF)',
                        marginBottom: 6,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        PT Sessions Included
                      </label>
                      <input
                        type="number"
                        value={formData.includedPTSessions}
                        onChange={(e) => setFormData({ ...formData, includedPTSessions: e.target.value })}
                        placeholder="0"
                        required
                        min="0"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 8,
                          color: 'var(--text-primary, #F9FAFB)',
                          fontSize: 14,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 10,
                    marginTop: 20,
                  }}>
                    <button
                      type="button"
                      onClick={resetForm}
                      style={{
                        padding: '10px 16px',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 8,
                        color: 'var(--text-secondary, #9CA3AF)',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                        border: 'none',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                      }}
                    >
                      {editingPlan ? 'Update Plan' : 'Create Plan'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Plans Grid */}
            {!loading && !error && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 16,
              }}>
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.packageId}
                    plan={plan}
                    mode={mode}
                    formatPrice={formatPrice}
                    formatDuration={formatDuration}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    onSelect={onPlanSelect}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && plans.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'var(--text-secondary, #9CA3AF)',
              }}>
                <div style={{
                  width: 64,
                  height: 64,
                  background: 'rgba(220, 38, 38, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <Calendar size={28} style={{ color: '#DC2626' }} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
                  {mode === 'selection' 
                    ? 'No active membership plans available'
                    : 'No membership plans yet'
                  }
                </p>
                <p style={{ fontSize: 13, opacity: 0.8 }}>
                  {mode === 'management' && 'Create your first plan to get started'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input:focus {
          border-color: #DC2626 !important;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12) !important;
        }
        input::placeholder {
          color: rgba(255,255,255,0.3);
        }
      `}</style>
    </>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}> = ({ icon, label, value, color }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: 14,
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div>
        <p style={{
          fontSize: 11,
          fontWeight: 500,
          color: 'var(--text-secondary, #9CA3AF)',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
        }}>
          {label}
        </p>
        <p style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--text-primary, #F9FAFB)',
          margin: '4px 0 0 0',
        }}>
          {value}
        </p>
      </div>
      <div style={{
        width: 40,
        height: 40,
        background: `${color}15`,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
      }}>
        {icon}
      </div>
    </div>
  </div>
);

// Plan Card Component
const PlanCard: React.FC<{
  plan: MembershipPackageDTO;
  mode: 'management' | 'selection';
  formatPrice: (price: number) => string;
  formatDuration: (days: number) => string;
  onEdit: (plan: MembershipPackageDTO) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (plan: MembershipPackageDTO) => void;
  onSelect?: (plan: MembershipPackageDTO) => void;
}> = ({ plan, mode, formatPrice, formatDuration, onEdit, onDelete, onToggleStatus, onSelect }) => {
  const getPlanGradient = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('premium') || lower.includes('gold')) {
      return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
    } else if (lower.includes('standard') || lower.includes('silver')) {
      return 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)';
    } else {
      return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
    }
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      overflow: 'hidden',
      transition: 'all 0.2s ease',
    }}>
      {/* Plan Header */}
      <div style={{
        background: getPlanGradient(plan.packageName),
        padding: '16px 16px 12px',
        position: 'relative',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#fff',
            margin: 0,
          }}>
            {plan.packageName}
          </h3>
          <span style={{
            padding: '3px 8px',
            background: plan.isActive ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 600,
            color: '#fff',
            textTransform: 'uppercase',
          }}>
            {plan.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <p style={{
          fontSize: 24,
          fontWeight: 800,
          color: '#fff',
          margin: '8px 0 0 0',
        }}>
          {formatPrice(plan.price)}
        </p>
      </div>

      {/* Plan Details */}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{
              fontSize: 12,
              color: 'var(--text-secondary, #9CA3AF)',
            }}>
              Duration
            </span>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary, #F9FAFB)',
            }}>
              {formatDuration(plan.durationDays)}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{
              fontSize: 12,
              color: 'var(--text-secondary, #9CA3AF)',
            }}>
              PT Sessions
            </span>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary, #F9FAFB)',
            }}>
              {plan.includedPTSessions}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          {mode === 'selection' ? (
            <button
              onClick={() => onSelect?.(plan)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '10px',
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Eye size={14} />
              Select Plan
            </button>
          ) : (
            <>
              <button
                onClick={() => onEdit(plan)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  padding: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  color: 'var(--text-secondary, #9CA3AF)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Edit size={13} />
                Edit
              </button>
              <button
                onClick={() => onToggleStatus(plan)}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  color: 'var(--text-secondary, #9CA3AF)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {plan.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => plan.packageId !== undefined && onDelete(plan.packageId)}
                style={{
                  padding: '8px 10px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 6,
                  color: '#EF4444',
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembershipPlanManagement;
