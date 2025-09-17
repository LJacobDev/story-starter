import { describe, it, expect } from 'vitest'
import appRoutes from '@/router/routes'

describe('App router registration', () => {
  it('includes the /verify-email route', () => {
    const found = appRoutes.find(r => r.path === '/verify-email')
    expect(found).toBeTruthy()
  })
})
