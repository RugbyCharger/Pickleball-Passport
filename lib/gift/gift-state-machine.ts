/**
 * Gift State Machine (GS-002)
 *
 * Centralized state machine for managing gift booking lifecycle.
 * Handles state validation, transition rules, and provides audit support.
 *
 * Valid State Transitions:
 * - PENDING → SENT (scheduled gift delivery or immediate send)
 * - PENDING → EXPIRED (gift never sent before expiration)
 * - PENDING → CANCELLED (purchaser cancels before delivery)
 * - SENT → ACCEPTED (recipient accepts gift)
 * - SENT → DECLINED (recipient declines gift)
 * - SENT → EXPIRED (no response within 30 days)
 *
 * Terminal States: ACCEPTED, DECLINED, EXPIRED, CANCELLED
 */

import { GiftState } from '@prisma/client'

/**
 * Metadata for state transitions
 */
export interface TransitionMetadata {
  triggeredBy: 'user' | 'system' | 'cron'
  userId?: string
  reason?: string
  additionalContext?: Record<string, unknown>
}

/**
 * Result of a transition validation
 */
export interface TransitionValidation {
  valid: boolean
  error?: string
}

/**
 * Defines the valid state transitions and their properties
 */
const STATE_TRANSITIONS: Record<GiftState, GiftState[]> = {
  [GiftState.PENDING]: [GiftState.SENT, GiftState.EXPIRED, GiftState.CANCELLED],
  [GiftState.SENT]: [GiftState.ACCEPTED, GiftState.DECLINED, GiftState.EXPIRED],
  [GiftState.ACCEPTED]: [], // Terminal state
  [GiftState.DECLINED]: [], // Terminal state
  [GiftState.EXPIRED]: [], // Terminal state
  [GiftState.CANCELLED]: [], // Terminal state
}

/**
 * Terminal states where no further transitions are allowed
 */
const TERMINAL_STATES: Set<GiftState> = new Set([
  GiftState.ACCEPTED,
  GiftState.DECLINED,
  GiftState.EXPIRED,
  GiftState.CANCELLED,
])

/**
 * Default reasons for each transition type
 */
const TRANSITION_REASONS: Record<string, string> = {
  [`${GiftState.PENDING}_${GiftState.SENT}`]: 'Gift notification sent to recipient',
  [`${GiftState.PENDING}_${GiftState.EXPIRED}`]: 'Gift expired before being sent',
  [`${GiftState.PENDING}_${GiftState.CANCELLED}`]: 'Gift cancelled by purchaser before delivery',
  [`${GiftState.SENT}_${GiftState.ACCEPTED}`]: 'Recipient accepted the gift',
  [`${GiftState.SENT}_${GiftState.DECLINED}`]: 'Recipient declined the gift',
  [`${GiftState.SENT}_${GiftState.EXPIRED}`]: 'Gift expired after 30 days without response',
}

/**
 * Gift State Machine class
 *
 * Provides methods for validating and managing gift state transitions.
 */
export class GiftStateMachine {
  /**
   * Check if a transition from one state to another is valid
   *
   * @param fromState - Current state of the gift
   * @param toState - Desired target state
   * @returns true if the transition is valid, false otherwise
   */
  canTransition(fromState: GiftState, toState: GiftState): boolean {
    const validTransitions = STATE_TRANSITIONS[fromState]
    return validTransitions.includes(toState)
  }

  /**
   * Validate a transition and return detailed result
   *
   * @param fromState - Current state of the gift
   * @param toState - Desired target state
   * @returns Validation result with error message if invalid
   */
  validateTransition(fromState: GiftState, toState: GiftState): TransitionValidation {
    if (fromState === toState) {
      return {
        valid: false,
        error: `Gift is already in state ${toState}`,
      }
    }

    if (this.isTerminalState(fromState)) {
      return {
        valid: false,
        error: `Cannot transition from terminal state ${fromState}`,
      }
    }

    if (!this.canTransition(fromState, toState)) {
      const validTransitions = this.getValidTransitions(fromState)
      return {
        valid: false,
        error: `Invalid transition from ${fromState} to ${toState}. Valid transitions: ${validTransitions.join(', ') || 'none'}`,
      }
    }

    return { valid: true }
  }

  /**
   * Get all valid target states from a given state
   *
   * @param currentState - The current state of the gift
   * @returns Array of valid states that can be transitioned to
   */
  getValidTransitions(currentState: GiftState): GiftState[] {
    return [...STATE_TRANSITIONS[currentState]]
  }

  /**
   * Check if a state is terminal (no further transitions allowed)
   *
   * @param state - The state to check
   * @returns true if the state is terminal, false otherwise
   */
  isTerminalState(state: GiftState): boolean {
    return TERMINAL_STATES.has(state)
  }

  /**
   * Get the default reason for a specific transition
   *
   * @param fromState - Source state
   * @param toState - Target state
   * @returns Human-readable reason for the transition
   */
  getTransitionReason(fromState: GiftState, toState: GiftState): string {
    const key = `${fromState}_${toState}`
    return TRANSITION_REASONS[key] || `State changed from ${fromState} to ${toState}`
  }

  /**
   * Get all terminal states
   *
   * @returns Array of terminal states
   */
  getTerminalStates(): GiftState[] {
    return Array.from(TERMINAL_STATES)
  }

  /**
   * Get all possible states
   *
   * @returns Array of all gift states
   */
  getAllStates(): GiftState[] {
    return Object.values(GiftState)
  }

  /**
   * Check if a state is the initial state
   *
   * @param state - The state to check
   * @returns true if the state is PENDING (initial)
   */
  isInitialState(state: GiftState): boolean {
    return state === GiftState.PENDING
  }

  /**
   * Create metadata for a transition
   *
   * @param triggeredBy - Who triggered the transition
   * @param options - Additional metadata options
   * @returns Structured transition metadata
   */
  createMetadata(
    triggeredBy: TransitionMetadata['triggeredBy'],
    options?: Omit<TransitionMetadata, 'triggeredBy'>
  ): TransitionMetadata {
    return {
      triggeredBy,
      ...options,
    }
  }

  /**
   * Assert that a transition is valid, throwing an error if not
   *
   * @param fromState - Current state
   * @param toState - Target state
   * @throws Error if transition is invalid
   */
  assertValidTransition(fromState: GiftState, toState: GiftState): void {
    const validation = this.validateTransition(fromState, toState)
    if (!validation.valid) {
      throw new Error(validation.error)
    }
  }
}

/**
 * Singleton instance for use across the codebase
 */
export const giftStateMachine = new GiftStateMachine()
