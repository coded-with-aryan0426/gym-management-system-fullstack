import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OwnerProfileSection from './OwnerProfileSection'

// Mock API
jest.mock('../../../services/api', () => ({
  get: jest.fn(),
  put: jest.fn()
}))

// Mock toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}))

describe('OwnerProfileSection - Phone Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockApi = require('../../../services/api')
  const mockToast = require('react-hot-toast').toast

  test('should enable save button with valid 10-digit phone number', async () => {
    mockApi.get.mockResolvedValue({ 
      data: { 
        legalName: '', 
        gymName: '', 
        email: '', 
        phone: '', 
        address: '', 
        city: '', 
        state: '', 
        zipCode: '', 
        taxId: '', 
        businessType: 'sole_proprietor' 
      } 
    })

    render(<OwnerProfileSection />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    })

    const phoneInput = screen.getByLabelText(/phone/i)
    const saveButton = screen.getByRole('button', { name: /save changes/i })

    // Test valid 10-digit number starting with 6-9
    fireEvent.change(phoneInput, { target: { value: '9876543210' } })
    
    await waitFor(() => {
      expect(saveButton).not.toBeDisabled()
    })
  })

  test('should enable save button with valid +91 phone number', async () => {
    mockApi.get.mockResolvedValue({ 
      data: { 
        legalName: '', 
        gymName: '', 
        email: '', 
        phone: '', 
        address: '', 
        city: '', 
        state: '', 
        zipCode: '', 
        taxId: '', 
        businessType: 'sole_proprietor' 
      } 
    })

    render(<OwnerProfileSection />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    })

    const phoneInput = screen.getByLabelText(/phone/i)
    const saveButton = screen.getByRole('button', { name: /save changes/i })

    // Test valid +91 number
    fireEvent.change(phoneInput, { target: { value: '+919876543210' } })
    
    await waitFor(() => {
      expect(saveButton).not.toBeDisabled()
    })
  })

  test('should disable save button with invalid phone number (less than 10 digits)', async () => {
    mockApi.get.mockResolvedValue({ 
      data: { 
        legalName: '', 
        gymName: '', 
        email: '', 
        phone: '', 
        address: '', 
        city: '', 
        state: '', 
        zipCode: '', 
        taxId: '', 
        businessType: 'sole_proprietor' 
      } 
    })

    render(<OwnerProfileSection />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    })

    const phoneInput = screen.getByLabelText(/phone/i)
    const saveButton = screen.getByRole('button', { name: /save changes/i })

    // Test invalid number (only 9 digits)
    fireEvent.change(phoneInput, { target: { value: '987654321' } })
    
    await waitFor(() => {
      expect(saveButton).toBeDisabled()
    })
  })

  test('should disable save button with invalid phone number (starts with invalid digit)', async () => {
    mockApi.get.mockResolvedValue({ 
      data: { 
        legalName: '', 
        gymName: '', 
        email: '', 
        phone: '', 
        address: '', 
        city: '', 
        state: '', 
        zipCode: '', 
        taxId: '', 
        businessType: 'sole_proprietor' 
      } 
    })

    render(<OwnerProfileSection />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    })

    const phoneInput = screen.getByLabelText(/phone/i)
    const saveButton = screen.getByRole('button', { name: /save changes/i })

    // Test invalid number (starts with 1-5)
    fireEvent.change(phoneInput, { target: { value: '1234567890' } })
    
    await waitFor(() => {
      expect(saveButton).toBeDisabled()
    })
  })

  test('should show validation error message for invalid phone', async () => {
    mockApi.get.mockResolvedValue({ 
      data: { 
        legalName: '', 
        gymName: '', 
        email: '', 
        phone: '', 
        address: '', 
        city: '', 
        state: '', 
        zipCode: '', 
        taxId: '', 
        businessType: 'sole_proprietor' 
      } 
    })

    render(<OwnerProfileSection />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    })

    const phoneInput = screen.getByLabelText(/phone/i)

    // Test invalid number
    fireEvent.change(phoneInput, { target: { value: '123456789' } })
    fireEvent.blur(phoneInput)
    
    await waitFor(() => {
      expect(screen.getByText(/phone must be 10 digits/i)).toBeInTheDocument()
    })
  })

  test('should format phone number input automatically', async () => {
    mockApi.get.mockResolvedValue({ 
      data: { 
        legalName: '', 
        gymName: '', 
        email: '', 
        phone: '', 
        address: '', 
        city: '', 
        state: '', 
        zipCode: '', 
        taxId: '', 
        businessType: 'sole_proprietor' 
      } 
    })

    render(<OwnerProfileSection />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    })

    const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement

    // Test auto-formatting
    fireEvent.change(phoneInput, { target: { value: '9876543210' } })
    
    await waitFor(() => {
      expect(phoneInput.value).toBe('98765 43210')
    })
  })

  test('should handle gym name from localStorage fallback', async () => {
    // Set gym name in localStorage
    localStorage.setItem('gymName', 'Test Gym')

    mockApi.get.mockResolvedValue({ 
      data: { 
        legalName: '', 
        gymName: '', 
        email: '', 
        phone: '', 
        address: '', 
        city: '', 
        state: '', 
        zipCode: '', 
        taxId: '', 
        businessType: 'sole_proprietor' 
      } 
    })

    render(<OwnerProfileSection />)
    
    await waitFor(() => {
      const gymNameInput = screen.getByLabelText(/business \/ gym name/i) as HTMLInputElement
      expect(gymNameInput.value).toBe('Test Gym')
    })

    // Clean up
    localStorage.removeItem('gymName')
  })
})