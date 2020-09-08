import { disposeNone } from '@most/disposable'
import { periodic } from '@most/scheduler'
import { Disposable, Period } from '@most/types'
import { ask, Effect, execEffect, Pure } from '@typed/fp/Effect'
import { createCallbackTask, SchedulerEnv } from '@typed/fp/fibers'

import { HookOpEnvs } from '../domain'
import { addDisposable, useRef } from '../domain/services'
import { useEffect } from './useEffect'

export const useInterval = <E>(
  effect: Effect<E, unknown>,
  interval: Period,
): Effect<HookOpEnvs & SchedulerEnv & E, Disposable> =>
  useEffect(
    function* (i) {
      const env = yield* ask<SchedulerEnv & HookOpEnvs & E>()
      const firstRun = yield* useRef(Pure.of(true))

      yield* addDisposable(
        periodic(
          i,
          createCallbackTask(() =>
            firstRun.current
              ? ((firstRun.current = false), disposeNone())
              : execEffect(env, effect),
          ),
          env.scheduler,
        ),
      )
    },
    [interval] as const,
  )