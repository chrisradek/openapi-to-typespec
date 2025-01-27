import { expect, it } from "vitest";
import { assertFileContents, toSourceText } from "./utils.jsx";
import { DecoratorExpression } from "../src/components/DecoratorExpression.jsx";
import { d } from "@alloy-js/core/testing";
import { SourceFile, ValueExpression } from "../src/index.jsx";
import { Output, render } from "@alloy-js/core";
import { http } from "../src/libs/http.js";

it("renders a decorator", () => {
  const res = toSourceText(<DecoratorExpression name="foo" />);
  expect(res).toEqual(d`
    @foo
  `);
});

it("renders a decorator with arguments", () => {
  const res = toSourceText(
    <DecoratorExpression name="encode">
      <ValueExpression value={"unixTimestamp"} />, int32
    </DecoratorExpression>,
  );
  expect(res).toEqual(d`
    @encode("unixTimestamp", int32)
  `);
});

it("works with externals", () => {
  const output = render(
    <Output externals={[http]}>
        <SourceFile path="main.tsp">
          <DecoratorExpression refkey={http.Http["@get"]}></DecoratorExpression>
        </SourceFile>
      </Output>,
  );

  assertFileContents(output, {
    "main.tsp": `
        import "@typespec/http";
        @Http.get
      `,
  });
});
