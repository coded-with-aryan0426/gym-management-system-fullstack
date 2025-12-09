import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('renders Active text for active status', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders Expired text for expired status', () => {
    render(<StatusBadge status="expired" />);
    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  it('applies correct class for active status', () => {
    render(<StatusBadge status="active" />);
    const badge = screen.getByText('Active');
    expect(badge).toHaveClass('status-badge--active');
  });

  it('applies correct class for expired status', () => {
    render(<StatusBadge status="expired" />);
    const badge = screen.getByText('Expired');
    expect(badge).toHaveClass('status-badge--expired');
  });
});
