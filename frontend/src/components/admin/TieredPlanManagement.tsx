import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Edit, Trash2, Eye, LayoutGrid, List, Clock, Dumbbell, Check, 
  Star, Copy, Archive, MoreVertical, ChevronDown, Sparkles, Crown, Users,
  TrendingUp, Package, Search, Filter, SlidersHorizontal, Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { MembershipPlan, PlanVariant, PlanStatus, PlanCategory } from '../../types/membershipPackage';
import membershipPlanApi from '../../services/membershipPlanApi';
import TieredPlanWizard from './TieredPlanWizard';

interface TieredPlanManagementProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onPlanSelect?: (plan: MembershipPlan, variant: PlanVariant) => void;
  mode?: 'management' | 'selection';
}

type ViewMode = 'grid' | 'list';

const TieredPlanManagement: React.FC<TieredPlanManagementProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onPlanSelect,
  mode = 'management'
}) => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('tieredPlanViewMode');
    return (saved as ViewMode) || 'grid';
  });
  const modalRef = useRef<HTMLDivElement>(null);

  // Filter plans based on search query
  const filteredPlans = useMemo(() => {
    if (!searchQuery.trim()) return plans;
    const query = searchQuery.toLowerCase();
    return plans.filter(plan => 
      plan.planName.toLowerCase().includes(query) ||
      plan.description?.toLowerCase().includes(query) ||
      plan.category.toLowerCase().includes(query)
    );
  }, [plans, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen, mode]);

  useEffect(() => {
    localStorage.setItem('tieredPlanViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !showWizard) onClose();
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && !showWizard) {
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
  }, [isOpen, onClose, showWizard]);

    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = mode === 'selection' 
          ? await membershipPlanApi.getActiveTieredPlans()
          : await membershipPlanApi.getAllTieredPlans();
        setPlans(response.data || []);
      } catch (err: any) {
        console.error('Failed to fetch tiered plans:', err);
        const errorMsg = err.response?.status === 500 
          ? 'Database tables not initialized. Please run database migrations.'
          : err.response?.data?.message || 'Failed to fetch membership plans';
        setError(errorMsg);
        toast.error('Failed to fetch membership plans');
      } finally {
        setLoading(false);
      }
    };

  const handleEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setShowWizard(true);
  };

  const handleDelete = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this membership tier? This action cannot be undone.')) return;
    
    try {
      await membershipPlanApi.deleteTieredPlan(planId);
      toast.success('Membership tier deleted successfully');
      fetchPlans();
      onSuccess?.();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete membership tier';
      if (err.response?.status === 409) {
        toast.error('Cannot delete this tier as it has active members.');
      } else {
        toast.error(message);
      }
    }
  };

  const handleDuplicate = async (planId: number) => {
    try {
      await membershipPlanApi.duplicateTieredPlan(planId);
      toast.success('Membership tier duplicated successfully');
      fetchPlans();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to duplicate tier');
    }
  };

  const handleToggleStatus = async (plan: MembershipPlan) => {
    try {
      if (!plan.planId) return;
      if (plan.status === 'ACTIVE') {
        await membershipPlanApi.deactivateTieredPlan(plan.planId);
        toast.success('Tier deactivated');
      } else {
        await membershipPlanApi.activateTieredPlan(plan.planId);
        toast.success('Tier activated');
      }
      fetchPlans();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update tier status');
    }
  };

  const handleArchive = async (planId: number) => {
    try {
      await membershipPlanApi.archiveTieredPlan(planId);
      toast.success('Tier archived');
      fetchPlans();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to archive tier');
    }
  };

  const handleToggleRecommended = async (planId: number) => {
    try {
      await membershipPlanApi.toggleTieredPlanRecommended(planId);
      toast.success('Recommendation updated');
      fetchPlans();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update recommendation');
    }
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
    setEditingPlan(null);
    fetchPlans();
    onSuccess?.();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStartingPrice = (plan: MembershipPlan) => {
    if (!plan.variants || plan.variants.length === 0) return 0;
    const activePrices = plan.variants.filter(v => v.isActive).map(v => v.price);
    return activePrices.length > 0 ? Math.min(...activePrices) : 0;
  };

  const getActiveVariantCount = (plan: MembershipPlan) => {
    return plan.variants?.filter(v => v.isActive).length || 0;
  };

  const getStatusColor = (status: PlanStatus) => {
    const colors: Record<PlanStatus, { bg: string; text: string }> = {
      ACTIVE: { bg: 'rgba(16, 185, 129, 0.12)', text: '#10B981' },
      INACTIVE: { bg: 'rgba(239, 68, 68, 0.12)', text: '#EF4444' },
      DRAFT: { bg: 'rgba(245, 158, 11, 0.12)', text: '#F59E0B' },
      ARCHIVED: { bg: 'rgba(107, 114, 128, 0.12)', text: '#6B7280' },
    };
    return colors[status] || colors.INACTIVE;
  };

  const getCategoryLabel = (category: PlanCategory) => {
    const labels: Record<PlanCategory, string> = {
      STANDARD: 'Standard',
      PREMIUM: 'Premium',
      VIP: 'VIP Elite',
      CORPORATE: 'Corporate',
      STUDENT: 'Student',
      CUSTOM: 'Custom',
    };
    return labels[category] || category;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(12px)',
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
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            background: 'linear-gradient(180deg, #141414 0%, #0a0a0a 100%)',
            borderRadius: 24,
            width: '100%',
            maxWidth: 1100,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.95), 0 0 80px rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Header - Compact with stats inline */}
            <div style={{
              padding: '14px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              position: 'sticky',
              top: 0,
              background: 'linear-gradient(180deg, #141414 0%, #121212 100%)',
              zIndex: 10,
            }}>
              {/* Single Row: Title + Stats + Search + Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                {/* Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.25) 0%, rgba(220, 38, 38, 0.08) 100%)',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                  }}>
                    <Crown size={18} style={{ color: '#DC2626' }} />
                  </div>
                  <div>
                    <h2 style={{ 
                      fontSize: 16, 
                      fontWeight: 700, 
                      color: '#F9FAFB', 
                      margin: 0,
                      letterSpacing: '-0.3px',
                      lineHeight: 1.2,
                    }}>
                      Membership Tiers
                    </h2>
                    <p style={{
                      fontSize: 11,
                      color: '#6B7280',
                      margin: 0,
                    }}>
                      {mode === 'selection' ? 'Select tier to assign' : 'Manage plans'}
                    </p>
                  </div>
                </div>

                {/* Compact Stats Pills */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0,
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 8px',
                    background: 'rgba(59, 130, 246, 0.08)',
                    borderRadius: 6,
                    border: '1px solid rgba(59, 130, 246, 0.12)',
                  }}>
                    <Package size={11} style={{ color: '#3B82F6' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#F9FAFB' }}>{plans.length}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 8px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: 6,
                    border: '1px solid rgba(16, 185, 129, 0.12)',
                  }}>
                    <Zap size={11} style={{ color: '#10B981' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981' }}>{plans.filter(p => p.status === 'ACTIVE').length}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 8px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    borderRadius: 6,
                    border: '1px solid rgba(239, 68, 68, 0.12)',
                  }}>
                    <X size={11} style={{ color: '#EF4444' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#EF4444' }}>{plans.filter(p => p.status !== 'ACTIVE').length}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 8px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    borderRadius: 6,
                    border: '1px solid rgba(245, 158, 11, 0.12)',
                  }}>
                    <Star size={11} style={{ color: '#F59E0B' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B' }}>{plans.filter(p => p.isRecommended).length}</span>
                  </div>
                </div>

                {/* Search Input - Compact */}
                <div style={{
                  flex: 1,
                  position: 'relative',
                  maxWidth: 280,
                }}>
                  <Search size={14} style={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6B7280',
                  }} />
                  <input
                    type="text"
                    placeholder="Search tiers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 32px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8,
                      color: '#F9FAFB',
                      fontSize: 12,
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  />
                </div>

                {/* View Toggle - Compact */}
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
                    title="Grid view"
                  >
                    <LayoutGrid size={14} />
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
                    title="List view"
                  >
                    <List size={14} />
                  </button>
                </div>

                {/* Create Button - Compact */}
                {mode === 'management' && (
                  <button
                    onClick={() => setShowWizard(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                      border: 'none',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                  >
                    <Plus size={14} />
                    Create Tier
                  </button>
                )}

                {/* Close Button */}
                <button
                  onClick={onClose}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#6B7280',
                    cursor: 'pointer',
                    padding: 7,
                    display: 'flex',
                    borderRadius: 6,
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

          {/* Content */}
          <div style={{ padding: '20px 28px' }}>
            {/* Search Results Info */}
            {searchQuery && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
                padding: '10px 14px',
                background: 'rgba(59, 130, 246, 0.08)',
                borderRadius: 10,
                border: '1px solid rgba(59, 130, 246, 0.15)',
              }}>
                <Search size={14} style={{ color: '#3B82F6' }} />
                <span style={{ fontSize: 13, color: '#9CA3AF' }}>
                  Found <strong style={{ color: '#F9FAFB' }}>{filteredPlans.length}</strong> result{filteredPlans.length !== 1 ? 's' : ''} for "<strong style={{ color: '#3B82F6' }}>{searchQuery}</strong>"
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    marginLeft: 'auto',
                    padding: '4px 10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    borderRadius: 6,
                    color: '#9CA3AF',
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '100px 0',
              }}>
                <div style={{
                  width: 40,
                  height: 40,
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
                  padding: '80px 20px',
                  color: '#DC2626',
                }}>
                  <p style={{ marginBottom: 8, fontSize: 16, fontWeight: 600 }}>An unexpected error occurred.</p>
                  <p style={{ marginBottom: 16, fontSize: 13, color: '#9CA3AF' }}>{error}</p>
                  <button
                    onClick={fetchPlans}
                    style={{
                      padding: '12px 24px',
                      background: 'rgba(220, 38, 38, 0.1)',
                      border: '1px solid rgba(220, 38, 38, 0.2)',
                      borderRadius: 10,
                      color: '#DC2626',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

            {/* Plans Grid View */}
            {!loading && !error && viewMode === 'grid' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 20,
              }}>
{filteredPlans.map((plan, index) => (
                    <TierCard
                      key={plan.planId ?? `plan-${index}`}
                      plan={plan}
                    mode={mode}
                    expanded={expandedPlan === plan.planId}
                    onToggleExpand={() => setExpandedPlan(expandedPlan === plan.planId ? null : plan.planId!)}
                    formatPrice={formatPrice}
                    getStartingPrice={getStartingPrice}
                    getActiveVariantCount={getActiveVariantCount}
                    getStatusColor={getStatusColor}
                    getCategoryLabel={getCategoryLabel}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    onToggleStatus={handleToggleStatus}
                    onArchive={handleArchive}
                    onToggleRecommended={handleToggleRecommended}
                    onSelectVariant={onPlanSelect}
                  />
                ))}
              </div>
            )}

            {/* Plans List View */}
            {!loading && !error && viewMode === 'list' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
{filteredPlans.map((plan, index) => (
                    <TierCardList
                      key={plan.planId ?? `plan-list-${index}`}
                      plan={plan}
                    mode={mode}
                    expanded={expandedPlan === plan.planId}
                    onToggleExpand={() => setExpandedPlan(expandedPlan === plan.planId ? null : plan.planId!)}
                    formatPrice={formatPrice}
                    getStartingPrice={getStartingPrice}
                    getActiveVariantCount={getActiveVariantCount}
                    getStatusColor={getStatusColor}
                    getCategoryLabel={getCategoryLabel}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    onToggleStatus={handleToggleStatus}
                    onArchive={handleArchive}
                    onToggleRecommended={handleToggleRecommended}
                    onSelectVariant={onPlanSelect}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredPlans.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                color: '#6B7280',
              }}>
                <div style={{
                  width: 72,
                  height: 72,
                  background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.02) 100%)',
                  borderRadius: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  border: '1px solid rgba(220, 38, 38, 0.1)',
                }}>
                  {searchQuery ? <Search size={32} style={{ color: '#6B7280' }} /> : <Package size={32} style={{ color: '#DC2626' }} />}
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: '#9CA3AF' }}>
                  {searchQuery 
                    ? 'No tiers match your search'
                    : mode === 'selection' 
                      ? 'No active membership tiers'
                      : 'No membership tiers yet'
                  }
                </p>
                <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 20 }}>
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : mode === 'management' && 'Create your first tier to start offering membership packages'
                  }
                </p>
                {!searchQuery && mode === 'management' && (
                  <button
                    onClick={() => setShowWizard(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                      border: 'none',
                      borderRadius: 10,
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(220, 38, 38, 0.35)',
                    }}
                  >
                    <Plus size={16} />
                    Create First Tier
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <TieredPlanWizard
            isOpen={showWizard}
            onClose={() => { setShowWizard(false); setEditingPlan(null); }}
            onComplete={handleWizardComplete}
            editingPlan={editingPlan}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

// Tier Card Component (Grid)
interface TierCardProps {
  plan: MembershipPlan;
  mode: 'management' | 'selection';
  expanded: boolean;
  onToggleExpand: () => void;
  formatPrice: (price: number) => string;
  getStartingPrice: (plan: MembershipPlan) => number;
  getActiveVariantCount: (plan: MembershipPlan) => number;
  getStatusColor: (status: PlanStatus) => { bg: string; text: string };
  getCategoryLabel: (category: PlanCategory) => string;
  onEdit: (plan: MembershipPlan) => void;
  onDelete: (id: number) => void;
  onDuplicate: (id: number) => void;
  onToggleStatus: (plan: MembershipPlan) => void;
  onArchive: (id: number) => void;
  onToggleRecommended: (id: number) => void;
  onSelectVariant?: (plan: MembershipPlan, variant: PlanVariant) => void;
}

const TierCard: React.FC<TierCardProps> = ({
  plan,
  mode,
  expanded,
  onToggleExpand,
  formatPrice,
  getStartingPrice,
  getActiveVariantCount,
  getStatusColor,
  getCategoryLabel,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
  onArchive,
  onToggleRecommended,
  onSelectVariant,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const color = plan.planColor || '#DC2626';
  const statusColor = getStatusColor(plan.status);

  const formatDuration = (variant: PlanVariant) => {
    const unitLabels: Record<string, [string, string]> = {
      DAYS: ['Day', 'Days'],
      WEEKS: ['Week', 'Weeks'],
      MONTHS: ['Month', 'Months'],
      YEARS: ['Year', 'Years'],
    };
    const [singular, plural] = unitLabels[variant.durationUnit] || ['', ''];
    return `${variant.durationValue} ${variant.durationValue === 1 ? singular : plural}`;
  };

  return (
    <motion.div
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
      style={{
        background: isHovered 
          ? `linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)`
          : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isHovered ? `${color}40` : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 18,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: isHovered 
          ? `0 20px 50px ${color}25, 0 10px 25px rgba(0,0,0,0.4)` 
          : '0 4px 20px rgba(0,0,0,0.15)',
        position: 'relative',
      }}
    >
      {/* Gradient Glow Effect on Hover */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 120,
        background: `linear-gradient(180deg, ${color}12 0%, transparent 100%)`,
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
      }} />
      
      {/* Color Bar */}
      <div style={{
        height: 4,
        background: `linear-gradient(90deg, ${color} 0%, ${color}90 50%, ${color}60 100%)`,
      }} />

      {/* Recommended Badge */}
      {plan.isRecommended && (
        <div style={{
          position: 'absolute',
          top: 14,
          right: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '5px 10px',
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          borderRadius: 16,
          fontSize: 9,
          fontWeight: 700,
          color: '#fff',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
          zIndex: 5,
        }}>
          <Star size={9} fill="#fff" />
          Best Value
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '18px 18px 0', position: 'relative' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 14,
        }}>
          <div style={{
            width: 44,
            height: 44,
            background: `linear-gradient(135deg, ${color}25 0%, ${color}10 100%)`,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${color}20`,
          }}>
            <Crown size={22} style={{ color }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              padding: '4px 10px',
              background: statusColor.bg,
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 600,
              color: statusColor.text,
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
            }}>
              {plan.status}
            </span>
            {mode === 'management' && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  style={{
                    padding: 6,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 6,
                    color: '#6B7280',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  <MoreVertical size={14} />
                </button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: 4,
                        background: '#1a1a1a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10,
                        padding: 6,
                        minWidth: 150,
                        zIndex: 100,
                        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                      }}
                    >
                      <MenuButton icon={<Edit size={13} />} onClick={() => { onEdit(plan); setShowMenu(false); }}>Edit</MenuButton>
                      <MenuButton icon={<Copy size={13} />} onClick={() => { plan.planId && onDuplicate(plan.planId); setShowMenu(false); }}>Duplicate</MenuButton>
                      <MenuButton icon={<Star size={13} />} onClick={() => { plan.planId && onToggleRecommended(plan.planId); setShowMenu(false); }}>
                        {plan.isRecommended ? 'Remove Best Value' : 'Mark Best Value'}
                      </MenuButton>
                      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                      <MenuButton icon={<Archive size={13} />} onClick={() => { plan.planId && onArchive(plan.planId); setShowMenu(false); }}>Archive</MenuButton>
                      <MenuButton icon={<Trash2 size={13} />} onClick={() => { plan.planId && onDelete(plan.planId); setShowMenu(false); }} danger>Delete</MenuButton>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 4 }}>
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            color: color,
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
          }}>
            {getCategoryLabel(plan.category)}
          </span>
        </div>
        <h3 style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#F9FAFB',
          margin: '0 0 6px 0',
          letterSpacing: '-0.3px',
        }}>
          {plan.planName}
        </h3>
        {plan.description && (
          <p style={{
            fontSize: 12,
            color: '#6B7280',
            margin: 0,
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {plan.description}
          </p>
        )}

        <div style={{ marginTop: 14 }}>
          <span style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#F9FAFB',
            letterSpacing: '-1px',
          }}>
            {formatPrice(getStartingPrice(plan))}
          </span>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', marginLeft: 4 }}>
            starting
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: 12,
        padding: '14px 18px',
        marginTop: 8,
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8,
          flex: 1,
          padding: '8px 10px',
          background: 'rgba(59, 130, 246, 0.08)',
          borderRadius: 8,
        }}>
          <Clock size={14} style={{ color: '#3B82F6' }} />
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#F9FAFB' }}>
              {getActiveVariantCount(plan)}
            </span>
            <span style={{ fontSize: 10, color: '#6B7280', marginLeft: 4 }}>Durations</span>
          </div>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8,
          flex: 1,
          padding: '8px 10px',
          background: 'rgba(16, 185, 129, 0.08)',
          borderRadius: 8,
        }}>
          <Check size={14} style={{ color: '#10B981' }} />
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#F9FAFB' }}>
              {plan.features?.filter(f => f.isIncluded).length || 0}
            </span>
            <span style={{ fontSize: 10, color: '#6B7280', marginLeft: 4 }}>Features</span>
          </div>
        </div>
      </div>

      {/* Expand Button */}
      <button
        onClick={onToggleExpand}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          padding: '10px',
          background: 'rgba(255,255,255,0.02)',
          border: 'none',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          color: '#9CA3AF',
          fontSize: 11,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {expanded ? 'Hide' : 'View'} Duration Options
        <ChevronDown size={12} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
      </button>

      {/* Expanded Variants */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
                padding: '0 18px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                {plan.variants?.filter(v => v.isActive).map((variant, vIndex) => (
                  <div
                    key={variant.variantId ?? `variant-${vIndex}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 10,
                    cursor: mode === 'selection' ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => mode === 'selection' && onSelectVariant?.(plan, variant)}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#F9FAFB', margin: 0 }}>
                      {formatDuration(variant)}
                    </p>
                    {variant.includedPTSessions > 0 && (
                      <p style={{ fontSize: 10, color: '#6B7280', margin: '2px 0 0' }}>
                        +{variant.includedPTSessions} PT sessions
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#F9FAFB', margin: 0 }}>
                      {formatPrice(variant.price)}
                    </p>
                    {variant.discountPercent && variant.discountPercent > 0 && (
                      <p style={{ fontSize: 10, color: '#10B981', margin: '2px 0 0' }}>
                        {variant.discountPercent}% off
                      </p>
                    )}
                  </div>
                  {mode === 'selection' && (
                    <div style={{
                      marginLeft: 10,
                      padding: '6px 12px',
                      background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                      Select
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions (Management Mode) */}
      {mode === 'management' && !expanded && (
        <div style={{
          padding: '12px 18px 16px',
          display: 'flex',
          gap: 8,
        }}>
          <button
            onClick={() => onEdit(plan)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '9px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              color: '#9CA3AF',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Edit size={12} />
            Edit
          </button>
          <button
            onClick={() => onToggleStatus(plan)}
            style={{
              flex: 1,
              padding: '9px',
              background: plan.status === 'ACTIVE' 
                ? 'rgba(239, 68, 68, 0.08)' 
                : 'rgba(16, 185, 129, 0.08)',
              border: plan.status === 'ACTIVE'
                ? '1px solid rgba(239, 68, 68, 0.15)'
                : '1px solid rgba(16, 185, 129, 0.15)',
              borderRadius: 8,
              color: plan.status === 'ACTIVE' ? '#EF4444' : '#10B981',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {plan.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )}
    </motion.div>
  );
};

// Tier Card List Component
const TierCardList: React.FC<TierCardProps> = ({
  plan,
  mode,
  expanded,
  onToggleExpand,
  formatPrice,
  getStartingPrice,
  getActiveVariantCount,
  getStatusColor,
  getCategoryLabel,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
  onArchive,
  onToggleRecommended,
  onSelectVariant,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const color = plan.planColor || '#DC2626';
  const statusColor = getStatusColor(plan.status);

  const formatDuration = (variant: PlanVariant) => {
    const unitLabels: Record<string, [string, string]> = {
      DAYS: ['Day', 'Days'],
      WEEKS: ['Week', 'Weeks'],
      MONTHS: ['Month', 'Months'],
      YEARS: ['Year', 'Years'],
    };
    const [singular, plural] = unitLabels[variant.durationUnit] || ['', ''];
    return `${variant.durationValue} ${variant.durationValue === 1 ? singular : plural}`;
  };

  return (
    <motion.div
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderTop: `1px solid ${isHovered ? `${color}30` : 'rgba(255,255,255,0.06)'}`,
        borderRight: `1px solid ${isHovered ? `${color}30` : 'rgba(255,255,255,0.06)'}`,
        borderBottom: `1px solid ${isHovered ? `${color}30` : 'rgba(255,255,255,0.06)'}`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 20px',
      }}>
        {/* Icon */}
        <div style={{
          width: 52,
          height: 52,
          background: `${color}12`,
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Crown size={24} style={{ color }} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#F9FAFB',
              margin: 0,
            }}>
              {plan.planName}
            </h3>
            <span style={{
              padding: '3px 10px',
              background: statusColor.bg,
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 600,
              color: statusColor.text,
              textTransform: 'uppercase',
            }}>
              {plan.status}
            </span>
            {plan.isRecommended && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 10px',
                background: 'rgba(245, 158, 11, 0.15)',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 600,
                color: '#F59E0B',
              }}>
                <Star size={10} fill="#F59E0B" />
                Best Value
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6 }}>
            <span style={{ fontSize: 11, color: color, fontWeight: 600, textTransform: 'uppercase' }}>
              {getCategoryLabel(plan.category)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}>
              <Clock size={12} />
              {getActiveVariantCount(plan)} durations
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}>
              <Check size={12} />
              {plan.features?.filter(f => f.isIncluded).length || 0} features
            </span>
          </div>
        </div>

        {/* Price */}
        <div style={{ textAlign: 'right', marginRight: 16 }}>
          <p style={{
            fontSize: 24,
            fontWeight: 800,
            color: '#F9FAFB',
            margin: 0,
          }}>
            {formatPrice(getStartingPrice(plan))}
          </p>
          <p style={{ fontSize: 11, color: '#6B7280', margin: '2px 0 0' }}>starting</p>
        </div>

        {/* Expand */}
        <button
          onClick={onToggleExpand}
          style={{
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            color: '#9CA3AF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          <ChevronDown size={14} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
        </button>

        {/* Actions */}
        {mode === 'management' && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => onEdit(plan)}
              style={{
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
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
                  padding: '10px 14px',
                  background: plan.status === 'ACTIVE' 
                    ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                    : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: 10,
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: plan.status === 'ACTIVE' 
                    ? '0 4px 12px rgba(239, 68, 68, 0.3)'
                    : '0 4px 12px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                {plan.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
              </button>
            <button
              onClick={() => plan.planId && onDelete(plan.planId)}
              style={{
                padding: '10px 12px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: 10,
                color: '#EF4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Expanded Variants */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
              <div style={{
                padding: '0 20px 20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 10,
                borderTop: '1px solid rgba(255,255,255,0.04)',
                paddingTop: 16,
              }}>
                {plan.variants?.filter(v => v.isActive).map((variant, vIndex) => (
                  <div
                    key={variant.variantId ?? `list-variant-${vIndex}`}
                  style={{
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12,
                    cursor: mode === 'selection' ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => mode === 'selection' && onSelectVariant?.(plan, variant)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#F9FAFB', margin: 0 }}>
                      {formatDuration(variant)}
                    </p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#F9FAFB', margin: 0 }}>
                      {formatPrice(variant.price)}
                    </p>
                  </div>
                  {(variant.includedPTSessions > 0 || variant.discountPercent) && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      {variant.includedPTSessions > 0 && (
                        <span style={{ fontSize: 11, color: '#6B7280' }}>
                          +{variant.includedPTSessions} PT
                        </span>
                      )}
                      {variant.discountPercent && variant.discountPercent > 0 && (
                        <span style={{ fontSize: 11, color: '#10B981' }}>
                          {variant.discountPercent}% off
                        </span>
                      )}
                    </div>
                  )}
                  {mode === 'selection' && (
                    <button
                      style={{
                        width: '100%',
                        marginTop: 10,
                        padding: '8px',
                        background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
                        border: 'none',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Select
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Menu Button Component
const MenuButton: React.FC<{ icon: React.ReactNode; onClick: () => void; danger?: boolean; children: React.ReactNode }> = ({ icon, onClick, danger, children }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      width: '100%',
      padding: '8px 10px',
      background: 'transparent',
      border: 'none',
      borderRadius: 6,
      color: danger ? '#EF4444' : '#9CA3AF',
      fontSize: 12,
      fontWeight: 500,
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all 0.15s ease',
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = danger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
  >
    {icon}
    {children}
  </button>
);

export default TieredPlanManagement;
