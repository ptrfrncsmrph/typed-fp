import { Arity1 } from '@typed/fp/common/exports'
import { curry } from '@typed/fp/lambda/exports'

import { doEffect, Effect } from './exports'

/**
 * @since 0.0.1
 */
export const chain = curry(
  <A, E1, B, E2>(f: Arity1<A, Effect<E1, B>>, eff: Effect<E2, A>): Effect<E1 & E2, B> =>
    doEffect(function* () {
      const a = yield* eff
      const b = yield* f(a)

      return b
    }),
) as {
  <A, E1, B, E2>(f: Arity1<A, Effect<E1, B>>, eff: Effect<E2, A>): Effect<E2 & E1, B>
  <A, E1, B>(f: Arity1<A, Effect<E1, B>>): <E2>(eff: Effect<E2, A>) => Effect<E2 & E1, B>
}
