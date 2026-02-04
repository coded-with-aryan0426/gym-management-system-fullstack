import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Edit, Trash2, Eye, LayoutGrid, List, Clock, Dumbbell, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { MembershipPackageDTO } from '../../types/membershipPackage';
import membershipPlanApi from '../../services/membershipPlanApi';

interface MembershipPlanManagementProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onPlanSelect?: (plan: MembershipPackageDTO) => void;
  mode?: 'management' | 'selection';
}

type ViewMode = 'grid' | 'list';

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
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('membershipPlanViewMode');
    return (saved as ViewMode) || 'grid';
  });
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
    }
  }, [isOpen, mode]);

  useEffect(() => {
    localStorage.setItem('membershipPlanViewMode', viewMode);
  }, [viewMode]);

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
      onSuccess?.();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to save membership plan';
      if (message.includes('already exists')) {
        toast.error('This membership plan already exists. Please use a different name or duration.');
      } else {
        toast.error(message);
      }
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
      onSuccess?.();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete membership plan';
      if (message.includes('assigned to') || message.includes('in use')) {
        toast.error(message);
      } else if (err.response?.status === 409) {
        toast.error('Cannot delete this plan as it is currently in use by members.');
      } else if (err.response?.status === 404) {
        toast.error('Membership plan not found. It may have already been deleted.');
        fetchPlans();
      } else {
        toast.error(message);
      }
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

  const getDefaultColor = (index: number) => {
    const colors = ['#DC2626', '#EA580C', '#D97706', '#16A34A', '#0891B2', '#2563EB', '#7C3AED', '#DB2777'];
    return colors[index % colors.length];
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
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
            background: 'linear-gradient(180deg, #141414 0%, #0a0a0a 100%)',
            borderRadius: 20,
            width: '100%',
            maxWidth: 960,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.95), 0 0 60px rgba(220, 38, 38, 0.08)',
            border: '1px solid rgba(255,255,255,0.06)',
            animation: 'modalSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            position: 'sticky',
            top: 0,
            background: 'linear-gradient(180deg, #141414 0%, #121212 100%)',
            zIndex: 10,
          }}>
            <div>
              <h2 style={{ 
                fontSize: 20, 
                fontWeight: 700, 
                color: '#F9FAFB', 
                margin: 0,
                letterSpacing: '-0.4px'
              }}>
                Membership Plans
              </h2>
              <p style={{
                fontSize: 13,
                color: '#6B7280',
                margin: '4px 0 0 0',
              }}>
                {mode === 'selection' ? 'Select a plan to assign' : 'Create and manage your gym membership packages'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* View Toggle */}
              <div style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 8,
                padding: 3,
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '6px 10px',
                    background: viewMode === 'grid' ? 'rgba(220, 38, 38, 0.15)' : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    color: viewMode === 'grid' ? '#DC2626' : '#6B7280',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '6px 10px',
                    background: viewMode === 'list' ? 'rgba(220, 38, 38, 0.15)' : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    color: viewMode === 'list' ? '#DC2626' : '#6B7280',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <List size={16} />
                </button>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#6B7280',
                  cursor: 'pointer',
                  padding: 8,
                  display: 'flex',
                  borderRadius: 8,
                  transition: 'all 0.2s ease',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '20px 24px' }}>
            {/* Action Bar */}
            {mode === 'management' && !showForm && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}>
                <p style={{ fontSize: 13, color: '#6B7280' }}>
                  {plans.length} plan{plans.length !== 1 ? 's' : ''} total
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 18px',
                    background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                    border: 'none',
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(220, 38, 38, 0.35)',
                    transition: 'all 0.2s ease',
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
                padding: '80px 0',
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  border: '3px solid rgba(220, 38, 38, 0.15)',
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
                padding: '60px 20px',
                color: '#DC2626',
              }}>
                <p style={{ marginBottom: 12 }}>{error}</p>
                <button
                  onClick={fetchPlans}
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(220, 38, 38, 0.1)',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    borderRadius: 8,
                    color: '#DC2626',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Create/Edit Form */}
            {showForm && !loading && (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14,
                padding: 24,
                marginBottom: 24,
              }}>
                <h3 style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#F9FAFB',
                  marginBottom: 20,
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
                        color: '#9CA3AF',
                        marginBottom: 8,
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
                          padding: '12px 14px',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 10,
                          color: '#F9FAFB',
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
                        color: '#9CA3AF',
                        marginBottom: 8,
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
                          padding: '12px 14px',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 10,
                          color: '#F9FAFB',
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
                        color: '#9CA3AF',
                        marginBottom: 8,
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
                          padding: '12px 14px',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 10,
                          color: '#F9FAFB',
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
                        color: '#9CA3AF',
                        marginBottom: 8,
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
                          padding: '12px 14px',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 10,
                          color: '#F9FAFB',
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
                    gap: 12,
                    marginTop: 24,
                  }}>
                    <button
                      type="button"
                      onClick={resetForm}
                      style={{
                        padding: '10px 20px',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10,
                        color: '#9CA3AF',
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
                        padding: '10px 24px',
                        background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                        border: 'none',
                        borderRadius: 10,
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

            {/* Plans Grid View */}
            {!loading && !error && viewMode === 'grid' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}>
                {plans.map((plan, index) => (
                  <PlanCardGrid
                    key={plan.packageId}
                    plan={plan}
                    color={plan.planColor || getDefaultColor(index)}
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

            {/* Plans List View */}
            {!loading && !error && viewMode === 'list' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plans.map((plan, index) => (
                  <PlanCardList
                    key={plan.packageId}
                    plan={plan}
                    color={plan.planColor || getDefaultColor(index)}
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
                padding: '80px 20px',
                color: '#6B7280',
              }}>
                <div style={{
                  width: 72,
                  height: 72,
                  background: 'rgba(220, 38, 38, 0.08)',
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <Dumbbell size={32} style={{ color: '#DC2626' }} />
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: '#9CA3AF' }}>
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
          from { opacity: 0; transform: scale(0.96) translateY(-8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input:focus {
          border-color: rgba(220, 38, 38, 0.5) !important;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
        }
        input::placeholder {
          color: rgba(255,255,255,0.25);
        }
      `}</style>
    </>
  );
};

// Grid Card Component
const PlanCardGrid: React.FC<{
  plan: MembershipPackageDTO;
  color: string;
  mode: 'management' | 'selection';
  formatPrice: (price: number) => string;
  formatDuration: (days: number) => string;
  onEdit: (plan: MembershipPackageDTO) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (plan: MembershipPackageDTO) => void;
  onSelect?: (plan: MembershipPackageDTO) => void;
}> = ({ plan, color, mode, formatPrice, formatDuration, onEdit, onDelete, onToggleStatus, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${isHovered ? `${color}40` : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 8px 30px ${color}15` : 'none',
      }}
    >
      {/* Color Bar */}
      <div style={{
        height: 4,
        background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
      }} />

      {/* Header */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}>
          <div style={{
            width: 40,
            height: 40,
            background: `${color}15`,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Dumbbell size={20} style={{ color }} />
          </div>
          <span style={{
            padding: '4px 10px',
            background: plan.isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            color: plan.isActive ? '#10B981' : '#EF4444',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
          }}>
            {plan.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <h3 style={{
          fontSize: 17,
          fontWeight: 700,
          color: '#F9FAFB',
          margin: '0 0 4px 0',
          letterSpacing: '-0.3px',
        }}>
          {plan.packageName}
        </h3>

        <p style={{
          fontSize: 28,
          fontWeight: 800,
          color: '#F9FAFB',
          margin: '8px 0 0 0',
          letterSpacing: '-0.5px',
        }}>
          {formatPrice(plan.price)}
          <span style={{ fontSize: 13, fontWeight: 500, color: '#6B7280', marginLeft: 4 }}>
            /{formatDuration(plan.durationDays)}
          </span>
        </p>
      </div>

      {/* Features */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 24,
              height: 24,
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Check size={14} style={{ color: '#10B981' }} />
            </div>
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>
              {formatDuration(plan.durationDays)} access
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 24,
              height: 24,
              background: plan.includedPTSessions > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Dumbbell size={14} style={{ color: plan.includedPTSessions > 0 ? '#10B981' : '#6B7280' }} />
            </div>
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>
              {plan.includedPTSessions > 0 ? `${plan.includedPTSessions} PT sessions` : 'No PT sessions'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        padding: '16px 20px 20px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        {mode === 'selection' ? (
          <button
            onClick={() => onSelect?.(plan)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px',
              background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
              border: 'none',
              borderRadius: 10,
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: `0 4px 12px ${color}30`,
            }}
          >
            <Eye size={16} />
            Select Plan
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onEdit(plan)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                color: '#9CA3AF',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Edit size={14} />
              Edit
            </button>
            <button
              onClick={() => onToggleStatus(plan)}
              style={{
                flex: 1,
                padding: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                color: '#9CA3AF',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {plan.isActive ? 'Disable' : 'Enable'}
            </button>
            <button
              onClick={() => plan.packageId !== undefined && onDelete(plan.packageId)}
              style={{
                padding: '10px 12px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: 8,
                color: '#EF4444',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// List Card Component
const PlanCardList: React.FC<{
  plan: MembershipPackageDTO;
  color: string;
  mode: 'management' | 'selection';
  formatPrice: (price: number) => string;
  formatDuration: (days: number) => string;
  onEdit: (plan: MembershipPackageDTO) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (plan: MembershipPackageDTO) => void;
  onSelect?: (plan: MembershipPackageDTO) => void;
}> = ({ plan, color, mode, formatPrice, formatDuration, onEdit, onDelete, onToggleStatus, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 20px',
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${isHovered ? `${color}30` : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 12,
        transition: 'all 0.2s ease',
        borderLeft: `3px solid ${color}`,
      }}
    >
      {/* Icon */}
      <div style={{
        width: 44,
        height: 44,
        background: `${color}12`,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Dumbbell size={20} style={{ color }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3 style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#F9FAFB',
            margin: 0,
          }}>
            {plan.packageName}
          </h3>
          <span style={{
            padding: '3px 8px',
            background: plan.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 600,
            color: plan.isActive ? '#10B981' : '#EF4444',
            textTransform: 'uppercase',
          }}>
            {plan.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}>
            <Clock size={12} />
            {formatDuration(plan.durationDays)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}>
            <Dumbbell size={12} />
            {plan.includedPTSessions} PT sessions
          </span>
        </div>
      </div>

      {/* Price */}
      <div style={{ textAlign: 'right', marginRight: 16 }}>
        <p style={{
          fontSize: 20,
          fontWeight: 800,
          color: '#F9FAFB',
          margin: 0,
        }}>
          {formatPrice(plan.price)}
        </p>
      </div>

      {/* Actions */}
      {mode === 'selection' ? (
        <button
          onClick={() => onSelect?.(plan)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Select
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => onEdit(plan)}
            style={{
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6,
              color: '#9CA3AF',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Edit size={13} />
            Edit
          </button>
          <button
            onClick={() => onToggleStatus(plan)}
            style={{
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6,
              color: '#9CA3AF',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {plan.isActive ? 'Disable' : 'Enable'}
          </button>
          <button
            onClick={() => plan.packageId !== undefined && onDelete(plan.packageId)}
            style={{
              padding: '8px 10px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: 6,
              color: '#EF4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MembershipPlanManagement;
