import { memo } from "@alloy-js/core";
import { ArrayValue } from "./ArrayValue.jsx";
import { ObjectValue } from "./ObjectValue.jsx";

export interface ValueExpressionProps {
  value: unknown;
}

export function ValueExpression({ value }: ValueExpressionProps) {
  return memo(() => {
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    } else if (typeof value === "string") {
      return `"${value}"`;
    } else if (value === null) {
      return "null";
    } else if (typeof value === "object") {
      if (Array.isArray(value)) {
        return <ArrayValue value={value} />;
      } else {
        return <ObjectValue value={value as Record<string, unknown>} />;
      }
    }
  });
}
