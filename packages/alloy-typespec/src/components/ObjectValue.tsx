import { computed, mapJoin, memo } from "@alloy-js/core";
import { ValueExpression } from "./ValueExpression.jsx";

export interface ObjectValueProps {
  value?: [string, unknown][] | Map<string, unknown> | Record<string, unknown>;
}

export function ObjectValue(props: ObjectValueProps) {
  const elements = computed(() => {
    const value = props.value;
    let properties: [string, unknown][];
    if (Array.isArray(value)) {
      properties = value;
    } else if (value instanceof Map) {
      properties = [...value.entries()];
    } else if (value !== undefined) {
      properties = Object.entries(value);
    } else {
      properties = [];
    }

    properties = properties.filter(([name, val]) => {
      return typeof val !== "undefined";
    });

    const elements = mapJoin(
      properties,
      ([name, value]) => <>{name}: <ValueExpression value={value} /></>,
      { joiner: ",\n" },
    );

    return elements;
  });

  return memo(() => {
    if (elements.value.length === 0) {
      return "#{}";
    } else {
      return <>
        #{"{"}
          {elements.value}
        {"}"}
      </>;
    }
  });
}
