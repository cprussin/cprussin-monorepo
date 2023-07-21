import { Result, Ok, Err } from "./result.js";

const _Some = <T>(value: T) => ({ isSome: true as const, value });
const _None = () => ({ isSome: false as const });
type _Option<T> = Readonly<
  ReturnType<typeof _Some<T>> | ReturnType<typeof _None>
>;

/**
 * A type which represents values that may or may not be present, without using
 * `undefined` or `null`.
 *
 * @typeParam T - if this Option contains a value, this is the type of the value
 */
export class Option<T extends NonNullable<unknown>> {
  /** @hidden */
  private readonly data: _Option<T>;

  /** @hidden */
  private constructor(data: _Option<T>) {
    this.data = data;
  }

  /**
   * Construct an {@link Option} containing a value.
   *
   * @category Constructing
   * @typeParam T - the type contained by the {@link Option}
   * @param value - the value contained by the {@link Option}
   * @returns an {@link Option} containing `value`
   * @see {@link None}
   * @see {@link wrap}
   */
  static Some<T extends NonNullable<unknown>>(value: T): Option<T> {
    return new Option(_Some(value));
  }

  /**
   * Construct an empty {@link Option}.
   *
   * @category Constructing
   * @typeParam T - the type contained by the {@link Option}
   * @returns an empty {@link Option}
   * @see {@link Some}
   * @see {@link wrap}
   */
  static None<T extends NonNullable<unknown>>(): Option<T> {
    return new Option(_None());
  }

  /**
   * Takes an Array of {@link Option} values.  If any of the {@link Option}
   * values in the array is `None`, returns `None`.  Otherwise, returns `Some`
   * containing an Array of each value inside each {@link Option} in the
   * original list.
   *
   * @category Transforming contained values
   * @typeParam T - the type contained by the {@link Option} values
   * @param options - the {@link Option} values to collect
   * @returns `Some` containing an Array of values contained by each {@link
   * Option} in the original Array if all {@link Option} values in the original
   * list are `Some`, `None` otherwise
   * @see {@link map}
   * @see {@link mapAsync}
   * @see {@link mapOr}
   * @see {@link filter}
   * @see {@link zip}
   * @see {@link unzip}
   */
  static collect<T extends NonNullable<unknown>>(
    options: Option<T>[],
  ): Option<T[]> {
    const values: T[] = [];
    for (const option of options) {
      if (option.data.isSome) {
        values.push(option.data.value);
      } else {
        return Option.None();
      }
    }
    return Option.Some(values);
  }

  /**
   * Takes a value that could be `null` or `undefined` and converts it into an
   * {@link Option}.
   *
   * @category Constructing
   * @typeParam T - the type contained by the {@link Option} values
   * @param value - the nullable value
   * @returns `None` if `value` is `null` or `undefined`, `Some` containing
   * `value` otherwise
   * @see {@link Some}
   * @see {@link None}
   */
  static wrap<T>(value: T): Option<NonNullable<T>> {
    return value === null || value === undefined
      ? Option.None()
      : Option.Some(value);
  }

  /**
   * Check if `this` is `Some`.
   *
   * @category Querying the variant
   * @returns true if `this` is `Some`, `false` otherwise
   * @see {@link isNone}
   */
  isSome(this: Option<T>): boolean {
    return this.data.isSome;
  }

  /**
   * Check if `this` is `None`.
   *
   * @category Querying the variant
   * @returns true if `this` is `None`, `false` otherwise
   * @see {@link isSome}
   */
  isNone(this: Option<T>): boolean {
    return !this.data.isSome;
  }

