import { expect, it } from "vitest";
import { toSourceText } from "./utils.jsx";
import { ScalarDeclaration } from "../src/components/ScalarDeclaration.jsx";
import { d } from "@alloy-js/core/testing";

it("declares scalars", () => {
  const res = toSourceText(<ScalarDeclaration name="Foo" />);
  expect(res).toEqual(d`
    scalar Foo;
  `);
});

it("can extend base scalar", () => {
  const res = toSourceText(
    <ScalarDeclaration name="Foo" baseScalar={"string"} />,
  );
  expect(res).toEqual(d`
    scalar Foo extends string;
  `);
});
