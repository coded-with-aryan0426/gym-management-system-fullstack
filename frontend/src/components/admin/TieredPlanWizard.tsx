import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronLeft, ChevronRight, Check, Crown, Clock, Sparkles, 
  Settings, Eye, Plus, Trash2, Dumbbell, Star, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { 
  MembershipPlan, 
  PlanVariant, 
  PlanFeature, 
  PlanCategory, 
  PlanStatus, 
  DurationUnit,
  FeatureCategory,
  DEFAULT_FEATURES,
  PLAN_COLORS,
  DURATION_PRESETS
} from '../../types/membershipPackage';
import membershipPlanApi from '../../services/membershipPlanApi';

interface TieredPlanWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  editingPlan?: MembershipPlan | null;
}

type WizardStep = 1 | 2 | 3 | 4 | 5;

interface WizardState {
  step: WizardStep;
  basicInfo: {
    planName: string;
    description: string;
    category: PlanCategory;
    planColor: string;
    iconName: string;
  };
  variants: PlanVariant[];
  features: PlanFeature[];
  settings: {
    isRecommended: boolean;
    status: PlanStatus;
  };
}

// Constants
const CATEGORIES: { value: PlanCategory; label: string; description: string }[] = [
  { value: 'STANDARD', label: 'Standard', description: 'Basic gym access' },
  { value: 'PREMIUM', label: 'Premium', description: 'Enhanced amenities' },
  { value: 'VIP', label: 'VIP Elite', description: 'All-inclusive access' },
  { value: 'CORPORATE', label: 'Corporate', description: 'Business packages' },
  { value: 'STUDENT', label: 'Student', description: 'Discounted rates' },
  { value: 'CUSTOM', label: 'Custom', description: 'Tailored plans' },
];

const COLOR_PALETTE = [
  '#DC2626', '#EA580C', '#D97706', '#16A34A', 
  '#0891B2', '#2563EB', '#7C3AED', '#DB2777'
];

const DURATION_OPTIONS: { value: number; unit: DurationUnit; label: string }[] = [
  { value: 1, unit: 'MONTHS', label: '1 Month' },
  { value: 3, unit: 'MONTHS', label: '3 Months' },
  { value: 6, unit: 'MONTHS', label: '6 Months' },
  { value: 12, unit: 'MONTHS', label: '1 Year' },
];

const FEATURE_TEMPLATES: Omit<PlanFeature, 'featureId'>[] = [
  { name: 'Gym Access', description: 'Full gym floor access', category: 'ACCESS', isIncluded: true, sortOrder: 1 },
  { name: 'Cardio Zone', description: 'Treadmills, bikes, ellipticals', category: 'EQUIPMENT', isIncluded: true, sortOrder: 2 },
  { name: 'Weight Training', description: 'Free weights and machines', category: 'EQUIPMENT', isIncluded: true, sortOrder: 3 },
  { name: 'Locker Room', description: 'Personal locker access', category: 'AMENITIES', isIncluded: true, sortOrder: 4 },
  { name: 'Group Classes', description: 'Yoga, Zumba, Spinning', category: 'CLASSES', isIncluded: false, sortOrder: 5 },
  { name: 'Swimming Pool', description: 'Pool and sauna access', category: 'AMENITIES', isIncluded: false, sortOrder: 6 },
  { name: 'Personal Training', description: 'One-on-one PT sessions', category: 'SERVICES', isIncluded: false, sortOrder: 7 },
  { name: 'Nutrition Consultation', description: 'Diet planning support', category: 'SERVICES', isIncluded: false, sortOrder: 8 },
  { name: 'Guest Passes', description: 'Bring friends monthly', category: 'PERKS', isIncluded: false, sortOrder: 9 },
  { name: 'Towel Service', description: 'Fresh towels provided', category: 'AMENITIES', isIncluded: false, sortOrder: 10 },
];

