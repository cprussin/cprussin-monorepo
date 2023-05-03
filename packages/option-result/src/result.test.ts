import { Option, Some, None } from "./option.js";
import { Result, Ok, Err } from "./result.js";

describe("Result", () => {
  describe("collect", () => {
    describe("with an array of Oks", () => {
      it("returns an Ok with an array of the values", () => {
        const result = Result.collect([Ok(1), Ok(2), Ok(3)]);
        expect(result).toStrictEqual(Ok([1, 2, 3]));
      });
    });

    describe("with an array containing some Errs", () => {
      it("returns the first Err", () => {
        expect(Result.collect([Ok(1), Err(2), Err(3)])).toStrictEqual(Err(2));
      });
    });
  });

  describe("wrap", () => {
    describe("when the function succeeds", () => {
      it("returns an Ok with the value", () => {
        expect(Result.wrap(() => "foo")).toStrictEqual(Ok("foo"));
      });
    });

    describe("when the function throws an error", () => {
      it("returns an Err with a Some with the error", () => {
        const result = Result.wrap(() => {
          throw new Error("bar");
        });
        expect(result).toStrictEqual(Err(Some(new Error("bar"))));
      });
    });

    describe("when the function throws a null value", () => {
      it("returns an Err with None", () => {
        const result = Result.wrap(() => {
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw undefined;
        });
        expect(result).toStrictEqual(Err(None()));
      });
    });
  });

  describe("wrapAsync", () => {
    describe("when the promise resolves", () => {
      it("returns an Ok with the value", async () => {
        const result = await Result.wrapAsync(Promise.resolve("foo"));
        expect(result).toStrictEqual(Ok("foo"));
      });
    });

    describe("when the promise rejects with a value", () => {
      it("returns an Err with a Some with the error", async () => {
        const result = await Result.wrapAsync(Promise.reject(new Error("bar")));
        expect(result).toStrictEqual(Err(Some(new Error("bar"))));
      });
    });

    describe("when the promise rejects with a null value", () => {
      it("returns an Err with a None", async () => {
        const result = await Result.wrapAsync(Promise.reject());
        expect(result).toStrictEqual(Err(None()));
      });
    });
  });

  describe("isOk", () => {
    describe("with an Ok", () => {
      it("is true", () => {
        expect(Ok("foo").isOk()).toBe(true);
      });
    });

    describe("with an Err", () => {
      it("is false", () => {
        expect(Err("foo").isOk()).toBe(false);
      });
    });
  });

  describe("isErr", () => {
    describe("with an Ok", () => {
      it("is false", () => {
        expect(Ok("foo").isErr()).toBe(false);
      });
    });

    describe("with an Err", () => {
      it("is true", () => {
        expect(Err("foo").isErr()).toBe(true);
      });
    });
  });

  describe("match", () => {
    describe("with an Ok", () => {
      it("runs the ok arm", () => {
        const result = Ok("foo").match({
          Ok: (value) => value + "baz",
          Err: () => "bar",
        });
        expect(result).toBe("foobaz");
      });
    });

    describe("with an Err", () => {
      it("runs the err arm", () => {
        const result = Err("bar").match({
          Ok: () => "foo",
          Err: (error) => error + "baz",
        });
        expect(result).toBe("barbaz");
      });
    });
  });

  describe("unwrapOrElse", () => {
    describe("with an Ok", () => {
      it("returns the value in the Ok", () => {
        expect(Ok("foo").unwrapOrElse(() => "bar")).toBe("foo");
      });
    });

    describe("with an Err", () => {
      it("returns the fallback value", () => {
        const result = Err(new Error("foo")).unwrapOrElse(
          (error) => error.message + "bar"
        );
        expect(result).toBe("foobar");
      });
    });
  });

  describe("unwrapOr", () => {
    describe("with an Ok", () => {
      it("returns the value in the Ok", () => {
        expect(Ok("foo").unwrapOr("bar")).toBe("foo");
      });
    });

    describe("with an Err", () => {
      it("returns the fallback value", () => {
        expect(Err("foo").unwrapOr("bar")).toBe("bar");
      });
    });
  });

  describe("andThen", () => {
    describe("with an Ok", () => {
      it("returns the new Result", () => {
        const result = Ok("foo").andThen((value) => Ok(value.length));
        expect(result).toStrictEqual(Ok(3));
      });
    });

    describe("with an Err", () => {
      it("returns an Err", () => {
        const result = Err("foo").andThen(() => Ok("bar"));
        expect(result).toStrictEqual(Err("foo"));
      });
    });
  });

  describe("and", () => {
    describe("with an Ok and an Ok", () => {
      it("returns the second Ok", () => {
        const second = Ok("bar");
        expect(Ok("foo").and(second)).toBe(second);
      });
    });

    describe("with an Ok and an Err", () => {
      it("returns the Err", () => {
        const second = Err("bar");
        expect(Ok("foo").and(second)).toBe(second);
      });
    });

    describe("with an Err and an Ok", () => {
      it("returns an Err", () => {
        expect(Err("foo").and(Ok("bar"))).toStrictEqual(Err("foo"));
      });
    });

    describe("with an Err and an Err", () => {
      it("returns an Err with the first value", () => {
        expect(Err("foo").and(Err("bar"))).toStrictEqual(Err("foo"));
      });
    });
  });

  describe("andThenAsync", () => {
    describe("with an Ok", () => {
      it("returns the new Result", async () => {
        const result = await Ok("foo").andThenAsync((value) =>
          Promise.resolve(Ok(value.length))
        );
        expect(result).toStrictEqual(Ok(3));
      });
    });

    describe("with an Err", () => {
      it("returns an Err", async () => {
        const result = await Err(new Error("foo")).andThenAsync(() => {
          const nextResult: Result<string> = Ok("bar");
          return Promise.resolve(nextResult);
        });
        expect(result).toStrictEqual(Err(new Error("foo")));
      });
    });
  });

  describe("orElse", () => {
    describe("with an Ok", () => {
      it("returns an Ok", () => {
        expect(Ok("foo").orElse(() => Ok("bar"))).toStrictEqual(Ok("foo"));
      });
    });

    describe("with an Err", () => {
      it("returns the new Result", () => {
        const result = Err("foo").orElse(() => Ok("bar"));
        expect(result).toStrictEqual(Ok("bar"));
      });
    });
  });

  describe("or", () => {
    describe("with an Ok and an Ok", () => {
      it("returns an Ok with the first value", () => {
        expect(Ok("foo").or(Ok("bar"))).toStrictEqual(Ok("foo"));
      });
    });

    describe("with an Ok and an Err", () => {
      it("returns an Ok with the first value", () => {
        expect(Ok("foo").or(Err("bar"))).toStrictEqual(Ok("foo"));
      });
    });

    describe("with an Err and an Ok", () => {
      it("returns the Ok", () => {
        const second = Ok("bar");
        expect(Err("foo").or(second)).toBe(second);
      });
    });

    describe("with an Err and an Err", () => {
      it("returns the second Err", () => {
        const second = Err("bar");
        expect(Err("foo").or(second)).toBe(second);
      });
    });
  });

  describe("orElseAsync", () => {
    describe("with an Ok", () => {
      it("returns an Ok", async () => {
        const result = await Ok("foo").orElseAsync(() =>
          Promise.resolve(Ok("bar"))
        );
        expect(result).toStrictEqual(Ok("foo"));
      });
    });

    describe("with an Err", () => {
      it("returns the new Result", async () => {
        const result = await Err("foo").orElseAsync(() =>
          Promise.resolve(Ok("bar"))
        );
        expect(result).toStrictEqual(Ok("bar"));
      });
    });
  });

  describe("map", () => {
    describe("with an Ok", () => {
      it("returns the mapped value", () => {
        const result = Ok("foo").map((value) => value.length);
        expect(result).toStrictEqual(Ok(3));
      });
    });

    describe("with an Err", () => {
      it("returns an Err", () => {
        expect(Err("foo").map(() => "bar")).toStrictEqual(Err("foo"));
      });
    });
  });

  describe("mapAsync", () => {
    describe("with an Ok", () => {
      it("returns the mapped value", async () => {
        const result = await Ok("foo").mapAsync((value) =>
          Promise.resolve(value.length)
        );
        expect(result).toStrictEqual(Ok(3));
      });
    });

    describe("with an Err", () => {
      it("returns an Err", async () => {
        const result = await Err("foo").mapAsync(() => Promise.resolve("bar"));
        expect(result).toStrictEqual(Err("foo"));
      });
    });
  });

  describe("mapOr", () => {
    describe("with an Ok", () => {
      it("maps the value", () => {
        const result = Ok("foo").mapOr("bar", (value) => value + "baz");
        expect(result).toBe("foobaz");
      });
    });

    describe("with an Err", () => {
      it("returns the default value", () => {
        const result = Err("foo").mapOr("bar", () => "baz");
        expect(result).toBe("bar");
      });
    });
  });

  describe("mapErr", () => {
    describe("with an Ok", () => {
      it("returns an Ok", () => {
        expect(Ok("foo").mapErr(() => "bar")).toStrictEqual(Ok("foo"));
      });
    });

    describe("with an Err", () => {
      it("returns the mapped value", () => {
        const result = Err(new Error("foo")).mapErr(
          (error) => error.message.length
        );
        expect(result).toStrictEqual(Err(3));
      });
    });
  });

  describe("mapErrAsync", () => {
    describe("with an Ok", () => {
      it("returns an Ok", async () => {
        const newResult = await Ok("foo").mapErrAsync(() =>
          Promise.resolve("bar")
        );
        expect(newResult).toStrictEqual(Ok("foo"));
      });
    });

    describe("with an Err", () => {
      it("returns the mapped value", async () => {
        const result = await Err(new Error("foo")).mapErrAsync((error) =>
          Promise.resolve(error.message.length)
        );
        expect(result).toStrictEqual(Err(3));
      });
    });
  });

  describe("ok", () => {
    describe("with an Ok", () => {
      it("returns a Some with the value", () => {
        expect(Ok("foo").ok()).toStrictEqual(Some("foo"));
      });
    });

    describe("with an Err", () => {
      it("returns a None", () => {
        expect(Err("foo").ok()).toStrictEqual(None());
      });
    });
  });

  describe("err", () => {
    describe("with an Ok", () => {
      it("returns a None", () => {
        expect(Ok("foo").err()).toStrictEqual(None());
      });
    });

    describe("with an Err", () => {
      it("returns a Some with the error", () => {
        expect(Err("foo").err()).toStrictEqual(Some("foo"));
      });
    });
  });

  describe("transpose", () => {
    describe("with an Ok containing a Some", () => {
      it("returns a Some containing an Ok with the inner value", () => {
        expect(Ok(Some("foo")).transpose()).toStrictEqual(Some(Ok("foo")));
      });
    });

    describe("with an Ok containing a None", () => {
      it("returns the None", () => {
        expect(Ok(None()).transpose()).toStrictEqual(None());
      });
    });

    describe("with an Err", () => {
      it("returns a Some containing the Err", () => {
        const result: Result<Option<never>, string> = Err("foo");
        expect(result.transpose()).toStrictEqual(Some(Err("foo")));
      });
    });
  });
});
