/* eslint-disable no-console */

import { Ok, Some } from "@cprussin/option-result";

const main = () => {
  console.log(Ok("hello").unwrapOr("uh oh"));
  console.log(Some("world").unwrapOr("uh oh"));
};

main();
