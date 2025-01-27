import { expect, it } from "vitest";
import { toSourceText } from "./utils.jsx";
import {
  ModelDeclaration,
  ModelProperty,
} from "../src/components/ModelDeclaration.jsx";
import { d } from "@alloy-js/core/testing";
import { Reference } from "../src/components/Reference.jsx";
import { NamePolicyContext, refkey } from "@alloy-js/core";
import { createTypeSpecNamePolicy } from "../src/name-policy.js";
import { ValueExpression } from "../src/index.jsx";
import { SpreadExpression } from "../src/components/SpreadExpression.jsx";
import { TypeExpression } from "../src/components/TypeExpression.jsx";

it("declares models", () => {
  const res = toSourceText(<ModelDeclaration name="Foo" />);
  expect(res).toEqual(d`
    model Foo {}
  `);
});

it("can create members", () => {
  const res = toSourceText(
    <ModelDeclaration name="Foo">
      <ModelProperty name="member" type={<TypeExpression builtin="string"/>} />
      <ModelProperty name="circular" type={<Reference refkey={refkey("Foo")} />} />
    </ModelDeclaration>,
  );
  expect(res).toEqual(d`
    model Foo {
      member: string;
      circular: Foo;
    }
  `);
});

it("can create optional members", () => {
  const res = toSourceText(
    <ModelDeclaration name="Foo">
      <ModelProperty name="member" type="string" />
      <ModelProperty optional name="circular" type={<Reference refkey={refkey("Foo")} />} />
    </ModelDeclaration>,
  );
  expect(res).toEqual(d`
    model Foo {
      member: string;
      circular?: Foo;
    }
  `);
});

it("can create members with default values", () => {
  const res = toSourceText(
    <ModelDeclaration name="Foo">
      <ModelProperty name="member" type="string" defaultValue={<ValueExpression value={"welcome"} />} />
    </ModelDeclaration>,
  );
  expect(res).toEqual(d`
    model Foo {
      member: string = "welcome";
    }
  `);
});

it("supports the naming policy", () => {
  const policy = createTypeSpecNamePolicy();
  const res = toSourceText(
    <NamePolicyContext.Provider value={policy}>
      <ModelDeclaration name="model_name">
        <ModelProperty name="member_property" type="string" />
        <ModelProperty name="circular" type={<Reference refkey={refkey("model_name")} />} />
      </ModelDeclaration>
    </NamePolicyContext.Provider>,
  );
  expect(res).toEqual(d`
    model ModelName {
      memberProperty: string;
      circular: ModelName;
    }
  `);
});

it("can extend models", () => {
  const res = toSourceText(
    <>
      <ModelDeclaration name="Pet" />
      <ModelDeclaration name="Cat" baseModel={refkey("Pet")} />
    </>,
  );

  expect(res).toEqual(d`
    model Pet {}
    model Cat extends Pet {}
  `);
});

it("can is a model", () => {
  const res = toSourceText(
    <>
      <ModelDeclaration name="Pet" />
      <ModelDeclaration name="Cat" sourceModel={refkey("Pet")} />
    </>,
  );

  expect(res).toEqual(d`
    model Pet {}
    model Cat is Pet;
  `);
});

it("can spread properties", () => {
  const res = toSourceText(
    <>
      <ModelDeclaration name="Pet" />
      <ModelDeclaration name="Cat">
        <SpreadExpression type={refkey("Pet")} />;
      </ModelDeclaration>
    </>,
  );

  expect(res).toEqual(d`
    model Pet {}
    model Cat {
      ...Pet;
    }
  `);
})