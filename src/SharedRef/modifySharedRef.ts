import { Arity1 } from '@typed/fp/common'
import { chain, Effect, map } from '@typed/fp/Effect'
import { pipe } from 'fp-ts/es6/pipeable'

import { readSharedRef } from './readSharedRef'
import { SharedRef, SharedRefEnv, SharedRefValue } from './SharedRef'
import { writeSharedRef } from './writeSharedRef'

export const modifySharedRef = <R extends SharedRef<any, any>>(ref: R) => (
  f: Arity1<SharedRefValue<R>, SharedRefValue<R>>,
): Effect<SharedRefEnv<R>, SharedRefValue<R>> =>
  pipe(ref, readSharedRef, map(f), chain(writeSharedRef(ref)))