import { expect, it } from "vitest";
import { toSourceText } from "./utils.jsx";
import { d } from "@alloy-js/core/testing";
import { RecordExpression } from "../src/components/RecordExpression.jsx";

it("works", () => {
  expect(toSourceText(
    <RecordExpression indexer="string" />
  )).toEqual(d`
    Record<string>
  `)
})