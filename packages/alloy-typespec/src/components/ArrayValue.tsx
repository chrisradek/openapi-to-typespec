import { computed, Indent, mapJoin, memo } from "@alloy-js/core";
import { ValueExpression } from "./ValueExpression.jsx";

export interface ArrayValueProps {
  value?: unknown[];
}

export function ArrayValue(props: ArrayValueProps) {
  const elements = computed(() => {
    const value = props.value ?? [];

    const elements = mapJoin(
      value,
      (value) => <ValueExpression value={value} />,
      {
        joiner: ",\n",
      },
    );

    return elements;
  });

  return memo(() => {
    if (elements.value.length === 0) {
      return "#[]";
    } else {
      return ["#[\n", <Indent>{elements.value}</Indent>, "\n]"];
    }
  });
}
