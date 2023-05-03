/**
 * @packageDocumentation
 *
 * This package contains yet another Typescript clone of the rust `Option` &
 * `Result` enums.
 *
 * # Installing
 *
 * Use the package manager of your choice to install:
 *
 * - **npm**: `npm install --save-dev @cprussin/option-result`
 * - **pnpm**: `pnpm add -D @cprussin/option-result`
 * - **yarn**: `yarn add -D @cprussin/option-result`
 *
 * # Usage
 *
 * This library mostly implements an as-close-to-identical API to the Rust types
 * as possible.
 *
 * @example
 * ```ts
 * import { Some } from "@cprussin/option-result";
 * Some(5)
 *   .map((value) => value + 1)
 *   .match({
 *     Some: (value) => console.log(value),
 *     None: () => console.error("There's nothing here!"),
 *   });
 * ```
 *
 * # FAQ
 *
 * ## Motivation
 *
 * ![But why?](media://but-why.webp)
 *
 * Two main reasons:
 *
 * 1. I didn't find any existing implementations I found to be
 *    satisfactory. They either lacked the strong typing guarantees I wanted, or
 *    they were incomplete and unmaintained, or I simply didn't like their
 *    stylistic preferences. For some reason or another I wasn't happy with any
 *    of the other implementations I tried.
 * 2. It's fun. Type-safe `Option` and `Result` are really rewarding types to
 *    implement. If you haven't tried building them yourself, I strongly
 *    recommend it.
 *
 * ## Why use Rust's `Option` and `Result` instead of Haskell's `Maybe` and `Either`?
 *
 * I opted to implement the Rust versions of these types and not the
 * Haskell/Purescript versions for a few reasons:
 *
 * 1. There are no type classes in Typescript, so approximated `Maybe` and
 *    `Either` implementations would have way more differences from their source
 *    versions than `Option` and `Result` instances.
 * 2. I love Haskell and Purescript (and other ML family languages) personally,
 *    but I also believe those to be far less approachable languages than
 *    Rust. I think the Rust versions are easier to understand and teach and the
 *    terminology is easier to grok for newcomers, at the expense of some degree
 *    of generic code. I use this library practically myself and while I value
 *    type safety, I also value approachability from developers other than
 *    myself, and I believe the Rust versions strike a better balance there than
 *    the Haskell/Purescript ones do.
 * 3. Purescript compiles to Javascript; as such I don't believe there's much
 *    value in cloning types from that language when you could just as easily
 *    write parts of your application in Purescript directly instead and not
 *    have to deal with the shortcomings of using those types in a language not
 *    designed for them.
 */

/* istanbul ignore file */

export * from "./result.js";
export * from "./option.js";
