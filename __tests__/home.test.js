import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from '../pages/index'

// Mock next/router so components that call useRouter (AuthModal, Header, etc.)
// don't throw when tests render pages outside of Next's runtime.
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

describe('Home page', () => {
  it('renders main heading', () => {
    render(<Home />)
    expect(screen.getByText(/Generate worksheets fast/i)).toBeInTheDocument()
  })
  it('renders tagline', () => {
    render(<Home />)
    expect(screen.getByText(/Custom worksheets, ready in seconds/i)).toBeInTheDocument()
  })
  it('renders Generate CTA button', () => {
    render(<Home />)
    const generateButtons = screen.getAllByText(/Generate/i)
    expect(generateButtons.length).toBeGreaterThan(0)
  })
  it('renders school-level resource sections', () => {
    render(<Home />)
    expect(screen.getByText(/Explore Elementary School Resources/i)).toBeInTheDocument()
    expect(screen.getByText(/Explore Middle School Resources/i)).toBeInTheDocument()
    expect(screen.getByText(/Explore High School Resources/i)).toBeInTheDocument()
  })
})
