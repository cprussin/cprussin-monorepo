import { Option, Some, None } from "./option.js";
import { Result, Ok, Err } from "./result.js";

describe("Option", () => {
  describe("collect", () => {
    describe("with an array of Somes", () => {
      it("returns a Some with an array of the values", () => {
        const option = Option.collect([Some(1), Some(2), Some(3)]);
        expect(option).toStrictEqual(Some([1, 2, 3]));
      });
    });

    describe("with an array containing some Nones", () => {
      it("returns a None", () => {
        expect(Option.collect([Some(1), None(), None()])).toStrictEqual(None());
      });
    });
  });

  describe("wrap", () => {
    describe("with a null", () => {
      it("returns a None", () => {
        // eslint-disable-next-line unicorn/no-null
        expect(Option.wrap(null)).toStrictEqual(None());
      });
    });

    describe("with an undefined", () => {
      it("returns a None", () => {
        expect(Option.wrap(undefined)).toStrictEqual(None());
      });
    });

    describe("with any other value", () => {
      it("returns a Some with the value", () => {
        expect(Option.wrap("foo")).toStrictEqual(Some("foo"));
      });
    });
  });

  describe("isSome", () => {
    describe("with a Some", () => {
      it("is true", () => {
        expect(Some("foo").isSome()).toBe(true);
      });
    });

    describe("with a None", () => {
      it("is false", () => {
        expect(None().isSome()).toBe(false);
      });
    });
  });

  describe("isNone", () => {
    describe("with a Some", () => {
      it("is false", () => {
        expect(Some("foo").isNone()).toBe(false);
      });
    });

    describe("with a None", () => {
      it("is true", () => {
        expect(None().isNone()).toBe(true);
      });
    });
  });

  describe("match", () => {
    describe("with a Some", () => {
      it("runs the some arm", () => {
        const option = Some("foo").match({
          Some: (value) => value + "baz",
          None: () => "bar",
        });
        expect(option).toBe("foobaz");
      });
    });

    describe("with a None", () => {
      it("runs the none arm", () => {
        const option = None().match({
          Some: () => "foo",
          None: () => "bar",
        });
        expect(option).toBe("bar");
      });
    });
  });

  describe("unwrapOrElse", () => {
    describe("with a Some", () => {
      it("returns the value in the Some", () => {
        expect(Some("foo").unwrapOrElse(() => "bar")).toBe("foo");
      });
    });

    describe("with a None", () => {
      it("returns the fallback value", () => {
        const option = None().unwrapOrElse(() => "bar");
        expect(option).toBe("bar");
      });
    });
  });

  describe("unwrapOr", () => {
    describe("with a Some", () => {
      it("returns the value in the Some", () => {
        expect(Some("foo").unwrapOr("bar")).toBe("foo");
      });
    });

    describe("with a None", () => {
      it("returns the fallback value", () => {
        expect(None().unwrapOr("bar")).toBe("bar");
      });
    });
  });

  describe("andThen", () => {
    describe("with a Some", () => {
      it("returns the new Option", () => {
        const option = Some("foo").andThen((value) => Some(value.length));
        expect(option).toStrictEqual(Some(3));
      });
    });

    describe("with a None", () => {
      it("returns a None", () => {
        expect(None().andThen(() => Some("bar"))).toStrictEqual(None());
      });
    });
  });

  describe("and", () => {
    describe("with a Some and a Some", () => {
      it("returns the second Some", () => {
        const second = Some("bar");
        const option = Some("foo").and(second);
        expect(option).toBe(second);
      });
    });

    describe("with a Some and a None", () => {
      it("returns the None", () => {
        const second = None();
        const option = Some("foo").and(second);
        expect(option).toBe(second);
      });
    });

    describe("with a None and a Some", () => {
      it("returns a None", () => {
        expect(None().and(Some("bar"))).toStrictEqual(None());
      });
    });

    describe("with a None and a None", () => {
      it("returns a None", () => {
        expect(None().and(None())).toStrictEqual(None());
      });
    });
  });

  describe("andThenAsync", () => {
    describe("with a Some", () => {
      it("returns the new Option", async () => {
        const option = await Some("foo").andThenAsync((value) =>
          Promise.resolve(Some(value.length)),
        );
        expect(option).toStrictEqual(Some(3));
      });
    });

    describe("with a None", () => {
      it("returns a None", async () => {
        const option = await None().andThenAsync(() =>
          Promise.resolve(Some("bar")),
        );
        expect(option).toStrictEqual(None());
      });
    });
  });

  describe("orElse", () => {
    describe("with a Some", () => {
      it("returns the Some", () => {
        const first = Some("foo");
        expect(first.orElse(() => Some("bar"))).toBe(first);
      });
    });

    describe("with a None", () => {
      it("returns the new Option", () => {
        expect(None().orElse(() => Some("bar"))).toStrictEqual(Some("bar"));
      });
    });
  });

  describe("or", () => {
    describe("with a Some and a Some", () => {
      it("returns the first Some", () => {
        const first = Some("foo");
        expect(first.or(Some("bar"))).toBe(first);
      });
    });

    describe("with a Some and a None", () => {
      it("returns the Some", () => {
        const first = Some("foo");
        expect(first.or(None())).toBe(first);
      });
    });

    describe("with a None and a Some", () => {
      it("returns the Some", () => {
        const second = Some("bar");
        expect(None().or(second)).toBe(second);
      });
    });

    describe("with a None and a None", () => {
      it("returns the second None", () => {
        const second = None();
        expect(None().or(second)).toBe(second);
      });
    });
  });

  describe("orElseAsync", () => {
    describe("with a Some", () => {
      it("returns the Some", async () => {
        const first = Some("foo");
        const option = await first.orElseAsync(() =>
          Promise.resolve(Some("bar")),
        );
        expect(option).toBe(first);
      });
    });

    describe("with a None", () => {
      it("returns the new Option", async () => {
        const option = await None().orElseAsync(() =>
          Promise.resolve(Some("bar")),
        );
        expect(option).toStrictEqual(Some("bar"));
      });
    });
  });

  describe("xor", () => {
    describe("with a Some and a Some", () => {
      it("returns a None", () => {
        expect(Some("foo").xor(Some("bar"))).toStrictEqual(None());
      });
    });

    describe("with a Some and a None", () => {
      it("returns the Some", () => {
        const first = Some("foo");
        expect(first.xor(None())).toBe(first);
      });
    });

    describe("with a None and a Some", () => {
      it("returns the Some", () => {
        const second = Some("bar");
        expect(None().xor(second)).toBe(second);
      });
    });

    describe("with a None and a None", () => {
      it("returns a None", () => {
        expect(None().xor(None())).toStrictEqual(None());
      });
    });
  });

  describe("map", () => {
    describe("with a Some", () => {
      it("returns the mapped value", () => {
        expect(Some("foo").map((value) => value.length)).toStrictEqual(Some(3));
      });
    });

    describe("with a None", () => {
      it("returns a None", () => {
        expect(None().map(() => "bar")).toStrictEqual(None());
      });
    });
  });

  describe("mapAsync", () => {
    describe("with a Some", () => {
      it("returns the mapped value", async () => {
        const option = await Some("foo").mapAsync((value) =>
          Promise.resolve(value.length),
        );
        expect(option).toStrictEqual(Some(3));
      });
    });

    describe("with a None", () => {
      it("returns a None", async () => {
        const option = await None().mapAsync(() => Promise.resolve("bar"));
        expect(option).toStrictEqual(None());
      });
    });
  });

  describe("mapOr", () => {
    describe("with a Some", () => {
      it("maps the value", () => {
        const option = Some("foo").mapOr("bar", (value) => value + "baz");
        expect(option).toBe("foobaz");
      });
    });

    describe("with a None", () => {
      it("returns the default value", () => {
        expect(None().mapOr("bar", () => "baz")).toBe("bar");
      });
    });
  });

  describe("filter", () => {
    describe("with a Some that matches the filter", () => {
      it("returns the Some", () => {
        const oldOption = Some("foo");
        const newOption = oldOption.filter((value) => value.length === 3);
        expect(oldOption).toBe(newOption);
      });
    });

    describe("with a Some that does not match the filter", () => {
      it("returns a None", () => {
        const option = Some("foo").filter((value) => value.length === 4);
        expect(option).toStrictEqual(None());
      });
    });

    describe("with a None", () => {
      it("returns the None", () => {
        const oldOption = None();
        expect(oldOption.filter(() => true)).toStrictEqual(oldOption);
      });
    });
  });

  describe("zip", () => {
    describe("with a Some and a Some", () => {
      it("returns a Some of a tuple", () => {
        expect(Some("foo").zip(Some("bar"))).toStrictEqual(
          Some(["foo", "bar"]),
        );
      });
    });

    describe("with a Some and a None", () => {
      it("returns a None", () => {
        expect(Some("foo").zip(None())).toStrictEqual(None());
      });
    });

    describe("with a None and a Some", () => {
      it("returns a None", () => {
        expect(None().zip(Some("foo"))).toStrictEqual(None());
      });
    });

    describe("with a None and a None", () => {
      it("returns a None", () => {
        expect(None().zip(None())).toStrictEqual(None());
      });
    });
  });

  describe("unzip", () => {
    describe("with a Some of a tuple", () => {
      it("returns a tuple of Some", () => {
        const option = Some(["foo", "bar"] as const);
        expect(option.unzip()).toStrictEqual([Some("foo"), Some("bar")]);
      });
    });

    describe("with a None", () => {
      it("returns a tuple of None", () => {
        const option: Option<readonly [string, string]> = None();
        expect(option.unzip()).toStrictEqual([None(), None()]);
      });
    });
  });

  describe("okOrElse", () => {
    describe("with a Some", () => {
      it("returns an Ok", () => {
        expect(Some("foo").okOrElse(() => "bar")).toStrictEqual(Ok("foo"));
      });
    });

    describe("with a None", () => {
      it("returns an Err", () => {
        expect(None().okOrElse(() => "bar")).toStrictEqual(Err("bar"));
      });
    });
  });

  describe("okOr", () => {
    describe("with a Some", () => {
      it("returns an Ok", () => {
        expect(Some("foo").okOr("bar")).toStrictEqual(Ok("foo"));
      });
    });

    describe("with a None", () => {
      it("returns an Err", () => {
        expect(None().okOr("bar")).toStrictEqual(Err("bar"));
      });
    });
  });

  describe("transpose", () => {
    describe("with a Some containing an Ok", () => {
      it("returns an Ok containing a Some with the inner value", () => {
        expect(Some(Ok("foo")).transpose()).toStrictEqual(Ok(Some("foo")));
      });
    });

    describe("with a Some containing an Err", () => {
      it("returns an Err with the same contents", () => {
        expect(Some(Err("foo")).transpose()).toStrictEqual(Err("foo"));
      });
    });

    describe("with a None", () => {
      it("returns an Ok containing the None", () => {
        const option: Option<Result<never, never>> = None();
        expect(option.transpose()).toStrictEqual(Ok(None()));
      });
    });
  });
});
