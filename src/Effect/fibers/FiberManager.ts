import { Disposable, disposeAll, disposeNone, lazy } from '@typed/fp/Disposable'
import { IO } from 'fp-ts/es6/IO'

import { Fiber, foldFiberInfo } from './Fiber'

export interface FiberManager extends Disposable {
  readonly addFiber: (fiber: Fiber<unknown>) => Disposable
  readonly hasRemainingFibers: () => boolean
}

export function createFiberManager(onFinish: IO<void>): FiberManager {
  const disposable = lazy()
  const fibers = new Set<Fiber<unknown>>()

  function addFiber(fiber: Fiber<unknown>): Disposable {
    fibers.add(fiber)

    const fiberDisposable: Disposable = {
      dispose: () => fibers.delete(fiber),
    }
    const listener = fiber.onInfoChange(
      foldFiberInfo(disposeNone, disposeNone, onDispose, disposeNone, onDispose),
    )
    const parentDisposable = disposable.addDisposable(fiber)
    const fiberResourcesDisposable = disposeAll([fiberDisposable, listener, parentDisposable])
    const childDisposable = fiber.addDisposable(fiberResourcesDisposable)
    const allResourcesDisposable = disposeAll([childDisposable, fiberResourcesDisposable])

    return allResourcesDisposable

    function onDispose() {
      allResourcesDisposable.dispose()

      onFinish()

      return disposeNone()
    }
  }

  const hasRemainingFibers = () => fibers.size > 0

  return {
    dispose: disposable.dispose,
    hasRemainingFibers,
    addFiber,
  }
}