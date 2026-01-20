/**
 * Gift State Machine Tests (GS-002)
 *
 * Comprehensive tests for gift state machine validation and transitions.
 */

import { describe, it, expect } from 'vitest'
import { GiftState } from '@prisma/client'
import { GiftStateMachine, giftStateMachine } from '../gift-state-machine'

describe('GiftStateMachine', () => {
  describe('canTransition', () => {
    describe('from PENDING state', () => {
      it('should allow transition from PENDING to SENT', () => {
        expect(giftStateMachine.canTransition(GiftState.PENDING, GiftState.SENT)).toBe(true)
      })

      it('should allow transition from PENDING to EXPIRED', () => {
        expect(giftStateMachine.canTransition(GiftState.PENDING, GiftState.EXPIRED)).toBe(true)
      })

      it('should not allow transition from PENDING to ACCEPTED', () => {
        expect(giftStateMachine.canTransition(GiftState.PENDING, GiftState.ACCEPTED)).toBe(false)
      })

      it('should not allow transition from PENDING to DECLINED', () => {
        expect(giftStateMachine.canTransition(GiftState.PENDING, GiftState.DECLINED)).toBe(false)
      })

      it('should not allow transition from PENDING to PENDING', () => {
        expect(giftStateMachine.canTransition(GiftState.PENDING, GiftState.PENDING)).toBe(false)
      })
    })

    describe('from SENT state', () => {
      it('should allow transition from SENT to ACCEPTED', () => {
        expect(giftStateMachine.canTransition(GiftState.SENT, GiftState.ACCEPTED)).toBe(true)
      })

      it('should allow transition from SENT to DECLINED', () => {
        expect(giftStateMachine.canTransition(GiftState.SENT, GiftState.DECLINED)).toBe(true)
      })

      it('should allow transition from SENT to EXPIRED', () => {
        expect(giftStateMachine.canTransition(GiftState.SENT, GiftState.EXPIRED)).toBe(true)
      })

      it('should not allow transition from SENT to PENDING', () => {
        expect(giftStateMachine.canTransition(GiftState.SENT, GiftState.PENDING)).toBe(false)
      })

      it('should not allow transition from SENT to SENT', () => {
        expect(giftStateMachine.canTransition(GiftState.SENT, GiftState.SENT)).toBe(false)
      })
    })

    describe('from terminal states', () => {
      it('should not allow any transitions from ACCEPTED', () => {
        expect(giftStateMachine.canTransition(GiftState.ACCEPTED, GiftState.PENDING)).toBe(false)
        expect(giftStateMachine.canTransition(GiftState.ACCEPTED, GiftState.SENT)).toBe(false)
        expect(giftStateMachine.canTransition(GiftState.ACCEPTED, GiftState.DECLINED)).toBe(false)
        expect(giftStateMachine.canTransition(GiftState.ACCEPTED, GiftState.EXPIRED)).toBe(false)
      })

      it('should not allow any transitions from DECLINED', () => {
        expect(giftStateMachine.canTransition(GiftState.DECLINED, GiftState.PENDING)).toBe(false)
        expect(giftStateMachine.canTransition(GiftState.DECLINED, GiftState.SENT)).toBe(false)
        expect(giftStateMachine.canTransition(GiftState.DECLINED, GiftState.ACCEPTED)).toBe(false)
        expect(giftStateMachine.canTransition(GiftState.DECLINED, GiftState.EXPIRED)).toBe(false)
      })

      it('should not allow any transitions from EXPIRED', () => {
        expect(giftStateMachine.canTransition(GiftState.EXPIRED, GiftState.PENDING)).toBe(false)
        expect(giftStateMachine.canTransition(GiftState.EXPIRED, GiftState.SENT)).toBe(false)
        expect(giftStateMachine.canTransition(GiftState.EXPIRED, GiftState.ACCEPTED)).toBe(false)
        expect(giftStateMachine.canTransition(GiftState.EXPIRED, GiftState.DECLINED)).toBe(false)
      })
    })
  })

  describe('validateTransition', () => {
    it('should return valid for allowed transitions', () => {
      const result = giftStateMachine.validateTransition(GiftState.PENDING, GiftState.SENT)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return error for same state transition', () => {
      const result = giftStateMachine.validateTransition(GiftState.PENDING, GiftState.PENDING)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Gift is already in state PENDING')
    })

    it('should return error for transition from terminal state', () => {
      const result = giftStateMachine.validateTransition(GiftState.ACCEPTED, GiftState.DECLINED)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Cannot transition from terminal state ACCEPTED')
    })

    it('should return error for invalid transition with valid alternatives', () => {
      const result = giftStateMachine.validateTransition(GiftState.PENDING, GiftState.ACCEPTED)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid transition from PENDING to ACCEPTED')
      expect(result.error).toContain('Valid transitions: SENT, EXPIRED')
    })
  })

  describe('getValidTransitions', () => {
    it('should return SENT and EXPIRED for PENDING', () => {
      const transitions = giftStateMachine.getValidTransitions(GiftState.PENDING)
      expect(transitions).toEqual([GiftState.SENT, GiftState.EXPIRED])
    })

    it('should return ACCEPTED, DECLINED, and EXPIRED for SENT', () => {
      const transitions = giftStateMachine.getValidTransitions(GiftState.SENT)
      expect(transitions).toEqual([GiftState.ACCEPTED, GiftState.DECLINED, GiftState.EXPIRED])
    })

    it('should return empty array for terminal states', () => {
      expect(giftStateMachine.getValidTransitions(GiftState.ACCEPTED)).toEqual([])
      expect(giftStateMachine.getValidTransitions(GiftState.DECLINED)).toEqual([])
      expect(giftStateMachine.getValidTransitions(GiftState.EXPIRED)).toEqual([])
    })
  })

  describe('isTerminalState', () => {
    it('should return true for ACCEPTED', () => {
      expect(giftStateMachine.isTerminalState(GiftState.ACCEPTED)).toBe(true)
    })

    it('should return true for DECLINED', () => {
      expect(giftStateMachine.isTerminalState(GiftState.DECLINED)).toBe(true)
    })

    it('should return true for EXPIRED', () => {
      expect(giftStateMachine.isTerminalState(GiftState.EXPIRED)).toBe(true)
    })

    it('should return false for PENDING', () => {
      expect(giftStateMachine.isTerminalState(GiftState.PENDING)).toBe(false)
    })

    it('should return false for SENT', () => {
      expect(giftStateMachine.isTerminalState(GiftState.SENT)).toBe(false)
    })
  })

  describe('getTransitionReason', () => {
    it('should return reason for PENDING to SENT', () => {
      const reason = giftStateMachine.getTransitionReason(GiftState.PENDING, GiftState.SENT)
      expect(reason).toBe('Gift notification sent to recipient')
    })

    it('should return reason for PENDING to EXPIRED', () => {
      const reason = giftStateMachine.getTransitionReason(GiftState.PENDING, GiftState.EXPIRED)
      expect(reason).toBe('Gift expired before being sent')
    })

    it('should return reason for SENT to ACCEPTED', () => {
      const reason = giftStateMachine.getTransitionReason(GiftState.SENT, GiftState.ACCEPTED)
      expect(reason).toBe('Recipient accepted the gift')
    })

    it('should return reason for SENT to DECLINED', () => {
      const reason = giftStateMachine.getTransitionReason(GiftState.SENT, GiftState.DECLINED)
      expect(reason).toBe('Recipient declined the gift')
    })

    it('should return reason for SENT to EXPIRED', () => {
      const reason = giftStateMachine.getTransitionReason(GiftState.SENT, GiftState.EXPIRED)
      expect(reason).toBe('Gift expired after 30 days without response')
    })

    it('should return generic reason for unknown transitions', () => {
      const reason = giftStateMachine.getTransitionReason(GiftState.ACCEPTED, GiftState.PENDING)
      expect(reason).toBe('State changed from ACCEPTED to PENDING')
    })
  })

  describe('getTerminalStates', () => {
    it('should return all terminal states', () => {
      const terminalStates = giftStateMachine.getTerminalStates()
      expect(terminalStates).toContain(GiftState.ACCEPTED)
      expect(terminalStates).toContain(GiftState.DECLINED)
      expect(terminalStates).toContain(GiftState.EXPIRED)
      expect(terminalStates).toHaveLength(3)
    })
  })

  describe('getAllStates', () => {
    it('should return all gift states', () => {
      const allStates = giftStateMachine.getAllStates()
      expect(allStates).toContain(GiftState.PENDING)
      expect(allStates).toContain(GiftState.SENT)
      expect(allStates).toContain(GiftState.ACCEPTED)
      expect(allStates).toContain(GiftState.DECLINED)
      expect(allStates).toContain(GiftState.EXPIRED)
      expect(allStates).toHaveLength(5)
    })
  })

  describe('isInitialState', () => {
    it('should return true for PENDING', () => {
      expect(giftStateMachine.isInitialState(GiftState.PENDING)).toBe(true)
    })

    it('should return false for non-initial states', () => {
      expect(giftStateMachine.isInitialState(GiftState.SENT)).toBe(false)
      expect(giftStateMachine.isInitialState(GiftState.ACCEPTED)).toBe(false)
      expect(giftStateMachine.isInitialState(GiftState.DECLINED)).toBe(false)
      expect(giftStateMachine.isInitialState(GiftState.EXPIRED)).toBe(false)
    })
  })

  describe('createMetadata', () => {
    it('should create metadata with triggeredBy only', () => {
      const metadata = giftStateMachine.createMetadata('user')
      expect(metadata).toEqual({ triggeredBy: 'user' })
    })

    it('should create metadata with all fields', () => {
      const metadata = giftStateMachine.createMetadata('system', {
        userId: 'user_123',
        reason: 'Custom reason',
        additionalContext: { source: 'cron_job' },
      })
      expect(metadata).toEqual({
        triggeredBy: 'system',
        userId: 'user_123',
        reason: 'Custom reason',
        additionalContext: { source: 'cron_job' },
      })
    })

    it('should create metadata for cron triggered transitions', () => {
      const metadata = giftStateMachine.createMetadata('cron', {
        reason: 'Auto-expiration',
      })
      expect(metadata).toEqual({
        triggeredBy: 'cron',
        reason: 'Auto-expiration',
      })
    })
  })

  describe('assertValidTransition', () => {
    it('should not throw for valid transitions', () => {
      expect(() => {
        giftStateMachine.assertValidTransition(GiftState.PENDING, GiftState.SENT)
      }).not.toThrow()
    })

    it('should throw for same state transition', () => {
      expect(() => {
        giftStateMachine.assertValidTransition(GiftState.PENDING, GiftState.PENDING)
      }).toThrow('Gift is already in state PENDING')
    })

    it('should throw for transition from terminal state', () => {
      expect(() => {
        giftStateMachine.assertValidTransition(GiftState.ACCEPTED, GiftState.DECLINED)
      }).toThrow('Cannot transition from terminal state ACCEPTED')
    })

    it('should throw for invalid transition', () => {
      expect(() => {
        giftStateMachine.assertValidTransition(GiftState.PENDING, GiftState.ACCEPTED)
      }).toThrow('Invalid transition from PENDING to ACCEPTED')
    })
  })

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(giftStateMachine).toBeInstanceOf(GiftStateMachine)
    })

    it('should work identically to new instance', () => {
      const newInstance = new GiftStateMachine()
      expect(giftStateMachine.canTransition(GiftState.PENDING, GiftState.SENT)).toBe(
        newInstance.canTransition(GiftState.PENDING, GiftState.SENT)
      )
    })
  })

  describe('edge cases', () => {
    it('should handle all state combinations consistently', () => {
      const allStates = giftStateMachine.getAllStates()

      for (const fromState of allStates) {
        for (const toState of allStates) {
          const canTransition = giftStateMachine.canTransition(fromState, toState)
          const validation = giftStateMachine.validateTransition(fromState, toState)

          // Validation should be consistent with canTransition for non-same-state transitions
          if (fromState !== toState && !giftStateMachine.isTerminalState(fromState)) {
            expect(validation.valid).toBe(canTransition)
          }
        }
      }
    })

    it('should ensure terminal states have no outgoing transitions', () => {
      const terminalStates = giftStateMachine.getTerminalStates()

      for (const terminalState of terminalStates) {
        const validTransitions = giftStateMachine.getValidTransitions(terminalState)
        expect(validTransitions).toEqual([])
      }
    })

    it('should ensure non-terminal states have at least one outgoing transition', () => {
      const allStates = giftStateMachine.getAllStates()
      const terminalStates = new Set(giftStateMachine.getTerminalStates())

      for (const state of allStates) {
        if (!terminalStates.has(state)) {
          const validTransitions = giftStateMachine.getValidTransitions(state)
          expect(validTransitions.length).toBeGreaterThan(0)
        }
      }
    })
  })
})
