import type { DictKey } from '../i18n/dictionary'

export type ModuleId = 'automation' | 'security' | 'performance' | 'platforms'

export interface ModuleDef {
  id: ModuleId
  nameKey: DictKey
  descKey: DictKey
  badgeKey: DictKey
}

const def = (id: ModuleId): ModuleDef => ({
  id,
  nameKey: `module.${id}.name`,
  descKey: `module.${id}.desc`,
  badgeKey: `module.${id}.badge`,
})

export const MODULES: readonly ModuleDef[] = [
  def('automation'),
  def('security'),
  def('performance'),
  def('platforms'),
]
