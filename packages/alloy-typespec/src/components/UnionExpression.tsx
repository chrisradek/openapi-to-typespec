import { Child, code, join } from "@alloy-js/core";

export interface UnionExpressionProps {
  variants: Child[];
}

export function UnionExpression(props: UnionExpressionProps) {
  if (props.variants.length === 0) {
    throw new Error("UnionExpression must have at least one variant");
  }

  return code`${join(props.variants, { joiner: " | " })}`;
}