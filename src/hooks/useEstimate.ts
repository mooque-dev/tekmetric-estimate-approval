import { useMemo, useReducer } from 'react'
import { services } from '../data/estimate'
import { computeLedger } from '../lib/ledger'
import type { Decision } from '../types'

export type SortMode = 'priority' | 'cost' | 'az'

interface State {
  decisions: Record<string, Decision>
  sort: SortMode
  signature: string | null
  authorized: boolean
  /** Bumped on start-over so the signature pad remounts fresh. */
  resetCount: number
}

type Action =
  | { type: 'decide'; id: string; decision: Decision }
  | { type: 'reset-decision'; id: string }
  | { type: 'sort'; sort: SortMode }
  | { type: 'sign'; signature: string | null }
  | { type: 'authorize' }
  | { type: 'start-over' }

// Every service starts Pending. Nothing is approved by default.
const initialState: State = {
  decisions: Object.fromEntries(services.map((s) => [s.id, 'pending'])) as Record<
    string,
    Decision
  >,
  sort: 'priority',
  signature: null,
  authorized: false,
  resetCount: 0,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'decide':
      return { ...state, decisions: { ...state.decisions, [action.id]: action.decision } }
    case 'reset-decision':
      return { ...state, decisions: { ...state.decisions, [action.id]: 'pending' } }
    case 'sort':
      return { ...state, sort: action.sort }
    case 'sign':
      return { ...state, signature: action.signature }
    case 'authorize':
      return { ...state, authorized: true }
    case 'start-over':
      return {
        ...initialState,
        decisions: { ...initialState.decisions },
        // keep the sort choice; force a fresh signature pad
        sort: state.sort,
        resetCount: state.resetCount + 1,
      }
    default:
      return state
  }
}

export function useEstimate() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const ledger = useMemo(() => computeLedger(state.decisions), [state.decisions])

  const allAddressed = ledger.pendingCount === 0
  const hasSignature = Boolean(state.signature)
  const canAuthorize = allAddressed && hasSignature && ledger.approvedCount > 0

  return { state, dispatch, ledger, allAddressed, hasSignature, canAuthorize }
}
