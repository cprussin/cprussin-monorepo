import { Option, Some, None } from "./option.js";

const _Ok = <T>(value: T) => ({ isOk: true as const, value });
const _Err = <E>(error: E) => ({ isOk: false as const, error });
type _Result<T, E> = Readonly<
  ReturnType<typeof _Ok<T>> | ReturnType<typeof _Err<E>>
>;

/**
 * A type which represents values that may encode either a successful result or
 * an error result.
 *
 * @typeParam T - the type of successful results
 * @typeParam E - the type of error results
 */
export class Result<
  T extends NonNullable<unknown>,
  E extends NonNullable<unknown> = Error
> {
  /** @hidden */
  private readonly data: _Result<T, E>;

  /** @hidden */
  private constructor(data: _Result<T, E>) {
    this.data = data;
  }

  /**
   * Construct a `Result` containing a success value.
   *
   * @category Constructing
   * @typeParam T - the type of the value
   * @typeParam E - the type of error results
   * @param value - the value contained by the `Result`
   * @returns a `Result` containing `value`
   * @see {@link Err}
   * @see {@link wrap}
   * @see {@link wrapAsync}
   */
  static Ok<
    T extends NonNullable<unknown>,
    E extends NonNullable<unknown> = Error
  >(value: T): Result<T, E> {
    return new Result(_Ok(value));
  }

  /**
   * Construct a `Result` containing an error value.
   *
   * @category Constructing
   * @typeParam T - the type of success values
   * @typeParam E - the type of the error value
   * @param error - the error contained by the `Result`
   * @returns a `Result` containing an error `error`
   * @see {@link Ok}
   * @see {@link wrap}
   * @see {@link wrapAsync}
   */
  static Err<
    T extends NonNullable<unknown>,
    E extends NonNullable<unknown> = Error
  >(error: E): Result<T, E> {
    return new Result(_Err(error));
  }

  /**
   * Takes an Array of {@link Result} values.  If any of the {@link Result}
   * values in the array is `Err`, returns that `Err`.  Otherwise, returns `Ok`
   * containing an Array of each value inside each {@link Result} in the
   * original list.
   *
   * @category Transforming contained values
   * @typeParam T - the type contained by the {@link Result} values
   * @typeParam E - the error type of the {@link Result} values
   * @param results - the {@link Result} values to collect
   * @returns `Ok` containing an Array of values contained by each {@link
   * Result} in the original Array if all {@link Result} values in the original
   * list are `Ok`, otherwise returns the first `Err` in the Array
   * @see {@link map}
   * @see {@link mapAsync}
   * @see {@link mapOr}
   * @see {@link mapErr}
   * @see {@link mapErrAsync}
   */
  static collect<
    T extends NonNullable<unknown>,
    E extends NonNullable<unknown> = Error
  >(results: Result<T, E>[]): Result<T[], E> {
    const values: T[] = [];
    for (const result of results) {
      if (result.data.isOk) {
        values.push(result.data.value);
      } else {
        return Result.Err(result.data.error);
      }
    }
    return Ok(values);
  }

  /**
   * Takes a function that could be throw and converts it into an {@link
   * Result}.
   *
   * @category Constructing
   * @typeParam T - the type contained by the {@link Result}
   * @typeParam E - the error type of the {@link Result}
   * @param fn - the function which could throw
   * @returns `Ok` with the return value of `fn` if `fn` doesn't throw,
   * otherwise `Err` containing an {@link Option} which is `None` if the
   * exception is `null` or `undefined`, and is `Some` with the exception
   * otherwise
   * @see {@link Ok}
   * @see {@link Err}
   * @see {@link wrapAsync}
   */
  static wrap<T extends NonNullable<unknown>>(
    fn: () => T
  ): Result<T, Option<NonNullable<unknown>>> {
    try {
      return Result.Ok(fn());
    } catch (error) {
      return Result.Err(Option.wrap(error));
    }
  }

  /**
   * Takes a promise that could reject and converts it into an {@link Result}.
   *
   * @category Constructing
   * @typeParam T - the type contained by the {@link Result}
   * @typeParam E - the error type of the {@link Result}
   * @param promise - the promise to convert
   * @returns a Promise containing `Ok` with the value resolved by `promise` if
   * `promise` doesn't reject, otherwise `Err` containing an {@link Option}
   * which is `None` if `promise` rejects with a `null` or `undefined`, and is
   * `Some` with the rejection value otherwise
   * @see {@link Ok}
   * @see {@link Err}
   * @see {@link wrap}
   */
  static async wrapAsync<T extends NonNullable<unknown>>(
    promise: Promise<T>
  ): Promise<Result<T, Option<NonNullable<unknown>>>> {
    try {
      return Result.Ok(await promise);
    } catch (error) {
      return Result.Err(Option.wrap(error));
    }
  }

  /**
   * Check if `this` is `Ok`.
   *
   * @category Querying the variant
   * @returns true if `this` is `Ok`, `false` otherwise
   * @see {@link isErr}
   */
  isOk(this: Result<T, E>): boolean {
    return this.data.isOk;
  }

  /**
   * Check if `this` is `Err`.
   *
   * @category Querying the variant
   * @returns true if `this` is `Err`, `false` otherwise
   * @see {@link isOk}
   */
  isErr(this: Result<T, E>): boolean {
    return !this.data.isOk;
  }

  /**
   * Takes two functions, one is called with the contained value if `this` is
   * `Ok` and the other is called with the error if `this` is `Err`.
   *
   * @category Extracting the contained value
   * @typeParam U - the type of the return value of the matcher functions
   * @param matchers - an object containing matcher functions
   * @returns the return value of the `Ok` or `Err` matcher function
   * @see {@link unwrapOrElse}
   * @see {@link unwrapOr}
   */
  match<U>(
    this: Result<T, E>,
    matchers: {
      /**
       * A function that will be called on the value contained if `this` is
       * `Ok`.
       *
       * @param value - the value contained in the `Ok`
       * @returns an arbitrary value
       */
      Ok: (value: T) => U;

      /**
       * A function that will be called on the value contained if `this` is
       * `Err`.
       *
       * @param error - the error contained in the `Err`
       * @returns an arbitrary value
       */
      Err: (error: E) => U;
    }
  ): U {
    return this.data.isOk
      ? matchers.Ok(this.data.value)
      : matchers.Err(this.data.error);
  }

  /**
   * Returns the contained value if `this` is `Ok`, otherwise call the provided
   * function with the error value and return the result.
   *
   * @category Extracting the contained value
   * @param defaultValue - a function that will be called on the error value if
   * `this` is `Err`
   * @returns the contained if `this` is `Ok`, otherwise the return value from
   * calling `defaultValue` on the error value
   * @see {@link unwrapOr}
   * @see {@link match}
   */
  unwrapOrElse(this: Result<T, E>, defaultValue: (error: E) => T): T {
    return this.match({
      Ok: (value) => value,
      Err: defaultValue,
    });
  }

  /**
   * Returns the contained value if `this` is `Ok`, otherwise return the
   * provided default value, ignoring any error value.
   *
   * @category Extracting the contained value
   * @param defaultValue - the value to return if `this` is `Err`
   * @returns the contained if `this` is `Ok`, otherwise `defaultValue`
   * @see {@link unwrapOrElse}
   * @see {@link match}
   */
  unwrapOr(this: Result<T, E>, defaultValue: T): T {
    return this.unwrapOrElse(() => defaultValue);
  }

  /**
   * Takes a function which takes the value contained in `this` and returns a
   * new {@link Result}; calls it and returns the result if `this` is `Ok`,
   * otherwise returns `this`.  Also sometimes known in other languages or
   * libraries as `flatmap` or `bind`.
   *
   * @category Boolean operators
   * @typeParam U - the type contained in the {@link Result} returned by `fn`
   * @param fn - a function that will be called with the value in `this` if
   * `this` is `Ok`
   * @returns the result of calling `fn` if `this` is `Ok`, `this` otherwise
   * @see {@link and}
   * @see {@link andThenAsync}
   * @see {@link or}
   * @see {@link orElse}
   * @see {@link orElseAsync}
   */
  andThen<U extends NonNullable<unknown>>(
    this: Result<T, E>,
    fn: (value: T) => Result<U, E>
  ): Result<U, E> {
    return this.match({
      Ok: fn,
      Err: (error) => Result.Err(error),
    });
  }

  /**
   * Takes another {@link Result} and returns it if `this` is `Ok`, otherwise
   * returns `this`.
   *
   * @category Boolean operators
   * @typeParam U - the type contained in the {@link Result} returned by `fn`
   * @param other - a {@link Result} to return if `this` is `Ok`
   * @returns `other` if `this` is `Ok`, `this` otherwise
   * @see {@link andThen}
   * @see {@link andThenAsync}
   * @see {@link or}
   * @see {@link orElse}
   * @see {@link orElseAsync}
   */
  and<U extends NonNullable<unknown>>(
    this: Result<T, E>,
    other: Result<U, E>
  ): Result<U, E> {
    return this.andThen(() => other);
  }

  /**
   * Takes a function which takes the value contained in `this` and returns a
   * promise which resolves to a new {@link Result}; calls it and returns the
   * result if `this` is `Ok`, otherwise returns a promise which resolves to
   * `this`.  This is an async version of {@link andThen}.
   *
   * @category Boolean operators
   * @typeParam U - the type contained in the {@link Result} returned by `fn`
   * @param fn - a function that will be called with the value in `this` if
   * `this` is `Ok`
   * @returns the result of calling `fn` if `this` is `Ok`, `this` otherwise
   * @see {@link and}
   * @see {@link andThen}
   * @see {@link or}
   * @see {@link orElse}
   * @see {@link orElseAsync}
   */
  andThenAsync<U extends NonNullable<unknown>>(
    this: Result<T, E>,
    fn: (value: T) => Promise<Result<U, E>>
  ): Promise<Result<U, E>> {
    return this.match({
      Ok: fn,
      Err: (error) => Promise.resolve(Result.Err(error)),
    });
  }

  /**
   * Takes a function which takes an error and returns a {@link Result}; calls
   * it on the contained error and returns the result if `this` is `Err`,
   * otherwise returns `this`.
   *
   * @category Boolean operators
   * @param fn - a function that will be called with the error value if `this`
   * is `Err`
   * @returns the result of calling `fn` if `this` is `Err`, `this` otherwise
   * @see {@link and}
   * @see {@link andThen}
   * @see {@link andThenAsync}
   * @see {@link or}
   * @see {@link orElseAsync}
   */
  orElse<F extends NonNullable<unknown> = Error>(
    this: Result<T, E>,
    fn: (error: E) => Result<T, F>
  ): Result<T, F> {
    return this.match({
      Ok: (value) => Result.Ok(value),
      Err: fn,
    });
  }

  /**
   * Takes another {@link Result} and returns it if `this` is `Err`, otherwise
   * returns `this`.
   *
   * @category Boolean operators
   * @param other - a {@link Result} to return if `this` is `Err`
   * @returns `other` if `this` is `Err`, `this` otherwise
   * @see {@link and}
   * @see {@link andThen}
   * @see {@link andThenAsync}
   * @see {@link orElse}
   * @see {@link orElseAsync}
   */
  or<F extends NonNullable<unknown> = Error>(
    this: Result<T, E>,
    other: Result<T, F>
  ): Result<T, F> {
    return this.orElse(() => other);
  }

  /**
   * Takes a function which takes an error and returns a promise which resolves
   * to a new {@link Result}; calls it with the contained error and returns the
   * result if `this` is `Err`, otherwise returns a promise which resolves to
   * `this`.
   *
   * @category Boolean operators
   * @param fn - a function that will be called if `this` is `Err`
   * @returns the result of calling `fn` if `this` is `Err`, `this` otherwise
   * @see {@link and}
   * @see {@link andThen}
   * @see {@link andThenAsync}
   * @see {@link or}
   * @see {@link orElse}
   */
  orElseAsync<F extends NonNullable<unknown> = Error>(
    this: Result<T, E>,
    fn: (error: E) => Promise<Result<T, F>>
  ): Promise<Result<T, F>> {
    return this.match({
      Ok: (value) => Promise.resolve(Result.Ok(value)),
      Err: fn,
    });
  }

  /**
   * Transforms `Result<T, E>` to `Result<U, E>` by applying the provided
   * function to the contained value of `Ok` and leaving `Err` values unchanged.
   *
   * @category Transforming contained values
   * @typeParam U - the type of the return value of `fn`
   * @param fn - the function to apply to the value contained if `this` is `Ok`
   * @returns `this` if `this` is `Err`, otherwise `Ok` containing the result of
   * applying `fn` to the value in `this`
   * @see {@link mapAsync}
   * @see {@link mapOr}
   * @see {@link mapErr}
   * @see {@link mapErrAsync}
   * @see {@link collect}
   */
  map<U extends NonNullable<unknown>>(
    this: Result<T, E>,
    fn: (value: T) => U
  ): Result<U, E> {
    return this.andThen((value) => Ok(fn(value)));
  }

  /**
   * Transforms `Result<T, E>` to `Promise<Result<U, E>>` by applying the
   * provided async function to the contained value of `Ok` and resolving `Err`
   * values unchanged.
   *
   * @category Transforming contained values
   * @typeParam U - the type of the value in the promise returned by `fn`
   * @param fn - the function to apply to the value contained if `this` is `Ok`
   * @returns a promise resolving to `this` if `this` is `Err`, otherwise a
   * promise resolving to `Ok` containing the value resolved by the promise
   * returned from applying `fn` to the value in `this`
   * @see {@link map}
   * @see {@link mapOr}
   * @see {@link mapErr}
   * @see {@link mapErrAsync}
   * @see {@link collect}
   */
  mapAsync<U extends NonNullable<unknown>>(
    this: Result<T, E>,
    fn: (value: T) => Promise<U>
  ): Promise<Result<U, E>> {
    return this.andThenAsync(async (value) => Ok(await fn(value)));
  }

  /**
   * Applies the provided function to the contained value if `this` is `Ok`,
   * otherwise returns the provided default value.
   *
   * @category Transforming contained values
   * @typeParam U - the type of `defaultValue` and the value returned by `fn`
   * @param defaultValue - the value to return if `this` is `Err`
   * @param fn - the function to apply to the value contained if `this` is `Ok`
   * @returns the result of applying `fn` to the value in `this` if `this` is
   * `Ok`, otherwise `defaultValue`
   * @see {@link map}
   * @see {@link mapAsync}
   * @see {@link mapErr}
   * @see {@link mapErrAsync}
   * @see {@link collect}
   */
  mapOr<U extends NonNullable<unknown>>(
    this: Result<T, E>,
    defaultValue: U,
    fn: (value: T) => U
  ): U {
    return this.map(fn).unwrapOr(defaultValue);
  }

  /**
   * Transforms `Result<T, E>` to `Result<T, F>` by applying the provided
   * function to the contained value of `Err` and leaving `Ok` values unchanged.
   *
   * @category Transforming contained values
   * @typeParam F - the type of the return value of `fn`
   * @param fn - the function to apply to the value contained if `this` is `Err`
   * @returns `this` if `this` is `Ok`, otherwise `Err` containing the result of
   * applying `fn` to the value in `this`
   * @see {@link map}
   * @see {@link mapAsync}
   * @see {@link mapOr}
   * @see {@link mapErrAsync}
   * @see {@link collect}
   */
  mapErr<F extends NonNullable<unknown> = Error>(
    this: Result<T, E>,
    fn: (error: E) => F
  ): Result<T, F> {
    return this.match({
      Ok: (value) => Result.Ok(value),
      Err: (error) => Result.Err(fn(error)),
    });
  }

  /**
   * Transforms `Result<T, E>` to `Promise<Result<T, F>>` by applying the
   * provided async function to the contained value of `Err` and resolving `Ok`
   * values unchanged.
   *
   * @category Transforming contained values
   * @typeParam F - the type of the value in the promise returned by `fn`
   * @param fn - the function to apply to the value contained if `this` is `Err`
   * @returns a promise resolving to `this` if `this` is `Ok`, otherwise a
   * promise resolving to `Err` containing the value resolved by the promise
   * returned from applying `fn` to the value in `this`
   * @see {@link map}
   * @see {@link mapAsync}
   * @see {@link mapOr}
   * @see {@link mapErr}
   * @see {@link collect}
   */
  mapErrAsync<F extends NonNullable<unknown> = Error>(
    this: Result<T, E>,
    fn: (error: E) => Promise<F>
  ): Promise<Result<T, F>> {
    return this.match({
      Ok: (value) => Promise.resolve(Result.Ok(value)),
      Err: async (error) => Result.Err<T, F>(await fn(error)),
    });
  }

  /**
   * If `this` is `Ok`, returns {@link Option.Some} containing the value in
   * `this`.  Otherwise return {@link Option.None}.
   *
   * @category Interacting with Option
   * @returns {@link Option.Some} with the value in `this` if `this` is `Ok`,
   * {@link Option.None} otherwise
   * @see {@link err}
   * @see {@link transpose}
   */
  ok(this: Result<T, E>): Option<T> {
    return this.match({
      Ok: (value) => Some(value),
      Err: () => None(),
    });
  }

  /**
   * If `this` is `Err`, returns {@link Option.Some} containing the value in
   * `this`.  Otherwise return {@link Option.None}.
   *
   * @category Interacting with Option
   * @returns {@link Option.Some} with the value in `this` if `this` is `Err`,
   * {@link Option.None} otherwise
   * @see {@link ok}
   * @see {@link transpose}
   */
  err(this: Result<T, E>): Option<E> {
    return this.match({
      Ok: () => None(),
      Err: (error) => Some(error),
    });
  }

  /**
   * Convert a {@link Result} containing an {@link Option} into an {@link
   * Option} containing a {@link Result}.
   *
   * @category Interacting with Option
   * @typeParam T - the type of the value contained in the {@link Option}
   * contained in `this`
   * @returns if `this` is `Err`, returns {@link Option.Some} containing `this`;
   * if `this` is `Ok` and the {@link Option} in `this` is {@link Option.None},
   * returns {@link Option.None}; otherwise returns {@link Option.Some}
   * containing `Ok` containing the value in the {@link Option} in `this`
   * @see {@link ok}
   * @see {@link err}
   */
  transpose<T extends NonNullable<unknown>>(
    this: Result<Option<T>, E>
  ): Option<Result<T, E>> {
    return this.match({
      Ok: (option) => option.map((value) => Result.Ok(value)),
      Err: (error) => Some(Result.Err(error)),
    });
  }
}

/**
 * Construct a {@link Result} containing a success value.
 *
 * @typeParam T - the type of the value
 * @typeParam E - the type of error results
 * @param value - the value contained by the {@link Result}
 * @returns a {@link Result} containing `value`
 * @see {@link Result.Err}
 * @see {@link Result.wrap}
 * @see {@link Result.wrapAsync}
 */
export const Ok = <
  T extends NonNullable<unknown>,
  E extends NonNullable<unknown>
>(
  value: T
): Result<T, E> => Result.Ok(value);

/**
 * Construct a {@link Result} containing an error value.
 *
 * @typeParam T - the type of success values
 * @typeParam E - the type of the error value
 * @param error - the error contained by the {@link Result}
 * @returns a {@link Result} containing an error `error`
 * @see {@link Result.Ok}
 * @see {@link Result.wrap}
 * @see {@link Result.wrapAsync}
 */
export const Err = <
  T extends NonNullable<unknown>,
  E extends NonNullable<unknown>
>(
  error: E
): Result<T, E> => Result.Err(error);
