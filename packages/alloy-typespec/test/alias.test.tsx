import { expect, it } from "vitest";
import { toSourceText } from "./utils.jsx";
import { AliasDeclaration } from "../src/components/AliasDeclaration.jsx";
import { createTypeSpecNamePolicy, ValueExpression } from "../src/index.jsx";
import { d } from "@alloy-js/core/testing";
import { NamePolicyContext } from "@alloy-js/core";

it("aliases string value", () => {
  const res = toSourceText(
    <AliasDeclaration name="Foo" type={<ValueExpression value={"foo"} />} />,
  );
  expect(res).toEqual(d`
    alias Foo = "foo";
  `);
});

it("aliases number value", () => {
  const res = toSourceText(
    <AliasDeclaration name="Foo" type={<ValueExpression value={42} />} />,
  );
  expect(res).toEqual(d`
    alias Foo = 42;
  `);
});

it("aliases boolean value", () => {
  const res = toSourceText(
    <AliasDeclaration name="Foo" type={<ValueExpression value={true} />} />,
  );
  expect(res).toEqual(d`
    alias Foo = true;
  `);
});

it("aliases boolean value", () => {
  const res = toSourceText(
    <AliasDeclaration name="Foo" type={<ValueExpression value={true} />} />,
  );
  expect(res).toEqual(d`
    alias Foo = true;
  `);
});

it("supports the naming policy", () => {
  const policy = createTypeSpecNamePolicy();
  expect(
    toSourceText(
      <NamePolicyContext.Provider value={policy}>
      <AliasDeclaration name="foo_bar" type={`"string"`} />
    </NamePolicyContext.Provider>,
    ),
  ).toEqual(d`
    alias fooBar = "string";
  `);
});

it("supports template parameters", () => {
  const res = toSourceText(
    <AliasDeclaration
      name="Foo"
      templateParameters="T"
      type="T"
    />,
  );
  expect(res).toEqual(d`
    alias Foo<T> = T;
  `);
});
