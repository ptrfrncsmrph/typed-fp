import { HeadArg } from '@typed/fp/common'
import { ask } from '@typed/fp/Effect/ask'
import { AddEnv, EffectOf } from '@typed/fp/Effect/Effect'

/**
 * @since 0.0.1
 */
export const doEffect = <G extends () => Generator>(effectGeneratorFunction: G): EffectOf<G> =>
  (({
    [Symbol.iterator]: effectGeneratorFunction,
  } as unknown) as EffectOf<G>)

/**
 * @since 0.0.1
 */
export const doEffectWith = <G extends (e: any) => Generator>(
  effectGeneratorFunction: G,
): AddEnv<HeadArg<G>, EffectOf<G>> =>
  doEffect(function* () {
    const e1 = yield* ask<HeadArg<G>>()

    return yield* effectGeneratorFunction(e1)
  })