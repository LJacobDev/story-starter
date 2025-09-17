import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

// Prepare a mock for useAuth().confirmEmail
let confirmEmailMock = vi.fn()
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    confirmEmail: confirmEmailMock
  })
}))

// Note: VerifyEmail.vue does not exist yet. This test is intentionally written first (TDD)
// It will fail until the VerifyEmail view is implemented to parse the `token` query param
// and call useAuth().confirmEmail(token).

describe('VerifyEmail view (TDD) - parses token and calls confirmEmail', () => {
  beforeEach(() => {
    confirmEmailMock = vi.fn().mockResolvedValue({ success: true, error: null })
  })

  it('calls confirmEmail with token from route query', async () => {
    // Dynamically import the component (will fail until the component exists)
    const { default: VerifyEmail } = await import('@/views/VerifyEmail.vue')

    const routes = [
      { path: '/verify-email', component: VerifyEmail }
    ]

    const router = createRouter({
      history: createMemoryHistory(),
      routes
    })

    // navigate to the verify page with a token in query
    await router.push({ path: '/verify-email', query: { token: 'VALID_TOKEN' } })
    await router.isReady()

    mount(VerifyEmail, {
      global: {
        plugins: [router]
      }
    })

    // allow any async tasks to run
    await new Promise((r) => setTimeout(r, 0))

    expect(confirmEmailMock).toHaveBeenCalled()
    expect(confirmEmailMock).toHaveBeenCalledWith('VALID_TOKEN')
  })
})
