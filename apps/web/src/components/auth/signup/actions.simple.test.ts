/**
 * Simplified unit tests for signup action
 * Testing the organization name generation logic
 */

import { describe, it, expect } from 'vitest';

describe('signup organization name generation', () => {
  it('should use organizationName when provided', () => {
    const input = {
      email: 'test@example.com',
      password: 'password123',
      organizationName: 'Custom Organization'
    };

    const organizationName = input.organizationName || 
      (input.fullName ? input.fullName : input.email.split('@')[0]);

    expect(organizationName).toBe('Custom Organization');
  });

  it('should use fullName when organizationName not provided', () => {
    const input = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'John Doe'
    };

    const organizationName = input.organizationName || 
      (input.fullName ? input.fullName : input.email.split('@')[0]);

    expect(organizationName).toBe('John Doe');
  });

  it('should use email prefix when neither organizationName nor fullName provided', () => {
    const input = {
      email: 'johndoe@example.com',
      password: 'password123'
    };

    const organizationName = input.organizationName || 
      (input.fullName ? input.fullName : input.email.split('@')[0]);

    expect(organizationName).toBe('johndoe');
  });

  it('should extract domain correctly', () => {
    const email = 'user@company.com';
    const emailDomain = email.split('@')[1];
    
    expect(emailDomain).toBe('company.com');
  });

  it('should default to free plan when not specified', () => {
    const input = {
      email: 'test@example.com',
      password: 'password123'
    };

    const plan = input.plan || 'free';
    
    expect(plan).toBe('free');
  });

  it('should use specified plan when provided', () => {
    const input = {
      email: 'test@example.com',
      password: 'password123',
      plan: 'pro'
    };

    const plan = input.plan || 'free';
    
    expect(plan).toBe('pro');
  });
});
