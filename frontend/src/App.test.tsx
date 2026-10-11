import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './i18n';

describe('SkillGap Frontend Ink Mono Theme', () => {
  it('renders app navigation and title', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getAllByText(/SKILLGAP/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rajasthan/i).length).toBeGreaterThan(0);
  });
});
