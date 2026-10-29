import type { ModuleId } from '../content/modules'

export type Stage =
  | { view: 'orb' }
  | { view: 'list' }
  | { view: 'detail'; module: ModuleId }

export type StageEvent =
  | { type: 'OPEN' }
  | { type: 'SELECT'; module: ModuleId }
  | { type: 'BACK' }
  | { type: 'CLOSE' }

const ORB: Stage = { view: 'orb' }
const LIST: Stage = { view: 'list' }

export function stageReducer(s: Stage, e: StageEvent): Stage {
  switch (e.type) {
    case 'OPEN':
      return s.view === 'orb' ? LIST : s
    case 'SELECT':
      return s.view === 'orb' ? s : { view: 'detail', module: e.module }
    case 'BACK':
      if (s.view === 'detail') return LIST
      return s.view === 'list' ? ORB : s
    case 'CLOSE':
      return s.view === 'orb' ? s : ORB
  }
}
