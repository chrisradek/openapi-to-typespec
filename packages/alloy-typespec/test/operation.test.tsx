import { expect, it } from "vitest";
import { toSourceText } from "./utils.jsx";
import { OperationDeclaration } from "../src/components/OperationDeclaration.jsx";
import { d } from "@alloy-js/core/testing";
import { refkey } from "@alloy-js/core";
import { Namespace, Reference } from "../src/index.jsx";

it("works", () => {
  const res = toSourceText(<OperationDeclaration name="foo" />);

  expect(res).toBe(d`
    op foo(): void;
  `);
});

it("can have a returnType", () => {
  const res = toSourceText(
    <OperationDeclaration name="foo" returnType="string" />,
  );

  expect(res).toBe(d`
    op foo(): string;
  `);
});

it("supports parameters", () => {
  const res = toSourceText(
    <OperationDeclaration name="foo">
      <OperationDeclaration.Parameters
        parameters={{bar: {type: "string", refkey: refkey()}}}
      />
    </OperationDeclaration>,
  );

  expect(res).toBe(d`
    op foo(bar: string): void;
  `);
});

it("supports optional parameters", () => {
  const res = toSourceText(
    <OperationDeclaration name="foo">
      <OperationDeclaration.Parameters
        parameters={{bar: {type: "string", refkey: refkey()}, optional: { type: "int32", refkey: refkey(), optional: true}}}
      />
    </OperationDeclaration>,
  );

  expect(res).toBe(d`
    op foo(bar: string, optional?: int32): void;
  `);
});

it("supports reuse", () => {
  const getFooRef = refkey();
  const res = toSourceText(
    <>
    <Namespace name="Api">
      <OperationDeclaration name="getFoo" refkey={getFooRef} />
    </Namespace>
    <Namespace name="OtherApi">
      <OperationDeclaration name="readFoo" sourceOperation={getFooRef} />
    </Namespace>
    </>,
  );

  expect(res).toBe(d`
    namespace Api {
      op getFoo(): void;
    }
    namespace OtherApi {
      op readFoo is Api.getFoo;
    }
  `);
});
