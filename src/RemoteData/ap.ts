import { curry } from '@typed/fp/lambda/exports'

import { chain } from './chain'
import { SuccessInfo } from './fold'
import { map } from './map'
import { RemoteData } from './RemoteData'

/**
 * Applies the function contains in an `RemoteData` to the value contained in a
 * second `RemoteData`.
 * @name ap<A, B, C>(fn: RemoteData<A, (value: B, refreshing: boolean) => C>, value: RemoteData<A, B>): RemoteData<A, C>
 */
export const ap = curry(__ap) as {
  <A, B, C>(
    fn: RemoteData<A, (value: B, info: SuccessInfo) => C>,
    value: RemoteData<A, B>,
  ): RemoteData<A, C>
  <A, B, C>(fn: RemoteData<A, (value: B, info: SuccessInfo) => C>): (
    value: RemoteData<A, B>,
  ) => RemoteData<A, C>
}

function __ap<A, B, C>(
  fn: RemoteData<A, (value: B, info: SuccessInfo) => C>,
  value: RemoteData<A, B>,
): RemoteData<A, C> {
  return chain((f) => map(f, value), fn)
}
