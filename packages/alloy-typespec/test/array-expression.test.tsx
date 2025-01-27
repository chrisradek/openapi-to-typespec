import { expect, it } from "vitest";
import { toSourceText } from "./utils.jsx";
import { ArrayExpression } from "../src/components/ArrayExpression.jsx";
import { d } from "@alloy-js/core/testing";

it("renders shorthand syntax", () => {
  expect(toSourceText(
    <ArrayExpression indexer="string" />
  )).toEqual(d`
    string[]
  `)
})

it("renders wrapStyle syntax", () => {
  expect(toSourceText(
    <ArrayExpression indexer="string" wrapStyle />
  )).toEqual(d`
    Array<string>
  `)
})