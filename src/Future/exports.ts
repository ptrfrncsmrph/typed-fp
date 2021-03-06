import {
  chain as chainEff,
  doEffect,
  Effect,
  effect,
  effectSeq,
  fail,
  FailEnv,
  fromReader,
  fromTask,
  Pure,
  toReaderTask,
  URI as EffectURI,
} from '@typed/fp/Effect/exports'
import { Alt3 } from 'fp-ts/Alt'
import * as E from 'fp-ts/Either'
import { EitherM2, getEitherM } from 'fp-ts/EitherT'
import { Monad3 } from 'fp-ts/Monad'
import { pipe, pipeable } from 'fp-ts/pipeable'
import { ReaderTaskEither } from 'fp-ts/ReaderTaskEither'
import { isLeft } from 'fp-ts/These'

export const URI = '@typed/fp/Future/exports'
export type URI = typeof URI

export type Future<E, A, B> = Effect<E, E.Either<A, B>>

declare module 'fp-ts/HKT' {
  export interface URItoKind3<R, E, A> {
    [URI]: Future<R, E, A>
  }
}

export const future: Monad3<URI> & Alt3<URI> & EitherM2<EffectURI> = { ...getEitherM(effect), URI }
export const futureSeq: Monad3<URI> & Alt3<URI> & EitherM2<EffectURI> = {
  ...getEitherM(effectSeq),
  URI,
}

export const left = <A, B>(value: A): Future<{}, A, B> => Pure.of(E.left<A, B>(value))
export const right = <A, B>(value: B): Future<{}, A, B> => Pure.of(E.right<A, B>(value))

export const {
  alt,
  ap,
  apFirst,
  apSecond,
  chain,
  chainFirst,
  map,
  bimap,
  mapLeft,
  flatten,
} = pipeable(future)

export const orFail = <K extends PropertyKey, E, A, B>(
  key: K,
  future: Future<E, A, B>,
): Effect<E & FailEnv<K, A>, B> => {
  const eff = doEffect(function* () {
    const either = yield* future

    if (isLeft(either)) {
      return yield* fail(key, either.left)
    }

    return either.right
  })

  return eff
}

export function fromReaderTaskEither<E, A, B>(rte: ReaderTaskEither<E, A, B>): Future<E, A, B> {
  return pipe(rte, fromReader, chainEff(fromTask))
}

export const toReaderTaskEither = <E, A, B>(future: Future<E, A, B>): ReaderTaskEither<E, A, B> =>
  toReaderTask(future)
