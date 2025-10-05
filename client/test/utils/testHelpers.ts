import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

/**
 * Test helper utilities for common testing patterns.
 */

/**
 * Custom render function that wraps components with providers if needed.
 * Currently just uses standard render, but can be extended for context providers.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options })
}

/**
 * Wait for a condition to be true (useful for async state updates)
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 3000,
  interval = 50
): Promise<void> {
  const startTime = Date.now()
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition')
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
}

/**
 * Create a mock function that tracks calls (Vitest's vi.fn() wrapper)
 */
export function createMockFn<T extends (...args: any[]) => any>() {
  const calls: Parameters<T>[] = []
  
  const mockFn = ((...args: Parameters<T>) => {
    calls.push(args)
  }) as T & { calls: Parameters<T>[] }
  
  mockFn.calls = calls
  
  return mockFn
}

/**
 * Delay execution (useful for testing timeouts)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
