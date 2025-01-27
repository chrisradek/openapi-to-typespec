import { Children, code, join, mapJoin, refkey, Refkey } from "@alloy-js/core";

export interface DecoratorExpressionProps {
  name?: string;
  refkey?: Refkey;
  children?: Children;
}

export function DecoratorExpression(props: DecoratorExpressionProps) {
  return <>
    @{props.name ? props.name : props.refkey}{props.children && <>({props.children})</>}
  </>;
}
