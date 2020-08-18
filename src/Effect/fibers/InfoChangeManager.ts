import { asap } from '@most/scheduler'
import { Disposable, Scheduler } from '@most/types'
import { Arity1 } from '@typed/fp/common'
import { lazy, LazyDisposable } from '@typed/fp/Disposable'
import { FiberInfo, FiberState } from '@typed/fp/Effect/fibers/Fiber'
import { IO } from 'fp-ts/es6/IO'
import { newIORef } from 'fp-ts/es6/IORef'

import { createCallbackTask } from '../SchedulerEnv'

export interface InfoChangeManager<A> extends Disposable {
  readonly getInfo: IO<FiberInfo<A>>
  readonly updateInfo: (updated: FiberInfo<A>) => void
  readonly onInfoChange: (f: (info: FiberInfo<A>) => Disposable) => Disposable
}

export function createInfoChangeManager<A>(scheduler: Scheduler): InfoChangeManager<A> {
  const disposable = lazy()
  const subscribers: Set<InfoChangeSubscriber<A>> = new Set()
  const info = newIORef<FiberInfo<A>>({
    state: FiberState.Queued,
  })()

  function pushInfo() {
    const updated = info.read()

    subscribers.forEach((subscriber) => {
      const [infoCallback, infoDisposable] = subscriber

      if (!infoDisposable.disposed) {
        infoDisposable.addDisposable(infoCallback(updated))
      }
    })
  }

  function updateInfo(updated: FiberInfo<A>) {
    info.write(updated)()

    pushInfo()
  }

  // Subscribe to info changes, always starting with the current value.
  // Always async to ensure Disposable can be returned before cb is executed
  function onInfoChange(cb: Arity1<FiberInfo<A>, Disposable>): Disposable {
    const initialInfo = info.read()

    // Always give a listener the ability to retrieve a value, even if late.
    if (disposable.disposed) {
      return cb(initialInfo)
    }

    // Used to ensure updates don't get called before initial value has a chance to
    let initialCallbackHasRun = false

    const infoDisposable = lazy()
    const scheduledTask = asap(
      createCallbackTask(() => {
        initialCallbackHasRun = true

        return cb(initialInfo)
      }, infoDisposable.dispose),
      scheduler,
    )

    function infoSubscriber(updated: FiberInfo<A>): Disposable {
      if (!initialCallbackHasRun) {
        return asap(
          createCallbackTask(() => cb(updated), infoDisposable.dispose),
          scheduler,
        )
      }

      return cb(updated)
    }

    const subscriber: InfoChangeSubscriber<A> = [infoSubscriber, infoDisposable]

    subscribers.add(subscriber)

    infoDisposable.addDisposable(disposable.addDisposable(infoDisposable))
    infoDisposable.addDisposable(scheduledTask)
    infoDisposable.addDisposable({ dispose: () => subscribers.delete(subscriber) })

    return infoDisposable
  }

  disposable.addDisposable({
    dispose: () => {
      subscribers.clear()
    },
  })

  return {
    dispose: disposable.dispose,
    getInfo: () => info.read(),
    updateInfo,
    onInfoChange,
  }
}

type InfoChangeSubscriber<A> = readonly [Arity1<FiberInfo<A>, Disposable>, LazyDisposable]