import { Disposable, LazyDisposable } from '@typed/fp/Disposable'
import { IO } from 'fp-ts/es6/IO'
import { Option } from 'fp-ts/es6/Option'

/**
 * A Fiber is a lightweight process which can be used similarly to promises within the context of Effects.
 * Guaranteed to be asynchronously executed.
 * @since 0.0.1
 */
export interface Fiber<A> extends LazyDisposable {
  // Always up-to-date information about a fiber
  readonly getInfo: IO<FiberInfo<A>>
  // Reference to the parent, if any
  readonly parentFiber: Option<Fiber<unknown>>
  // Listen to changes to the FiberInfo of the Fiber
  readonly onInfoChange: (f: (info: FiberInfo<A>) => Disposable) => Disposable // will always be called at least once with the current state
  // Track a child fiber
  readonly addChildFiber: (fiber: Fiber<unknown>) => Disposable
}

/**
 * @since 0.0.1
 */
export const enum FiberState {
  Queued = 'queued',
  Running = 'running',
  Failed = 'failed',
  Success = 'success',
  Completed = 'completed',
}

/**
 * @since 0.0.1
 */
export type FiberInfo<A> =
  | FiberQueued
  | FiberRunning
  | FiberFailed
  | FiberSuccess<A>
  | FiberComplete<A>

/**
 * Starting state for a fiber
 * @since 0.0.1
 */
export type FiberQueued = {
  readonly state: FiberState.Queued
}

/**
 * Fiber has begun executing
 * @since 0.0.1
 */
export type FiberRunning = {
  readonly state: FiberState.Running
}

/**
 * Executing a fiber process threw and exception
 * @since 0.0.1
 */
export type FiberFailed = {
  readonly state: FiberState.Failed
  readonly error: Error
}

/**
 * Parent fiber has a return value, but has forked fibers still running.
 * @since 0.0.1
 */
export type FiberSuccess<A> = {
  readonly state: FiberState.Success
  readonly value: A
}

/**
 * Parent fiber has a return value, and all forked fibers have completed.
 * @since 0.0.1
 */
export type FiberComplete<A> = {
  readonly state: FiberState.Completed
  readonly value: A
}

/**
 * @since 0.0.1
 */
export const foldFiberInfo = <A, B, C, D, E, F>(
  queued: () => A,
  running: () => B,
  failed: (error: Error) => C,
  success: (value: D) => E,
  completed: (value: D) => F,
) => (info: FiberInfo<D>): A | B | C | E | F => {
  switch (info.state) {
    case FiberState.Queued:
      return queued()
    case FiberState.Running:
      return running()
    case FiberState.Failed:
      return failed(info.error)
    case FiberState.Success:
      return success(info.value)
    case FiberState.Completed:
      return completed(info.value)
  }
}