import { code, computed, mapJoin, memo } from "@alloy-js/core";

export interface LegacyModelExpressionProps {
  value?: Record<string, unknown>;
}

export function LegacyModelExpression(props: LegacyModelExpressionProps) {
  const elements = computed(() => {
    const value = props.value;
    let properties: [string, unknown][];
    if (typeof value !== "undefined") {
      properties = Object.entries(value);
    } else {
      properties = [];
    }

    // Filter out undefined properties
    properties = properties.filter(([name, val]) => {
      return typeof val !== "undefined";
    });

    const elements = mapJoin(
      properties,
      ([name, value]) => {
        let valueExpression;
        if (Array.isArray(value)) {
          valueExpression = <LegacyArrayExpression values={value} />;
        } else if (typeof value === "number" || typeof value === "boolean") {
          valueExpression = String(value);
        } else if (typeof value === "string") {
          valueExpression = `"${value}"`;
        } else if (value === null) {
          valueExpression = "null";
        } else if (typeof value === "object") {
          valueExpression =
            <LegacyModelExpression value={value as Record<string, unknown>} />;
        }
        return code`${name}: ${valueExpression}`;
      },
      {
        joiner: ", ",
      },
    );

    return elements;
  });

  return memo(() => {
    if (elements.value.length === 0) {
      return "{}";
    } else {
      return code`{ ${elements.value} }`;
    }
  });
}

interface LegacyArrayExpressionProps {
  values: unknown[];
}

function LegacyArrayExpression(props: LegacyArrayExpressionProps) {
  const elements = computed(() => {
    const values = props.values;

    const elements = mapJoin(
      values,
      (value) => {
        if (Array.isArray(value)) {
          return <LegacyArrayExpression values={value} />;
        } else if (typeof value === "number" || typeof value === "boolean") {
          return String(value);
        } else if (typeof value === "string") {
          return `"${value}"`;
        } else if (value === null) {
          return "null";
        } else if (typeof value === "object") {
          return <LegacyModelExpression value={value as Record<string, unknown>} />;
        }
      },
      { joiner: ", " },
    );
    return elements;
  });

  return memo(() => {
    if (elements.value.length === 0) {
      return "[]";
    } else {
      return code`[${elements.value}]`;
    }
  });
}
