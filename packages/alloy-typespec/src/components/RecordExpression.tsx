import { Children, code } from "@alloy-js/core";

export interface RecordExpressionProps {
  indexer: Children;
}

export function RecordExpression(props: RecordExpressionProps) {
  return code`Record<${props.indexer}>`;
}