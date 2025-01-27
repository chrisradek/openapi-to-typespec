import { expect, it } from "vitest";
import { toSourceText } from "./utils.jsx";
import { UnionExpression } from "../src/components/UnionExpression.jsx";
import { ModelExpression, ModelProperty, ValueExpression } from "../src/index.jsx";
import { d } from "@alloy-js/core/testing";

it("renders a single variant", () => {
  expect(toSourceText(
    <UnionExpression variants={[<ValueExpression value={1} />]} />
  )).toEqual(d`
    1
  `);
})

it("renders multiple variants", () => {
  expect(toSourceText(
    <UnionExpression
      variants={[
        <ValueExpression value={1} />,
        <ValueExpression value={"foo"} />,
        <ModelExpression>
          <ModelProperty name="foo" type="string" />
        </ModelExpression>
      ]}
    />
  )).toEqual(d`
    1 | "foo" | {
      foo: string;
    }
  `);
});