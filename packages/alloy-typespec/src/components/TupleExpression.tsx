import { Children, childrenArray, code, join, mapJoin } from "@alloy-js/core";

export interface TupleExpressionProps {
  items?: Children[];
}

export function TupleExpression(props: TupleExpressionProps) {
  const children = childrenArray(() => props.items);
  return code`[${join(children, { joiner: ", " })}]`;
}
