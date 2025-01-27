import {
  Children,
  Declaration,
  DeclarationProps,
  Name,
  refkey,
} from "@alloy-js/core";
import { useTypeSpecNamePolicy } from "../name-policy.js";
import { createTypeSpecSymbol } from "../symbols/typespec-output-symbol.js";

export interface ScalarDeclarationProps
  extends Omit<DeclarationProps, "children"> {
  name: string;
  baseScalar?: Children;
}

export function ScalarDeclaration({
  baseScalar,
  ...props
}: ScalarDeclarationProps) {
  const namePolicy = useTypeSpecNamePolicy();
  const name = namePolicy.getName(props.name, "scalar");
  const sym = createTypeSpecSymbol({
    name,
    refkey: props.refkey ?? refkey(props.name),
  });

  return <Declaration symbol={sym}>
    scalar {name}{baseScalar && <> extends {baseScalar}</>};
  </Declaration>;
}
