import { apiClient } from './api';
import type { AxiosResponse } from 'axios';

export interface FinancialTransaction {
  id: number;
  gymId: number;
  type: 'INCOME' | 'EXPENSE';
  incomeCategory?: string;
  expenseCategory?: string;
  amount: number;
  currency: string;
  amountInBaseCurrency?: number;
  exchangeRate?: number;
  transactionDate: string;
  description: string;
  referenceNumber?: string;
  paymentMethod?: string;
  gatewayTransactionId?: string;
  gateway?: string;
  receiptUrl?: string;
  status: string;
  memberId?: number;
  memberName?: string;
  createdAt: string;
  updatedAt: string;
  isRecurring: boolean;
  recurringScheduleId?: number;
}

export interface IncomeSummary {
  totalIncome: number;
  thisMonth: number;
  lastMonth: number;
  thisYear?: number;
  projectedMonthly?: number;
  byCategory: Record<string, number>;
  recentTransactions: FinancialTransaction[];
  percentageChange: number;
  transactionCount: number;
}

export interface ExpenseSummary {
  totalExpenses: number;
  thisMonth: number;
  lastMonth: number;
  thisYear?: number;
  projectedMonthly?: number;
  byCategory: Record<string, number>;
  recentExpenses: FinancialTransaction[];
  percentageChange: number;
  transactionCount: number;
  pendingPayments: number;
  pendingCount: number;
}

export interface FinancialReport {
  reportType: string;
  startDate: string;
  endDate: string;
  gymId: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  totalAssets?: number;
  totalLiabilities?: number;
  netWorth?: number;
  operatingCashFlow?: number;
  investingCashFlow?: number;
  financingCashFlow?: number;
  netCashFlow?: number;
  incomeBreakdown?: IncomeSummary[];
  expenseBreakdown?: ExpenseSummary[];
  transactions: FinancialTransaction[];
  totalTaxLiability?: number;
  totalDeductibleExpenses?: number;
  generatedAt: string;
  generatedBy?: string;
}

export interface CheckoutSession {
  sessionId: string;
  checkoutUrl: string;
  paymentIntentId?: string;
  gateway: string;
  status: string;
  amount: number;
  currency: string;
  expiresAt: string;
  allowedPaymentMethods: string[];
}

export interface CreatePaymentRequest {
  amount: number;
  currency: string;
  description: string;
  memberId?: number;
  membershipId?: number;
  metadata?: Record<string, string>;
}

export const financialApi = {
  getTransactions(
    gymId: number,
    page = 0,
    size = 20
  ): Promise<AxiosResponse<{ content: FinancialTransaction[]; totalElements: number; totalPages: number }>> {
    return apiClient.get(`/finance/transactions`, { params: { gymId, page, size } });
  },

  getTransactionsByType(
    gymId: number,
    type: 'INCOME' | 'EXPENSE',
    page = 0,
    size = 20
  ): Promise<AxiosResponse<{ content: FinancialTransaction[]; totalElements: number }>> {
    return apiClient.get(`/finance/transactions/by-type/${type}`, { params: { gymId, page, size } });
  },

  getTransaction(id: number): Promise<AxiosResponse<FinancialTransaction>> {
    return apiClient.get(`/finance/transactions/${id}`);
  },

  createTransaction(transaction: Partial<FinancialTransaction>): Promise<AxiosResponse<FinancialTransaction>> {
    return apiClient.post('/finance/transactions', transaction);
  },

  updateTransaction(id: number, transaction: Partial<FinancialTransaction>): Promise<AxiosResponse<FinancialTransaction>> {
    return apiClient.put(`/finance/transactions/${id}`, transaction);
  },

  deleteTransaction(id: number): Promise<AxiosResponse<void>> {
    return apiClient.delete(`/finance/transactions/${id}`);
  },

  getIncomeSummary(
    gymId: number,
    startDate?: string,
    endDate?: string
  ): Promise<AxiosResponse<IncomeSummary>> {
    return apiClient.get('/finance/income/summary', { params: { gymId, startDate, endDate } });
  },

  getExpenseSummary(
    gymId: number,
    startDate?: string,
    endDate?: string
  ): Promise<AxiosResponse<ExpenseSummary>> {
    return apiClient.get('/finance/expense/summary', { params: { gymId, startDate, endDate } });
  },

  getReport(
    gymId: number,
    reportType = 'MONTHLY',
    startDate?: string,
    endDate?: string
  ): Promise<AxiosResponse<FinancialReport>> {
    return apiClient.get('/finance/reports', { params: { gymId, reportType, startDate, endDate } });
  },

  getQuarterlyReport(gymId: number, year: number, quarter: number): Promise<AxiosResponse<FinancialReport>> {
    return apiClient.get('/finance/reports/quarterly', { params: { gymId, year, quarter } });
  },

  getAnnualReport(gymId: number, year: number): Promise<AxiosResponse<FinancialReport>> {
    return apiClient.get('/finance/reports/annual', { params: { gymId, year } });
  },

  uploadReceipt(transactionId: number, file: File): Promise<AxiosResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/finance/transactions/${transactionId}/receipt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  createCheckout(
    gymId: number,
    request: CreatePaymentRequest,
    gateway = 'STRIPE'
  ): Promise<AxiosResponse<CheckoutSession>> {
    return apiClient.post('/payments/checkout', request, { params: { gymId, gateway } });
  },

  confirmPayment(sessionId: string, gateway = 'STRIPE'): Promise<AxiosResponse<FinancialTransaction>> {
    return apiClient.post('/payments/confirm/' + sessionId, null, { params: { gateway } });
  },

  refundPayment(transactionId: string, amount?: number, gateway = 'STRIPE'): Promise<AxiosResponse<FinancialTransaction>> {
    return apiClient.post('/payments/' + transactionId + '/refund', null, { params: { amount, gateway } });
  },

  getTransactionsByMember(memberId: number): Promise<AxiosResponse<FinancialTransaction[]>> {
    return apiClient.get('/finance/transactions/member/' + memberId);
  },
};
