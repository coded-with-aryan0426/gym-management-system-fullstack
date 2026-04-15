"use client"

import type React from "react"
import { Crown, Calendar, Zap, Shield, Check, Clock, Info, ExternalLink } from "lucide-react"
import { useSubscription } from "../../hooks/useSubscription"

const MyPlanSection: React.FC = () => {
  const {
    isLoading,
    subscription,
    currentPlan,
    license,
    isActive,
    isTrialing,
    isInGracePeriod,
    daysUntilExpiry,
    features,
  } = useSubscription()

  const getStatusColor = () => {
    if (isTrialing) return "var(--color-ocean)"
    if (isInGracePeriod) return "var(--color-amber)"
    if (isActive) return "var(--color-emerald)"
    return "var(--settings-text-tertiary)"
  }

  const getStatusLabel = () => {
    if (isTrialing) return "Trial"
    if (isInGracePeriod) return "Grace Period"
    if (isActive) return subscription?.status || "Active"
    return subscription?.status || "None"
  }

  if (isLoading) {
    return (
      <div className="settings-section" style={{ "--section-accent": "#ec4899" } as React.CSSProperties}>
        <div className="settings-section__loading">
          <div className="settings-section__loading-spinner" />
          <span>Loading plan details...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-section" style={{ "--section-accent": "#ec4899" } as React.CSSProperties}>
      <div className="settings-section__header">
        <div className="settings-section__title-group">
          <div className="settings-section__icon">
            <Crown size={18} />
          </div>
          <div>
            <h2 className="settings-section__title">My Plan</h2>
            <p className="settings-section__description">
              Your current subscription status and features
            </p>
          </div>
        </div>
      </div>

      <div className="settings-section__content">
        {/* Current Plan Status */}
        <div className="form-group">
          <div className="form-group__header">
            <Zap size={12} />
            <h4 className="form-group__title">Current Plan</h4>
          </div>
          <div className="myplan-status-card">
            {subscription && currentPlan ? (
              <>
                <div className="myplan-plan-row">
                  <div className="myplan-plan-info">
                    <span className="myplan-plan-name">
                      {currentPlan.displayName || currentPlan.name}
                    </span>
                    <span
                      className="myplan-status-badge"
                      style={{
                        background: `${getStatusColor()}22`,
                        color: getStatusColor(),
                        border: `1px solid ${getStatusColor()}44`,
                      }}
                    >
                      {getStatusLabel()}
                    </span>
                  </div>
                </div>

                <div className="myplan-details-grid">
                  <div className="myplan-detail-item">
                    <Calendar size={13} />
                    <span className="myplan-detail-label">Billing Cycle</span>
                    <span className="myplan-detail-value">
                      {subscription.billingCycle || "—"}
                    </span>
                  </div>

                  <div className="myplan-detail-item">
                    <Clock size={13} />
                    <span className="myplan-detail-label">
                      {isTrialing ? "Trial Ends" : isInGracePeriod ? "Grace Period Ends" : "Next Renewal"}
                    </span>
                    <span className="myplan-detail-value">
                      {new Date(
                        isTrialing
                          ? subscription.trialEnd || subscription.currentPeriodEnd
                          : subscription.currentPeriodEnd
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                    <div className="myplan-detail-item">
                      <Shield size={13} />
                      <span className="myplan-detail-label">Days Remaining</span>
                      <span className="myplan-detail-value myplan-detail-value--highlight">
                        {daysUntilExpiry} days
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="myplan-empty">
                <Crown size={28} strokeWidth={1.5} />
                <p>No active subscription</p>
                <span>Contact your SaaS administrator to get started</span>
              </div>
            )}
          </div>
        </div>

        {/* Plan Features */}
        {currentPlan && (
          <div className="form-group">
            <div className="form-group__header">
              <Check size={12} />
              <h4 className="form-group__title">Plan Features</h4>
            </div>
            <div className="myplan-features-grid">
              <div className="myplan-feature-item">
                <Check size={13} />
                <span>
                  {currentPlan.maxMembers === -1
                    ? "Unlimited"
                    : currentPlan.maxMembers}{" "}
                  Members
                </span>
              </div>
              <div className="myplan-feature-item">
                <Check size={13} />
                <span>
                  {currentPlan.maxStaff === -1
                    ? "Unlimited"
                    : currentPlan.maxStaff}{" "}
                  Staff
                </span>
              </div>
              <div className="myplan-feature-item">
                <Check size={13} />
                <span>
                  {currentPlan.maxTrainers === -1
                    ? "Unlimited"
                    : currentPlan.maxTrainers}{" "}
                  Trainers
                </span>
              </div>
              {features.analytics && (
                <div className="myplan-feature-item">
                  <Check size={13} />
                  <span>Analytics</span>
                </div>
              )}
              {features.paymentCollection && (
                <div className="myplan-feature-item">
                  <Check size={13} />
                  <span>Payment Collection</span>
                </div>
              )}
              {features.brandedMobileApp && (
                <div className="myplan-feature-item">
                  <Check size={13} />
                  <span>Branded Mobile App</span>
                </div>
              )}
              {features.apiAccess && (
                <div className="myplan-feature-item">
                  <Check size={13} />
                  <span>API Access</span>
                </div>
              )}
              {features.whiteLabel && (
                <div className="myplan-feature-item">
                  <Check size={13} />
                  <span>White Label</span>
                </div>
              )}
              {features.multiLocation && (
                <div className="myplan-feature-item">
                  <Check size={13} />
                  <span>Multi-Location</span>
                </div>
              )}
              {features.dedicatedSupport && (
                <div className="myplan-feature-item">
                  <Check size={13} />
                  <span>Dedicated Support</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* License Key */}
        {license && (
          <div className="form-group">
            <div className="form-group__header">
              <Shield size={12} />
              <h4 className="form-group__title">License</h4>
            </div>
            <div className="myplan-license-row">
              <span className="myplan-license-label">License Key</span>
              <code className="myplan-license-key">{license.licenseKey}</code>
            </div>
          </div>
        )}

        {/* Info Note */}
        <div className="policy-note">
          <div className="policy-note__icon">
            <Info size={16} />
          </div>
          <span>
            <strong>Plan Management:</strong> To upgrade, downgrade, or manage your subscription plan,
            please contact your SaaS platform administrator through the Creator Portal.
          </span>
        </div>
      </div>
    </div>
  )
}

export default MyPlanSection
