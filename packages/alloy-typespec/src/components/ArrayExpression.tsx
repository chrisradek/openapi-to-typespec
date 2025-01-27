import { Children, code } from "@alloy-js/core";

export interface ArrayExpressionProps {
  wrapStyle?: boolean;
  indexer: Children;
}

export function ArrayExpression(props: ArrayExpressionProps) {
  if (props.wrapStyle) {
    return code`Array<${props.indexer}>`;
  }

  return code`${props.indexer}[]`;
}