  /**
   * Takes two functions, one is called with the contained value if `this` is
   * `Some` and the other is called if `this` is `None`.
   *
   * @category Extracting the contained value
   * @typeParam U - the type of the return value of the matcher functions
   * @param matchers - an object containing matcher functions
   * @returns the return value of the `Some` or `None` matcher function
   * @see {@link unwrapOrElse}
   * @see {@link unwrapOr}
   */
  match<U>(
    this: Option<T>,
    matchers: {
      /**
       * A function that will be called on the value contained if `this` is
       * `Some`.
       *
       * @param value - the value contained in the `Some`
       * @returns an arbitrary value
       */
      Some: (value: T) => U;

      /**
       * A function that will be called if `this` is `None`.
       *
       * @returns an arbitrary value
       */
      None: () => U;
    },
  ): U {
    return this.data.isSome ? matchers.Some(this.data.value) : matchers.None();
  }

  /**
   * Returns the contained value if `this` is `Some`, otherwise call the
   * provided function and return the result.
   *
   * @category Extracting the contained value
   * @param defaultValue - a function that will be called if `this` is `None`
   * @returns the contained if `this` is `Some`, otherwise the return value from
   * calling `defaultValue`
   * @see {@link unwrapOr}
   * @see {@link match}
   */
  unwrapOrElse(this: Option<T>, defaultValue: () => T): T {
    return this.match({
      Some: (value) => value,
      None: defaultValue,
    });
  }

  /**
   * Returns the contained value if `this` is `Some`, otherwise return the
   * provided default value.
   *
   * @category Extracting the contained value
   * @param defaultValue - the value to return if `this` is `None`
   * @returns the contained if `this` is `Some`, otherwise `defaultValue`
   * @see {@link unwrapOrElse}
   * @see {@link match}
   */
  unwrapOr(this: Option<T>, defaultValue: T): T {
    return this.unwrapOrElse(() => defaultValue);
  }

  /**
   * Takes a function which takes the value contained in `this` and returns a
   * new {@link Option}; calls it and returns the result if `this` is `Some`,
   * otherwise returns `None`.  Also sometimes known in other languages or
   * libraries as `flatmap` or `bind`.
   *
   * @category Boolean operators
   * @typeParam U - the type contained in the {@link Option} returned by `fn`
   * @param fn - a function that will be called with the value in `this` if
   * `this` is `Some`
   * @returns the result of calling `fn` if `this` is `Some`, `None` otherwise
   * @see {@link and}
   * @see {@link andThenAsync}
   * @see {@link or}
   * @see {@link orElse}
   * @see {@link orElseAsync}
   * @see {@link xor}
   */
  andThen<U extends NonNullable<unknown>>(
    this: Option<T>,
    fn: (value: T) => Option<U>,
  ): Option<U> {
    return this.match({
      Some: fn,
      None: () => Option.None(),
    });
  }

  /**
   * Takes another {@link Option} and returns it if `this` is `Some`, otherwise
   * returns `None`.
   *
   * @category Boolean operators
   * @typeParam U - the type contained in the {@link Option} returned by `fn`
   * @param other - an {@link Option} to return if `this` is `Some`
   * @returns `other` if `this` is `Some`, `None` otherwise
   * @see {@link andThen}
   * @see {@link andThenAsync}
   * @see {@link or}
   * @see {@link orElse}
   * @see {@link orElseAsync}
   * @see {@link xor}
   */
  and<U extends NonNullable<unknown>>(
    this: Option<T>,
    other: Option<U>,
  ): Option<U> {
    return this.andThen(() => other);
  }

  /**
   * Takes a function which takes the value contained in `this` and returns a
   * promise which resolves to a new {@link Option}; calls it and returns the
   * result if `this` is `Some`, otherwise returns a promise which resolves to
   * `None`.  This is an async version of {@link andThen}.
   *
   * @category Boolean operators
   * @typeParam U - the type contained in the {@link Option} returned by `fn`
   * @param fn - a function that will be called with the value in `this` if
   * `this` is `Some`
   * @returns the result of calling `fn` if `this` is `Some`, `None` otherwise
   * @see {@link and}
   * @see {@link andThen}
   * @see {@link or}
   * @see {@link orElse}
   * @see {@link orElseAsync}
   * @see {@link xor}
   */
  andThenAsync<U extends NonNullable<unknown>>(
    this: Option<T>,
    fn: (value: T) => Promise<Option<U>>,
  ): Promise<Option<U>> {
    return this.match({
      Some: fn,
      None: () => Promise.resolve(Option.None()),
    });
  }

