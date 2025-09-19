import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase util used by useStory
const fromMock = vi.fn()
const eqMock = vi.fn()
const selectMock = vi.fn()
const singleMock = vi.fn()
const deleteMock = vi.fn()
const updateMock = vi.fn()

vi.mock('@/utils/supabase', () => ({
  supabase: {
    from: fromMock
  }
}))

// Helper to reset chainable mocks between tests
function resetChain() {
  fromMock.mockReset()
  eqMock.mockReset()
  selectMock.mockReset()
  singleMock.mockReset()
  deleteMock.mockReset()
  updateMock.mockReset()
}

// Wire up typical supabase chain behaviors per test
function mockSelectSingle(result: any) {
  singleMock.mockResolvedValue(result)
  // select('*') -> returns builder with eq
  selectMock.mockReturnValue({ eq: eqMock })
  // .eq('id', ...) -> returns builder with single
  eqMock.mockReturnValue({ single: singleMock })
  fromMock.mockReturnValue({ select: selectMock })
}

function mockUpdate(result: any) {
  singleMock.mockResolvedValue(result)
  // after eq, we call select('*') -> returns { single }
  selectMock.mockReturnValue({ single: singleMock })
  // update(patch).eq('id', ...) -> returns builder with select
  eqMock.mockReturnValue({ select: selectMock })
  updateMock.mockReturnValue({ eq: eqMock })
  fromMock.mockReturnValue({ update: updateMock })
}

describe('useStory composable', () => {
  beforeEach(() => {
    resetChain()
  })

  it('getById returns data on success', async () => {
    mockSelectSingle({ data: { id: '1', title: 'A' }, error: null })
    const { useStory } = await import('@/composables/useStory')
    const { getById } = useStory()
    const res = await getById('1')
    expect(res.error).toBeNull()
    expect(res.data).toEqual({ id: '1', title: 'A' })
    expect(fromMock).toHaveBeenCalledWith('story_starter_stories')
  })

  it('getById returns not found when data missing', async () => {
    mockSelectSingle({ data: null, error: null })
    const { useStory } = await import('@/composables/useStory')
    const { getById } = useStory()
    const res = await getById('x')
    expect(res.data).toBeNull()
    expect(res.error?.message).toMatch(/Not found/i)
  })

  it('getById maps error from supabase', async () => {
    mockSelectSingle({ data: null, error: { message: 'boom', code: '400' } })
    const { useStory } = await import('@/composables/useStory')
    const { getById } = useStory()
    const res = await getById('x')
    expect(res.data).toBeNull()
    expect(res.error).toEqual({ message: 'boom', code: '400' })
  })

  it('remove returns success true on delete ok', async () => {
    // delete().eq(). returns { error: null }
    eqMock.mockResolvedValue({ error: null })
    deleteMock.mockReturnValue({ eq: eqMock })
    fromMock.mockReturnValue({ delete: deleteMock })

    const { useStory } = await import('@/composables/useStory')
    const { remove } = useStory()
    const res = await remove('1')
    expect(res).toEqual({ success: true })
  })

  it('remove returns error when delete fails', async () => {
    eqMock.mockResolvedValue({ error: { message: 'nope', code: '401' } })
    deleteMock.mockReturnValue({ eq: eqMock })
    fromMock.mockReturnValue({ delete: deleteMock })

    const { useStory } = await import('@/composables/useStory')
    const { remove } = useStory()
    const res = await remove('bad')
    expect(res.success).toBe(false)
    expect(res.error?.message).toBe('nope')
  })

  it('update returns data on success', async () => {
    mockUpdate({ data: { id: '1', title: 'B' }, error: null })
    const { useStory } = await import('@/composables/useStory')
    const { update } = useStory()
    const res = await update('1', { title: 'B' })
    expect(res.success).toBe(true)
    expect(res.data).toEqual({ id: '1', title: 'B' })
  })

  it('update returns error when update fails', async () => {
    mockUpdate({ data: null, error: { message: 'fail', code: '500' } })
    const { useStory } = await import('@/composables/useStory')
    const { update } = useStory()
    const res = await update('1', { title: 'Z' })
    expect(res.success).toBe(false)
    expect(res.error).toEqual({ message: 'fail', code: '500' })
  })
})
