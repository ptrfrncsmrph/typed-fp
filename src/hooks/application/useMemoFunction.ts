import { doEffect, Pure } from '@typed/fp/Effect'
import { Fn } from '@typed/fp/lambda'
import { Eq } from 'fp-ts/es6/Eq'
import { identity, pipe } from 'fp-ts/es6/function'
import * as M from 'fp-ts/es6/Map'
import * as O from 'fp-ts/es6/Option'

import { useRef } from '../domain'
import { useMemo } from './useMemo'

export const useMemoFunction = <Args extends ReadonlyArray<any>, R>(
  fn: Fn<Args, R>,
  eq: Eq<Args>,
) =>
  doEffect(function* () {
    const map = yield* useRef(Pure.fromIO(() => new Map<Args, R>()))
    const add = yield* useMemo(M.insertAt, [eq])
    const get = yield* useMemo(M.lookup, [eq])

    const remove = yield* useMemo(
      (e) => (...args: Args) => {
        M.deleteAt(e)(args)(map.current)
      },
      [eq],
    )

    const f = yield* useMemo(
      (add, get) => (...args: Args) =>
        pipe(
          get(args)(map.current),
          O.fold(() => {
            const r = fn(...args)

            pipe(map.current, add(args, r))

            return r
          }, identity),
        ),
      [add, get] as const,
    )

    return [f, remove] as const
  })