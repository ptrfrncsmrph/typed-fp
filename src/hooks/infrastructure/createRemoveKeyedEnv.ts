import { ask, doEffect } from '@typed/fp/Effect'

import { HookEvent, HookEventType } from './events'
import { HookEnv } from './HookEnvironment'

export function createRemoveKeyedEnv(sendEvent: (event: HookEvent) => void) {
  return (key: any) =>
    doEffect(function* () {
      const { hookEnvironment } = yield* ask<HookEnv>()
      const keyed = hookEnvironment.children.get(key)

      if (keyed) {
        hookEnvironment.children.delete(key)

        sendEvent({ type: HookEventType.RemovedEnvironment, hookEnvironment: keyed })
      }
    })
}