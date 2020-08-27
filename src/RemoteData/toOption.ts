import { none, Option, some } from 'fp-ts/es6/Option'
import { pipe } from 'fp-ts/es6/pipeable'

import { getOrElse } from './getOrElse'
import { map } from './map'
import { RemoteData } from './RemoteData'

export function toOption<A, B>(rd: RemoteData<A, B>): Option<B> {
  return pipe(
    rd,
    map(some),
    getOrElse(() => none),
  )
}
