import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, Badge, Button } from '../ui';
import { Input } from '../base';
import ErrorMessage from '../utilities/ErrorMessage';
import { MembershipPackageDTO } from '../../types/membershipPackage';
import membershipPlanApi from '../../services/membershipPlanApi';

interface MembershipPlanManagementProps {
  onPlanSelect?: (plan: MembershipPackageDTO) => void;
  mode?: 'management' | 'selection';
}

const MembershipPlanManagement: React.FC<MembershipPlanManagementProps> = ({
  onPlanSelect,
  mode = 'management'
}) => {
  const [plans, setPlans] = useState<MembershipPackageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPackageDTO | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    packageName: '',
    price: '',
    durationDays: '',
    includedPTSessions: '',
    isActive: true
  });

  useEffect(() => {
    fetchPlans();
    if (mode === 'management') {
      fetchAnalytics();
    }
  }, []);

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

      if (editingPlan) {
        await membershipPlanApi.updatePlan(editingPlan.packageId, planData);
        toast.success('Membership plan updated successfully');
      } else {
        await membershipPlanApi.createPlan(planData);
        toast.success('Membership plan created successfully');
      }
      
      resetForm();
      fetchPlans();
      fetchAnalytics();
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
      isActive: plan.isActive
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
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete membership plan');
    }
  };

  const handleToggleStatus = async (plan: MembershipPackageDTO) => {
    try {
      if (plan.isActive) {
        await membershipPlanApi.deactivatePlan(plan.packageId);
        toast.success('Membership plan deactivated');
      } else {
        await membershipPlanApi.activatePlan(plan.packageId);
        toast.success('Membership plan activated');
      }
      fetchPlans();
      fetchAnalytics();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchPlans} />;
  }

  return (
    <div className="space-y-6">
      {mode === 'management' && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Plans</p>
                  <p className="text-2xl font-bold">{analytics.totalPlans}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Plans</p>
                  <p className="text-2xl font-bold">{analytics.activePlans}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Price</p>
                  <p className="text-2xl font-bold">
                    {formatPrice(analytics.averagePrice || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    {formatPrice(analytics.totalRevenue || 0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {mode === 'management' && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Membership Plans</h2>
          <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />}>
            Create Plan
          </Button>
        </div>
      )}

      {showForm && (
        <Card title={editingPlan ? 'Edit Membership Plan' : 'Create New Membership Plan'}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    id="packageName"
                    label="Plan Name"
                    fullWidth
                    value={formData.packageName}
                    onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                    placeholder="e.g., Premium Monthly"
                    required
                  />
                </div>
                
                <div>
                  <Input
                    id="price"
                    label="Price ($)"
                    fullWidth
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="99.99"
                    required
                  />
                </div>
                
                <div>
                  <Input
                    id="durationDays"
                    label="Duration (days)"
                    fullWidth
                    type="number"
                    min="1"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                    placeholder="30"
                    required
                  />
                </div>
                
                <div>
                  <Input
                    id="includedPTSessions"
                    label="Included PT Sessions"
                    fullWidth
                    type="number"
                    min="0"
                    value={formData.includedPTSessions}
                    onChange={(e) => setFormData({ ...formData, includedPTSessions: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
              </div>
            </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.packageId}
            title={plan.packageName}
            action={<Badge variant={plan.isActive ? 'active' : 'expired'}>{plan.isActive ? 'Active' : 'Inactive'}</Badge>}
            className="hover:shadow-lg transition-shadow"
          >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Price</span>
                  <span className="font-semibold">{formatPrice(plan.price)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Duration</span>
                  <span className="font-medium">{formatDuration(plan.durationDays)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">PT Sessions</span>
                  <span className="font-medium">{plan.includedPTSessions}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                {mode === 'selection' ? (
                  <Button 
                    size="sm" 
                    onClick={() => onPlanSelect?.(plan)}
                    className="w-full"
                    icon={<Eye size={16} />}
                  >
                    Select Plan
                  </Button>
                ) : (
                  <div className="flex space-x-2 w-full">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => handleEdit(plan)}
                      className="flex-1"
                      icon={<Edit size={16} />}
                    >
                      Edit
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleToggleStatus(plan)}
                      className="flex-1"
                    >
                      {plan.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="danger"
                      onClick={() => handleDelete(plan.packageId)}
                      className="flex-1"
                      icon={<Trash2 size={16} />}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
          </Card>
        ))}
      </div>
      
      {plans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {mode === 'selection' 
              ? 'No active membership plans available'
              : 'No membership plans found. Create your first plan to get started.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default MembershipPlanManagement;
