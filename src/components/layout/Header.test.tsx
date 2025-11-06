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
    expect(logo).toHaveClass('font-heading');
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
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();

    // Check for navigation links using aria-labels to be more specific
    expect(screen.getByLabelText('Browse Vehicles')).toBeInTheDocument();
    expect(screen.getByLabelText('Become a Host')).toBeInTheDocument();
    expect(screen.getByLabelText('About ZEMO')).toBeInTheDocument();
  });

  it('has authentication buttons', () => {
    render(<Header />);
    expect(screen.getByLabelText('Sign In')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Sign Up')).toHaveLength(2); // Desktop and mobile versions
  });

  it('applies ZEMO design tokens correctly', () => {
    render(<Header />);
    const logo = screen.getByText('ZEMO');
    expect(logo).toHaveClass('font-heading');
    expect(logo).toHaveClass('text-zemo-black');
  });

  it('has mobile signup button', () => {
    render(<Header />);
    // Check for mobile version sign up button
    const mobileButtons = screen.getAllByLabelText('Sign Up');
    expect(mobileButtons.length).toBeGreaterThan(0);
  });
});
