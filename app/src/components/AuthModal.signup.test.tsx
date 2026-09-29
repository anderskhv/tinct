// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthModal } from './AuthModal'
afterEach(cleanup)
describe('email signup confirmation', () => {
  it.each([true, false])('keeps a useful completion screen (confirmation needed: %s)', async confirmationRequired => {
    const onClose = vi.fn()
    render(<AuthModal defaultMode="signup" onClose={onClose}
      onSignUp={vi.fn().mockResolvedValue({ confirmationRequired })}
      onSignIn={vi.fn()} onGoogleSignIn={vi.fn()} onResetPassword={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'reader@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'example-password' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Create account' }).closest('form')!)
    await waitFor(() => expect(screen.getByRole('heading').textContent).toBe(confirmationRequired ? 'Check your email' : 'Welcome to Tinct.'))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: confirmationRequired ? 'Back to reading' : 'Continue reading' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
