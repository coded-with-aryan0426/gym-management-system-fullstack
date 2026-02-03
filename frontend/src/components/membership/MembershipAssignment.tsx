import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../ui';
import { Calendar, DollarSign, Users, Clock } from 'lucide-react';
import { MembershipPackageDTO } from '../../types/membershipPackage';
import membershipPlanApi from '../../services/membershipPlanApi';
import { toast } from 'react-hot-toast';

interface MembershipAssignmentProps {
  memberId?: number;
  onMembershipSelect: (membershipId: number) => void;
  selectedMembershipId?: number;
  mode?: 'create' | 'edit' | 'renew';
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
  
  const { toast } = useToast();

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
      toast({
        title: 'Error',
        description: 'Failed to fetch membership plans',
        variant: 'destructive'
      });
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
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
        </CardContent>
      </Card>
    );
  }

  if (membershipPlans.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="font-medium">No membership plans available</p>
            <p className="text-sm mt-1">
              {mode === 'create' 
                ? 'Contact your gym administrator to set up membership plans.'
                : 'Please create membership plans first.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="membershipPlan">
          {mode === 'renew' ? 'Renew Membership Plan' : 'Select Membership Plan'}
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Select 
          value={selectedPlan?.packageId.toString() || ''} 
          onValueChange={handlePlanSelect}
          required
        >
          <SelectTrigger id="membershipPlan" className="mt-1">
            <SelectValue placeholder="Choose a membership plan..." />
          </SelectTrigger>
          <SelectContent>
            {membershipPlans.map((plan) => (
              <SelectItem key={plan.packageId} value={plan.packageId.toString()}>
                <div className="flex items-center justify-between w-full">
                  <span>{plan.packageName}</span>
                  <Badge variant="outline" className="ml-2">
                    {formatPrice(plan.price)}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPlan && (
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{selectedPlan.packageName}</CardTitle>
              <Badge variant="default">Selected</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Price</p>
                  <p className="font-semibold">{formatPrice(selectedPlan.price)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold">{formatDuration(selectedPlan.durationDays)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Monthly Price</p>
                  <p className="font-semibold">
                    {formatPrice(calculateMonthlyPrice(selectedPlan.price, selectedPlan.durationDays))}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">PT Sessions</p>
                  <p className="font-semibold">
                    {selectedPlan.includedPTSessions} {selectedPlan.includedPTSessions === 1 ? 'session' : 'sessions'}
                  </p>
                </div>
              </div>
            </div>
            
            {mode === 'renew' && memberId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Renewal Summary:</strong> This membership will be assigned to member ID {memberId} 
                  for {formatDuration(selectedPlan.durationDays)} starting from today.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MembershipAssignment;