  /**
   * Takes a function that returns an {@link Option}; calls it and returns the
   * result if `this` is `None`, otherwise returns `this`.
   *
   * @category Boolean operators
   * @param fn - a function that will be called if `this` is `None`
   * @returns the result of calling `fn` if `this` is `None`, `this` otherwise
   * @see {@link and}
   * @see {@link andThen}
   * @see {@link andThenAsync}
   * @see {@link or}
   * @see {@link orElseAsync}
   * @see {@link xor}
   */
  orElse(this: Option<T>, fn: () => Option<T>): Option<T> {
    return this.match({
      Some: () => this,
      None: fn,
    });
  }

  /**
   * Takes another {@link Option} and returns it if `this` is `None`, otherwise
   * returns `this`.
   *
   * @category Boolean operators
   * @param other - an {@link Option} to return if `this` is `None`
   * @returns `other` if `this` is `None`, `this` otherwise
   * @see {@link and}
   * @see {@link andThen}
   * @see {@link andThenAsync}
   * @see {@link orElse}
   * @see {@link orElseAsync}
   * @see {@link xor}
   */
  or(this: Option<T>, other: Option<T>): Option<T> {
    return this.orElse(() => other);
  }

  /**
   * Takes a function that returns a promise which resolves to a new {@link
   * Option}; calls it and returns the result if `this` is `None`, otherwise
   * returns a promise which resolves to `this`.
   *
   * @category Boolean operators
   * @param fn - a function that will be called if `this` is `None`
   * @returns the result of calling `fn` if `this` is `None`, `this` otherwise
   * @see {@link and}
   * @see {@link andThen}
   * @see {@link andThenAsync}
   * @see {@link or}
   * @see {@link orElse}
   * @see {@link xor}
   */
  orElseAsync(
    this: Option<T>,
    fn: () => Promise<Option<T>>,
  ): Promise<Option<T>> {
    return this.match({
      Some: () => Promise.resolve(this),
      None: fn,
    });
  }

  /**
   * Takes another {@link Option}, if both `this` and the other {@link Option}
   * are either `Some` or `None`, returns `None`.  Otherwise, returns whichever
   * {@link Option} is `Some`.
   *
   * @category Boolean operators
   * @param other - the other {@link Option} to compare with `this`
   * @returns `None` if both `this` and `other` are either `Some` or `None`;
   * otherwise returns whichever {@link Option} is `Some`
   * @see {@link and}
   * @see {@link andThen}
   * @see {@link andThenAsync}
   * @see {@link or}
   * @see {@link orElse}
   * @see {@link orElseAsync}
   */
  xor(this: Option<T>, other: Option<T>): Option<T> {
    return this.isSome() && other.isSome() ? Option.None() : this.or(other);
  }

  /**
   * Transforms `Option<T>` to `Option<U>` by applying the provided function to
   * the contained value of `Some` and leaving `None` values unchanged.
   *
   * @category Transforming contained values
   * @typeParam U - the type of the return value of `fn`
   * @param fn - the function to apply to the value contained if `this` is `Some`
   * @returns `None` if `this` is `None`, otherwise `Some` containing the result
   * of applying `fn` to the value in `this`
   * @see {@link mapAsync}
   * @see {@link mapOr}
   * @see {@link filter}
   * @see {@link zip}
   * @see {@link unzip}
   * @see {@link collect}
   */
  map<U extends NonNullable<unknown>>(
    this: Option<T>,
    fn: (value: T) => U,
  ): Option<U> {
    return this.andThen((value) => Option.Some(fn(value)));
  }

