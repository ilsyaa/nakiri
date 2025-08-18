
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model DeviceAuth
 * 
 */
export type DeviceAuth = $Result.DefaultSelection<Prisma.$DeviceAuthPayload>
/**
 * Model Bot
 * 
 */
export type Bot = $Result.DefaultSelection<Prisma.$BotPayload>
/**
 * Model Group
 * 
 */
export type Group = $Result.DefaultSelection<Prisma.$GroupPayload>
/**
 * Model GroupParticipant
 * 
 */
export type GroupParticipant = $Result.DefaultSelection<Prisma.$GroupParticipantPayload>
/**
 * Model GroupTag
 * 
 */
export type GroupTag = $Result.DefaultSelection<Prisma.$GroupTagPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const accessFeatures: {
  adminonly: 'adminonly',
  everyone: 'everyone'
};

export type accessFeatures = (typeof accessFeatures)[keyof typeof accessFeatures]

}

export type accessFeatures = $Enums.accessFeatures

export const accessFeatures: typeof $Enums.accessFeatures

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more DeviceAuths
 * const deviceAuths = await prisma.deviceAuth.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more DeviceAuths
   * const deviceAuths = await prisma.deviceAuth.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P]): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number }): $Utils.JsPromise<R>

  /**
   * Executes a raw MongoDB command and returns the result of it.
   * @example
   * ```
   * const user = await prisma.$runCommandRaw({
   *   aggregate: 'User',
   *   pipeline: [{ $match: { name: 'Bob' } }, { $project: { email: true, _id: false } }],
   *   explain: false,
   * })
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $runCommandRaw(command: Prisma.InputJsonObject): Prisma.PrismaPromise<Prisma.JsonObject>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.deviceAuth`: Exposes CRUD operations for the **DeviceAuth** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DeviceAuths
    * const deviceAuths = await prisma.deviceAuth.findMany()
    * ```
    */
  get deviceAuth(): Prisma.DeviceAuthDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.bot`: Exposes CRUD operations for the **Bot** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Bots
    * const bots = await prisma.bot.findMany()
    * ```
    */
  get bot(): Prisma.BotDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.group`: Exposes CRUD operations for the **Group** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Groups
    * const groups = await prisma.group.findMany()
    * ```
    */
  get group(): Prisma.GroupDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.groupParticipant`: Exposes CRUD operations for the **GroupParticipant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GroupParticipants
    * const groupParticipants = await prisma.groupParticipant.findMany()
    * ```
    */
  get groupParticipant(): Prisma.GroupParticipantDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.groupTag`: Exposes CRUD operations for the **GroupTag** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GroupTags
    * const groupTags = await prisma.groupTag.findMany()
    * ```
    */
  get groupTag(): Prisma.GroupTagDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.13.0
   * Query Engine version: 361e86d0ea4987e9f53a565309b3eed797a6bcbd
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    DeviceAuth: 'DeviceAuth',
    Bot: 'Bot',
    Group: 'Group',
    GroupParticipant: 'GroupParticipant',
    GroupTag: 'GroupTag',
    User: 'User'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "deviceAuth" | "bot" | "group" | "groupParticipant" | "groupTag" | "user"
      txIsolationLevel: never
    }
    model: {
      DeviceAuth: {
        payload: Prisma.$DeviceAuthPayload<ExtArgs>
        fields: Prisma.DeviceAuthFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DeviceAuthFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceAuthPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DeviceAuthFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceAuthPayload>
          }
          findFirst: {
            args: Prisma.DeviceAuthFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceAuthPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DeviceAuthFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceAuthPayload>
          }
          findMany: {
            args: Prisma.DeviceAuthFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceAuthPayload>[]
          }
          create: {
            args: Prisma.DeviceAuthCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceAuthPayload>
          }
          createMany: {
            args: Prisma.DeviceAuthCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.DeviceAuthDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceAuthPayload>
          }
          update: {
            args: Prisma.DeviceAuthUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceAuthPayload>
          }
          deleteMany: {
            args: Prisma.DeviceAuthDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DeviceAuthUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DeviceAuthUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceAuthPayload>
          }
          aggregate: {
            args: Prisma.DeviceAuthAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDeviceAuth>
          }
          groupBy: {
            args: Prisma.DeviceAuthGroupByArgs<ExtArgs>
            result: $Utils.Optional<DeviceAuthGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.DeviceAuthFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.DeviceAuthAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.DeviceAuthCountArgs<ExtArgs>
            result: $Utils.Optional<DeviceAuthCountAggregateOutputType> | number
          }
        }
      }
      Bot: {
        payload: Prisma.$BotPayload<ExtArgs>
        fields: Prisma.BotFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BotFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BotFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotPayload>
          }
          findFirst: {
            args: Prisma.BotFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BotFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotPayload>
          }
          findMany: {
            args: Prisma.BotFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotPayload>[]
          }
          create: {
            args: Prisma.BotCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotPayload>
          }
          createMany: {
            args: Prisma.BotCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.BotDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotPayload>
          }
          update: {
            args: Prisma.BotUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotPayload>
          }
          deleteMany: {
            args: Prisma.BotDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BotUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.BotUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotPayload>
          }
          aggregate: {
            args: Prisma.BotAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBot>
          }
          groupBy: {
            args: Prisma.BotGroupByArgs<ExtArgs>
            result: $Utils.Optional<BotGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.BotFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.BotAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.BotCountArgs<ExtArgs>
            result: $Utils.Optional<BotCountAggregateOutputType> | number
          }
        }
      }
      Group: {
        payload: Prisma.$GroupPayload<ExtArgs>
        fields: Prisma.GroupFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GroupFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GroupFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupPayload>
          }
          findFirst: {
            args: Prisma.GroupFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GroupFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupPayload>
          }
          findMany: {
            args: Prisma.GroupFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupPayload>[]
          }
          create: {
            args: Prisma.GroupCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupPayload>
          }
          createMany: {
            args: Prisma.GroupCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.GroupDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupPayload>
          }
          update: {
            args: Prisma.GroupUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupPayload>
          }
          deleteMany: {
            args: Prisma.GroupDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GroupUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GroupUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupPayload>
          }
          aggregate: {
            args: Prisma.GroupAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGroup>
          }
          groupBy: {
            args: Prisma.GroupGroupByArgs<ExtArgs>
            result: $Utils.Optional<GroupGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.GroupFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.GroupAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.GroupCountArgs<ExtArgs>
            result: $Utils.Optional<GroupCountAggregateOutputType> | number
          }
        }
      }
      GroupParticipant: {
        payload: Prisma.$GroupParticipantPayload<ExtArgs>
        fields: Prisma.GroupParticipantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GroupParticipantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupParticipantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GroupParticipantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupParticipantPayload>
          }
          findFirst: {
            args: Prisma.GroupParticipantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupParticipantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GroupParticipantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupParticipantPayload>
          }
          findMany: {
            args: Prisma.GroupParticipantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupParticipantPayload>[]
          }
          create: {
            args: Prisma.GroupParticipantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupParticipantPayload>
          }
          createMany: {
            args: Prisma.GroupParticipantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.GroupParticipantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupParticipantPayload>
          }
          update: {
            args: Prisma.GroupParticipantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupParticipantPayload>
          }
          deleteMany: {
            args: Prisma.GroupParticipantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GroupParticipantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GroupParticipantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupParticipantPayload>
          }
          aggregate: {
            args: Prisma.GroupParticipantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGroupParticipant>
          }
          groupBy: {
            args: Prisma.GroupParticipantGroupByArgs<ExtArgs>
            result: $Utils.Optional<GroupParticipantGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.GroupParticipantFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.GroupParticipantAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.GroupParticipantCountArgs<ExtArgs>
            result: $Utils.Optional<GroupParticipantCountAggregateOutputType> | number
          }
        }
      }
      GroupTag: {
        payload: Prisma.$GroupTagPayload<ExtArgs>
        fields: Prisma.GroupTagFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GroupTagFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupTagPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GroupTagFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupTagPayload>
          }
          findFirst: {
            args: Prisma.GroupTagFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupTagPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GroupTagFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupTagPayload>
          }
          findMany: {
            args: Prisma.GroupTagFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupTagPayload>[]
          }
          create: {
            args: Prisma.GroupTagCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupTagPayload>
          }
          createMany: {
            args: Prisma.GroupTagCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.GroupTagDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupTagPayload>
          }
          update: {
            args: Prisma.GroupTagUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupTagPayload>
          }
          deleteMany: {
            args: Prisma.GroupTagDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GroupTagUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GroupTagUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GroupTagPayload>
          }
          aggregate: {
            args: Prisma.GroupTagAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGroupTag>
          }
          groupBy: {
            args: Prisma.GroupTagGroupByArgs<ExtArgs>
            result: $Utils.Optional<GroupTagGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.GroupTagFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.GroupTagAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.GroupTagCountArgs<ExtArgs>
            result: $Utils.Optional<GroupTagCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.UserFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.UserAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $runCommandRaw: {
          args: Prisma.InputJsonObject,
          result: Prisma.JsonObject
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    deviceAuth?: DeviceAuthOmit
    bot?: BotOmit
    group?: GroupOmit
    groupParticipant?: GroupParticipantOmit
    groupTag?: GroupTagOmit
    user?: UserOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type GroupCountOutputType
   */

  export type GroupCountOutputType = {
    participants: number
  }

  export type GroupCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    participants?: boolean | GroupCountOutputTypeCountParticipantsArgs
  }

  // Custom InputTypes
  /**
   * GroupCountOutputType without action
   */
  export type GroupCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupCountOutputType
     */
    select?: GroupCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * GroupCountOutputType without action
   */
  export type GroupCountOutputTypeCountParticipantsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GroupParticipantWhereInput
  }


  /**
   * Models
   */

  /**
   * Model DeviceAuth
   */

  export type AggregateDeviceAuth = {
    _count: DeviceAuthCountAggregateOutputType | null
    _min: DeviceAuthMinAggregateOutputType | null
    _max: DeviceAuthMaxAggregateOutputType | null
  }

  export type DeviceAuthMinAggregateOutputType = {
    id: string | null
    session: string | null
    key: string | null
  }

  export type DeviceAuthMaxAggregateOutputType = {
    id: string | null
    session: string | null
    key: string | null
  }

  export type DeviceAuthCountAggregateOutputType = {
    id: number
    session: number
    key: number
    value: number
    _all: number
  }


  export type DeviceAuthMinAggregateInputType = {
    id?: true
    session?: true
    key?: true
  }

  export type DeviceAuthMaxAggregateInputType = {
    id?: true
    session?: true
    key?: true
  }

  export type DeviceAuthCountAggregateInputType = {
    id?: true
    session?: true
    key?: true
    value?: true
    _all?: true
  }

  export type DeviceAuthAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DeviceAuth to aggregate.
     */
    where?: DeviceAuthWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeviceAuths to fetch.
     */
    orderBy?: DeviceAuthOrderByWithRelationInput | DeviceAuthOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DeviceAuthWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeviceAuths from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeviceAuths.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DeviceAuths
    **/
    _count?: true | DeviceAuthCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DeviceAuthMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DeviceAuthMaxAggregateInputType
  }

  export type GetDeviceAuthAggregateType<T extends DeviceAuthAggregateArgs> = {
        [P in keyof T & keyof AggregateDeviceAuth]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDeviceAuth[P]>
      : GetScalarType<T[P], AggregateDeviceAuth[P]>
  }




  export type DeviceAuthGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DeviceAuthWhereInput
    orderBy?: DeviceAuthOrderByWithAggregationInput | DeviceAuthOrderByWithAggregationInput[]
    by: DeviceAuthScalarFieldEnum[] | DeviceAuthScalarFieldEnum
    having?: DeviceAuthScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DeviceAuthCountAggregateInputType | true
    _min?: DeviceAuthMinAggregateInputType
    _max?: DeviceAuthMaxAggregateInputType
  }

  export type DeviceAuthGroupByOutputType = {
    id: string
    session: string
    key: string
    value: JsonValue | null
    _count: DeviceAuthCountAggregateOutputType | null
    _min: DeviceAuthMinAggregateOutputType | null
    _max: DeviceAuthMaxAggregateOutputType | null
  }

  type GetDeviceAuthGroupByPayload<T extends DeviceAuthGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DeviceAuthGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DeviceAuthGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DeviceAuthGroupByOutputType[P]>
            : GetScalarType<T[P], DeviceAuthGroupByOutputType[P]>
        }
      >
    >


  export type DeviceAuthSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    session?: boolean
    key?: boolean
    value?: boolean
  }, ExtArgs["result"]["deviceAuth"]>



  export type DeviceAuthSelectScalar = {
    id?: boolean
    session?: boolean
    key?: boolean
    value?: boolean
  }

  export type DeviceAuthOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "session" | "key" | "value", ExtArgs["result"]["deviceAuth"]>

  export type $DeviceAuthPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DeviceAuth"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      session: string
      key: string
      value: Prisma.JsonValue | null
    }, ExtArgs["result"]["deviceAuth"]>
    composites: {}
  }

  type DeviceAuthGetPayload<S extends boolean | null | undefined | DeviceAuthDefaultArgs> = $Result.GetResult<Prisma.$DeviceAuthPayload, S>

  type DeviceAuthCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DeviceAuthFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DeviceAuthCountAggregateInputType | true
    }

  export interface DeviceAuthDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DeviceAuth'], meta: { name: 'DeviceAuth' } }
    /**
     * Find zero or one DeviceAuth that matches the filter.
     * @param {DeviceAuthFindUniqueArgs} args - Arguments to find a DeviceAuth
     * @example
     * // Get one DeviceAuth
     * const deviceAuth = await prisma.deviceAuth.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DeviceAuthFindUniqueArgs>(args: SelectSubset<T, DeviceAuthFindUniqueArgs<ExtArgs>>): Prisma__DeviceAuthClient<$Result.GetResult<Prisma.$DeviceAuthPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DeviceAuth that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DeviceAuthFindUniqueOrThrowArgs} args - Arguments to find a DeviceAuth
     * @example
     * // Get one DeviceAuth
     * const deviceAuth = await prisma.deviceAuth.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DeviceAuthFindUniqueOrThrowArgs>(args: SelectSubset<T, DeviceAuthFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DeviceAuthClient<$Result.GetResult<Prisma.$DeviceAuthPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DeviceAuth that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceAuthFindFirstArgs} args - Arguments to find a DeviceAuth
     * @example
     * // Get one DeviceAuth
     * const deviceAuth = await prisma.deviceAuth.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DeviceAuthFindFirstArgs>(args?: SelectSubset<T, DeviceAuthFindFirstArgs<ExtArgs>>): Prisma__DeviceAuthClient<$Result.GetResult<Prisma.$DeviceAuthPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DeviceAuth that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceAuthFindFirstOrThrowArgs} args - Arguments to find a DeviceAuth
     * @example
     * // Get one DeviceAuth
     * const deviceAuth = await prisma.deviceAuth.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DeviceAuthFindFirstOrThrowArgs>(args?: SelectSubset<T, DeviceAuthFindFirstOrThrowArgs<ExtArgs>>): Prisma__DeviceAuthClient<$Result.GetResult<Prisma.$DeviceAuthPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DeviceAuths that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceAuthFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DeviceAuths
     * const deviceAuths = await prisma.deviceAuth.findMany()
     * 
     * // Get first 10 DeviceAuths
     * const deviceAuths = await prisma.deviceAuth.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const deviceAuthWithIdOnly = await prisma.deviceAuth.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DeviceAuthFindManyArgs>(args?: SelectSubset<T, DeviceAuthFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeviceAuthPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DeviceAuth.
     * @param {DeviceAuthCreateArgs} args - Arguments to create a DeviceAuth.
     * @example
     * // Create one DeviceAuth
     * const DeviceAuth = await prisma.deviceAuth.create({
     *   data: {
     *     // ... data to create a DeviceAuth
     *   }
     * })
     * 
     */
    create<T extends DeviceAuthCreateArgs>(args: SelectSubset<T, DeviceAuthCreateArgs<ExtArgs>>): Prisma__DeviceAuthClient<$Result.GetResult<Prisma.$DeviceAuthPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DeviceAuths.
     * @param {DeviceAuthCreateManyArgs} args - Arguments to create many DeviceAuths.
     * @example
     * // Create many DeviceAuths
     * const deviceAuth = await prisma.deviceAuth.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DeviceAuthCreateManyArgs>(args?: SelectSubset<T, DeviceAuthCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a DeviceAuth.
     * @param {DeviceAuthDeleteArgs} args - Arguments to delete one DeviceAuth.
     * @example
     * // Delete one DeviceAuth
     * const DeviceAuth = await prisma.deviceAuth.delete({
     *   where: {
     *     // ... filter to delete one DeviceAuth
     *   }
     * })
     * 
     */
    delete<T extends DeviceAuthDeleteArgs>(args: SelectSubset<T, DeviceAuthDeleteArgs<ExtArgs>>): Prisma__DeviceAuthClient<$Result.GetResult<Prisma.$DeviceAuthPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DeviceAuth.
     * @param {DeviceAuthUpdateArgs} args - Arguments to update one DeviceAuth.
     * @example
     * // Update one DeviceAuth
     * const deviceAuth = await prisma.deviceAuth.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DeviceAuthUpdateArgs>(args: SelectSubset<T, DeviceAuthUpdateArgs<ExtArgs>>): Prisma__DeviceAuthClient<$Result.GetResult<Prisma.$DeviceAuthPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DeviceAuths.
     * @param {DeviceAuthDeleteManyArgs} args - Arguments to filter DeviceAuths to delete.
     * @example
     * // Delete a few DeviceAuths
     * const { count } = await prisma.deviceAuth.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DeviceAuthDeleteManyArgs>(args?: SelectSubset<T, DeviceAuthDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DeviceAuths.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceAuthUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DeviceAuths
     * const deviceAuth = await prisma.deviceAuth.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DeviceAuthUpdateManyArgs>(args: SelectSubset<T, DeviceAuthUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DeviceAuth.
     * @param {DeviceAuthUpsertArgs} args - Arguments to update or create a DeviceAuth.
     * @example
     * // Update or create a DeviceAuth
     * const deviceAuth = await prisma.deviceAuth.upsert({
     *   create: {
     *     // ... data to create a DeviceAuth
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DeviceAuth we want to update
     *   }
     * })
     */
    upsert<T extends DeviceAuthUpsertArgs>(args: SelectSubset<T, DeviceAuthUpsertArgs<ExtArgs>>): Prisma__DeviceAuthClient<$Result.GetResult<Prisma.$DeviceAuthPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DeviceAuths that matches the filter.
     * @param {DeviceAuthFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const deviceAuth = await prisma.deviceAuth.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: DeviceAuthFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a DeviceAuth.
     * @param {DeviceAuthAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const deviceAuth = await prisma.deviceAuth.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: DeviceAuthAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of DeviceAuths.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceAuthCountArgs} args - Arguments to filter DeviceAuths to count.
     * @example
     * // Count the number of DeviceAuths
     * const count = await prisma.deviceAuth.count({
     *   where: {
     *     // ... the filter for the DeviceAuths we want to count
     *   }
     * })
    **/
    count<T extends DeviceAuthCountArgs>(
      args?: Subset<T, DeviceAuthCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DeviceAuthCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DeviceAuth.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceAuthAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DeviceAuthAggregateArgs>(args: Subset<T, DeviceAuthAggregateArgs>): Prisma.PrismaPromise<GetDeviceAuthAggregateType<T>>

    /**
     * Group by DeviceAuth.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceAuthGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DeviceAuthGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DeviceAuthGroupByArgs['orderBy'] }
        : { orderBy?: DeviceAuthGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DeviceAuthGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDeviceAuthGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DeviceAuth model
   */
  readonly fields: DeviceAuthFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DeviceAuth.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DeviceAuthClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DeviceAuth model
   */
  interface DeviceAuthFieldRefs {
    readonly id: FieldRef<"DeviceAuth", 'String'>
    readonly session: FieldRef<"DeviceAuth", 'String'>
    readonly key: FieldRef<"DeviceAuth", 'String'>
    readonly value: FieldRef<"DeviceAuth", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * DeviceAuth findUnique
   */
  export type DeviceAuthFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceAuth
     */
    select?: DeviceAuthSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeviceAuth
     */
    omit?: DeviceAuthOmit<ExtArgs> | null
    /**
     * Filter, which DeviceAuth to fetch.
     */
    where: DeviceAuthWhereUniqueInput
  }

  /**
   * DeviceAuth findUniqueOrThrow
   */
  export type DeviceAuthFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceAuth
     */
    select?: DeviceAuthSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeviceAuth
     */
    omit?: DeviceAuthOmit<ExtArgs> | null
    /**
     * Filter, which DeviceAuth to fetch.
     */
    where: DeviceAuthWhereUniqueInput
  }

  /**
   * DeviceAuth findFirst
   */
  export type DeviceAuthFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceAuth
     */
    select?: DeviceAuthSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeviceAuth
     */
    omit?: DeviceAuthOmit<ExtArgs> | null
    /**
     * Filter, which DeviceAuth to fetch.
     */
    where?: DeviceAuthWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeviceAuths to fetch.
     */
    orderBy?: DeviceAuthOrderByWithRelationInput | DeviceAuthOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DeviceAuths.
     */
    cursor?: DeviceAuthWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeviceAuths from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeviceAuths.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DeviceAuths.
     */
    distinct?: DeviceAuthScalarFieldEnum | DeviceAuthScalarFieldEnum[]
  }

  /**
   * DeviceAuth findFirstOrThrow
   */
  export type DeviceAuthFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceAuth
     */
    select?: DeviceAuthSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeviceAuth
     */
    omit?: DeviceAuthOmit<ExtArgs> | null
    /**
     * Filter, which DeviceAuth to fetch.
     */
    where?: DeviceAuthWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeviceAuths to fetch.
     */
    orderBy?: DeviceAuthOrderByWithRelationInput | DeviceAuthOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DeviceAuths.
     */
    cursor?: DeviceAuthWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeviceAuths from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeviceAuths.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DeviceAuths.
     */
    distinct?: DeviceAuthScalarFieldEnum | DeviceAuthScalarFieldEnum[]
  }

  /**
   * DeviceAuth findMany
   */
  export type DeviceAuthFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceAuth
     */
    select?: DeviceAuthSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeviceAuth
     */
    omit?: DeviceAuthOmit<ExtArgs> | null
    /**
     * Filter, which DeviceAuths to fetch.
     */
    where?: DeviceAuthWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeviceAuths to fetch.
     */
    orderBy?: DeviceAuthOrderByWithRelationInput | DeviceAuthOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DeviceAuths.
     */
    cursor?: DeviceAuthWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeviceAuths from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeviceAuths.
     */
    skip?: number
    distinct?: DeviceAuthScalarFieldEnum | DeviceAuthScalarFieldEnum[]
  }

  /**
   * DeviceAuth create
   */
  export type DeviceAuthCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceAuth
     */
    select?: DeviceAuthSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeviceAuth
     */
    omit?: DeviceAuthOmit<ExtArgs> | null
    /**
     * The data needed to create a DeviceAuth.
     */
    data: XOR<DeviceAuthCreateInput, DeviceAuthUncheckedCreateInput>
  }

  /**
   * DeviceAuth createMany
   */
  export type DeviceAuthCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DeviceAuths.
     */
    data: DeviceAuthCreateManyInput | DeviceAuthCreateManyInput[]
  }

  /**
   * DeviceAuth update
   */
  export type DeviceAuthUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceAuth
     */
    select?: DeviceAuthSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeviceAuth
     */
    omit?: DeviceAuthOmit<ExtArgs> | null
    /**
     * The data needed to update a DeviceAuth.
     */
    data: XOR<DeviceAuthUpdateInput, DeviceAuthUncheckedUpdateInput>
    /**
     * Choose, which DeviceAuth to update.
     */
    where: DeviceAuthWhereUniqueInput
  }

  /**
   * DeviceAuth updateMany
   */
  export type DeviceAuthUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DeviceAuths.
     */
    data: XOR<DeviceAuthUpdateManyMutationInput, DeviceAuthUncheckedUpdateManyInput>
    /**
     * Filter which DeviceAuths to update
     */
    where?: DeviceAuthWhereInput
    /**
     * Limit how many DeviceAuths to update.
     */
    limit?: number
  }

  /**
   * DeviceAuth upsert
   */
  export type DeviceAuthUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceAuth
     */
    select?: DeviceAuthSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeviceAuth
     */
    omit?: DeviceAuthOmit<ExtArgs> | null
    /**
     * The filter to search for the DeviceAuth to update in case it exists.
     */
    where: DeviceAuthWhereUniqueInput
    /**
     * In case the DeviceAuth found by the `where` argument doesn't exist, create a new DeviceAuth with this data.
     */
    create: XOR<DeviceAuthCreateInput, DeviceAuthUncheckedCreateInput>
    /**
     * In case the DeviceAuth was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DeviceAuthUpdateInput, DeviceAuthUncheckedUpdateInput>
  }

  /**
   * DeviceAuth delete
   */
  export type DeviceAuthDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceAuth
     */
    select?: DeviceAuthSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeviceAuth
     */
    omit?: DeviceAuthOmit<ExtArgs> | null
    /**
     * Filter which DeviceAuth to delete.
     */
    where: DeviceAuthWhereUniqueInput
  }

  /**
   * DeviceAuth deleteMany
   */
  export type DeviceAuthDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DeviceAuths to delete
     */
    where?: DeviceAuthWhereInput
    /**
     * Limit how many DeviceAuths to delete.
     */
    limit?: number
  }

  /**
   * DeviceAuth findRaw
   */
  export type DeviceAuthFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * DeviceAuth aggregateRaw
   */
  export type DeviceAuthAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * DeviceAuth without action
   */
  export type DeviceAuthDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceAuth
     */
    select?: DeviceAuthSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeviceAuth
     */
    omit?: DeviceAuthOmit<ExtArgs> | null
  }


  /**
   * Model Bot
   */

  export type AggregateBot = {
    _count: BotCountAggregateOutputType | null
    _min: BotMinAggregateOutputType | null
    _max: BotMaxAggregateOutputType | null
  }

  export type BotMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BotMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BotCountAggregateOutputType = {
    id: number
    prefixs: number
    owners: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BotMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BotMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BotCountAggregateInputType = {
    id?: true
    prefixs?: true
    owners?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BotAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bot to aggregate.
     */
    where?: BotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bots to fetch.
     */
    orderBy?: BotOrderByWithRelationInput | BotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Bots
    **/
    _count?: true | BotCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BotMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BotMaxAggregateInputType
  }

  export type GetBotAggregateType<T extends BotAggregateArgs> = {
        [P in keyof T & keyof AggregateBot]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBot[P]>
      : GetScalarType<T[P], AggregateBot[P]>
  }




  export type BotGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BotWhereInput
    orderBy?: BotOrderByWithAggregationInput | BotOrderByWithAggregationInput[]
    by: BotScalarFieldEnum[] | BotScalarFieldEnum
    having?: BotScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BotCountAggregateInputType | true
    _min?: BotMinAggregateInputType
    _max?: BotMaxAggregateInputType
  }

  export type BotGroupByOutputType = {
    id: string
    prefixs: JsonValue
    owners: JsonValue
    createdAt: Date
    updatedAt: Date
    _count: BotCountAggregateOutputType | null
    _min: BotMinAggregateOutputType | null
    _max: BotMaxAggregateOutputType | null
  }

  type GetBotGroupByPayload<T extends BotGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BotGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BotGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BotGroupByOutputType[P]>
            : GetScalarType<T[P], BotGroupByOutputType[P]>
        }
      >
    >


  export type BotSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    prefixs?: boolean
    owners?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["bot"]>



  export type BotSelectScalar = {
    id?: boolean
    prefixs?: boolean
    owners?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BotOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "prefixs" | "owners" | "createdAt" | "updatedAt", ExtArgs["result"]["bot"]>

  export type $BotPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Bot"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      prefixs: Prisma.JsonValue
      owners: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["bot"]>
    composites: {}
  }

  type BotGetPayload<S extends boolean | null | undefined | BotDefaultArgs> = $Result.GetResult<Prisma.$BotPayload, S>

  type BotCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BotFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BotCountAggregateInputType | true
    }

  export interface BotDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Bot'], meta: { name: 'Bot' } }
    /**
     * Find zero or one Bot that matches the filter.
     * @param {BotFindUniqueArgs} args - Arguments to find a Bot
     * @example
     * // Get one Bot
     * const bot = await prisma.bot.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BotFindUniqueArgs>(args: SelectSubset<T, BotFindUniqueArgs<ExtArgs>>): Prisma__BotClient<$Result.GetResult<Prisma.$BotPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Bot that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BotFindUniqueOrThrowArgs} args - Arguments to find a Bot
     * @example
     * // Get one Bot
     * const bot = await prisma.bot.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BotFindUniqueOrThrowArgs>(args: SelectSubset<T, BotFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BotClient<$Result.GetResult<Prisma.$BotPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Bot that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotFindFirstArgs} args - Arguments to find a Bot
     * @example
     * // Get one Bot
     * const bot = await prisma.bot.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BotFindFirstArgs>(args?: SelectSubset<T, BotFindFirstArgs<ExtArgs>>): Prisma__BotClient<$Result.GetResult<Prisma.$BotPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Bot that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotFindFirstOrThrowArgs} args - Arguments to find a Bot
     * @example
     * // Get one Bot
     * const bot = await prisma.bot.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BotFindFirstOrThrowArgs>(args?: SelectSubset<T, BotFindFirstOrThrowArgs<ExtArgs>>): Prisma__BotClient<$Result.GetResult<Prisma.$BotPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Bots that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Bots
     * const bots = await prisma.bot.findMany()
     * 
     * // Get first 10 Bots
     * const bots = await prisma.bot.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const botWithIdOnly = await prisma.bot.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BotFindManyArgs>(args?: SelectSubset<T, BotFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BotPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Bot.
     * @param {BotCreateArgs} args - Arguments to create a Bot.
     * @example
     * // Create one Bot
     * const Bot = await prisma.bot.create({
     *   data: {
     *     // ... data to create a Bot
     *   }
     * })
     * 
     */
    create<T extends BotCreateArgs>(args: SelectSubset<T, BotCreateArgs<ExtArgs>>): Prisma__BotClient<$Result.GetResult<Prisma.$BotPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Bots.
     * @param {BotCreateManyArgs} args - Arguments to create many Bots.
     * @example
     * // Create many Bots
     * const bot = await prisma.bot.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BotCreateManyArgs>(args?: SelectSubset<T, BotCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Bot.
     * @param {BotDeleteArgs} args - Arguments to delete one Bot.
     * @example
     * // Delete one Bot
     * const Bot = await prisma.bot.delete({
     *   where: {
     *     // ... filter to delete one Bot
     *   }
     * })
     * 
     */
    delete<T extends BotDeleteArgs>(args: SelectSubset<T, BotDeleteArgs<ExtArgs>>): Prisma__BotClient<$Result.GetResult<Prisma.$BotPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Bot.
     * @param {BotUpdateArgs} args - Arguments to update one Bot.
     * @example
     * // Update one Bot
     * const bot = await prisma.bot.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BotUpdateArgs>(args: SelectSubset<T, BotUpdateArgs<ExtArgs>>): Prisma__BotClient<$Result.GetResult<Prisma.$BotPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Bots.
     * @param {BotDeleteManyArgs} args - Arguments to filter Bots to delete.
     * @example
     * // Delete a few Bots
     * const { count } = await prisma.bot.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BotDeleteManyArgs>(args?: SelectSubset<T, BotDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Bots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Bots
     * const bot = await prisma.bot.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BotUpdateManyArgs>(args: SelectSubset<T, BotUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Bot.
     * @param {BotUpsertArgs} args - Arguments to update or create a Bot.
     * @example
     * // Update or create a Bot
     * const bot = await prisma.bot.upsert({
     *   create: {
     *     // ... data to create a Bot
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Bot we want to update
     *   }
     * })
     */
    upsert<T extends BotUpsertArgs>(args: SelectSubset<T, BotUpsertArgs<ExtArgs>>): Prisma__BotClient<$Result.GetResult<Prisma.$BotPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Bots that matches the filter.
     * @param {BotFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const bot = await prisma.bot.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: BotFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Bot.
     * @param {BotAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const bot = await prisma.bot.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: BotAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Bots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotCountArgs} args - Arguments to filter Bots to count.
     * @example
     * // Count the number of Bots
     * const count = await prisma.bot.count({
     *   where: {
     *     // ... the filter for the Bots we want to count
     *   }
     * })
    **/
    count<T extends BotCountArgs>(
      args?: Subset<T, BotCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BotCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Bot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BotAggregateArgs>(args: Subset<T, BotAggregateArgs>): Prisma.PrismaPromise<GetBotAggregateType<T>>

    /**
     * Group by Bot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BotGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BotGroupByArgs['orderBy'] }
        : { orderBy?: BotGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BotGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBotGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Bot model
   */
  readonly fields: BotFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Bot.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BotClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Bot model
   */
  interface BotFieldRefs {
    readonly id: FieldRef<"Bot", 'String'>
    readonly prefixs: FieldRef<"Bot", 'Json'>
    readonly owners: FieldRef<"Bot", 'Json'>
    readonly createdAt: FieldRef<"Bot", 'DateTime'>
    readonly updatedAt: FieldRef<"Bot", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Bot findUnique
   */
  export type BotFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bot
     */
    select?: BotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bot
     */
    omit?: BotOmit<ExtArgs> | null
    /**
     * Filter, which Bot to fetch.
     */
    where: BotWhereUniqueInput
  }

  /**
   * Bot findUniqueOrThrow
   */
  export type BotFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bot
     */
    select?: BotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bot
     */
    omit?: BotOmit<ExtArgs> | null
    /**
     * Filter, which Bot to fetch.
     */
    where: BotWhereUniqueInput
  }

  /**
   * Bot findFirst
   */
  export type BotFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bot
     */
    select?: BotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bot
     */
    omit?: BotOmit<ExtArgs> | null
    /**
     * Filter, which Bot to fetch.
     */
    where?: BotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bots to fetch.
     */
    orderBy?: BotOrderByWithRelationInput | BotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bots.
     */
    cursor?: BotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bots.
     */
    distinct?: BotScalarFieldEnum | BotScalarFieldEnum[]
  }

  /**
   * Bot findFirstOrThrow
   */
  export type BotFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bot
     */
    select?: BotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bot
     */
    omit?: BotOmit<ExtArgs> | null
    /**
     * Filter, which Bot to fetch.
     */
    where?: BotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bots to fetch.
     */
    orderBy?: BotOrderByWithRelationInput | BotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bots.
     */
    cursor?: BotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bots.
     */
    distinct?: BotScalarFieldEnum | BotScalarFieldEnum[]
  }

  /**
   * Bot findMany
   */
  export type BotFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bot
     */
    select?: BotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bot
     */
    omit?: BotOmit<ExtArgs> | null
    /**
     * Filter, which Bots to fetch.
     */
    where?: BotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bots to fetch.
     */
    orderBy?: BotOrderByWithRelationInput | BotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Bots.
     */
    cursor?: BotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bots.
     */
    skip?: number
    distinct?: BotScalarFieldEnum | BotScalarFieldEnum[]
  }

  /**
   * Bot create
   */
  export type BotCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bot
     */
    select?: BotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bot
     */
    omit?: BotOmit<ExtArgs> | null
    /**
     * The data needed to create a Bot.
     */
    data: XOR<BotCreateInput, BotUncheckedCreateInput>
  }

  /**
   * Bot createMany
   */
  export type BotCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Bots.
     */
    data: BotCreateManyInput | BotCreateManyInput[]
  }

  /**
   * Bot update
   */
  export type BotUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bot
     */
    select?: BotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bot
     */
    omit?: BotOmit<ExtArgs> | null
    /**
     * The data needed to update a Bot.
     */
    data: XOR<BotUpdateInput, BotUncheckedUpdateInput>
    /**
     * Choose, which Bot to update.
     */
    where: BotWhereUniqueInput
  }

  /**
   * Bot updateMany
   */
  export type BotUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Bots.
     */
    data: XOR<BotUpdateManyMutationInput, BotUncheckedUpdateManyInput>
    /**
     * Filter which Bots to update
     */
    where?: BotWhereInput
    /**
     * Limit how many Bots to update.
     */
    limit?: number
  }

  /**
   * Bot upsert
   */
  export type BotUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bot
     */
    select?: BotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bot
     */
    omit?: BotOmit<ExtArgs> | null
    /**
     * The filter to search for the Bot to update in case it exists.
     */
    where: BotWhereUniqueInput
    /**
     * In case the Bot found by the `where` argument doesn't exist, create a new Bot with this data.
     */
    create: XOR<BotCreateInput, BotUncheckedCreateInput>
    /**
     * In case the Bot was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BotUpdateInput, BotUncheckedUpdateInput>
  }

  /**
   * Bot delete
   */
  export type BotDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bot
     */
    select?: BotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bot
     */
    omit?: BotOmit<ExtArgs> | null
    /**
     * Filter which Bot to delete.
     */
    where: BotWhereUniqueInput
  }

  /**
   * Bot deleteMany
   */
  export type BotDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bots to delete
     */
    where?: BotWhereInput
    /**
     * Limit how many Bots to delete.
     */
    limit?: number
  }

  /**
   * Bot findRaw
   */
  export type BotFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Bot aggregateRaw
   */
  export type BotAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Bot without action
   */
  export type BotDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bot
     */
    select?: BotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bot
     */
    omit?: BotOmit<ExtArgs> | null
  }


  /**
   * Model Group
   */

  export type AggregateGroup = {
    _count: GroupCountAggregateOutputType | null
    _avg: GroupAvgAggregateOutputType | null
    _sum: GroupSumAggregateOutputType | null
    _min: GroupMinAggregateOutputType | null
    _max: GroupMaxAggregateOutputType | null
  }

  export type GroupAvgAggregateOutputType = {
    maxStrike: number | null
  }

  export type GroupSumAggregateOutputType = {
    maxStrike: number | null
  }

  export type GroupMinAggregateOutputType = {
    id: string | null
    groupId: string | null
    subject: string | null
    visible: boolean | null
    link: string | null
    accessFeatures: $Enums.accessFeatures | null
    joinApprovalMode: boolean | null
    maxStrike: number | null
    activityScore: boolean | null
    lang: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GroupMaxAggregateOutputType = {
    id: string | null
    groupId: string | null
    subject: string | null
    visible: boolean | null
    link: string | null
    accessFeatures: $Enums.accessFeatures | null
    joinApprovalMode: boolean | null
    maxStrike: number | null
    activityScore: boolean | null
    lang: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GroupCountAggregateOutputType = {
    id: number
    groupId: number
    subject: number
    visible: number
    link: number
    publicFeatures: number
    accessFeatures: number
    joinApprovalMode: number
    maxStrike: number
    wordBlocker: number
    antiMention: number
    welcome: number
    activityScore: number
    lang: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type GroupAvgAggregateInputType = {
    maxStrike?: true
  }

  export type GroupSumAggregateInputType = {
    maxStrike?: true
  }

  export type GroupMinAggregateInputType = {
    id?: true
    groupId?: true
    subject?: true
    visible?: true
    link?: true
    accessFeatures?: true
    joinApprovalMode?: true
    maxStrike?: true
    activityScore?: true
    lang?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GroupMaxAggregateInputType = {
    id?: true
    groupId?: true
    subject?: true
    visible?: true
    link?: true
    accessFeatures?: true
    joinApprovalMode?: true
    maxStrike?: true
    activityScore?: true
    lang?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GroupCountAggregateInputType = {
    id?: true
    groupId?: true
    subject?: true
    visible?: true
    link?: true
    publicFeatures?: true
    accessFeatures?: true
    joinApprovalMode?: true
    maxStrike?: true
    wordBlocker?: true
    antiMention?: true
    welcome?: true
    activityScore?: true
    lang?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type GroupAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Group to aggregate.
     */
    where?: GroupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Groups to fetch.
     */
    orderBy?: GroupOrderByWithRelationInput | GroupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GroupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Groups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Groups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Groups
    **/
    _count?: true | GroupCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GroupAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GroupSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GroupMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GroupMaxAggregateInputType
  }

  export type GetGroupAggregateType<T extends GroupAggregateArgs> = {
        [P in keyof T & keyof AggregateGroup]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGroup[P]>
      : GetScalarType<T[P], AggregateGroup[P]>
  }




  export type GroupGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GroupWhereInput
    orderBy?: GroupOrderByWithAggregationInput | GroupOrderByWithAggregationInput[]
    by: GroupScalarFieldEnum[] | GroupScalarFieldEnum
    having?: GroupScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GroupCountAggregateInputType | true
    _avg?: GroupAvgAggregateInputType
    _sum?: GroupSumAggregateInputType
    _min?: GroupMinAggregateInputType
    _max?: GroupMaxAggregateInputType
  }

  export type GroupGroupByOutputType = {
    id: string
    groupId: string
    subject: string
    visible: boolean
    link: string
    publicFeatures: JsonValue
    accessFeatures: $Enums.accessFeatures
    joinApprovalMode: boolean
    maxStrike: number
    wordBlocker: JsonValue
    antiMention: JsonValue
    welcome: JsonValue
    activityScore: boolean
    lang: string
    createdAt: Date
    updatedAt: Date
    _count: GroupCountAggregateOutputType | null
    _avg: GroupAvgAggregateOutputType | null
    _sum: GroupSumAggregateOutputType | null
    _min: GroupMinAggregateOutputType | null
    _max: GroupMaxAggregateOutputType | null
  }

  type GetGroupGroupByPayload<T extends GroupGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GroupGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GroupGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GroupGroupByOutputType[P]>
            : GetScalarType<T[P], GroupGroupByOutputType[P]>
        }
      >
    >


  export type GroupSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    groupId?: boolean
    subject?: boolean
    visible?: boolean
    link?: boolean
    publicFeatures?: boolean
    accessFeatures?: boolean
    joinApprovalMode?: boolean
    maxStrike?: boolean
    wordBlocker?: boolean
    antiMention?: boolean
    welcome?: boolean
    activityScore?: boolean
    lang?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    participants?: boolean | Group$participantsArgs<ExtArgs>
    _count?: boolean | GroupCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["group"]>



  export type GroupSelectScalar = {
    id?: boolean
    groupId?: boolean
    subject?: boolean
    visible?: boolean
    link?: boolean
    publicFeatures?: boolean
    accessFeatures?: boolean
    joinApprovalMode?: boolean
    maxStrike?: boolean
    wordBlocker?: boolean
    antiMention?: boolean
    welcome?: boolean
    activityScore?: boolean
    lang?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type GroupOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "groupId" | "subject" | "visible" | "link" | "publicFeatures" | "accessFeatures" | "joinApprovalMode" | "maxStrike" | "wordBlocker" | "antiMention" | "welcome" | "activityScore" | "lang" | "createdAt" | "updatedAt", ExtArgs["result"]["group"]>
  export type GroupInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    participants?: boolean | Group$participantsArgs<ExtArgs>
    _count?: boolean | GroupCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $GroupPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Group"
    objects: {
      participants: Prisma.$GroupParticipantPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      groupId: string
      subject: string
      visible: boolean
      link: string
      publicFeatures: Prisma.JsonValue
      accessFeatures: $Enums.accessFeatures
      joinApprovalMode: boolean
      maxStrike: number
      wordBlocker: Prisma.JsonValue
      antiMention: Prisma.JsonValue
      welcome: Prisma.JsonValue
      activityScore: boolean
      lang: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["group"]>
    composites: {}
  }

  type GroupGetPayload<S extends boolean | null | undefined | GroupDefaultArgs> = $Result.GetResult<Prisma.$GroupPayload, S>

  type GroupCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GroupFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GroupCountAggregateInputType | true
    }

  export interface GroupDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Group'], meta: { name: 'Group' } }
    /**
     * Find zero or one Group that matches the filter.
     * @param {GroupFindUniqueArgs} args - Arguments to find a Group
     * @example
     * // Get one Group
     * const group = await prisma.group.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GroupFindUniqueArgs>(args: SelectSubset<T, GroupFindUniqueArgs<ExtArgs>>): Prisma__GroupClient<$Result.GetResult<Prisma.$GroupPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Group that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GroupFindUniqueOrThrowArgs} args - Arguments to find a Group
     * @example
     * // Get one Group
     * const group = await prisma.group.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GroupFindUniqueOrThrowArgs>(args: SelectSubset<T, GroupFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GroupClient<$Result.GetResult<Prisma.$GroupPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Group that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupFindFirstArgs} args - Arguments to find a Group
     * @example
     * // Get one Group
     * const group = await prisma.group.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GroupFindFirstArgs>(args?: SelectSubset<T, GroupFindFirstArgs<ExtArgs>>): Prisma__GroupClient<$Result.GetResult<Prisma.$GroupPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Group that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupFindFirstOrThrowArgs} args - Arguments to find a Group
     * @example
     * // Get one Group
     * const group = await prisma.group.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GroupFindFirstOrThrowArgs>(args?: SelectSubset<T, GroupFindFirstOrThrowArgs<ExtArgs>>): Prisma__GroupClient<$Result.GetResult<Prisma.$GroupPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Groups that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Groups
     * const groups = await prisma.group.findMany()
     * 
     * // Get first 10 Groups
     * const groups = await prisma.group.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const groupWithIdOnly = await prisma.group.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GroupFindManyArgs>(args?: SelectSubset<T, GroupFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GroupPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Group.
     * @param {GroupCreateArgs} args - Arguments to create a Group.
     * @example
     * // Create one Group
     * const Group = await prisma.group.create({
     *   data: {
     *     // ... data to create a Group
     *   }
     * })
     * 
     */
    create<T extends GroupCreateArgs>(args: SelectSubset<T, GroupCreateArgs<ExtArgs>>): Prisma__GroupClient<$Result.GetResult<Prisma.$GroupPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Groups.
     * @param {GroupCreateManyArgs} args - Arguments to create many Groups.
     * @example
     * // Create many Groups
     * const group = await prisma.group.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GroupCreateManyArgs>(args?: SelectSubset<T, GroupCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Group.
     * @param {GroupDeleteArgs} args - Arguments to delete one Group.
     * @example
     * // Delete one Group
     * const Group = await prisma.group.delete({
     *   where: {
     *     // ... filter to delete one Group
     *   }
     * })
     * 
     */
    delete<T extends GroupDeleteArgs>(args: SelectSubset<T, GroupDeleteArgs<ExtArgs>>): Prisma__GroupClient<$Result.GetResult<Prisma.$GroupPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Group.
     * @param {GroupUpdateArgs} args - Arguments to update one Group.
     * @example
     * // Update one Group
     * const group = await prisma.group.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GroupUpdateArgs>(args: SelectSubset<T, GroupUpdateArgs<ExtArgs>>): Prisma__GroupClient<$Result.GetResult<Prisma.$GroupPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Groups.
     * @param {GroupDeleteManyArgs} args - Arguments to filter Groups to delete.
     * @example
     * // Delete a few Groups
     * const { count } = await prisma.group.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GroupDeleteManyArgs>(args?: SelectSubset<T, GroupDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Groups.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Groups
     * const group = await prisma.group.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GroupUpdateManyArgs>(args: SelectSubset<T, GroupUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Group.
     * @param {GroupUpsertArgs} args - Arguments to update or create a Group.
     * @example
     * // Update or create a Group
     * const group = await prisma.group.upsert({
     *   create: {
     *     // ... data to create a Group
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Group we want to update
     *   }
     * })
     */
    upsert<T extends GroupUpsertArgs>(args: SelectSubset<T, GroupUpsertArgs<ExtArgs>>): Prisma__GroupClient<$Result.GetResult<Prisma.$GroupPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Groups that matches the filter.
     * @param {GroupFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const group = await prisma.group.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: GroupFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Group.
     * @param {GroupAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const group = await prisma.group.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: GroupAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Groups.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupCountArgs} args - Arguments to filter Groups to count.
     * @example
     * // Count the number of Groups
     * const count = await prisma.group.count({
     *   where: {
     *     // ... the filter for the Groups we want to count
     *   }
     * })
    **/
    count<T extends GroupCountArgs>(
      args?: Subset<T, GroupCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GroupCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Group.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GroupAggregateArgs>(args: Subset<T, GroupAggregateArgs>): Prisma.PrismaPromise<GetGroupAggregateType<T>>

    /**
     * Group by Group.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GroupGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GroupGroupByArgs['orderBy'] }
        : { orderBy?: GroupGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GroupGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGroupGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Group model
   */
  readonly fields: GroupFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Group.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GroupClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    participants<T extends Group$participantsArgs<ExtArgs> = {}>(args?: Subset<T, Group$participantsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Group model
   */
  interface GroupFieldRefs {
    readonly id: FieldRef<"Group", 'String'>
    readonly groupId: FieldRef<"Group", 'String'>
    readonly subject: FieldRef<"Group", 'String'>
    readonly visible: FieldRef<"Group", 'Boolean'>
    readonly link: FieldRef<"Group", 'String'>
    readonly publicFeatures: FieldRef<"Group", 'Json'>
    readonly accessFeatures: FieldRef<"Group", 'accessFeatures'>
    readonly joinApprovalMode: FieldRef<"Group", 'Boolean'>
    readonly maxStrike: FieldRef<"Group", 'Int'>
    readonly wordBlocker: FieldRef<"Group", 'Json'>
    readonly antiMention: FieldRef<"Group", 'Json'>
    readonly welcome: FieldRef<"Group", 'Json'>
    readonly activityScore: FieldRef<"Group", 'Boolean'>
    readonly lang: FieldRef<"Group", 'String'>
    readonly createdAt: FieldRef<"Group", 'DateTime'>
    readonly updatedAt: FieldRef<"Group", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Group findUnique
   */
  export type GroupFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Group
     */
    select?: GroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Group
     */
    omit?: GroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupInclude<ExtArgs> | null
    /**
     * Filter, which Group to fetch.
     */
    where: GroupWhereUniqueInput
  }

  /**
   * Group findUniqueOrThrow
   */
  export type GroupFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Group
     */
    select?: GroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Group
     */
    omit?: GroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupInclude<ExtArgs> | null
    /**
     * Filter, which Group to fetch.
     */
    where: GroupWhereUniqueInput
  }

  /**
   * Group findFirst
   */
  export type GroupFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Group
     */
    select?: GroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Group
     */
    omit?: GroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupInclude<ExtArgs> | null
    /**
     * Filter, which Group to fetch.
     */
    where?: GroupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Groups to fetch.
     */
    orderBy?: GroupOrderByWithRelationInput | GroupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Groups.
     */
    cursor?: GroupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Groups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Groups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Groups.
     */
    distinct?: GroupScalarFieldEnum | GroupScalarFieldEnum[]
  }

  /**
   * Group findFirstOrThrow
   */
  export type GroupFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Group
     */
    select?: GroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Group
     */
    omit?: GroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupInclude<ExtArgs> | null
    /**
     * Filter, which Group to fetch.
     */
    where?: GroupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Groups to fetch.
     */
    orderBy?: GroupOrderByWithRelationInput | GroupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Groups.
     */
    cursor?: GroupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Groups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Groups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Groups.
     */
    distinct?: GroupScalarFieldEnum | GroupScalarFieldEnum[]
  }

  /**
   * Group findMany
   */
  export type GroupFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Group
     */
    select?: GroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Group
     */
    omit?: GroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupInclude<ExtArgs> | null
    /**
     * Filter, which Groups to fetch.
     */
    where?: GroupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Groups to fetch.
     */
    orderBy?: GroupOrderByWithRelationInput | GroupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Groups.
     */
    cursor?: GroupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Groups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Groups.
     */
    skip?: number
    distinct?: GroupScalarFieldEnum | GroupScalarFieldEnum[]
  }

  /**
   * Group create
   */
  export type GroupCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Group
     */
    select?: GroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Group
     */
    omit?: GroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupInclude<ExtArgs> | null
    /**
     * The data needed to create a Group.
     */
    data: XOR<GroupCreateInput, GroupUncheckedCreateInput>
  }

  /**
   * Group createMany
   */
  export type GroupCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Groups.
     */
    data: GroupCreateManyInput | GroupCreateManyInput[]
  }

  /**
   * Group update
   */
  export type GroupUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Group
     */
    select?: GroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Group
     */
    omit?: GroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupInclude<ExtArgs> | null
    /**
     * The data needed to update a Group.
     */
    data: XOR<GroupUpdateInput, GroupUncheckedUpdateInput>
    /**
     * Choose, which Group to update.
     */
    where: GroupWhereUniqueInput
  }

  /**
   * Group updateMany
   */
  export type GroupUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Groups.
     */
    data: XOR<GroupUpdateManyMutationInput, GroupUncheckedUpdateManyInput>
    /**
     * Filter which Groups to update
     */
    where?: GroupWhereInput
    /**
     * Limit how many Groups to update.
     */
    limit?: number
  }

  /**
   * Group upsert
   */
  export type GroupUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Group
     */
    select?: GroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Group
     */
    omit?: GroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupInclude<ExtArgs> | null
    /**
     * The filter to search for the Group to update in case it exists.
     */
    where: GroupWhereUniqueInput
    /**
     * In case the Group found by the `where` argument doesn't exist, create a new Group with this data.
     */
    create: XOR<GroupCreateInput, GroupUncheckedCreateInput>
    /**
     * In case the Group was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GroupUpdateInput, GroupUncheckedUpdateInput>
  }

  /**
   * Group delete
   */
  export type GroupDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Group
     */
    select?: GroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Group
     */
    omit?: GroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupInclude<ExtArgs> | null
    /**
     * Filter which Group to delete.
     */
    where: GroupWhereUniqueInput
  }

  /**
   * Group deleteMany
   */
  export type GroupDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Groups to delete
     */
    where?: GroupWhereInput
    /**
     * Limit how many Groups to delete.
     */
    limit?: number
  }

  /**
   * Group findRaw
   */
  export type GroupFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Group aggregateRaw
   */
  export type GroupAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Group.participants
   */
  export type Group$participantsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupParticipant
     */
    select?: GroupParticipantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupParticipant
     */
    omit?: GroupParticipantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupParticipantInclude<ExtArgs> | null
    where?: GroupParticipantWhereInput
    orderBy?: GroupParticipantOrderByWithRelationInput | GroupParticipantOrderByWithRelationInput[]
    cursor?: GroupParticipantWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GroupParticipantScalarFieldEnum | GroupParticipantScalarFieldEnum[]
  }

  /**
   * Group without action
   */
  export type GroupDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Group
     */
    select?: GroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Group
     */
    omit?: GroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupInclude<ExtArgs> | null
  }


  /**
   * Model GroupParticipant
   */

  export type AggregateGroupParticipant = {
    _count: GroupParticipantCountAggregateOutputType | null
    _avg: GroupParticipantAvgAggregateOutputType | null
    _sum: GroupParticipantSumAggregateOutputType | null
    _min: GroupParticipantMinAggregateOutputType | null
    _max: GroupParticipantMaxAggregateOutputType | null
  }

  export type GroupParticipantAvgAggregateOutputType = {
    strike: number | null
    score: number | null
  }

  export type GroupParticipantSumAggregateOutputType = {
    strike: number | null
    score: number | null
  }

  export type GroupParticipantMinAggregateOutputType = {
    id: string | null
    groupId: string | null
    jid: string | null
    isAdmin: boolean | null
    strike: number | null
    score: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GroupParticipantMaxAggregateOutputType = {
    id: string | null
    groupId: string | null
    jid: string | null
    isAdmin: boolean | null
    strike: number | null
    score: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GroupParticipantCountAggregateOutputType = {
    id: number
    groupId: number
    jid: number
    isAdmin: number
    strike: number
    score: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type GroupParticipantAvgAggregateInputType = {
    strike?: true
    score?: true
  }

  export type GroupParticipantSumAggregateInputType = {
    strike?: true
    score?: true
  }

  export type GroupParticipantMinAggregateInputType = {
    id?: true
    groupId?: true
    jid?: true
    isAdmin?: true
    strike?: true
    score?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GroupParticipantMaxAggregateInputType = {
    id?: true
    groupId?: true
    jid?: true
    isAdmin?: true
    strike?: true
    score?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GroupParticipantCountAggregateInputType = {
    id?: true
    groupId?: true
    jid?: true
    isAdmin?: true
    strike?: true
    score?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type GroupParticipantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GroupParticipant to aggregate.
     */
    where?: GroupParticipantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GroupParticipants to fetch.
     */
    orderBy?: GroupParticipantOrderByWithRelationInput | GroupParticipantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GroupParticipantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GroupParticipants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GroupParticipants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GroupParticipants
    **/
    _count?: true | GroupParticipantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GroupParticipantAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GroupParticipantSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GroupParticipantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GroupParticipantMaxAggregateInputType
  }

  export type GetGroupParticipantAggregateType<T extends GroupParticipantAggregateArgs> = {
        [P in keyof T & keyof AggregateGroupParticipant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGroupParticipant[P]>
      : GetScalarType<T[P], AggregateGroupParticipant[P]>
  }




  export type GroupParticipantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GroupParticipantWhereInput
    orderBy?: GroupParticipantOrderByWithAggregationInput | GroupParticipantOrderByWithAggregationInput[]
    by: GroupParticipantScalarFieldEnum[] | GroupParticipantScalarFieldEnum
    having?: GroupParticipantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GroupParticipantCountAggregateInputType | true
    _avg?: GroupParticipantAvgAggregateInputType
    _sum?: GroupParticipantSumAggregateInputType
    _min?: GroupParticipantMinAggregateInputType
    _max?: GroupParticipantMaxAggregateInputType
  }

  export type GroupParticipantGroupByOutputType = {
    id: string
    groupId: string
    jid: string
    isAdmin: boolean
    strike: number
    score: number
    createdAt: Date
    updatedAt: Date
    _count: GroupParticipantCountAggregateOutputType | null
    _avg: GroupParticipantAvgAggregateOutputType | null
    _sum: GroupParticipantSumAggregateOutputType | null
    _min: GroupParticipantMinAggregateOutputType | null
    _max: GroupParticipantMaxAggregateOutputType | null
  }

  type GetGroupParticipantGroupByPayload<T extends GroupParticipantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GroupParticipantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GroupParticipantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GroupParticipantGroupByOutputType[P]>
            : GetScalarType<T[P], GroupParticipantGroupByOutputType[P]>
        }
      >
    >


  export type GroupParticipantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    groupId?: boolean
    jid?: boolean
    isAdmin?: boolean
    strike?: boolean
    score?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    group?: boolean | GroupDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["groupParticipant"]>



  export type GroupParticipantSelectScalar = {
    id?: boolean
    groupId?: boolean
    jid?: boolean
    isAdmin?: boolean
    strike?: boolean
    score?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type GroupParticipantOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "groupId" | "jid" | "isAdmin" | "strike" | "score" | "createdAt" | "updatedAt", ExtArgs["result"]["groupParticipant"]>
  export type GroupParticipantInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    group?: boolean | GroupDefaultArgs<ExtArgs>
  }

  export type $GroupParticipantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GroupParticipant"
    objects: {
      group: Prisma.$GroupPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      groupId: string
      jid: string
      isAdmin: boolean
      strike: number
      score: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["groupParticipant"]>
    composites: {}
  }

  type GroupParticipantGetPayload<S extends boolean | null | undefined | GroupParticipantDefaultArgs> = $Result.GetResult<Prisma.$GroupParticipantPayload, S>

  type GroupParticipantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GroupParticipantFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GroupParticipantCountAggregateInputType | true
    }

  export interface GroupParticipantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GroupParticipant'], meta: { name: 'GroupParticipant' } }
    /**
     * Find zero or one GroupParticipant that matches the filter.
     * @param {GroupParticipantFindUniqueArgs} args - Arguments to find a GroupParticipant
     * @example
     * // Get one GroupParticipant
     * const groupParticipant = await prisma.groupParticipant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GroupParticipantFindUniqueArgs>(args: SelectSubset<T, GroupParticipantFindUniqueArgs<ExtArgs>>): Prisma__GroupParticipantClient<$Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one GroupParticipant that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GroupParticipantFindUniqueOrThrowArgs} args - Arguments to find a GroupParticipant
     * @example
     * // Get one GroupParticipant
     * const groupParticipant = await prisma.groupParticipant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GroupParticipantFindUniqueOrThrowArgs>(args: SelectSubset<T, GroupParticipantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GroupParticipantClient<$Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GroupParticipant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupParticipantFindFirstArgs} args - Arguments to find a GroupParticipant
     * @example
     * // Get one GroupParticipant
     * const groupParticipant = await prisma.groupParticipant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GroupParticipantFindFirstArgs>(args?: SelectSubset<T, GroupParticipantFindFirstArgs<ExtArgs>>): Prisma__GroupParticipantClient<$Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GroupParticipant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupParticipantFindFirstOrThrowArgs} args - Arguments to find a GroupParticipant
     * @example
     * // Get one GroupParticipant
     * const groupParticipant = await prisma.groupParticipant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GroupParticipantFindFirstOrThrowArgs>(args?: SelectSubset<T, GroupParticipantFindFirstOrThrowArgs<ExtArgs>>): Prisma__GroupParticipantClient<$Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GroupParticipants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupParticipantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GroupParticipants
     * const groupParticipants = await prisma.groupParticipant.findMany()
     * 
     * // Get first 10 GroupParticipants
     * const groupParticipants = await prisma.groupParticipant.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const groupParticipantWithIdOnly = await prisma.groupParticipant.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GroupParticipantFindManyArgs>(args?: SelectSubset<T, GroupParticipantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a GroupParticipant.
     * @param {GroupParticipantCreateArgs} args - Arguments to create a GroupParticipant.
     * @example
     * // Create one GroupParticipant
     * const GroupParticipant = await prisma.groupParticipant.create({
     *   data: {
     *     // ... data to create a GroupParticipant
     *   }
     * })
     * 
     */
    create<T extends GroupParticipantCreateArgs>(args: SelectSubset<T, GroupParticipantCreateArgs<ExtArgs>>): Prisma__GroupParticipantClient<$Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many GroupParticipants.
     * @param {GroupParticipantCreateManyArgs} args - Arguments to create many GroupParticipants.
     * @example
     * // Create many GroupParticipants
     * const groupParticipant = await prisma.groupParticipant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GroupParticipantCreateManyArgs>(args?: SelectSubset<T, GroupParticipantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a GroupParticipant.
     * @param {GroupParticipantDeleteArgs} args - Arguments to delete one GroupParticipant.
     * @example
     * // Delete one GroupParticipant
     * const GroupParticipant = await prisma.groupParticipant.delete({
     *   where: {
     *     // ... filter to delete one GroupParticipant
     *   }
     * })
     * 
     */
    delete<T extends GroupParticipantDeleteArgs>(args: SelectSubset<T, GroupParticipantDeleteArgs<ExtArgs>>): Prisma__GroupParticipantClient<$Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one GroupParticipant.
     * @param {GroupParticipantUpdateArgs} args - Arguments to update one GroupParticipant.
     * @example
     * // Update one GroupParticipant
     * const groupParticipant = await prisma.groupParticipant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GroupParticipantUpdateArgs>(args: SelectSubset<T, GroupParticipantUpdateArgs<ExtArgs>>): Prisma__GroupParticipantClient<$Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more GroupParticipants.
     * @param {GroupParticipantDeleteManyArgs} args - Arguments to filter GroupParticipants to delete.
     * @example
     * // Delete a few GroupParticipants
     * const { count } = await prisma.groupParticipant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GroupParticipantDeleteManyArgs>(args?: SelectSubset<T, GroupParticipantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GroupParticipants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupParticipantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GroupParticipants
     * const groupParticipant = await prisma.groupParticipant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GroupParticipantUpdateManyArgs>(args: SelectSubset<T, GroupParticipantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one GroupParticipant.
     * @param {GroupParticipantUpsertArgs} args - Arguments to update or create a GroupParticipant.
     * @example
     * // Update or create a GroupParticipant
     * const groupParticipant = await prisma.groupParticipant.upsert({
     *   create: {
     *     // ... data to create a GroupParticipant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GroupParticipant we want to update
     *   }
     * })
     */
    upsert<T extends GroupParticipantUpsertArgs>(args: SelectSubset<T, GroupParticipantUpsertArgs<ExtArgs>>): Prisma__GroupParticipantClient<$Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GroupParticipants that matches the filter.
     * @param {GroupParticipantFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const groupParticipant = await prisma.groupParticipant.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: GroupParticipantFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a GroupParticipant.
     * @param {GroupParticipantAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const groupParticipant = await prisma.groupParticipant.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: GroupParticipantAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of GroupParticipants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupParticipantCountArgs} args - Arguments to filter GroupParticipants to count.
     * @example
     * // Count the number of GroupParticipants
     * const count = await prisma.groupParticipant.count({
     *   where: {
     *     // ... the filter for the GroupParticipants we want to count
     *   }
     * })
    **/
    count<T extends GroupParticipantCountArgs>(
      args?: Subset<T, GroupParticipantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GroupParticipantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GroupParticipant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupParticipantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GroupParticipantAggregateArgs>(args: Subset<T, GroupParticipantAggregateArgs>): Prisma.PrismaPromise<GetGroupParticipantAggregateType<T>>

    /**
     * Group by GroupParticipant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupParticipantGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GroupParticipantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GroupParticipantGroupByArgs['orderBy'] }
        : { orderBy?: GroupParticipantGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GroupParticipantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGroupParticipantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GroupParticipant model
   */
  readonly fields: GroupParticipantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GroupParticipant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GroupParticipantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    group<T extends GroupDefaultArgs<ExtArgs> = {}>(args?: Subset<T, GroupDefaultArgs<ExtArgs>>): Prisma__GroupClient<$Result.GetResult<Prisma.$GroupPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GroupParticipant model
   */
  interface GroupParticipantFieldRefs {
    readonly id: FieldRef<"GroupParticipant", 'String'>
    readonly groupId: FieldRef<"GroupParticipant", 'String'>
    readonly jid: FieldRef<"GroupParticipant", 'String'>
    readonly isAdmin: FieldRef<"GroupParticipant", 'Boolean'>
    readonly strike: FieldRef<"GroupParticipant", 'Int'>
    readonly score: FieldRef<"GroupParticipant", 'Int'>
    readonly createdAt: FieldRef<"GroupParticipant", 'DateTime'>
    readonly updatedAt: FieldRef<"GroupParticipant", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GroupParticipant findUnique
   */
  export type GroupParticipantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupParticipant
     */
    select?: GroupParticipantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupParticipant
     */
    omit?: GroupParticipantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupParticipantInclude<ExtArgs> | null
    /**
     * Filter, which GroupParticipant to fetch.
     */
    where: GroupParticipantWhereUniqueInput
  }

  /**
   * GroupParticipant findUniqueOrThrow
   */
  export type GroupParticipantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupParticipant
     */
    select?: GroupParticipantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupParticipant
     */
    omit?: GroupParticipantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupParticipantInclude<ExtArgs> | null
    /**
     * Filter, which GroupParticipant to fetch.
     */
    where: GroupParticipantWhereUniqueInput
  }

  /**
   * GroupParticipant findFirst
   */
  export type GroupParticipantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupParticipant
     */
    select?: GroupParticipantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupParticipant
     */
    omit?: GroupParticipantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupParticipantInclude<ExtArgs> | null
    /**
     * Filter, which GroupParticipant to fetch.
     */
    where?: GroupParticipantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GroupParticipants to fetch.
     */
    orderBy?: GroupParticipantOrderByWithRelationInput | GroupParticipantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GroupParticipants.
     */
    cursor?: GroupParticipantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GroupParticipants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GroupParticipants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GroupParticipants.
     */
    distinct?: GroupParticipantScalarFieldEnum | GroupParticipantScalarFieldEnum[]
  }

  /**
   * GroupParticipant findFirstOrThrow
   */
  export type GroupParticipantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupParticipant
     */
    select?: GroupParticipantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupParticipant
     */
    omit?: GroupParticipantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupParticipantInclude<ExtArgs> | null
    /**
     * Filter, which GroupParticipant to fetch.
     */
    where?: GroupParticipantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GroupParticipants to fetch.
     */
    orderBy?: GroupParticipantOrderByWithRelationInput | GroupParticipantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GroupParticipants.
     */
    cursor?: GroupParticipantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GroupParticipants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GroupParticipants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GroupParticipants.
     */
    distinct?: GroupParticipantScalarFieldEnum | GroupParticipantScalarFieldEnum[]
  }

  /**
   * GroupParticipant findMany
   */
  export type GroupParticipantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupParticipant
     */
    select?: GroupParticipantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupParticipant
     */
    omit?: GroupParticipantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupParticipantInclude<ExtArgs> | null
    /**
     * Filter, which GroupParticipants to fetch.
     */
    where?: GroupParticipantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GroupParticipants to fetch.
     */
    orderBy?: GroupParticipantOrderByWithRelationInput | GroupParticipantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GroupParticipants.
     */
    cursor?: GroupParticipantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GroupParticipants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GroupParticipants.
     */
    skip?: number
    distinct?: GroupParticipantScalarFieldEnum | GroupParticipantScalarFieldEnum[]
  }

  /**
   * GroupParticipant create
   */
  export type GroupParticipantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupParticipant
     */
    select?: GroupParticipantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupParticipant
     */
    omit?: GroupParticipantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupParticipantInclude<ExtArgs> | null
    /**
     * The data needed to create a GroupParticipant.
     */
    data: XOR<GroupParticipantCreateInput, GroupParticipantUncheckedCreateInput>
  }

  /**
   * GroupParticipant createMany
   */
  export type GroupParticipantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GroupParticipants.
     */
    data: GroupParticipantCreateManyInput | GroupParticipantCreateManyInput[]
  }

  /**
   * GroupParticipant update
   */
  export type GroupParticipantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupParticipant
     */
    select?: GroupParticipantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupParticipant
     */
    omit?: GroupParticipantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupParticipantInclude<ExtArgs> | null
    /**
     * The data needed to update a GroupParticipant.
     */
    data: XOR<GroupParticipantUpdateInput, GroupParticipantUncheckedUpdateInput>
    /**
     * Choose, which GroupParticipant to update.
     */
    where: GroupParticipantWhereUniqueInput
  }

  /**
   * GroupParticipant updateMany
   */
  export type GroupParticipantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GroupParticipants.
     */
    data: XOR<GroupParticipantUpdateManyMutationInput, GroupParticipantUncheckedUpdateManyInput>
    /**
     * Filter which GroupParticipants to update
     */
    where?: GroupParticipantWhereInput
    /**
     * Limit how many GroupParticipants to update.
     */
    limit?: number
  }

  /**
   * GroupParticipant upsert
   */
  export type GroupParticipantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupParticipant
     */
    select?: GroupParticipantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupParticipant
     */
    omit?: GroupParticipantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupParticipantInclude<ExtArgs> | null
    /**
     * The filter to search for the GroupParticipant to update in case it exists.
     */
    where: GroupParticipantWhereUniqueInput
    /**
     * In case the GroupParticipant found by the `where` argument doesn't exist, create a new GroupParticipant with this data.
     */
    create: XOR<GroupParticipantCreateInput, GroupParticipantUncheckedCreateInput>
    /**
     * In case the GroupParticipant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GroupParticipantUpdateInput, GroupParticipantUncheckedUpdateInput>
  }

  /**
   * GroupParticipant delete
   */
  export type GroupParticipantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupParticipant
     */
    select?: GroupParticipantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupParticipant
     */
    omit?: GroupParticipantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupParticipantInclude<ExtArgs> | null
    /**
     * Filter which GroupParticipant to delete.
     */
    where: GroupParticipantWhereUniqueInput
  }

  /**
   * GroupParticipant deleteMany
   */
  export type GroupParticipantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GroupParticipants to delete
     */
    where?: GroupParticipantWhereInput
    /**
     * Limit how many GroupParticipants to delete.
     */
    limit?: number
  }

  /**
   * GroupParticipant findRaw
   */
  export type GroupParticipantFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * GroupParticipant aggregateRaw
   */
  export type GroupParticipantAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * GroupParticipant without action
   */
  export type GroupParticipantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupParticipant
     */
    select?: GroupParticipantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupParticipant
     */
    omit?: GroupParticipantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GroupParticipantInclude<ExtArgs> | null
  }


  /**
   * Model GroupTag
   */

  export type AggregateGroupTag = {
    _count: GroupTagCountAggregateOutputType | null
    _min: GroupTagMinAggregateOutputType | null
    _max: GroupTagMaxAggregateOutputType | null
  }

  export type GroupTagMinAggregateOutputType = {
    id: string | null
    groupId: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GroupTagMaxAggregateOutputType = {
    id: string | null
    groupId: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GroupTagCountAggregateOutputType = {
    id: number
    groupId: number
    name: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type GroupTagMinAggregateInputType = {
    id?: true
    groupId?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GroupTagMaxAggregateInputType = {
    id?: true
    groupId?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GroupTagCountAggregateInputType = {
    id?: true
    groupId?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type GroupTagAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GroupTag to aggregate.
     */
    where?: GroupTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GroupTags to fetch.
     */
    orderBy?: GroupTagOrderByWithRelationInput | GroupTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GroupTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GroupTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GroupTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GroupTags
    **/
    _count?: true | GroupTagCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GroupTagMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GroupTagMaxAggregateInputType
  }

  export type GetGroupTagAggregateType<T extends GroupTagAggregateArgs> = {
        [P in keyof T & keyof AggregateGroupTag]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGroupTag[P]>
      : GetScalarType<T[P], AggregateGroupTag[P]>
  }




  export type GroupTagGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GroupTagWhereInput
    orderBy?: GroupTagOrderByWithAggregationInput | GroupTagOrderByWithAggregationInput[]
    by: GroupTagScalarFieldEnum[] | GroupTagScalarFieldEnum
    having?: GroupTagScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GroupTagCountAggregateInputType | true
    _min?: GroupTagMinAggregateInputType
    _max?: GroupTagMaxAggregateInputType
  }

  export type GroupTagGroupByOutputType = {
    id: string
    groupId: string
    name: string
    createdAt: Date
    updatedAt: Date
    _count: GroupTagCountAggregateOutputType | null
    _min: GroupTagMinAggregateOutputType | null
    _max: GroupTagMaxAggregateOutputType | null
  }

  type GetGroupTagGroupByPayload<T extends GroupTagGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GroupTagGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GroupTagGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GroupTagGroupByOutputType[P]>
            : GetScalarType<T[P], GroupTagGroupByOutputType[P]>
        }
      >
    >


  export type GroupTagSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    groupId?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["groupTag"]>



  export type GroupTagSelectScalar = {
    id?: boolean
    groupId?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type GroupTagOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "groupId" | "name" | "createdAt" | "updatedAt", ExtArgs["result"]["groupTag"]>

  export type $GroupTagPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GroupTag"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      groupId: string
      name: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["groupTag"]>
    composites: {}
  }

  type GroupTagGetPayload<S extends boolean | null | undefined | GroupTagDefaultArgs> = $Result.GetResult<Prisma.$GroupTagPayload, S>

  type GroupTagCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GroupTagFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GroupTagCountAggregateInputType | true
    }

  export interface GroupTagDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GroupTag'], meta: { name: 'GroupTag' } }
    /**
     * Find zero or one GroupTag that matches the filter.
     * @param {GroupTagFindUniqueArgs} args - Arguments to find a GroupTag
     * @example
     * // Get one GroupTag
     * const groupTag = await prisma.groupTag.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GroupTagFindUniqueArgs>(args: SelectSubset<T, GroupTagFindUniqueArgs<ExtArgs>>): Prisma__GroupTagClient<$Result.GetResult<Prisma.$GroupTagPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one GroupTag that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GroupTagFindUniqueOrThrowArgs} args - Arguments to find a GroupTag
     * @example
     * // Get one GroupTag
     * const groupTag = await prisma.groupTag.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GroupTagFindUniqueOrThrowArgs>(args: SelectSubset<T, GroupTagFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GroupTagClient<$Result.GetResult<Prisma.$GroupTagPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GroupTag that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupTagFindFirstArgs} args - Arguments to find a GroupTag
     * @example
     * // Get one GroupTag
     * const groupTag = await prisma.groupTag.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GroupTagFindFirstArgs>(args?: SelectSubset<T, GroupTagFindFirstArgs<ExtArgs>>): Prisma__GroupTagClient<$Result.GetResult<Prisma.$GroupTagPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GroupTag that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupTagFindFirstOrThrowArgs} args - Arguments to find a GroupTag
     * @example
     * // Get one GroupTag
     * const groupTag = await prisma.groupTag.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GroupTagFindFirstOrThrowArgs>(args?: SelectSubset<T, GroupTagFindFirstOrThrowArgs<ExtArgs>>): Prisma__GroupTagClient<$Result.GetResult<Prisma.$GroupTagPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GroupTags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupTagFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GroupTags
     * const groupTags = await prisma.groupTag.findMany()
     * 
     * // Get first 10 GroupTags
     * const groupTags = await prisma.groupTag.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const groupTagWithIdOnly = await prisma.groupTag.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GroupTagFindManyArgs>(args?: SelectSubset<T, GroupTagFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GroupTagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a GroupTag.
     * @param {GroupTagCreateArgs} args - Arguments to create a GroupTag.
     * @example
     * // Create one GroupTag
     * const GroupTag = await prisma.groupTag.create({
     *   data: {
     *     // ... data to create a GroupTag
     *   }
     * })
     * 
     */
    create<T extends GroupTagCreateArgs>(args: SelectSubset<T, GroupTagCreateArgs<ExtArgs>>): Prisma__GroupTagClient<$Result.GetResult<Prisma.$GroupTagPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many GroupTags.
     * @param {GroupTagCreateManyArgs} args - Arguments to create many GroupTags.
     * @example
     * // Create many GroupTags
     * const groupTag = await prisma.groupTag.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GroupTagCreateManyArgs>(args?: SelectSubset<T, GroupTagCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a GroupTag.
     * @param {GroupTagDeleteArgs} args - Arguments to delete one GroupTag.
     * @example
     * // Delete one GroupTag
     * const GroupTag = await prisma.groupTag.delete({
     *   where: {
     *     // ... filter to delete one GroupTag
     *   }
     * })
     * 
     */
    delete<T extends GroupTagDeleteArgs>(args: SelectSubset<T, GroupTagDeleteArgs<ExtArgs>>): Prisma__GroupTagClient<$Result.GetResult<Prisma.$GroupTagPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one GroupTag.
     * @param {GroupTagUpdateArgs} args - Arguments to update one GroupTag.
     * @example
     * // Update one GroupTag
     * const groupTag = await prisma.groupTag.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GroupTagUpdateArgs>(args: SelectSubset<T, GroupTagUpdateArgs<ExtArgs>>): Prisma__GroupTagClient<$Result.GetResult<Prisma.$GroupTagPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more GroupTags.
     * @param {GroupTagDeleteManyArgs} args - Arguments to filter GroupTags to delete.
     * @example
     * // Delete a few GroupTags
     * const { count } = await prisma.groupTag.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GroupTagDeleteManyArgs>(args?: SelectSubset<T, GroupTagDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GroupTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupTagUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GroupTags
     * const groupTag = await prisma.groupTag.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GroupTagUpdateManyArgs>(args: SelectSubset<T, GroupTagUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one GroupTag.
     * @param {GroupTagUpsertArgs} args - Arguments to update or create a GroupTag.
     * @example
     * // Update or create a GroupTag
     * const groupTag = await prisma.groupTag.upsert({
     *   create: {
     *     // ... data to create a GroupTag
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GroupTag we want to update
     *   }
     * })
     */
    upsert<T extends GroupTagUpsertArgs>(args: SelectSubset<T, GroupTagUpsertArgs<ExtArgs>>): Prisma__GroupTagClient<$Result.GetResult<Prisma.$GroupTagPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GroupTags that matches the filter.
     * @param {GroupTagFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const groupTag = await prisma.groupTag.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: GroupTagFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a GroupTag.
     * @param {GroupTagAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const groupTag = await prisma.groupTag.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: GroupTagAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of GroupTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupTagCountArgs} args - Arguments to filter GroupTags to count.
     * @example
     * // Count the number of GroupTags
     * const count = await prisma.groupTag.count({
     *   where: {
     *     // ... the filter for the GroupTags we want to count
     *   }
     * })
    **/
    count<T extends GroupTagCountArgs>(
      args?: Subset<T, GroupTagCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GroupTagCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GroupTag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupTagAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GroupTagAggregateArgs>(args: Subset<T, GroupTagAggregateArgs>): Prisma.PrismaPromise<GetGroupTagAggregateType<T>>

    /**
     * Group by GroupTag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupTagGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GroupTagGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GroupTagGroupByArgs['orderBy'] }
        : { orderBy?: GroupTagGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GroupTagGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGroupTagGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GroupTag model
   */
  readonly fields: GroupTagFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GroupTag.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GroupTagClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GroupTag model
   */
  interface GroupTagFieldRefs {
    readonly id: FieldRef<"GroupTag", 'String'>
    readonly groupId: FieldRef<"GroupTag", 'String'>
    readonly name: FieldRef<"GroupTag", 'String'>
    readonly createdAt: FieldRef<"GroupTag", 'DateTime'>
    readonly updatedAt: FieldRef<"GroupTag", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GroupTag findUnique
   */
  export type GroupTagFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupTag
     */
    select?: GroupTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupTag
     */
    omit?: GroupTagOmit<ExtArgs> | null
    /**
     * Filter, which GroupTag to fetch.
     */
    where: GroupTagWhereUniqueInput
  }

  /**
   * GroupTag findUniqueOrThrow
   */
  export type GroupTagFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupTag
     */
    select?: GroupTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupTag
     */
    omit?: GroupTagOmit<ExtArgs> | null
    /**
     * Filter, which GroupTag to fetch.
     */
    where: GroupTagWhereUniqueInput
  }

  /**
   * GroupTag findFirst
   */
  export type GroupTagFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupTag
     */
    select?: GroupTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupTag
     */
    omit?: GroupTagOmit<ExtArgs> | null
    /**
     * Filter, which GroupTag to fetch.
     */
    where?: GroupTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GroupTags to fetch.
     */
    orderBy?: GroupTagOrderByWithRelationInput | GroupTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GroupTags.
     */
    cursor?: GroupTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GroupTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GroupTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GroupTags.
     */
    distinct?: GroupTagScalarFieldEnum | GroupTagScalarFieldEnum[]
  }

  /**
   * GroupTag findFirstOrThrow
   */
  export type GroupTagFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupTag
     */
    select?: GroupTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupTag
     */
    omit?: GroupTagOmit<ExtArgs> | null
    /**
     * Filter, which GroupTag to fetch.
     */
    where?: GroupTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GroupTags to fetch.
     */
    orderBy?: GroupTagOrderByWithRelationInput | GroupTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GroupTags.
     */
    cursor?: GroupTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GroupTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GroupTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GroupTags.
     */
    distinct?: GroupTagScalarFieldEnum | GroupTagScalarFieldEnum[]
  }

  /**
   * GroupTag findMany
   */
  export type GroupTagFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupTag
     */
    select?: GroupTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupTag
     */
    omit?: GroupTagOmit<ExtArgs> | null
    /**
     * Filter, which GroupTags to fetch.
     */
    where?: GroupTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GroupTags to fetch.
     */
    orderBy?: GroupTagOrderByWithRelationInput | GroupTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GroupTags.
     */
    cursor?: GroupTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GroupTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GroupTags.
     */
    skip?: number
    distinct?: GroupTagScalarFieldEnum | GroupTagScalarFieldEnum[]
  }

  /**
   * GroupTag create
   */
  export type GroupTagCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupTag
     */
    select?: GroupTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupTag
     */
    omit?: GroupTagOmit<ExtArgs> | null
    /**
     * The data needed to create a GroupTag.
     */
    data: XOR<GroupTagCreateInput, GroupTagUncheckedCreateInput>
  }

  /**
   * GroupTag createMany
   */
  export type GroupTagCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GroupTags.
     */
    data: GroupTagCreateManyInput | GroupTagCreateManyInput[]
  }

  /**
   * GroupTag update
   */
  export type GroupTagUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupTag
     */
    select?: GroupTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupTag
     */
    omit?: GroupTagOmit<ExtArgs> | null
    /**
     * The data needed to update a GroupTag.
     */
    data: XOR<GroupTagUpdateInput, GroupTagUncheckedUpdateInput>
    /**
     * Choose, which GroupTag to update.
     */
    where: GroupTagWhereUniqueInput
  }

  /**
   * GroupTag updateMany
   */
  export type GroupTagUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GroupTags.
     */
    data: XOR<GroupTagUpdateManyMutationInput, GroupTagUncheckedUpdateManyInput>
    /**
     * Filter which GroupTags to update
     */
    where?: GroupTagWhereInput
    /**
     * Limit how many GroupTags to update.
     */
    limit?: number
  }

  /**
   * GroupTag upsert
   */
  export type GroupTagUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupTag
     */
    select?: GroupTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupTag
     */
    omit?: GroupTagOmit<ExtArgs> | null
    /**
     * The filter to search for the GroupTag to update in case it exists.
     */
    where: GroupTagWhereUniqueInput
    /**
     * In case the GroupTag found by the `where` argument doesn't exist, create a new GroupTag with this data.
     */
    create: XOR<GroupTagCreateInput, GroupTagUncheckedCreateInput>
    /**
     * In case the GroupTag was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GroupTagUpdateInput, GroupTagUncheckedUpdateInput>
  }

  /**
   * GroupTag delete
   */
  export type GroupTagDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupTag
     */
    select?: GroupTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupTag
     */
    omit?: GroupTagOmit<ExtArgs> | null
    /**
     * Filter which GroupTag to delete.
     */
    where: GroupTagWhereUniqueInput
  }

  /**
   * GroupTag deleteMany
   */
  export type GroupTagDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GroupTags to delete
     */
    where?: GroupTagWhereInput
    /**
     * Limit how many GroupTags to delete.
     */
    limit?: number
  }

  /**
   * GroupTag findRaw
   */
  export type GroupTagFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * GroupTag aggregateRaw
   */
  export type GroupTagAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * GroupTag without action
   */
  export type GroupTagDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupTag
     */
    select?: GroupTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GroupTag
     */
    omit?: GroupTagOmit<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    exp: number | null
  }

  export type UserSumAggregateOutputType = {
    exp: number | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    jid: string | null
    pushName: string | null
    exp: number | null
    token: string | null
    lang: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    jid: string | null
    pushName: string | null
    exp: number | null
    token: string | null
    lang: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    jid: number
    pushName: number
    exp: number
    subscription: number
    banStatus: number
    token: number
    lang: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    exp?: true
  }

  export type UserSumAggregateInputType = {
    exp?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    jid?: true
    pushName?: true
    exp?: true
    token?: true
    lang?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    jid?: true
    pushName?: true
    exp?: true
    token?: true
    lang?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    jid?: true
    pushName?: true
    exp?: true
    subscription?: true
    banStatus?: true
    token?: true
    lang?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    jid: string
    pushName: string | null
    exp: number
    subscription: JsonValue
    banStatus: JsonValue
    token: string
    lang: string
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jid?: boolean
    pushName?: boolean
    exp?: boolean
    subscription?: boolean
    banStatus?: boolean
    token?: boolean
    lang?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>



  export type UserSelectScalar = {
    id?: boolean
    jid?: boolean
    pushName?: boolean
    exp?: boolean
    subscription?: boolean
    banStatus?: boolean
    token?: boolean
    lang?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "jid" | "pushName" | "exp" | "subscription" | "banStatus" | "token" | "lang" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      jid: string
      pushName: string | null
      exp: number
      subscription: Prisma.JsonValue
      banStatus: Prisma.JsonValue
      token: string
      lang: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * @param {UserFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const user = await prisma.user.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: UserFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a User.
     * @param {UserAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const user = await prisma.user.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: UserAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly jid: FieldRef<"User", 'String'>
    readonly pushName: FieldRef<"User", 'String'>
    readonly exp: FieldRef<"User", 'Int'>
    readonly subscription: FieldRef<"User", 'Json'>
    readonly banStatus: FieldRef<"User", 'Json'>
    readonly token: FieldRef<"User", 'String'>
    readonly lang: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User findRaw
   */
  export type UserFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * User aggregateRaw
   */
  export type UserAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const DeviceAuthScalarFieldEnum: {
    id: 'id',
    session: 'session',
    key: 'key',
    value: 'value'
  };

  export type DeviceAuthScalarFieldEnum = (typeof DeviceAuthScalarFieldEnum)[keyof typeof DeviceAuthScalarFieldEnum]


  export const BotScalarFieldEnum: {
    id: 'id',
    prefixs: 'prefixs',
    owners: 'owners',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BotScalarFieldEnum = (typeof BotScalarFieldEnum)[keyof typeof BotScalarFieldEnum]


  export const GroupScalarFieldEnum: {
    id: 'id',
    groupId: 'groupId',
    subject: 'subject',
    visible: 'visible',
    link: 'link',
    publicFeatures: 'publicFeatures',
    accessFeatures: 'accessFeatures',
    joinApprovalMode: 'joinApprovalMode',
    maxStrike: 'maxStrike',
    wordBlocker: 'wordBlocker',
    antiMention: 'antiMention',
    welcome: 'welcome',
    activityScore: 'activityScore',
    lang: 'lang',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type GroupScalarFieldEnum = (typeof GroupScalarFieldEnum)[keyof typeof GroupScalarFieldEnum]


  export const GroupParticipantScalarFieldEnum: {
    id: 'id',
    groupId: 'groupId',
    jid: 'jid',
    isAdmin: 'isAdmin',
    strike: 'strike',
    score: 'score',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type GroupParticipantScalarFieldEnum = (typeof GroupParticipantScalarFieldEnum)[keyof typeof GroupParticipantScalarFieldEnum]


  export const GroupTagScalarFieldEnum: {
    id: 'id',
    groupId: 'groupId',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type GroupTagScalarFieldEnum = (typeof GroupTagScalarFieldEnum)[keyof typeof GroupTagScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    jid: 'jid',
    pushName: 'pushName',
    exp: 'exp',
    subscription: 'subscription',
    banStatus: 'banStatus',
    token: 'token',
    lang: 'lang',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'accessFeatures'
   */
  export type EnumaccessFeaturesFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'accessFeatures'>
    


  /**
   * Reference to a field of type 'accessFeatures[]'
   */
  export type ListEnumaccessFeaturesFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'accessFeatures[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type DeviceAuthWhereInput = {
    AND?: DeviceAuthWhereInput | DeviceAuthWhereInput[]
    OR?: DeviceAuthWhereInput[]
    NOT?: DeviceAuthWhereInput | DeviceAuthWhereInput[]
    id?: StringFilter<"DeviceAuth"> | string
    session?: StringFilter<"DeviceAuth"> | string
    key?: StringFilter<"DeviceAuth"> | string
    value?: JsonNullableFilter<"DeviceAuth">
  }

  export type DeviceAuthOrderByWithRelationInput = {
    id?: SortOrder
    session?: SortOrder
    key?: SortOrder
    value?: SortOrder
  }

  export type DeviceAuthWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    session_key?: DeviceAuthSessionKeyCompoundUniqueInput
    AND?: DeviceAuthWhereInput | DeviceAuthWhereInput[]
    OR?: DeviceAuthWhereInput[]
    NOT?: DeviceAuthWhereInput | DeviceAuthWhereInput[]
    session?: StringFilter<"DeviceAuth"> | string
    key?: StringFilter<"DeviceAuth"> | string
    value?: JsonNullableFilter<"DeviceAuth">
  }, "id" | "session_key">

  export type DeviceAuthOrderByWithAggregationInput = {
    id?: SortOrder
    session?: SortOrder
    key?: SortOrder
    value?: SortOrder
    _count?: DeviceAuthCountOrderByAggregateInput
    _max?: DeviceAuthMaxOrderByAggregateInput
    _min?: DeviceAuthMinOrderByAggregateInput
  }

  export type DeviceAuthScalarWhereWithAggregatesInput = {
    AND?: DeviceAuthScalarWhereWithAggregatesInput | DeviceAuthScalarWhereWithAggregatesInput[]
    OR?: DeviceAuthScalarWhereWithAggregatesInput[]
    NOT?: DeviceAuthScalarWhereWithAggregatesInput | DeviceAuthScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DeviceAuth"> | string
    session?: StringWithAggregatesFilter<"DeviceAuth"> | string
    key?: StringWithAggregatesFilter<"DeviceAuth"> | string
    value?: JsonNullableWithAggregatesFilter<"DeviceAuth">
  }

  export type BotWhereInput = {
    AND?: BotWhereInput | BotWhereInput[]
    OR?: BotWhereInput[]
    NOT?: BotWhereInput | BotWhereInput[]
    id?: StringFilter<"Bot"> | string
    prefixs?: JsonFilter<"Bot">
    owners?: JsonFilter<"Bot">
    createdAt?: DateTimeFilter<"Bot"> | Date | string
    updatedAt?: DateTimeFilter<"Bot"> | Date | string
  }

  export type BotOrderByWithRelationInput = {
    id?: SortOrder
    prefixs?: SortOrder
    owners?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BotWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: BotWhereInput | BotWhereInput[]
    OR?: BotWhereInput[]
    NOT?: BotWhereInput | BotWhereInput[]
    prefixs?: JsonFilter<"Bot">
    owners?: JsonFilter<"Bot">
    createdAt?: DateTimeFilter<"Bot"> | Date | string
    updatedAt?: DateTimeFilter<"Bot"> | Date | string
  }, "id">

  export type BotOrderByWithAggregationInput = {
    id?: SortOrder
    prefixs?: SortOrder
    owners?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BotCountOrderByAggregateInput
    _max?: BotMaxOrderByAggregateInput
    _min?: BotMinOrderByAggregateInput
  }

  export type BotScalarWhereWithAggregatesInput = {
    AND?: BotScalarWhereWithAggregatesInput | BotScalarWhereWithAggregatesInput[]
    OR?: BotScalarWhereWithAggregatesInput[]
    NOT?: BotScalarWhereWithAggregatesInput | BotScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Bot"> | string
    prefixs?: JsonWithAggregatesFilter<"Bot">
    owners?: JsonWithAggregatesFilter<"Bot">
    createdAt?: DateTimeWithAggregatesFilter<"Bot"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Bot"> | Date | string
  }

  export type GroupWhereInput = {
    AND?: GroupWhereInput | GroupWhereInput[]
    OR?: GroupWhereInput[]
    NOT?: GroupWhereInput | GroupWhereInput[]
    id?: StringFilter<"Group"> | string
    groupId?: StringFilter<"Group"> | string
    subject?: StringFilter<"Group"> | string
    visible?: BoolFilter<"Group"> | boolean
    link?: StringFilter<"Group"> | string
    publicFeatures?: JsonFilter<"Group">
    accessFeatures?: EnumaccessFeaturesFilter<"Group"> | $Enums.accessFeatures
    joinApprovalMode?: BoolFilter<"Group"> | boolean
    maxStrike?: IntFilter<"Group"> | number
    wordBlocker?: JsonFilter<"Group">
    antiMention?: JsonFilter<"Group">
    welcome?: JsonFilter<"Group">
    activityScore?: BoolFilter<"Group"> | boolean
    lang?: StringFilter<"Group"> | string
    createdAt?: DateTimeFilter<"Group"> | Date | string
    updatedAt?: DateTimeFilter<"Group"> | Date | string
    participants?: GroupParticipantListRelationFilter
  }

  export type GroupOrderByWithRelationInput = {
    id?: SortOrder
    groupId?: SortOrder
    subject?: SortOrder
    visible?: SortOrder
    link?: SortOrder
    publicFeatures?: SortOrder
    accessFeatures?: SortOrder
    joinApprovalMode?: SortOrder
    maxStrike?: SortOrder
    wordBlocker?: SortOrder
    antiMention?: SortOrder
    welcome?: SortOrder
    activityScore?: SortOrder
    lang?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    participants?: GroupParticipantOrderByRelationAggregateInput
  }

  export type GroupWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    groupId?: string
    AND?: GroupWhereInput | GroupWhereInput[]
    OR?: GroupWhereInput[]
    NOT?: GroupWhereInput | GroupWhereInput[]
    subject?: StringFilter<"Group"> | string
    visible?: BoolFilter<"Group"> | boolean
    link?: StringFilter<"Group"> | string
    publicFeatures?: JsonFilter<"Group">
    accessFeatures?: EnumaccessFeaturesFilter<"Group"> | $Enums.accessFeatures
    joinApprovalMode?: BoolFilter<"Group"> | boolean
    maxStrike?: IntFilter<"Group"> | number
    wordBlocker?: JsonFilter<"Group">
    antiMention?: JsonFilter<"Group">
    welcome?: JsonFilter<"Group">
    activityScore?: BoolFilter<"Group"> | boolean
    lang?: StringFilter<"Group"> | string
    createdAt?: DateTimeFilter<"Group"> | Date | string
    updatedAt?: DateTimeFilter<"Group"> | Date | string
    participants?: GroupParticipantListRelationFilter
  }, "id" | "groupId">

  export type GroupOrderByWithAggregationInput = {
    id?: SortOrder
    groupId?: SortOrder
    subject?: SortOrder
    visible?: SortOrder
    link?: SortOrder
    publicFeatures?: SortOrder
    accessFeatures?: SortOrder
    joinApprovalMode?: SortOrder
    maxStrike?: SortOrder
    wordBlocker?: SortOrder
    antiMention?: SortOrder
    welcome?: SortOrder
    activityScore?: SortOrder
    lang?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: GroupCountOrderByAggregateInput
    _avg?: GroupAvgOrderByAggregateInput
    _max?: GroupMaxOrderByAggregateInput
    _min?: GroupMinOrderByAggregateInput
    _sum?: GroupSumOrderByAggregateInput
  }

  export type GroupScalarWhereWithAggregatesInput = {
    AND?: GroupScalarWhereWithAggregatesInput | GroupScalarWhereWithAggregatesInput[]
    OR?: GroupScalarWhereWithAggregatesInput[]
    NOT?: GroupScalarWhereWithAggregatesInput | GroupScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Group"> | string
    groupId?: StringWithAggregatesFilter<"Group"> | string
    subject?: StringWithAggregatesFilter<"Group"> | string
    visible?: BoolWithAggregatesFilter<"Group"> | boolean
    link?: StringWithAggregatesFilter<"Group"> | string
    publicFeatures?: JsonWithAggregatesFilter<"Group">
    accessFeatures?: EnumaccessFeaturesWithAggregatesFilter<"Group"> | $Enums.accessFeatures
    joinApprovalMode?: BoolWithAggregatesFilter<"Group"> | boolean
    maxStrike?: IntWithAggregatesFilter<"Group"> | number
    wordBlocker?: JsonWithAggregatesFilter<"Group">
    antiMention?: JsonWithAggregatesFilter<"Group">
    welcome?: JsonWithAggregatesFilter<"Group">
    activityScore?: BoolWithAggregatesFilter<"Group"> | boolean
    lang?: StringWithAggregatesFilter<"Group"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Group"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Group"> | Date | string
  }

  export type GroupParticipantWhereInput = {
    AND?: GroupParticipantWhereInput | GroupParticipantWhereInput[]
    OR?: GroupParticipantWhereInput[]
    NOT?: GroupParticipantWhereInput | GroupParticipantWhereInput[]
    id?: StringFilter<"GroupParticipant"> | string
    groupId?: StringFilter<"GroupParticipant"> | string
    jid?: StringFilter<"GroupParticipant"> | string
    isAdmin?: BoolFilter<"GroupParticipant"> | boolean
    strike?: IntFilter<"GroupParticipant"> | number
    score?: IntFilter<"GroupParticipant"> | number
    createdAt?: DateTimeFilter<"GroupParticipant"> | Date | string
    updatedAt?: DateTimeFilter<"GroupParticipant"> | Date | string
    group?: XOR<GroupScalarRelationFilter, GroupWhereInput>
  }

  export type GroupParticipantOrderByWithRelationInput = {
    id?: SortOrder
    groupId?: SortOrder
    jid?: SortOrder
    isAdmin?: SortOrder
    strike?: SortOrder
    score?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    group?: GroupOrderByWithRelationInput
  }

  export type GroupParticipantWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    groupId_jid?: GroupParticipantGroupIdJidCompoundUniqueInput
    AND?: GroupParticipantWhereInput | GroupParticipantWhereInput[]
    OR?: GroupParticipantWhereInput[]
    NOT?: GroupParticipantWhereInput | GroupParticipantWhereInput[]
    groupId?: StringFilter<"GroupParticipant"> | string
    jid?: StringFilter<"GroupParticipant"> | string
    isAdmin?: BoolFilter<"GroupParticipant"> | boolean
    strike?: IntFilter<"GroupParticipant"> | number
    score?: IntFilter<"GroupParticipant"> | number
    createdAt?: DateTimeFilter<"GroupParticipant"> | Date | string
    updatedAt?: DateTimeFilter<"GroupParticipant"> | Date | string
    group?: XOR<GroupScalarRelationFilter, GroupWhereInput>
  }, "id" | "groupId_jid">

  export type GroupParticipantOrderByWithAggregationInput = {
    id?: SortOrder
    groupId?: SortOrder
    jid?: SortOrder
    isAdmin?: SortOrder
    strike?: SortOrder
    score?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: GroupParticipantCountOrderByAggregateInput
    _avg?: GroupParticipantAvgOrderByAggregateInput
    _max?: GroupParticipantMaxOrderByAggregateInput
    _min?: GroupParticipantMinOrderByAggregateInput
    _sum?: GroupParticipantSumOrderByAggregateInput
  }

  export type GroupParticipantScalarWhereWithAggregatesInput = {
    AND?: GroupParticipantScalarWhereWithAggregatesInput | GroupParticipantScalarWhereWithAggregatesInput[]
    OR?: GroupParticipantScalarWhereWithAggregatesInput[]
    NOT?: GroupParticipantScalarWhereWithAggregatesInput | GroupParticipantScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GroupParticipant"> | string
    groupId?: StringWithAggregatesFilter<"GroupParticipant"> | string
    jid?: StringWithAggregatesFilter<"GroupParticipant"> | string
    isAdmin?: BoolWithAggregatesFilter<"GroupParticipant"> | boolean
    strike?: IntWithAggregatesFilter<"GroupParticipant"> | number
    score?: IntWithAggregatesFilter<"GroupParticipant"> | number
    createdAt?: DateTimeWithAggregatesFilter<"GroupParticipant"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"GroupParticipant"> | Date | string
  }

  export type GroupTagWhereInput = {
    AND?: GroupTagWhereInput | GroupTagWhereInput[]
    OR?: GroupTagWhereInput[]
    NOT?: GroupTagWhereInput | GroupTagWhereInput[]
    id?: StringFilter<"GroupTag"> | string
    groupId?: StringFilter<"GroupTag"> | string
    name?: StringFilter<"GroupTag"> | string
    createdAt?: DateTimeFilter<"GroupTag"> | Date | string
    updatedAt?: DateTimeFilter<"GroupTag"> | Date | string
  }

  export type GroupTagOrderByWithRelationInput = {
    id?: SortOrder
    groupId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GroupTagWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: GroupTagWhereInput | GroupTagWhereInput[]
    OR?: GroupTagWhereInput[]
    NOT?: GroupTagWhereInput | GroupTagWhereInput[]
    groupId?: StringFilter<"GroupTag"> | string
    name?: StringFilter<"GroupTag"> | string
    createdAt?: DateTimeFilter<"GroupTag"> | Date | string
    updatedAt?: DateTimeFilter<"GroupTag"> | Date | string
  }, "id">

  export type GroupTagOrderByWithAggregationInput = {
    id?: SortOrder
    groupId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: GroupTagCountOrderByAggregateInput
    _max?: GroupTagMaxOrderByAggregateInput
    _min?: GroupTagMinOrderByAggregateInput
  }

  export type GroupTagScalarWhereWithAggregatesInput = {
    AND?: GroupTagScalarWhereWithAggregatesInput | GroupTagScalarWhereWithAggregatesInput[]
    OR?: GroupTagScalarWhereWithAggregatesInput[]
    NOT?: GroupTagScalarWhereWithAggregatesInput | GroupTagScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GroupTag"> | string
    groupId?: StringWithAggregatesFilter<"GroupTag"> | string
    name?: StringWithAggregatesFilter<"GroupTag"> | string
    createdAt?: DateTimeWithAggregatesFilter<"GroupTag"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"GroupTag"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    jid?: StringFilter<"User"> | string
    pushName?: StringNullableFilter<"User"> | string | null
    exp?: IntFilter<"User"> | number
    subscription?: JsonFilter<"User">
    banStatus?: JsonFilter<"User">
    token?: StringFilter<"User"> | string
    lang?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    jid?: SortOrder
    pushName?: SortOrder
    exp?: SortOrder
    subscription?: SortOrder
    banStatus?: SortOrder
    token?: SortOrder
    lang?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    jid?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    pushName?: StringNullableFilter<"User"> | string | null
    exp?: IntFilter<"User"> | number
    subscription?: JsonFilter<"User">
    banStatus?: JsonFilter<"User">
    token?: StringFilter<"User"> | string
    lang?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
  }, "id" | "jid">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    jid?: SortOrder
    pushName?: SortOrder
    exp?: SortOrder
    subscription?: SortOrder
    banStatus?: SortOrder
    token?: SortOrder
    lang?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    jid?: StringWithAggregatesFilter<"User"> | string
    pushName?: StringNullableWithAggregatesFilter<"User"> | string | null
    exp?: IntWithAggregatesFilter<"User"> | number
    subscription?: JsonWithAggregatesFilter<"User">
    banStatus?: JsonWithAggregatesFilter<"User">
    token?: StringWithAggregatesFilter<"User"> | string
    lang?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type DeviceAuthCreateInput = {
    id?: string
    session: string
    key: string
    value?: InputJsonValue | null
  }

  export type DeviceAuthUncheckedCreateInput = {
    id?: string
    session: string
    key: string
    value?: InputJsonValue | null
  }

  export type DeviceAuthUpdateInput = {
    session?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: InputJsonValue | InputJsonValue | null
  }

  export type DeviceAuthUncheckedUpdateInput = {
    session?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: InputJsonValue | InputJsonValue | null
  }

  export type DeviceAuthCreateManyInput = {
    id?: string
    session: string
    key: string
    value?: InputJsonValue | null
  }

  export type DeviceAuthUpdateManyMutationInput = {
    session?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: InputJsonValue | InputJsonValue | null
  }

  export type DeviceAuthUncheckedUpdateManyInput = {
    session?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: InputJsonValue | InputJsonValue | null
  }

  export type BotCreateInput = {
    id?: string
    prefixs: InputJsonValue
    owners: InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BotUncheckedCreateInput = {
    id?: string
    prefixs: InputJsonValue
    owners: InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BotUpdateInput = {
    prefixs?: InputJsonValue | InputJsonValue
    owners?: InputJsonValue | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BotUncheckedUpdateInput = {
    prefixs?: InputJsonValue | InputJsonValue
    owners?: InputJsonValue | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BotCreateManyInput = {
    id?: string
    prefixs: InputJsonValue
    owners: InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BotUpdateManyMutationInput = {
    prefixs?: InputJsonValue | InputJsonValue
    owners?: InputJsonValue | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BotUncheckedUpdateManyInput = {
    prefixs?: InputJsonValue | InputJsonValue
    owners?: InputJsonValue | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GroupCreateInput = {
    id?: string
    groupId: string
    subject: string
    visible?: boolean
    link?: string
    publicFeatures?: InputJsonValue
    accessFeatures?: $Enums.accessFeatures
    joinApprovalMode: boolean
    maxStrike: number
    wordBlocker: InputJsonValue
    antiMention: InputJsonValue
    welcome: InputJsonValue
    activityScore: boolean
    lang?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    participants?: GroupParticipantCreateNestedManyWithoutGroupInput
  }

  export type GroupUncheckedCreateInput = {
    id?: string
    groupId: string
    subject: string
    visible?: boolean
    link?: string
    publicFeatures?: InputJsonValue
    accessFeatures?: $Enums.accessFeatures
    joinApprovalMode: boolean
    maxStrike: number
    wordBlocker: InputJsonValue
    antiMention: InputJsonValue
    welcome: InputJsonValue
    activityScore: boolean
    lang?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    participants?: GroupParticipantUncheckedCreateNestedManyWithoutGroupInput
  }

  export type GroupUpdateInput = {
    groupId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    visible?: BoolFieldUpdateOperationsInput | boolean
    link?: StringFieldUpdateOperationsInput | string
    publicFeatures?: InputJsonValue | InputJsonValue
    accessFeatures?: EnumaccessFeaturesFieldUpdateOperationsInput | $Enums.accessFeatures
    joinApprovalMode?: BoolFieldUpdateOperationsInput | boolean
    maxStrike?: IntFieldUpdateOperationsInput | number
    wordBlocker?: InputJsonValue | InputJsonValue
    antiMention?: InputJsonValue | InputJsonValue
    welcome?: InputJsonValue | InputJsonValue
    activityScore?: BoolFieldUpdateOperationsInput | boolean
    lang?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    participants?: GroupParticipantUpdateManyWithoutGroupNestedInput
  }

  export type GroupUncheckedUpdateInput = {
    groupId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    visible?: BoolFieldUpdateOperationsInput | boolean
    link?: StringFieldUpdateOperationsInput | string
    publicFeatures?: InputJsonValue | InputJsonValue
    accessFeatures?: EnumaccessFeaturesFieldUpdateOperationsInput | $Enums.accessFeatures
    joinApprovalMode?: BoolFieldUpdateOperationsInput | boolean
    maxStrike?: IntFieldUpdateOperationsInput | number
    wordBlocker?: InputJsonValue | InputJsonValue
    antiMention?: InputJsonValue | InputJsonValue
    welcome?: InputJsonValue | InputJsonValue
    activityScore?: BoolFieldUpdateOperationsInput | boolean
    lang?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    participants?: GroupParticipantUncheckedUpdateManyWithoutGroupNestedInput
  }

  export type GroupCreateManyInput = {
    id?: string
    groupId: string
    subject: string
    visible?: boolean
    link?: string
    publicFeatures?: InputJsonValue
    accessFeatures?: $Enums.accessFeatures
    joinApprovalMode: boolean
    maxStrike: number
    wordBlocker: InputJsonValue
    antiMention: InputJsonValue
    welcome: InputJsonValue
    activityScore: boolean
    lang?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GroupUpdateManyMutationInput = {
    groupId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    visible?: BoolFieldUpdateOperationsInput | boolean
    link?: StringFieldUpdateOperationsInput | string
    publicFeatures?: InputJsonValue | InputJsonValue
    accessFeatures?: EnumaccessFeaturesFieldUpdateOperationsInput | $Enums.accessFeatures
    joinApprovalMode?: BoolFieldUpdateOperationsInput | boolean
    maxStrike?: IntFieldUpdateOperationsInput | number
    wordBlocker?: InputJsonValue | InputJsonValue
    antiMention?: InputJsonValue | InputJsonValue
    welcome?: InputJsonValue | InputJsonValue
    activityScore?: BoolFieldUpdateOperationsInput | boolean
    lang?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GroupUncheckedUpdateManyInput = {
    groupId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    visible?: BoolFieldUpdateOperationsInput | boolean
    link?: StringFieldUpdateOperationsInput | string
    publicFeatures?: InputJsonValue | InputJsonValue
    accessFeatures?: EnumaccessFeaturesFieldUpdateOperationsInput | $Enums.accessFeatures
    joinApprovalMode?: BoolFieldUpdateOperationsInput | boolean
    maxStrike?: IntFieldUpdateOperationsInput | number
    wordBlocker?: InputJsonValue | InputJsonValue
    antiMention?: InputJsonValue | InputJsonValue
    welcome?: InputJsonValue | InputJsonValue
    activityScore?: BoolFieldUpdateOperationsInput | boolean
    lang?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GroupParticipantCreateInput = {
    id?: string
    jid: string
    isAdmin: boolean
    strike: number
    score?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    group: GroupCreateNestedOneWithoutParticipantsInput
  }

  export type GroupParticipantUncheckedCreateInput = {
    id?: string
    groupId: string
    jid: string
    isAdmin: boolean
    strike: number
    score?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GroupParticipantUpdateInput = {
    jid?: StringFieldUpdateOperationsInput | string
    isAdmin?: BoolFieldUpdateOperationsInput | boolean
    strike?: IntFieldUpdateOperationsInput | number
    score?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    group?: GroupUpdateOneRequiredWithoutParticipantsNestedInput
  }

  export type GroupParticipantUncheckedUpdateInput = {
    groupId?: StringFieldUpdateOperationsInput | string
    jid?: StringFieldUpdateOperationsInput | string
    isAdmin?: BoolFieldUpdateOperationsInput | boolean
    strike?: IntFieldUpdateOperationsInput | number
    score?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GroupParticipantCreateManyInput = {
    id?: string
    groupId: string
    jid: string
    isAdmin: boolean
    strike: number
    score?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GroupParticipantUpdateManyMutationInput = {
    jid?: StringFieldUpdateOperationsInput | string
    isAdmin?: BoolFieldUpdateOperationsInput | boolean
    strike?: IntFieldUpdateOperationsInput | number
    score?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GroupParticipantUncheckedUpdateManyInput = {
    groupId?: StringFieldUpdateOperationsInput | string
    jid?: StringFieldUpdateOperationsInput | string
    isAdmin?: BoolFieldUpdateOperationsInput | boolean
    strike?: IntFieldUpdateOperationsInput | number
    score?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GroupTagCreateInput = {
    id?: string
    groupId: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GroupTagUncheckedCreateInput = {
    id?: string
    groupId: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GroupTagUpdateInput = {
    groupId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GroupTagUncheckedUpdateInput = {
    groupId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GroupTagCreateManyInput = {
    id?: string
    groupId: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GroupTagUpdateManyMutationInput = {
    groupId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GroupTagUncheckedUpdateManyInput = {
    groupId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    id?: string
    jid: string
    pushName?: string | null
    exp?: number
    subscription?: InputJsonValue
    banStatus?: InputJsonValue
    token?: string
    lang?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUncheckedCreateInput = {
    id?: string
    jid: string
    pushName?: string | null
    exp?: number
    subscription?: InputJsonValue
    banStatus?: InputJsonValue
    token?: string
    lang?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateInput = {
    jid?: StringFieldUpdateOperationsInput | string
    pushName?: NullableStringFieldUpdateOperationsInput | string | null
    exp?: IntFieldUpdateOperationsInput | number
    subscription?: InputJsonValue | InputJsonValue
    banStatus?: InputJsonValue | InputJsonValue
    token?: StringFieldUpdateOperationsInput | string
    lang?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateInput = {
    jid?: StringFieldUpdateOperationsInput | string
    pushName?: NullableStringFieldUpdateOperationsInput | string | null
    exp?: IntFieldUpdateOperationsInput | number
    subscription?: InputJsonValue | InputJsonValue
    banStatus?: InputJsonValue | InputJsonValue
    token?: StringFieldUpdateOperationsInput | string
    lang?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateManyInput = {
    id?: string
    jid: string
    pushName?: string | null
    exp?: number
    subscription?: InputJsonValue
    banStatus?: InputJsonValue
    token?: string
    lang?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    jid?: StringFieldUpdateOperationsInput | string
    pushName?: NullableStringFieldUpdateOperationsInput | string | null
    exp?: IntFieldUpdateOperationsInput | number
    subscription?: InputJsonValue | InputJsonValue
    banStatus?: InputJsonValue | InputJsonValue
    token?: StringFieldUpdateOperationsInput | string
    lang?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    jid?: StringFieldUpdateOperationsInput | string
    pushName?: NullableStringFieldUpdateOperationsInput | string | null
    exp?: IntFieldUpdateOperationsInput | number
    subscription?: InputJsonValue | InputJsonValue
    banStatus?: InputJsonValue | InputJsonValue
    token?: StringFieldUpdateOperationsInput | string
    lang?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    isSet?: boolean
  }

  export type DeviceAuthSessionKeyCompoundUniqueInput = {
    session: string
    key: string
  }

  export type DeviceAuthCountOrderByAggregateInput = {
    id?: SortOrder
    session?: SortOrder
    key?: SortOrder
    value?: SortOrder
  }

  export type DeviceAuthMaxOrderByAggregateInput = {
    id?: SortOrder
    session?: SortOrder
    key?: SortOrder
  }

  export type DeviceAuthMinOrderByAggregateInput = {
    id?: SortOrder
    session?: SortOrder
    key?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
    isSet?: boolean
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type BotCountOrderByAggregateInput = {
    id?: SortOrder
    prefixs?: SortOrder
    owners?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BotMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BotMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type EnumaccessFeaturesFilter<$PrismaModel = never> = {
    equals?: $Enums.accessFeatures | EnumaccessFeaturesFieldRefInput<$PrismaModel>
    in?: $Enums.accessFeatures[] | ListEnumaccessFeaturesFieldRefInput<$PrismaModel>
    notIn?: $Enums.accessFeatures[] | ListEnumaccessFeaturesFieldRefInput<$PrismaModel>
    not?: NestedEnumaccessFeaturesFilter<$PrismaModel> | $Enums.accessFeatures
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type GroupParticipantListRelationFilter = {
    every?: GroupParticipantWhereInput
    some?: GroupParticipantWhereInput
    none?: GroupParticipantWhereInput
  }

  export type GroupParticipantOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GroupCountOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    subject?: SortOrder
    visible?: SortOrder
    link?: SortOrder
    publicFeatures?: SortOrder
    accessFeatures?: SortOrder
    joinApprovalMode?: SortOrder
    maxStrike?: SortOrder
    wordBlocker?: SortOrder
    antiMention?: SortOrder
    welcome?: SortOrder
    activityScore?: SortOrder
    lang?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GroupAvgOrderByAggregateInput = {
    maxStrike?: SortOrder
  }

  export type GroupMaxOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    subject?: SortOrder
    visible?: SortOrder
    link?: SortOrder
    accessFeatures?: SortOrder
    joinApprovalMode?: SortOrder
    maxStrike?: SortOrder
    activityScore?: SortOrder
    lang?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GroupMinOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    subject?: SortOrder
    visible?: SortOrder
    link?: SortOrder
    accessFeatures?: SortOrder
    joinApprovalMode?: SortOrder
    maxStrike?: SortOrder
    activityScore?: SortOrder
    lang?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GroupSumOrderByAggregateInput = {
    maxStrike?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumaccessFeaturesWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.accessFeatures | EnumaccessFeaturesFieldRefInput<$PrismaModel>
    in?: $Enums.accessFeatures[] | ListEnumaccessFeaturesFieldRefInput<$PrismaModel>
    notIn?: $Enums.accessFeatures[] | ListEnumaccessFeaturesFieldRefInput<$PrismaModel>
    not?: NestedEnumaccessFeaturesWithAggregatesFilter<$PrismaModel> | $Enums.accessFeatures
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumaccessFeaturesFilter<$PrismaModel>
    _max?: NestedEnumaccessFeaturesFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type GroupScalarRelationFilter = {
    is?: GroupWhereInput
    isNot?: GroupWhereInput
  }

  export type GroupParticipantGroupIdJidCompoundUniqueInput = {
    groupId: string
    jid: string
  }

  export type GroupParticipantCountOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    jid?: SortOrder
    isAdmin?: SortOrder
    strike?: SortOrder
    score?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GroupParticipantAvgOrderByAggregateInput = {
    strike?: SortOrder
    score?: SortOrder
  }

  export type GroupParticipantMaxOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    jid?: SortOrder
    isAdmin?: SortOrder
    strike?: SortOrder
    score?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GroupParticipantMinOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    jid?: SortOrder
    isAdmin?: SortOrder
    strike?: SortOrder
    score?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GroupParticipantSumOrderByAggregateInput = {
    strike?: SortOrder
    score?: SortOrder
  }

  export type GroupTagCountOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GroupTagMaxOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GroupTagMinOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
    isSet?: boolean
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    jid?: SortOrder
    pushName?: SortOrder
    exp?: SortOrder
    subscription?: SortOrder
    banStatus?: SortOrder
    token?: SortOrder
    lang?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    exp?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    jid?: SortOrder
    pushName?: SortOrder
    exp?: SortOrder
    token?: SortOrder
    lang?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    jid?: SortOrder
    pushName?: SortOrder
    exp?: SortOrder
    token?: SortOrder
    lang?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    exp?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type GroupParticipantCreateNestedManyWithoutGroupInput = {
    create?: XOR<GroupParticipantCreateWithoutGroupInput, GroupParticipantUncheckedCreateWithoutGroupInput> | GroupParticipantCreateWithoutGroupInput[] | GroupParticipantUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: GroupParticipantCreateOrConnectWithoutGroupInput | GroupParticipantCreateOrConnectWithoutGroupInput[]
    createMany?: GroupParticipantCreateManyGroupInputEnvelope
    connect?: GroupParticipantWhereUniqueInput | GroupParticipantWhereUniqueInput[]
  }

  export type GroupParticipantUncheckedCreateNestedManyWithoutGroupInput = {
    create?: XOR<GroupParticipantCreateWithoutGroupInput, GroupParticipantUncheckedCreateWithoutGroupInput> | GroupParticipantCreateWithoutGroupInput[] | GroupParticipantUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: GroupParticipantCreateOrConnectWithoutGroupInput | GroupParticipantCreateOrConnectWithoutGroupInput[]
    createMany?: GroupParticipantCreateManyGroupInputEnvelope
    connect?: GroupParticipantWhereUniqueInput | GroupParticipantWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type EnumaccessFeaturesFieldUpdateOperationsInput = {
    set?: $Enums.accessFeatures
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type GroupParticipantUpdateManyWithoutGroupNestedInput = {
    create?: XOR<GroupParticipantCreateWithoutGroupInput, GroupParticipantUncheckedCreateWithoutGroupInput> | GroupParticipantCreateWithoutGroupInput[] | GroupParticipantUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: GroupParticipantCreateOrConnectWithoutGroupInput | GroupParticipantCreateOrConnectWithoutGroupInput[]
    upsert?: GroupParticipantUpsertWithWhereUniqueWithoutGroupInput | GroupParticipantUpsertWithWhereUniqueWithoutGroupInput[]
    createMany?: GroupParticipantCreateManyGroupInputEnvelope
    set?: GroupParticipantWhereUniqueInput | GroupParticipantWhereUniqueInput[]
    disconnect?: GroupParticipantWhereUniqueInput | GroupParticipantWhereUniqueInput[]
    delete?: GroupParticipantWhereUniqueInput | GroupParticipantWhereUniqueInput[]
    connect?: GroupParticipantWhereUniqueInput | GroupParticipantWhereUniqueInput[]
    update?: GroupParticipantUpdateWithWhereUniqueWithoutGroupInput | GroupParticipantUpdateWithWhereUniqueWithoutGroupInput[]
    updateMany?: GroupParticipantUpdateManyWithWhereWithoutGroupInput | GroupParticipantUpdateManyWithWhereWithoutGroupInput[]
    deleteMany?: GroupParticipantScalarWhereInput | GroupParticipantScalarWhereInput[]
  }

  export type GroupParticipantUncheckedUpdateManyWithoutGroupNestedInput = {
    create?: XOR<GroupParticipantCreateWithoutGroupInput, GroupParticipantUncheckedCreateWithoutGroupInput> | GroupParticipantCreateWithoutGroupInput[] | GroupParticipantUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: GroupParticipantCreateOrConnectWithoutGroupInput | GroupParticipantCreateOrConnectWithoutGroupInput[]
    upsert?: GroupParticipantUpsertWithWhereUniqueWithoutGroupInput | GroupParticipantUpsertWithWhereUniqueWithoutGroupInput[]
    createMany?: GroupParticipantCreateManyGroupInputEnvelope
    set?: GroupParticipantWhereUniqueInput | GroupParticipantWhereUniqueInput[]
    disconnect?: GroupParticipantWhereUniqueInput | GroupParticipantWhereUniqueInput[]
    delete?: GroupParticipantWhereUniqueInput | GroupParticipantWhereUniqueInput[]
    connect?: GroupParticipantWhereUniqueInput | GroupParticipantWhereUniqueInput[]
    update?: GroupParticipantUpdateWithWhereUniqueWithoutGroupInput | GroupParticipantUpdateWithWhereUniqueWithoutGroupInput[]
    updateMany?: GroupParticipantUpdateManyWithWhereWithoutGroupInput | GroupParticipantUpdateManyWithWhereWithoutGroupInput[]
    deleteMany?: GroupParticipantScalarWhereInput | GroupParticipantScalarWhereInput[]
  }

  export type GroupCreateNestedOneWithoutParticipantsInput = {
    create?: XOR<GroupCreateWithoutParticipantsInput, GroupUncheckedCreateWithoutParticipantsInput>
    connectOrCreate?: GroupCreateOrConnectWithoutParticipantsInput
    connect?: GroupWhereUniqueInput
  }

  export type GroupUpdateOneRequiredWithoutParticipantsNestedInput = {
    create?: XOR<GroupCreateWithoutParticipantsInput, GroupUncheckedCreateWithoutParticipantsInput>
    connectOrCreate?: GroupCreateOrConnectWithoutParticipantsInput
    upsert?: GroupUpsertWithoutParticipantsInput
    connect?: GroupWhereUniqueInput
    update?: XOR<XOR<GroupUpdateToOneWithWhereWithoutParticipantsInput, GroupUpdateWithoutParticipantsInput>, GroupUncheckedUpdateWithoutParticipantsInput>
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
    unset?: boolean
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
    isSet?: boolean
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    isSet?: boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumaccessFeaturesFilter<$PrismaModel = never> = {
    equals?: $Enums.accessFeatures | EnumaccessFeaturesFieldRefInput<$PrismaModel>
    in?: $Enums.accessFeatures[] | ListEnumaccessFeaturesFieldRefInput<$PrismaModel>
    notIn?: $Enums.accessFeatures[] | ListEnumaccessFeaturesFieldRefInput<$PrismaModel>
    not?: NestedEnumaccessFeaturesFilter<$PrismaModel> | $Enums.accessFeatures
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumaccessFeaturesWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.accessFeatures | EnumaccessFeaturesFieldRefInput<$PrismaModel>
    in?: $Enums.accessFeatures[] | ListEnumaccessFeaturesFieldRefInput<$PrismaModel>
    notIn?: $Enums.accessFeatures[] | ListEnumaccessFeaturesFieldRefInput<$PrismaModel>
    not?: NestedEnumaccessFeaturesWithAggregatesFilter<$PrismaModel> | $Enums.accessFeatures
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumaccessFeaturesFilter<$PrismaModel>
    _max?: NestedEnumaccessFeaturesFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
    isSet?: boolean
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type GroupParticipantCreateWithoutGroupInput = {
    id?: string
    jid: string
    isAdmin: boolean
    strike: number
    score?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GroupParticipantUncheckedCreateWithoutGroupInput = {
    id?: string
    jid: string
    isAdmin: boolean
    strike: number
    score?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GroupParticipantCreateOrConnectWithoutGroupInput = {
    where: GroupParticipantWhereUniqueInput
    create: XOR<GroupParticipantCreateWithoutGroupInput, GroupParticipantUncheckedCreateWithoutGroupInput>
  }

  export type GroupParticipantCreateManyGroupInputEnvelope = {
    data: GroupParticipantCreateManyGroupInput | GroupParticipantCreateManyGroupInput[]
  }

  export type GroupParticipantUpsertWithWhereUniqueWithoutGroupInput = {
    where: GroupParticipantWhereUniqueInput
    update: XOR<GroupParticipantUpdateWithoutGroupInput, GroupParticipantUncheckedUpdateWithoutGroupInput>
    create: XOR<GroupParticipantCreateWithoutGroupInput, GroupParticipantUncheckedCreateWithoutGroupInput>
  }

  export type GroupParticipantUpdateWithWhereUniqueWithoutGroupInput = {
    where: GroupParticipantWhereUniqueInput
    data: XOR<GroupParticipantUpdateWithoutGroupInput, GroupParticipantUncheckedUpdateWithoutGroupInput>
  }

  export type GroupParticipantUpdateManyWithWhereWithoutGroupInput = {
    where: GroupParticipantScalarWhereInput
    data: XOR<GroupParticipantUpdateManyMutationInput, GroupParticipantUncheckedUpdateManyWithoutGroupInput>
  }

  export type GroupParticipantScalarWhereInput = {
    AND?: GroupParticipantScalarWhereInput | GroupParticipantScalarWhereInput[]
    OR?: GroupParticipantScalarWhereInput[]
    NOT?: GroupParticipantScalarWhereInput | GroupParticipantScalarWhereInput[]
    id?: StringFilter<"GroupParticipant"> | string
    groupId?: StringFilter<"GroupParticipant"> | string
    jid?: StringFilter<"GroupParticipant"> | string
    isAdmin?: BoolFilter<"GroupParticipant"> | boolean
    strike?: IntFilter<"GroupParticipant"> | number
    score?: IntFilter<"GroupParticipant"> | number
    createdAt?: DateTimeFilter<"GroupParticipant"> | Date | string
    updatedAt?: DateTimeFilter<"GroupParticipant"> | Date | string
  }

  export type GroupCreateWithoutParticipantsInput = {
    id?: string
    groupId: string
    subject: string
    visible?: boolean
    link?: string
    publicFeatures?: InputJsonValue
    accessFeatures?: $Enums.accessFeatures
    joinApprovalMode: boolean
    maxStrike: number
    wordBlocker: InputJsonValue
    antiMention: InputJsonValue
    welcome: InputJsonValue
    activityScore: boolean
    lang?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GroupUncheckedCreateWithoutParticipantsInput = {
    id?: string
    groupId: string
    subject: string
    visible?: boolean
    link?: string
    publicFeatures?: InputJsonValue
    accessFeatures?: $Enums.accessFeatures
    joinApprovalMode: boolean
    maxStrike: number
    wordBlocker: InputJsonValue
    antiMention: InputJsonValue
    welcome: InputJsonValue
    activityScore: boolean
    lang?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GroupCreateOrConnectWithoutParticipantsInput = {
    where: GroupWhereUniqueInput
    create: XOR<GroupCreateWithoutParticipantsInput, GroupUncheckedCreateWithoutParticipantsInput>
  }

  export type GroupUpsertWithoutParticipantsInput = {
    update: XOR<GroupUpdateWithoutParticipantsInput, GroupUncheckedUpdateWithoutParticipantsInput>
    create: XOR<GroupCreateWithoutParticipantsInput, GroupUncheckedCreateWithoutParticipantsInput>
    where?: GroupWhereInput
  }

  export type GroupUpdateToOneWithWhereWithoutParticipantsInput = {
    where?: GroupWhereInput
    data: XOR<GroupUpdateWithoutParticipantsInput, GroupUncheckedUpdateWithoutParticipantsInput>
  }

  export type GroupUpdateWithoutParticipantsInput = {
    groupId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    visible?: BoolFieldUpdateOperationsInput | boolean
    link?: StringFieldUpdateOperationsInput | string
    publicFeatures?: InputJsonValue | InputJsonValue
    accessFeatures?: EnumaccessFeaturesFieldUpdateOperationsInput | $Enums.accessFeatures
    joinApprovalMode?: BoolFieldUpdateOperationsInput | boolean
    maxStrike?: IntFieldUpdateOperationsInput | number
    wordBlocker?: InputJsonValue | InputJsonValue
    antiMention?: InputJsonValue | InputJsonValue
    welcome?: InputJsonValue | InputJsonValue
    activityScore?: BoolFieldUpdateOperationsInput | boolean
    lang?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GroupUncheckedUpdateWithoutParticipantsInput = {
    groupId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    visible?: BoolFieldUpdateOperationsInput | boolean
    link?: StringFieldUpdateOperationsInput | string
    publicFeatures?: InputJsonValue | InputJsonValue
    accessFeatures?: EnumaccessFeaturesFieldUpdateOperationsInput | $Enums.accessFeatures
    joinApprovalMode?: BoolFieldUpdateOperationsInput | boolean
    maxStrike?: IntFieldUpdateOperationsInput | number
    wordBlocker?: InputJsonValue | InputJsonValue
    antiMention?: InputJsonValue | InputJsonValue
    welcome?: InputJsonValue | InputJsonValue
    activityScore?: BoolFieldUpdateOperationsInput | boolean
    lang?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GroupParticipantCreateManyGroupInput = {
    id?: string
    jid: string
    isAdmin: boolean
    strike: number
    score?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GroupParticipantUpdateWithoutGroupInput = {
    jid?: StringFieldUpdateOperationsInput | string
    isAdmin?: BoolFieldUpdateOperationsInput | boolean
    strike?: IntFieldUpdateOperationsInput | number
    score?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GroupParticipantUncheckedUpdateWithoutGroupInput = {
    jid?: StringFieldUpdateOperationsInput | string
    isAdmin?: BoolFieldUpdateOperationsInput | boolean
    strike?: IntFieldUpdateOperationsInput | number
    score?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GroupParticipantUncheckedUpdateManyWithoutGroupInput = {
    jid?: StringFieldUpdateOperationsInput | string
    isAdmin?: BoolFieldUpdateOperationsInput | boolean
    strike?: IntFieldUpdateOperationsInput | number
    score?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}