import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from '../pages/index'

describe('Home page', () => {
  it('renders main heading', () => {
    render(<Home />)
    expect(screen.getByText(/Ready-Made Teaching Resources/i)).toBeInTheDocument()
  })
  it('renders tagline with high-quality worksheets', () => {
    render(<Home />)
    expect(screen.getByText(/Save hours of prep time with high-quality worksheets/i)).toBeInTheDocument()
  })
  it('renders Get Started CTA button', () => {
    render(<Home />)
    expect(screen.getByText(/Get Started Free/i)).toBeInTheDocument()
  })
  it('renders featured resources section', () => {
    render(<Home />)
    expect(screen.getByText(/Featured Resources/i)).toBeInTheDocument()
    expect(screen.getByText(/Math Worksheets Bundle/i)).toBeInTheDocument()
  })
})
