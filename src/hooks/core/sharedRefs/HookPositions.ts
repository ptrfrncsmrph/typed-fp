import { doEffect, Effect } from '@typed/fp/Effect/exports'
import {
  createSharedRef,
  readSharedRef,
  SharedRef,
  SharedRefEnv,
} from '@typed/fp/SharedRef/exports'

import { getOrSet } from '../../helpers/getOrSet'
import { HookEnvironmentId } from '../types/HookEnvironment'

export const INITIAL_ENV_INDEX = 1

export const HOOK_POSITIONS = '@typed/fp/HookPositions'
export type HOOK_POSITIONS = typeof HOOK_POSITIONS

export interface HookPositions extends SharedRef<HOOK_POSITIONS, Map<HookEnvironmentId, number>> {}

export const HookPositions = createSharedRef<HookPositions>(HOOK_POSITIONS)

export const getHookPositions = readSharedRef(HookPositions)

export const getNextIndex = (
  id: HookEnvironmentId,
): Effect<SharedRefEnv<HookPositions>, number> => {
  const eff = doEffect(function* () {
    const positions = yield* getHookPositions

    return getNextById(positions, id)
  })

  return eff
}

export const resetIndex = (id: HookEnvironmentId): Effect<SharedRefEnv<HookPositions>, void> => {
  const eff = doEffect(function* () {
    const positions = yield* getHookPositions

    positions.set(id, INITIAL_ENV_INDEX)
  })

  return eff
}

export const deleteHookPosition = (
  id: HookEnvironmentId,
): Effect<SharedRefEnv<HookPositions>, void> => {
  const eff = doEffect(function* () {
    const positions = yield* getHookPositions

    positions.delete(id)
  })

  return eff
}

function getNextById(hookPositions: Map<HookEnvironmentId, number>, id: HookEnvironmentId) {
  const index = getOrSet(id, hookPositions, () => INITIAL_ENV_INDEX)

  hookPositions.set(id, index + 1)

  return index
}