  /**
   * Transforms `Option<T>` to `Promise<Option<U>>` by applying the provided
   * async function to the contained value of `Some` and resolving `None` values
   * unchanged.
   *
   * @category Transforming contained values
   * @typeParam U - the type of the value in the promise returned by `fn`
   * @param fn - the function to apply to the value contained if `this` is
   * `Some`
   * @returns a promise resolving to `None` if `this` is `None`, otherwise a
   * promise resolving to `Some` containing the value resolved by the promise
   * returned from applying `fn` to the value in `this`
   * @see {@link map}
   * @see {@link mapOr}
   * @see {@link filter}
   * @see {@link zip}
   * @see {@link unzip}
   * @see {@link collect}
   */
  mapAsync<U extends NonNullable<unknown>>(
    this: Option<T>,
    fn: (value: T) => Promise<U>,
  ): Promise<Option<U>> {
    return this.andThenAsync(async (value) => Option.Some(await fn(value)));
  }

  /**
   * Applies the provided function to the contained value if `this` is `Some`,
   * otherwise returns the provided default value.
   *
   * @category Transforming contained values
   * @typeParam U - the type of `defaultValue` and the value returned by `fn`
   * @param defaultValue - the value to return if `this` is `None`
   * @param fn - the function to apply to the value contained if `this` is
   * `Some`
   * @returns the result of applying `fn` to the value in `this` if `this` is
   * `Some`, otherwise `defaultValue`
   * @see {@link map}
   * @see {@link mapAsync}
   * @see {@link filter}
   * @see {@link zip}
   * @see {@link unzip}
   * @see {@link collect}
   */
  mapOr<U extends NonNullable<unknown>>(
    this: Option<T>,
    defaultValue: U,
    fn: (value: T) => U,
  ): U {
    return this.map(fn).unwrapOr(defaultValue);
  }

  /**
   * If `this` is `None`, returns `None`.  Otherwise, calls the predicate on the
   * value contained in `this`; if the predicate returns `true` then `this` is
   * returned, if the predicate returns `false` then `None` is returned.
   *
   * @category Transforming contained values
   * @param fn - the predicate function
   * @returns `None` if `this` is `None` or if `fn` returns `false` when applied
   * to the value in `this`, `this` otherwise
   * @see {@link map}
   * @see {@link mapAsync}
   * @see {@link mapOr}
   * @see {@link zip}
   * @see {@link unzip}
   */
  filter(this: Option<T>, fn: (value: T) => boolean): Option<T> {
    return this.andThen((value) => (fn(value) ? this : Option.None()));
  }

  /**
   * Takes another {@link Option}, if both {@link Option} values are `Some`,
   * returns a `Some` containing a tuple of the contained values.  Otherwise
   * returns `None`.
   *
   * @category Transforming contained values
   * @typeParam U - the type of the value in `other`
   * @param other - the other {@link Option} to zip with `this`
   * @returns `Some` containing a tuple with the values in `this` and `other` if
   * both `this` and `other` are `Some`, `None` otherwise
   * @see {@link map}
   * @see {@link mapAsync}
   * @see {@link mapOr}
   * @see {@link filter}
   * @see {@link unzip}
   */
  zip<U extends NonNullable<unknown>>(
    this: Option<T>,
    other: Option<U>,
  ): Option<readonly [T, U]> {
    return this.match({
      Some: (value) => other.map((otherValue) => [value, otherValue]),
      None: () => Option.None(),
    });
  }

