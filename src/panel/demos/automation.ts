const HOURS_PER_RULE = 3.4

export function savedHoursPerWeek(rules: { active: boolean }[]): string {
  return (rules.filter((r) => r.active).length * HOURS_PER_RULE).toFixed(1)
}
