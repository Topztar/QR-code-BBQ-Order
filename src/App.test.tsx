import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    // A simple sanity check test to ensure the app can mount
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });
});
