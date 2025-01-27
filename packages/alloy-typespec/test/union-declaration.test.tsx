import { expect, it } from "vitest";
import { toSourceText } from "./utils.jsx";
import { UnionDeclaration, UnionVariant } from "../src/components/UnionDeclaration.jsx";
import { createTypeSpecNamePolicy, Reference, ValueExpression } from "../src/index.jsx";
import { d } from "@alloy-js/core/testing";
import { NamePolicyContext, refkey } from "@alloy-js/core";

it("declares unions with anonymous members", () => {
  expect(toSourceText(
    <UnionDeclaration name="Choices">
      <UnionVariant type={<ValueExpression value={"First"} />} />
      <UnionVariant type={<ValueExpression value={"Second"} />} />
    </UnionDeclaration>
  )).toEqual(d`
    union Choices {
      "First",
      "Second",
    }
  `)
});

it("declares unions with named members", () => {
  expect(toSourceText(
    <UnionDeclaration name="Choices">
      <UnionVariant name="first" type={<ValueExpression value={"First"} />} />
      <UnionVariant name="second" type={<ValueExpression value={"Second"} />} />
    </UnionDeclaration>
  )).toEqual(d`
    union Choices {
      first: "First",
      second: "Second",
    }
  `)
});

it("can reference named union variants", () => {
  const firstVariant = refkey();

  expect(toSourceText(
    <>
      <UnionDeclaration name="Choices">
        <UnionVariant name="first" refkey={firstVariant} type={<ValueExpression value={"First"} />} />
        <UnionVariant name="second" type={<ValueExpression value={"Second"} />} />
      </UnionDeclaration>

      <Reference refkey={firstVariant} />;
    </>
  )).toEqual(d`
    union Choices {
      first: "First",
      second: "Second",
    }

    Choices.first;
  `)
})

it("supports the naming policy", () => {
  const policy = createTypeSpecNamePolicy();
  expect(toSourceText(
    <NamePolicyContext.Provider value={policy}>
      <UnionDeclaration name="choices">
        <UnionVariant name="First" type={<ValueExpression value={"First"} />} />
        <UnionVariant name="Second" type={<ValueExpression value={"Second"} />} />
      </UnionDeclaration>
    </NamePolicyContext.Provider>
  )).toEqual(d`
    union Choices {
      first: "First",
      second: "Second",
    }
  `);
});