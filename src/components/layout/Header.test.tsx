import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from './Header';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}));

describe('Header Component', () => {
  it('renders the ZEMO logo', () => {
    render(<Header />);
    const logo = screen.getByText('ZEMO');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveClass('font-bold');
  });

  it('renders with correct header structure', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('sticky');
    expect(header).toHaveClass('bg-white');
  });

  it('contains navigation links', () => {
    render(<Header />);
    // Check for actual links that exist in the component
    expect(screen.getByText('Become a host')).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('has authentication buttons', () => {
    render(<Header />);
    // Match actual text in component (lowercase)
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('applies correct styling', () => {
    render(<Header />);
    const logo = screen.getByText('ZEMO');
    expect(logo).toHaveClass('font-bold');
    expect(logo).toHaveClass('text-gray-900');
  });

  it('has search link', () => {
    render(<Header />);
    const searchLinks = screen.getAllByLabelText('Search');
    expect(searchLinks.length).toBeGreaterThan(0);
  });
});
