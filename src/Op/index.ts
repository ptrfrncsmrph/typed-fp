import * as C from '@typed/fp/common'
import { Effect, ReturnOf } from '@typed/fp/Effect'
import { Fn } from '@typed/fp/lambda'
import { Newtype } from 'newtype-ts'

/**
 * Used to represent the resources required to perform a particular operation.
 */
export interface Op<Uri = any, F extends Fn<readonly any[], Effect<any, any>> = Fn>
  extends Newtype<OpUri<Uri, F>, Uri> {}

interface OpUri<Uri, F extends Fn = Fn> {
  readonly Op: unique symbol
  readonly Uri: Uri
  readonly Fn: F
}

// Type-level Helpers

/**
 * Extract the URI of an Op
 */
export type UriOf<A> = A extends Op<infer R, any> ? R : never

/**
 * Extract the Function behind an Operation
 */
export type FnOf<A> = A extends Op<any, infer R> ? R : Fn<any, Effect<any, any>>

/**
 * Extract the arguments for a particular Op
 */
export type ArgsOf<A> = C.ArgsOf<FnOf<A>>

/**
 * Extract the return type of a particular Op
 */
export type EffectOf<A> = ReturnType<FnOf<A>>

export const OPS = Symbol('@typed/fp/Ops')
export type OPS = typeof OPS

/**
 * Opaque environment in which to request the implementation of a particular operation.
 */
export interface OpEnv<O extends Op> extends Newtype<O, Readonly<Record<OPS, OpMap>>> {}

/**
 * The shared map in which *all* implementation of operations are placed in.
 */
export interface OpMap extends Map<Op<any, any>, Fn<any, Effect<any, any>>> {}

/**
 * Type-level map for using Op implementations that require type parameters. The "Env"
 * type-parameter is used to allow alternative implementations to inject environment requirements.
 * @example
 *
 * declare module "@typed/fp/Op" {
 *   export interface Ops<Env> {
 *      [MY_URI]: <E, A>(eff: Effect<E, A>) => Effect<Env & E, A>
 *   }
 * }
 */
export interface Ops<Env> {}

export type OpsUris = keyof Ops<any>

export type GetOperation<E, O extends Op> = (...args: ArgsOf<O>) => Effect<E, ReturnOf<EffectOf<O>>>

export * from './callOp'
export * from './createOp'
export * from './OpEnv'
export * from './provideOp'