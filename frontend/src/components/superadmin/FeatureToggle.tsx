import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { FeatureFlag } from '../../types/feature.types';

interface FeatureToggleProps {
  feature: FeatureFlag;
  onToggle: (key: string, enabled: boolean) => void;
  isUpdating: boolean;
}

const FeatureToggle: React.FC<FeatureToggleProps> = ({ feature, onToggle, isUpdating }) => {
  const roles = feature.allowedRoles
    ? feature.allowedRoles.split(',').map((r) => r.trim()).filter(Boolean)
    : [];

  return (
    <div className="sa__flag-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '14px 18px' }}>
      {/* Info block */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className="sa__flag-name" style={{ fontSize: 14 }}>{feature.featureKey}</span>
          <span
            className={`sa__badge ${feature.enabled ? 'sa__badge--green' : 'sa__badge--gray'}`}
            style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            {feature.enabled ? 'ENABLED' : 'DISABLED'}
          </span>
        </div>

        {feature.description && (
          <div className="sa__flag-desc" style={{ marginBottom: 6 }}>
            {feature.description}
          </div>
        )}

        {roles.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {roles.map((role) => (
              <span key={role} className="sa__badge sa__badge--blue" style={{ fontSize: 10 }}>
                {role}
              </span>
            ))}
          </div>
        )}

        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          Updated {new Date(feature.updatedAt).toLocaleDateString()}
        </div>
      </div>

      {/* Toggle / loading */}
      <div style={{ display: 'flex', alignItems: 'center', paddingTop: 2 }}>
        {isUpdating ? (
          <RefreshCw size={18} className="spinning" style={{ color: 'var(--text-muted)' }} />
        ) : (
          <label
            className="sa__toggle"
            onClick={(e) => {
              e.preventDefault();
              onToggle(feature.featureKey, !feature.enabled);
            }}
            style={{ cursor: 'pointer' }}
          >
            <input type="checkbox" checked={feature.enabled} readOnly />
            <span className="sa__toggle-track" />
            <span className="sa__toggle-thumb" />
          </label>
        )}
      </div>
    </div>
  );
};

export default FeatureToggle;
