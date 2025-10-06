import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from '../pages/index'

describe('Home page', () => {
  it('renders heading and contact link', () => {
    render(<Home />)
    expect(screen.getByText(/High-quality worksheets for teachers/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument()
  })
})
