// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { PhoneStreamAnswer } from './LabPhoneCards'
afterEach(cleanup)
it('explains a failed answer safely and clears the error on a successful retry', async () => {
  const request = vi.fn().mockRejectedValueOnce(new Error('private upstream detail')).mockResolvedValueOnce('Recovered answer.')
  render(<PhoneStreamAnswer request={request} />)
  await screen.findByText('The answer could not be loaded. Please try again.')
  expect(screen.queryByText('private upstream detail')).toBeNull()
  fireEvent.click(screen.getByTestId('lab-phone-card-retry'))
  await screen.findByText('Recovered answer.')
  expect(screen.queryByTestId('lab-phone-card-retry')).toBeNull()
  expect(request).toHaveBeenCalledTimes(2)
})
