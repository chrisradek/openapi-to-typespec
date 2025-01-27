import { expect, it } from "vitest";
import { toSourceText } from "./utils.jsx";
import { EnumDeclaration } from "../src/components/EnumDeclaration.jsx";
import { d } from "@alloy-js/core/testing";
import { EnumMember } from "../src/components/EnumMember.jsx";
import { NamePolicyContext, refkey } from "@alloy-js/core";
import { createTypeSpecNamePolicy, Reference } from "../src/index.jsx";

it("declares enums with members", () => {
  const res = toSourceText(
    <EnumDeclaration name="Direction">
      <EnumMember name="North" />
      <EnumMember name="East" />
      <EnumMember name="South" />
      <EnumMember name="West" />
    </EnumDeclaration>,
  );
  expect(res).toEqual(d`
    enum Direction {
      North,
      East,
      South,
      West,
    }
  `);
});

it("renders enums with custom values", () => {
  const res = toSourceText(
    <EnumDeclaration name="Foo">
      <EnumMember name="North" value={"north"} />
      <EnumMember name="Ten" value={10} />
      <EnumMember name="Half" value={0.5} />
      EscapeHatch,
    </EnumDeclaration>,
  );
  expect(res).toEqual(d`
    enum Foo {
      North: "north",
      Ten: 10,
      Half: 0.5,
      EscapeHatch,
    }
  `);
});

it("can reference enum members by refkey", () => {
  const northMember = refkey();

  const res = toSourceText(
    <>
      <EnumDeclaration name="Direction">
        <EnumMember name="North" refkey={northMember} />
        <EnumMember name="East" />
        <EnumMember name="South" />
        <EnumMember name="West" />
      </EnumDeclaration>

      <Reference refkey={northMember} />;
    </>,
  );
  expect(res).toEqual(d`
    enum Direction {
      North,
      East,
      South,
      West,
    }

    Direction.North;
  `);
});

it("supports the naming policy", () => {
  const policy = createTypeSpecNamePolicy();
  const res = toSourceText(
    <NamePolicyContext.Provider value={policy}>
      <EnumDeclaration name="direction">
        <EnumMember name="north" />
        <EnumMember name="east" />
        <EnumMember name="south" />
        <EnumMember name="west" />
      </EnumDeclaration>
    </NamePolicyContext.Provider>,
  );
  expect(res).toEqual(d`
    enum Direction {
      North,
      East,
      South,
      West,
    }
  `);
});