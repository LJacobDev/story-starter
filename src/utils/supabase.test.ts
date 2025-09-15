import { describe, it, expect, vi } from 'vitest'

// Mock the entire Supabase module to avoid environment issues
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {},
    from: vi.fn(),
    storage: {}
  }))
}))

// Import the functions to test after mocking
import { createSupabaseResponse, handleSupabaseError } from '@/utils/supabase'

describe('Supabase Utility Functions', () => {
  describe('createSupabaseResponse', () => {
    it('should create a successful response with data', () => {
      const testData = { id: '1', name: 'Test' }
      const response = createSupabaseResponse(testData)
      
      expect(response).toEqual({
        data: testData,
        error: null,
        success: true
      })
    })

    it('should create an error response with Error object', () => {
      const error = new Error('Database connection failed')
      const response = createSupabaseResponse(null, error)
      
      expect(response).toEqual({
        data: null,
        error: 'Database connection failed',
        success: false
      })
    })

    it('should create an error response with string error', () => {
      const error = 'Simple error message'
      const response = createSupabaseResponse(null, error)
      
      expect(response).toEqual({
        data: null,
        error: 'Simple error message',
        success: false
      })
    })

    it('should handle null data without error as unsuccessful', () => {
      const response = createSupabaseResponse(null)
      
      expect(response).toEqual({
        data: null,
        error: null,
        success: false
      })
    })

    it('should log errors to console', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Test error')
      
      createSupabaseResponse(null, error)
      
      expect(consoleSpy).toHaveBeenCalledWith('Supabase operation error:', error)
      consoleSpy.mockRestore()
    })
  })

  describe('handleSupabaseError', () => {
    it('should handle PGRST116 (no data found) error', () => {
      const error = { code: 'PGRST116', message: 'No rows found' }
      const result = handleSupabaseError(error)
      
      expect(result).toBe('No data found')
    })

    it('should handle 23505 (unique constraint) error', () => {
      const error = { code: '23505', message: 'Unique constraint violation' }
      const result = handleSupabaseError(error)
      
      expect(result).toBe('A record with this data already exists')
    })

    it('should handle 23503 (foreign key constraint) error', () => {
      const error = { code: '23503', message: 'Foreign key violation' }
      const result = handleSupabaseError(error)
      
      expect(result).toBe('Referenced record does not exist')
    })

    it('should handle unknown error codes', () => {
      const error = { code: 'UNKNOWN', message: 'Unknown database error' }
      const result = handleSupabaseError(error)
      
      expect(result).toBe('Unknown database error')
    })

    it('should handle errors without codes', () => {
      const error = { message: 'Generic error' }
      const result = handleSupabaseError(error)
      
      expect(result).toBe('Generic error')
    })

    it('should handle string errors', () => {
      const error = 'Simple string error'
      const result = handleSupabaseError(error)
      
      expect(result).toBe('Simple string error')
    })

    it('should handle null/undefined errors', () => {
      const result = handleSupabaseError(null)
      
      expect(result).toBe('An unexpected error occurred')
    })
  })
})
