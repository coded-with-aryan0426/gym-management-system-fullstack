import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../ui';
import {
  Calendar,
  Clock,
  IndianRupee,
  Users,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  QrCode,
  Download,
  RefreshCw
} from 'lucide-react';
import type { MembershipPackageDTO } from '../../types/membershipPackage';
import { MembershipDTO } from '../../types/membership';
import membershipApi from '../../services/membershipApi';
import { toast } from 'react-hot-toast';

interface MemberMembershipViewProps {
  memberId: number;
  onRenewMembership?: () => void;
  onUpgradeMembership?: () => void;
}

const MemberMembershipView: React.FC<MemberMembershipViewProps> = ({
  memberId,
  onRenewMembership,
  onUpgradeMembership
}) => {
  const [membership, setMembership] = useState<MembershipDTO | null>(null);
  const [planDetails, setPlanDetails] = useState<MembershipPackageDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);

  useEffect(() => {
    fetchMemberMembership();
  }, [memberId]);

  const fetchMemberMembership = async () => {
    try {
      setLoading(true);
      setError(null);

      const membershipResponse = await membershipApi.getMemberMembership(memberId);
      const membershipData = membershipResponse.data;

      if (membershipData) {
        setMembership(membershipData);

        if (membershipData.membershipPackageId) {
          const planResponse = await membershipApi.getMembershipPlan(membershipData.membershipPackageId);
          setPlanDetails(planResponse.data);
        }

        calculateMembershipProgress(membershipData);
      }

    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch membership details';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateMembershipProgress = (m: MembershipDTO) => {
    if (!m.endDate) return;

    const today = new Date();
    const endDate = new Date(m.endDate);
    const startDate = new Date(m.startDate);

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, totalDays - elapsedDays);

    setDaysRemaining(remainingDays);
    setProgressPercentage(Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100)));
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

  const formatDuration = (days: number) => {
    if (days >= 365) { const y = Math.floor(days / 365); return `${y} year${y > 1 ? 's' : ''}`; }
    if (days >= 30) { const m = Math.floor(days / 30); return `${m} month${m > 1 ? 's' : ''}`; }
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  const generateQRCode = async () => {
    try {
      await membershipApi.generateCheckInQR(memberId);
      toast.success('Show this QR code at the gym entrance for quick check-in');
    } catch {
      toast.error('Failed to generate QR code');
    }
  };

  const downloadMembershipCard = () => {
    toast('Your membership card is being prepared for download');
  };

  const statusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'EXPIRED': return 'danger';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="p-6 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 text-red-500 mb-4">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" onClick={fetchMemberMembership}>
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!membership) {
    return (
      <Card>
        <div className="p-6 text-center text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="font-medium">No Active Membership</p>
          <p className="text-sm mt-1">You don't currently have an active membership. Contact the gym to get started!</p>
          <Button variant="secondary" onClick={onRenewMembership} style={{ marginTop: '1rem' }}>
            Browse Membership Plans
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Membership Status Card */}
      <Card>
        <div className="p-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="text-xl font-semibold">Current Membership</h2>
            <Badge variant={statusBadgeColor(membership.status) as 'success' | 'danger' | 'default'}>
              {membership.status}
            </Badge>
          </div>

          {planDetails && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="text-lg font-semibold">{planDetails.packageName}</h3>
                <span className="text-sm font-medium">{formatPrice(planDetails.price)}</span>
              </div>

              <hr style={{ border: '1px solid rgba(255,255,255,0.08)' }} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Start Date</p>
                    <p className="font-medium text-sm">{new Date(membership.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-xs text-gray-500">End Date</p>
                    <p className="font-medium text-sm">{new Date(membership.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-medium text-sm">{formatDuration(planDetails.durationDays)}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">PT Sessions</p>
                    <p className="font-medium text-sm">{planDetails.includedPTSessions}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Progress Card */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Membership Progress</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-sm text-gray-500">Days Remaining</span>
              <span className="text-lg font-semibold">{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</span>
            </div>

            {/* Progress bar */}
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercentage}%`, height: '100%', background: '#10b981', borderRadius: '99px', transition: 'width 0.4s' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-xs text-gray-500">{Math.round(progressPercentage)}% Complete</span>
              <span className="text-xs text-gray-500">{100 - Math.round(progressPercentage)}% Remaining</span>
            </div>

            {daysRemaining <= 7 && membership.status === 'ACTIVE' && (
              <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <AlertCircle className="h-4 w-4 text-red-500" style={{ marginTop: '1px', flexShrink: 0 }} />
                <span className="text-sm text-gray-300">
                  Your membership expires in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}. Consider renewing to avoid interruption.
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Button variant="secondary" onClick={generateQRCode}>
          <QrCode className="h-4 w-4 mr-2" /> Generate Check-in QR
        </Button>
        <Button variant="secondary" onClick={downloadMembershipCard}>
          <Download className="h-4 w-4 mr-2" /> Download Membership Card
        </Button>
        {daysRemaining <= 30 && (
          <Button onClick={onRenewMembership}>
            <RefreshCw className="h-4 w-4 mr-2" /> Renew Membership
          </Button>
        )}
        {onUpgradeMembership && (
          <Button variant="secondary" onClick={onUpgradeMembership}>
            <TrendingUp className="h-4 w-4 mr-2" /> Upgrade Plan
          </Button>
        )}
      </div>
    </div>
  );
};

export default MemberMembershipView;