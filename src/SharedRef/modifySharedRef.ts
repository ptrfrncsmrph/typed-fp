import { Arity1 } from '@typed/fp/common/exports'
import { chain, Effect, map } from '@typed/fp/Effect/exports'
import { curry } from '@typed/fp/lambda/exports'
import { pipe } from 'fp-ts/pipeable'

import { readSharedRef } from './readSharedRef'
import { SharedRef, SharedRefEnv, SharedRefValue } from './SharedRef'
import { writeSharedRef } from './writeSharedRef'

export const modifySharedRef = curry(
  <R extends SharedRef<any, any>>(
    ref: R,
    f: Arity1<SharedRefValue<R>, SharedRefValue<R>>,
  ): Effect<SharedRefEnv<R>, SharedRefValue<R>> =>
    pipe(ref, readSharedRef, map(f), chain(writeSharedRef(ref))),
) as {
  <R extends SharedRef<any, any>>(ref: R, f: Arity1<SharedRefValue<R>, SharedRefValue<R>>): Effect<
    SharedRefEnv<R>,
    SharedRefValue<R>
  >

  <R extends SharedRef<any, any>>(ref: R): (
    f: Arity1<SharedRefValue<R>, SharedRefValue<R>>,
  ) => Effect<SharedRefEnv<R>, SharedRefValue<R>>
}
