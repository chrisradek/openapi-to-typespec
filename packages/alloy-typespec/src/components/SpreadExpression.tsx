import { Children, code } from "@alloy-js/core";

export interface SpreadExpressionProps {
  type: Children;
}

export function SpreadExpression({ type }: SpreadExpressionProps) {
  return code`...${type}`;
}