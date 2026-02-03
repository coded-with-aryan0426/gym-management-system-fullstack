import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  QrCode,
  Download,
  RefreshCw
} from 'lucide-react';
import { MembershipPackageDTO } from '@/types/membershipPackage';
import { MembershipDTO } from '@/types/membership';
import membershipApi from '@/services/membershipApi';
import { useToast } from '@/components/ui/use-toast';

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
  
  const { toast } = useToast();

  useEffect(() => {
    fetchMemberMembership();
  }, [memberId]);

  const fetchMemberMembership = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch current membership
      const membershipResponse = await membershipApi.getMemberMembership(memberId);
      const membershipData = membershipResponse.data;
      
      if (membershipData) {
        setMembership(membershipData);
        
        // Fetch plan details
        if (membershipData.membershipPackageId) {
          const planResponse = await membershipApi.getMembershipPlan(membershipData.membershipPackageId);
          setPlanDetails(planResponse.data);
        }
        
        // Calculate days remaining and progress
        calculateMembershipProgress(membershipData);
      }
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch membership details';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMembershipProgress = (membership: MembershipDTO) => {
    if (!membership.endDate) return;
    
    const today = new Date();
    const endDate = new Date(membership.endDate);
    const startDate = new Date(membership.startDate);
    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, totalDays - elapsedDays);
    
    setDaysRemaining(remainingDays);
    setProgressPercentage(Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100)));
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

  const generateQRCode = async () => {
    try {
      const response = await membershipApi.generateCheckInQR(memberId);
      // Handle QR code generation and display
      toast({
        title: 'QR Code Generated',
        description: 'Show this QR code at the gym entrance for quick check-in'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to generate QR code',
        variant: 'destructive'
      });
    }
  };

  const downloadMembershipCard = () => {
    // Generate and download membership card PDF
    toast({
      title: 'Membership Card',
      description: 'Your membership card is being prepared for download'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4" />;
      case 'EXPIRED': return <AlertCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
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
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={fetchMemberMembership}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!membership) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="font-medium">No Active Membership</p>
            <p className="text-sm mt-1">
              You don't currently have an active membership. Contact the gym to get started!
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={onRenewMembership}
            >
              Browse Membership Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Membership Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Current Membership</CardTitle>
            <Badge className={getStatusColor(membership.status)}>
              {getStatusIcon(membership.status)}
              <span className="ml-1">{membership.status}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {planDetails && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{planDetails.packageName}</h3>
                <Badge variant="outline">{formatPrice(planDetails.price)}</Badge>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium">
                      {new Date(membership.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-medium">
                      {new Date(membership.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{formatDuration(planDetails.durationDays)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">PT Sessions</p>
                    <p className="font-medium">{planDetails.includedPTSessions}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Membership Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Days Remaining</span>
              <span className="text-lg font-semibold">
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
              </span>
            </div>
            
            <Progress value={progressPercentage} className="h-2" />
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>{Math.round(progressPercentage)}% Complete</span>
              <span>{100 - Math.round(progressPercentage)}% Remaining</span>
            </div>
            
            {daysRemaining <= 7 && membership.status === 'ACTIVE' && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your membership expires in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}. 
                  Consider renewing to avoid interruption.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button onClick={generateQRCode} variant="outline">
          <QrCode className="h-4 w-4 mr-2" />
          Generate Check-in QR
        </Button>
        
        <Button onClick={downloadMembershipCard} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Membership Card
        </Button>
        
        {daysRemaining <= 30 && (
          <Button onClick={onRenewMembership}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Renew Membership
          </Button>
        )}
        
        {onUpgradeMembership && (
          <Button onClick={onUpgradeMembership} variant="secondary">
            <TrendingUp className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        )}
      </div>
    </div>
  );
};

export default MemberMembershipView;