  /**
   * Called on an {@link Option} containing a tuple -- if `this` is `Some`,
   * returns a tuple of `Some` containing the contained values. Otherwise,
   * returns a tuple of `None`.
   *
   * @category Transforming contained values
   * @typeParam T - the type of the first value in the tuple in `this`
   * @typeParam U - the type of the second value in the tuple in `this`
   * @returns a tuple of `Some` containing the values in the tuple contained in
   * `this` if `this` is `Some`, a tuple of `None` otherwise
   * @see {@link map}
   * @see {@link mapAsync}
   * @see {@link mapOr}
   * @see {@link filter}
   * @see {@link zip}
   */
  unzip<T extends NonNullable<unknown>, U extends NonNullable<unknown>>(
    this: Option<readonly [T, U]>,
  ): readonly [Option<T>, Option<U>] {
    return this.match({
      Some: (value) => [Option.Some(value[0]), Option.Some(value[1])],
      None: () => [Option.None(), Option.None()],
    });
  }

  /**
   * If `this` is a `Some`, return an {@link Result.Ok} with the contained
   * value.  Otherwise, return an {@link Result.Err} with the value returned by
   * calling the passed function.
   *
   * @category Interacting with Result
   * @typeParam E - the return type of `fn` (and the error type of the returned
   * {@link Result})
   * @param error - a function which returns an error value to use if `this` is
   * `None`
   * @returns {@link Result.Ok} containing the value in `this` if `this` is
   * `Some`, otherwise {@link Result.Err} containing the value returned by
   * `error`
   * @see {@link okOr}
   * @see {@link transpose}
   */
  okOrElse<E extends NonNullable<unknown>>(
    this: Option<T>,
    error: () => E,
  ): Result<T, E> {
    return this.match({
      Some: (value) => Ok(value),
      None: () => Err(error()),
    });
  }

  /**
   * If `this` is a `Some`, return an {@link Result.Ok} with the contained
   * value.  Otherwise, return an {@link Result.Err} containing the passed
   * default error value.
   *
   * @category Interacting with Result
   * @typeParam E - the type of `error` (and the error type of the returned
   * {@link Result})
   * @param error - an error value to use if `this` is `None`
   * @returns {@link Result.Ok} containing the value in `this` if `this` is
   * `Some`, otherwise {@link Result.Err} containing `error`
   * @see {@link okOrElse}
   * @see {@link transpose}
   */
  okOr<E extends NonNullable<unknown>>(
    this: Option<T>,
    error: E,
  ): Result<T, E> {
    return this.okOrElse(() => error);
  }

  /**
   * Convert an {@link Option} containing a {@link Result} into a {@link Result}
   * containing an {@link Option}.
   *
   * @category Interacting with Result
   * @typeParam T - the type of the value contained in the {@link Result}
   * contained in `this`
   * @typeParam E - the error type of the {@link Result} contained in `this`
   * @returns if `this` is `None`, returns {@link Result.Ok} containing `None`;
   * if `this` is `Some` and the {@link Result} in `this` is {@link Result.Err},
   * returns the {@link Result.Err}; otherwise returns {@link Result.Ok}
   * containing `Some` containing the value in the {@link Result} in `this`
   * @see {@link okOr}
   * @see {@link okOrElse}
   */
  transpose<T extends NonNullable<unknown>, E extends NonNullable<unknown>>(
    this: Option<Result<T, E>>,
  ): Result<Option<T>, E> {
    return this.match({
      Some: (result) => result.map((value) => Some(value)),
      None: () => Ok(None()),
    });
  }
}

/**
 * Construct an {@link Option} containing a value.
 *
 * @typeParam T - the type contained by the {@link Option}
 * @param value - the value contained by the {@link Option}
 * @returns an {@link Option} containing `value`
 * @see {@link Option.None}
 * @see {@link Option.wrap}
 */
export const Some = <T extends NonNullable<unknown>>(value: T): Option<T> =>
  Option.Some(value);

/**
 * Construct an empty {@link Option}.
 *
 * @typeParam T - the type contained by the {@link Option}
 * @returns an empty {@link Option}
 * @see {@link Option.Some}
 * @see {@link Option.wrap}
 */
export const None = <T extends NonNullable<unknown>>(): Option<T> =>
  Option.None();
