import { expect, it } from "vitest";
import { toSourceText } from "./utils.jsx";
import { TupleExpression } from "../src/components/TupleExpression.jsx";
import { d } from "@alloy-js/core/testing";
import { TypeExpression } from "../src/index.jsx";

it("renders children inside brackets", () => {
  expect(
    toSourceText(
      <TupleExpression
        items={[
          <TypeExpression builtin="string" />,
          <TypeExpression builtin="int32" />
        ]}
      />,
    ),
  ).toEqual(d`
    [string, int32]
  `);
});