const getInitialState = (editingPlan?: MembershipPlan | null): WizardState => {
  if (editingPlan) {
    return {
      step: 1,
      basicInfo: {
        planName: editingPlan.planName,
        description: editingPlan.description || '',
        category: editingPlan.category,
        planColor: editingPlan.planColor,
        iconName: editingPlan.iconName || 'crown',
      },
      variants: editingPlan.variants || [],
      features: editingPlan.features || [],
      settings: {
        isRecommended: editingPlan.isRecommended || false,
        status: editingPlan.status,
      },
    };
  }
  return {
    step: 1,
    basicInfo: {
      planName: '',
      description: '',
      category: 'STANDARD',
      planColor: COLOR_PALETTE[0],
      iconName: 'crown',
    },
    variants: [],
    features: FEATURE_TEMPLATES.map((f, i) => ({ ...f, featureId: undefined })),
    settings: {
      isRecommended: false,
      status: 'ACTIVE',
    },
  };
};

const TieredPlanWizard: React.FC<TieredPlanWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  editingPlan,
}) => {
  const [state, setState] = useState<WizardState>(() => getInitialState(editingPlan));
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setState(getInitialState(editingPlan));
      setErrors({});
    }
  }, [isOpen, editingPlan]);

  const validateStep = (step: WizardStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!state.basicInfo.planName.trim()) {
          newErrors.planName = 'Plan name is required';
        }
        break;
      case 2:
        if (state.variants.length === 0) {
          newErrors.variants = 'At least one pricing option is required';
        }
        state.variants.forEach((v, i) => {
          if (!v.price || v.price <= 0) {
            newErrors[`variant_${i}_price`] = 'Price must be greater than 0';
          }
        });
        break;
      case 3:
        // Features are optional but must have at least one included
        if (!state.features.some(f => f.isIncluded)) {
          newErrors.features = 'At least one feature must be included';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(state.step)) {
      setState(prev => ({ ...prev, step: Math.min(5, prev.step + 1) as WizardStep }));
    }
  };

  const handleBack = () => {
    setState(prev => ({ ...prev, step: Math.max(1, prev.step - 1) as WizardStep }));
  };

  const handleSubmit = async () => {
    if (!validateStep(state.step)) return;

    setLoading(true);
    try {
      const planData = {
        planName: state.basicInfo.planName,
        description: state.basicInfo.description,
        category: state.basicInfo.category,
        planColor: state.basicInfo.planColor,
        iconName: state.basicInfo.iconName,
        isRecommended: state.settings.isRecommended,
        status: state.settings.status,
        variants: state.variants.map(v => ({
          durationValue: v.durationValue,
          durationUnit: v.durationUnit,
          price: v.price,
          originalPrice: v.originalPrice,
          discountPercent: v.discountPercent,
          includedPTSessions: v.includedPTSessions || 0,
          isPopular: v.isPopular || false,
          isActive: v.isActive !== false,
          sortOrder: v.sortOrder || 0,
        })),
        features: state.features.map(f => ({
          name: f.name,
          description: f.description,
          category: f.category,
          isIncluded: f.isIncluded,
          sortOrder: f.sortOrder || 0,
        })),
      };

      if (editingPlan?.planId) {
        await membershipPlanApi.updateTieredPlan(editingPlan.planId, {
          ...planData,
          status: state.settings.status,
        });
        toast.success('Membership tier updated successfully');
      } else {
        await membershipPlanApi.createTieredPlan(planData);
        toast.success('Membership tier created successfully');
      }

      onComplete();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to save membership tier';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => {
    const nextPreset = DURATION_OPTIONS[state.variants.length % DURATION_OPTIONS.length];
    setState(prev => ({
      ...prev,
      variants: [...prev.variants, {
        durationValue: nextPreset.value,
        durationUnit: nextPreset.unit,
        durationDays: nextPreset.value * 30,
        price: 0,
        includedPTSessions: 0,
        isPopular: false,
        isActive: true,
        sortOrder: prev.variants.length,
      }],
    }));
  };

  const removeVariant = (index: number) => {
    setState(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariant = (index: number, field: keyof PlanVariant, value: any) => {
    setState(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => {
        if (i !== index) return v;
        const updated = { ...v, [field]: value };
        if (field === 'durationValue' || field === 'durationUnit') {
          updated.durationDays = calculateDurationDays(updated.durationValue, updated.durationUnit);
        }
        return updated;
      }),
    }));
  };

  const toggleFeature = (index: number) => {
    setState(prev => ({
      ...prev,
      features: prev.features.map((f, i) => 
        i === index ? { ...f, isIncluded: !f.isIncluded } : f
      ),
    }));
  };

  const calculateDurationDays = (value: number, unit: DurationUnit): number => {
    switch (unit) {
      case 'DAYS': return value;
      case 'WEEKS': return value * 7;
      case 'MONTHS': return value * 30;
      case 'YEARS': return value * 365;
      default: return value;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDuration = (value: number, unit: DurationUnit) => {
    const labels: Record<DurationUnit, [string, string]> = {
      DAYS: ['Day', 'Days'],
      WEEKS: ['Week', 'Weeks'],
      MONTHS: ['Month', 'Months'],
      YEARS: ['Year', 'Years'],
    };
    const [singular, plural] = labels[unit];
    return `${value} ${value === 1 ? singular : plural}`;
  };

  const steps = [
    { num: 1, label: 'Basic Info', icon: Crown },
    { num: 2, label: 'Pricing', icon: Clock },
    { num: 3, label: 'Features', icon: Sparkles },
    { num: 4, label: 'Settings', icon: Settings },
    { num: 5, label: 'Review', icon: Eye },
  ];

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(16px)',
              zIndex: 10000,
            }}
            onClick={onClose}
          />

          {/* Modal */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001,
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(180deg, #161616 0%, #0c0c0c 100%)',
                borderRadius: 24,
                width: '100%',
                maxWidth: 720,
                maxHeight: '90vh',
                overflow: 'hidden',
                boxShadow: '0 30px 100px -20px rgba(0, 0, 0, 0.95), 0 0 100px rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div style={{
                padding: '24px 28px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'linear-gradient(180deg, #181818 0%, #161616 100%)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      background: `linear-gradient(135deg, ${state.basicInfo.planColor}30 0%, ${state.basicInfo.planColor}10 100%)`,
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${state.basicInfo.planColor}30`,
                    }}>
                      <Crown size={22} style={{ color: state.basicInfo.planColor }} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F9FAFB', margin: 0 }}>
                        {editingPlan ? 'Edit Membership Tier' : 'Create Membership Tier'}
                      </h2>
                      <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>
                        Step {state.step} of 5 - {steps[state.step - 1].label}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    style={{
                      padding: 10,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10,
                      color: '#6B7280',
                      cursor: 'pointer',
                      display: 'flex',
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Progress Steps */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  {steps.map((s, i) => (
                    <React.Fragment key={s.num}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 12px',
                          background: state.step >= s.num ? `${state.basicInfo.planColor}15` : 'transparent',
                          borderRadius: 10,
                          cursor: state.step > s.num ? 'pointer' : 'default',
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => state.step > s.num && setState(prev => ({ ...prev, step: s.num as WizardStep }))}
                      >
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: state.step > s.num 
                            ? state.basicInfo.planColor 
                            : state.step === s.num 
                              ? `${state.basicInfo.planColor}30`
                              : 'rgba(255,255,255,0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: state.step >= s.num ? '#fff' : '#6B7280',
                          fontSize: 12,
                          fontWeight: 600,
                        }}>
                          {state.step > s.num ? <Check size={14} /> : s.num}
                        </div>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: state.step >= s.num ? '#F9FAFB' : '#6B7280',
                          display: i < 3 ? 'block' : 'none',
                        }}>
                          {s.label}
                        </span>
                      </div>
                      {i < steps.length - 1 && (
                        <div style={{
                          flex: 1,
                          height: 2,
                          background: state.step > s.num 
                            ? state.basicInfo.planColor 
                            : 'rgba(255,255,255,0.08)',
                          margin: '0 4px',
                          borderRadius: 1,
                        }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
                <AnimatePresence mode="wait">
                  {/* Step 1: Basic Info */}
                  {state.step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
                    >
                      {/* Plan Name */}
                      <div>
                        <label style={labelStyle}>Plan Name *</label>
                        <input
                          type="text"
                          value={state.basicInfo.planName}
                          onChange={(e) => setState(prev => ({
                            ...prev,
                            basicInfo: { ...prev.basicInfo, planName: e.target.value }
                          }))}
                          placeholder="e.g., Gold, Platinum, Elite"
                          style={inputStyle}
                        />
                        {errors.planName && <ErrorText>{errors.planName}</ErrorText>}
                      </div>

                      {/* Description */}
                      <div>
                        <label style={labelStyle}>Description</label>
                        <textarea
                          value={state.basicInfo.description}
                          onChange={(e) => setState(prev => ({
                            ...prev,
                            basicInfo: { ...prev.basicInfo, description: e.target.value }
                          }))}
                          placeholder="Brief description of this tier..."
                          rows={3}
                          style={{ ...inputStyle, resize: 'none', minHeight: 80 }}
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label style={labelStyle}>Category</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                          {CATEGORIES.map((cat) => (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => setState(prev => ({
                                ...prev,
                                basicInfo: { ...prev.basicInfo, category: cat.value }
                              }))}
                              style={{
                                padding: '14px 16px',
                                background: state.basicInfo.category === cat.value 
                                  ? `${state.basicInfo.planColor}15` 
                                  : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${state.basicInfo.category === cat.value 
                                  ? state.basicInfo.planColor + '50' 
                                  : 'rgba(255,255,255,0.08)'}`,
                                borderRadius: 12,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <p style={{ fontSize: 13, fontWeight: 600, color: '#F9FAFB', margin: 0 }}>{cat.label}</p>
                              <p style={{ fontSize: 11, color: '#6B7280', margin: '4px 0 0' }}>{cat.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color */}
                      <div>
                        <label style={labelStyle}>Brand Color</label>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          {COLOR_PALETTE.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setState(prev => ({
                                ...prev,
                                basicInfo: { ...prev.basicInfo, planColor: color }
                              }))}
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                background: color,
                                border: state.basicInfo.planColor === color 
                                  ? '3px solid #fff' 
                                  : '3px solid transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: state.basicInfo.planColor === color 
                                  ? `0 0 20px ${color}60` 
                                  : 'none',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              {state.basicInfo.planColor === color && <Check size={18} color="#fff" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Pricing/Variants */}
                  {state.step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F9FAFB', margin: 0 }}>
                            Duration & Pricing Options
                          </h3>
                          <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0' }}>
                            Add different duration options with their prices
                          </p>
                        </div>
                        <button
                          onClick={addVariant}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '10px 16px',
                            background: `linear-gradient(135deg, ${state.basicInfo.planColor} 0%, ${state.basicInfo.planColor}cc 100%)`,
                            border: 'none',
                            borderRadius: 10,
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Plus size={16} />
                          Add Option
                        </button>
                      </div>

                      {errors.variants && <ErrorText>{errors.variants}</ErrorText>}

                      {state.variants.length === 0 ? (
                        <div style={{
                          padding: '48px 24px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px dashed rgba(255,255,255,0.1)',
                          borderRadius: 16,
                          textAlign: 'center',
                        }}>
                          <Clock size={32} style={{ color: '#6B7280', marginBottom: 12 }} />
                          <p style={{ color: '#9CA3AF', margin: 0 }}>No pricing options yet</p>
                          <p style={{ fontSize: 12, color: '#6B7280', margin: '8px 0 0' }}>
                            Click "Add Option" to create duration/price combinations
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {state.variants.map((variant, index) => (
                            <div
                              key={index}
                              style={{
                                padding: '18px 20px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 14,
                              }}
                            >
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                                {/* Duration Value */}
                                <div>
                                  <label style={{ ...labelStyle, fontSize: 10 }}>Duration</label>
                                  <div style={{ display: 'flex', gap: 8 }}>
                                    <input
                                      type="number"
                                      value={variant.durationValue}
                                      onChange={(e) => updateVariant(index, 'durationValue', parseInt(e.target.value) || 1)}
                                      min={1}
                                      style={{ ...inputStyle, width: 70 }}
                                    />
                                    <select
                                      value={variant.durationUnit}
                                      onChange={(e) => updateVariant(index, 'durationUnit', e.target.value)}
                                      style={{ ...inputStyle, flex: 1 }}
                                    >
                                      <option value="DAYS">Days</option>
                                      <option value="WEEKS">Weeks</option>
                                      <option value="MONTHS">Months</option>
                                      <option value="YEARS">Years</option>
                                    </select>
                                  </div>
                                </div>

                                {/* Price */}
                                <div>
                                  <label style={{ ...labelStyle, fontSize: 10 }}>Price (₹) *</label>
                                  <input
                                    type="number"
                                    value={variant.price || ''}
                                    onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                                    placeholder="1999"
                                    min={0}
                                    style={inputStyle}
                                  />
                                  {errors[`variant_${index}_price`] && (
                                    <span style={{ fontSize: 10, color: '#EF4444' }}>Required</span>
                                  )}
                                </div>

                                {/* PT Sessions */}
                                <div>
                                  <label style={{ ...labelStyle, fontSize: 10 }}>PT Sessions</label>
                                  <input
                                    type="number"
                                    value={variant.includedPTSessions || ''}
                                    onChange={(e) => updateVariant(index, 'includedPTSessions', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    min={0}
                                    style={inputStyle}
                                  />
                                </div>

                                {/* Remove */}
                                <button
                                  onClick={() => removeVariant(index)}
                                  style={{
                                    padding: 10,
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: 10,
                                    color: '#EF4444',
                                    cursor: 'pointer',
                                    display: 'flex',
                                  }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>

                              {/* Additional Options Row */}
                              <div style={{ 
                                display: 'flex', 
                                gap: 16, 
                                marginTop: 12, 
                                paddingTop: 12, 
                                borderTop: '1px solid rgba(255,255,255,0.04)' 
                              }}>
                                <label style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  cursor: 'pointer',
                                  fontSize: 12,
                                  color: '#9CA3AF',
                                }}>
                                  <input
                                    type="checkbox"
                                    checked={variant.isPopular || false}
                                    onChange={(e) => updateVariant(index, 'isPopular', e.target.checked)}
                                    style={{ accentColor: state.basicInfo.planColor }}
                                  />
                                  <Star size={14} />
                                  Mark as Popular
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <label style={{ fontSize: 12, color: '#6B7280' }}>Discount %</label>
                                  <input
                                    type="number"
                                    value={variant.discountPercent || ''}
                                    onChange={(e) => updateVariant(index, 'discountPercent', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    min={0}
                                    max={100}
                                    style={{ ...inputStyle, width: 70, padding: '6px 10px' }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Features */}
                  {state.step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                    >
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F9FAFB', margin: 0 }}>
                          Features & Amenities
                        </h3>
                        <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0' }}>
                          Select what's included in this membership tier
                        </p>
                      </div>

                      {errors.features && <ErrorText>{errors.features}</ErrorText>}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {state.features.map((feature, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => toggleFeature(index)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 14,
                              padding: '14px 18px',
                              background: feature.isIncluded 
                                ? `${state.basicInfo.planColor}10` 
                                : 'rgba(255,255,255,0.02)',
                              border: `1px solid ${feature.isIncluded 
                                ? state.basicInfo.planColor + '40' 
                                : 'rgba(255,255,255,0.06)'}`,
                              borderRadius: 12,
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <div style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              background: feature.isIncluded 
                                ? state.basicInfo.planColor 
                                : 'rgba(255,255,255,0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                            }}>
                              <Check size={14} style={{ color: feature.isIncluded ? '#fff' : '#6B7280' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ 
                                fontSize: 13, 
                                fontWeight: 600, 
                                color: feature.isIncluded ? '#F9FAFB' : '#9CA3AF', 
                                margin: 0 
                              }}>
                                {feature.name}
                              </p>
                              <p style={{ 
                                fontSize: 11, 
                                color: feature.isIncluded ? '#9CA3AF' : '#6B7280', 
                                margin: '2px 0 0' 
                              }}>
                                {feature.description}
                              </p>
                            </div>
                            <span style={{
                              padding: '4px 10px',
                              background: 'rgba(255,255,255,0.05)',
                              borderRadius: 6,
                              fontSize: 10,
                              fontWeight: 600,
                              color: '#6B7280',
                              textTransform: 'uppercase',
                            }}>
                              {feature.category}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Settings */}
                  {state.step === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
                    >
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F9FAFB', margin: 0 }}>
                          Plan Settings
                        </h3>
                        <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0' }}>
                          Configure visibility and highlight options
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <label style={labelStyle}>Status</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                          {(['ACTIVE', 'INACTIVE', 'DRAFT'] as PlanStatus[]).map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setState(prev => ({
                                ...prev,
                                settings: { ...prev.settings, status }
                              }))}
                              style={{
                                padding: '14px 16px',
                                background: state.settings.status === status 
                                  ? `${state.basicInfo.planColor}15` 
                                  : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${state.settings.status === status 
                                  ? state.basicInfo.planColor + '50' 
                                  : 'rgba(255,255,255,0.08)'}`,
                                borderRadius: 12,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <p style={{ fontSize: 13, fontWeight: 600, color: '#F9FAFB', margin: 0 }}>
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                              </p>
                              <p style={{ fontSize: 11, color: '#6B7280', margin: '4px 0 0' }}>
                                {status === 'ACTIVE' && 'Visible to staff and members'}
                                {status === 'INACTIVE' && 'Hidden from selection'}
                                {status === 'DRAFT' && 'Work in progress'}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Recommended */}
                      <div>
                        <label style={labelStyle}>Highlight</label>
                        <button
                          type="button"
                          onClick={() => setState(prev => ({
                            ...prev,
                            settings: { ...prev.settings, isRecommended: !prev.settings.isRecommended }
                          }))}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            width: '100%',
                            padding: '16px 18px',
                            background: state.settings.isRecommended 
                              ? 'rgba(245, 158, 11, 0.1)' 
                              : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${state.settings.isRecommended 
                              ? 'rgba(245, 158, 11, 0.3)' 
                              : 'rgba(255,255,255,0.08)'}`,
                            borderRadius: 12,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: state.settings.isRecommended 
                              ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' 
                              : 'rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Star size={16} fill={state.settings.isRecommended ? '#fff' : 'transparent'} 
                              style={{ color: state.settings.isRecommended ? '#fff' : '#6B7280' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#F9FAFB', margin: 0 }}>
                              Mark as "Best Value"
                            </p>
                            <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0' }}>
                              Display a highlight badge to attract attention
                            </p>
                          </div>
                          <div style={{
                            width: 44,
                            height: 24,
                            borderRadius: 12,
                            background: state.settings.isRecommended 
                              ? '#F59E0B' 
                              : 'rgba(255,255,255,0.1)',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                          }}>
                            <div style={{
                              width: 20,
                              height: 20,
                              borderRadius: 10,
                              background: '#fff',
                              position: 'absolute',
                              top: 2,
                              left: state.settings.isRecommended ? 22 : 2,
                              transition: 'all 0.2s ease',
                            }} />
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5: Review */}
                  {state.step === 5 && (
                    <motion.div
                      key="step5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                    >
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F9FAFB', margin: 0 }}>
                          Review Your Tier
                        </h3>
                        <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0' }}>
                          Verify all details before saving
                        </p>
                      </div>

                      {/* Preview Card */}
                      <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 20,
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: 5,
                          background: `linear-gradient(90deg, ${state.basicInfo.planColor} 0%, ${state.basicInfo.planColor}80 100%)`,
                        }} />
                        <div style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                            <div style={{
                              width: 52,
                              height: 52,
                              background: `${state.basicInfo.planColor}15`,
                              borderRadius: 14,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Crown size={26} style={{ color: state.basicInfo.planColor }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: state.basicInfo.planColor,
                                  textTransform: 'uppercase',
                                }}>
                                  {CATEGORIES.find(c => c.value === state.basicInfo.category)?.label}
                                </span>
                                {state.settings.isRecommended && (
                                  <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '3px 8px',
                                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                    borderRadius: 20,
                                    fontSize: 9,
                                    fontWeight: 700,
                                    color: '#fff',
                                  }}>
                                    <Star size={8} fill="#fff" />
                                    BEST VALUE
                                  </span>
                                )}
                              </div>
                              <h4 style={{ fontSize: 22, fontWeight: 700, color: '#F9FAFB', margin: '4px 0' }}>
                                {state.basicInfo.planName || 'Untitled Plan'}
                              </h4>
                              {state.basicInfo.description && (
                                <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                                  {state.basicInfo.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Variants Summary */}
                          {state.variants.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                              <p style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' }}>
                                Pricing Options ({state.variants.length})
                              </p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {state.variants.map((v, i) => (
                                  <div key={i} style={{
                                    padding: '10px 14px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: 10,
                                  }}>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: '#F9FAFB', margin: 0 }}>
                                      {formatDuration(v.durationValue, v.durationUnit)}
                                    </p>
                                    <p style={{ fontSize: 16, fontWeight: 700, color: state.basicInfo.planColor, margin: '4px 0 0' }}>
                                      {formatPrice(v.price)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Features Summary */}
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' }}>
                              Included Features ({state.features.filter(f => f.isIncluded).length})
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {state.features.filter(f => f.isIncluded).map((f, i) => (
                                <span key={i} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  padding: '6px 12px',
                                  background: 'rgba(16, 185, 129, 0.1)',
                                  borderRadius: 20,
                                  fontSize: 12,
                                  color: '#10B981',
                                }}>
                                  <Check size={12} />
                                  {f.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '12px',
                        background: state.settings.status === 'ACTIVE' 
                          ? 'rgba(16, 185, 129, 0.1)' 
                          : state.settings.status === 'DRAFT' 
                            ? 'rgba(245, 158, 11, 0.1)' 
                            : 'rgba(239, 68, 68, 0.1)',
                        borderRadius: 10,
                      }}>
                        <AlertCircle size={16} style={{ 
                          color: state.settings.status === 'ACTIVE' 
                            ? '#10B981' 
                            : state.settings.status === 'DRAFT' 
                              ? '#F59E0B' 
                              : '#EF4444' 
                        }} />
                        <span style={{ 
                          fontSize: 13, 
                          fontWeight: 500,
                          color: state.settings.status === 'ACTIVE' 
                            ? '#10B981' 
                            : state.settings.status === 'DRAFT' 
                              ? '#F59E0B' 
                              : '#EF4444'
                        }}>
                          This tier will be {state.settings.status === 'ACTIVE' 
                            ? 'immediately visible to staff' 
                            : state.settings.status === 'DRAFT' 
                              ? 'saved as a draft' 
                              : 'hidden from selection'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div style={{
                padding: '20px 28px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(180deg, #161616 0%, #141414 100%)',
              }}>
                <button
                  onClick={state.step === 1 ? onClose : handleBack}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 20px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    color: '#9CA3AF',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <ChevronLeft size={18} />
                  {state.step === 1 ? 'Cancel' : 'Back'}
                </button>

                <button
                  onClick={state.step === 5 ? handleSubmit : handleNext}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 24px',
                    background: state.step === 5 
                      ? `linear-gradient(135deg, ${state.basicInfo.planColor} 0%, ${state.basicInfo.planColor}cc 100%)`
                      : `linear-gradient(135deg, ${state.basicInfo.planColor} 0%, ${state.basicInfo.planColor}cc 100%)`,
                    border: 'none',
                    borderRadius: 12,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: `0 4px 20px ${state.basicInfo.planColor}40`,
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: 18,
                        height: 18,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      Saving...
                    </>
                  ) : state.step === 5 ? (
                    <>
                      <Check size={18} />
                      {editingPlan ? 'Save Changes' : 'Create Tier'}
                    </>
                  ) : (
                    <>
                      Continue
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>

          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

// Styled components
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: '#9CA3AF',
  marginBottom: 8,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  color: '#F9FAFB',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease',
};

const ErrorText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: 6, 
    fontSize: 12, 
    color: '#EF4444', 
    margin: '8px 0 0' 
  }}>
    <AlertCircle size={14} />
    {children}
  </p>
);

export default TieredPlanWizard;
