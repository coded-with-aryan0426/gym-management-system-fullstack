import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../ui';
import { Calendar, IndianRupee, Users, Clock } from 'lucide-react';
import type { MembershipPackageDTO } from '../../types/membershipPackage';
import membershipPlanApi from '../../services/membershipPlanApi';
import { toast } from 'react-hot-toast';
import './MembershipAssignment.css';

interface MembershipAssignmentProps {
  memberId?: number;
  onMembershipSelect: (membershipId: number) => void;
  selectedMembershipId?: number;
  mode?: 'create' | 'edit' | 'renew' | 'selection';
}

const MembershipAssignment: React.FC<MembershipAssignmentProps> = ({
  memberId,
  onMembershipSelect,
  selectedMembershipId,
  mode = 'create'
}) => {
  const [membershipPlans, setMembershipPlans] = useState<MembershipPackageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPackageDTO | null>(null);

  useEffect(() => {
    fetchMembershipPlans();
  }, []);

  const fetchMembershipPlans = async () => {
    try {
      setLoading(true);
      const response = await membershipPlanApi.getPlansForAssignment();
      setMembershipPlans(response.data);
      
      // If a membership is already selected, find it in the list
      if (selectedMembershipId) {
        const plan = response.data.find(p => p.packageId === selectedMembershipId);
        if (plan) {
          setSelectedPlan(plan);
        }
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch membership plans');
      toast.error('Failed to fetch membership plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (planId: string) => {
    const plan = membershipPlans.find(p => p.packageId.toString() === planId);
    if (plan) {
      setSelectedPlan(plan);
      onMembershipSelect(plan.packageId);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
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

  const calculateMonthlyPrice = (price: number, days: number): number => {
    const months = days / 30.44; // Average days per month
    return Math.round((price / months) * 100) / 100;
  };

  // Selection mode - compact dropdown for forms
  if (mode === 'selection') {
    if (loading) {
      return (
        <div className="membership-select-wrapper">
          <select className="membership-select membership-select--loading" disabled>
            <option>Loading plans...</option>
          </select>
        </div>
      );
    }

    if (error) {
      return (
        <div className="membership-select-wrapper">
          <select className="membership-select membership-select--error" disabled>
            <option>Error loading plans</option>
          </select>
        </div>
      );
    }

    return (
      <div className="membership-select-wrapper">
        <select
          value={selectedPlan?.packageId.toString() || ''}
          onChange={(e) => handlePlanSelect(e.target.value)}
          className="membership-select"
          required
        >
          <option value="">Choose a membership plan</option>
          {membershipPlans.map((plan) => (
            <option key={plan.packageId} value={plan.packageId.toString()}>
              {plan.packageName} - ₹{plan.price.toLocaleString('en-IN')}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Full card mode for other contexts
  if (loading) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-6">
          <div className="text-center text-red-600">
            <p className="font-medium">Error loading membership plans</p>
            <p className="text-sm mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={fetchMembershipPlans}
            >
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (membershipPlans.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <div className="text-center text-gray-500">
            <p className="font-medium">No membership plans available</p>
            <p className="text-sm mt-1">Please create membership plans first</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Select Membership Plan *
        </label>
        <select
          value={selectedPlan?.packageId.toString() || ''}
          onChange={(e) => handlePlanSelect(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Choose a membership plan</option>
          {membershipPlans.map((plan) => (
              <option key={plan.packageId} value={plan.packageId.toString()}>
                {plan.packageName} - ₹{plan.price}
              </option>
          ))}
        </select>
      </div>

      {selectedPlan && (
        <Card elevation="2" className="border-blue-200 bg-blue-50">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{selectedPlan.packageName}</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(selectedPlan.price)}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDuration(selectedPlan.durationDays)} • ~{formatPrice(calculateMonthlyPrice(selectedPlan.price, selectedPlan.durationDays))}/month
                </p>
              </div>
              <Badge variant="active" className="text-xs">
                Selected
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{selectedPlan.durationDays} days</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span>{selectedPlan.includedPTSessions} PT sessions</span>
              </div>
            </div>

            {selectedPlan.description && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">{selectedPlan.description}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default MembershipAssignment;