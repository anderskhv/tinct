/** An in-memory user_data table behind the two calls the app makes: select ... maybeSingle and commit_user_data (versioned). */
export type FakeRow = { value: Record<string, unknown> | null; rev: number }

export function fakeUserData(rows: Map<string, FakeRow>) {
  return {
    from: (_table: string) => {
      const filter: Record<string, unknown> = {}
      const query = {
        select: () => query,
        eq: (column: string, value: unknown) => { filter[column] = value; return query },
        maybeSingle: async () => ({ data: rows.get(`${filter.user_id}:${filter.key}`) ?? null, error: null }),
      }
      return query
    },
    rpc: async (name: string, args: { p_user_id: string; p_key: string; p_value: Record<string, unknown> | null; p_expected_rev: number | null }) => {
      if (name !== 'commit_user_data') return { data: null, error: { message: 'unknown rpc' } }
      const key = `${args.p_user_id}:${args.p_key}`
      const current = rows.get(key)
      if ((current?.rev ?? null) !== args.p_expected_rev) return { data: { ...current, applied: false, conflict: true }, error: null }
      const next = { value: args.p_value, rev: (current?.rev ?? 0) + 1 }
      rows.set(key, next)
      return { data: { ...next, applied: true, conflict: false }, error: null }
    },
  }
}
