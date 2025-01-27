import * as core from "@alloy-js/core";
import { TypeSpecElements, useTypeSpecNamePolicy } from "../name-policy.js";
import { createTypeSpecSymbol } from "../symbols/typespec-output-symbol.js";

export interface BaseDeclarationProps extends core.DeclarationProps {
  name: string;
  flags?: core.OutputSymbolFlags;
}

export interface DeclarationProps extends BaseDeclarationProps {
  nameKind: TypeSpecElements;
  
}

export function Declaration(props: DeclarationProps) {
  const namePolicy = useTypeSpecNamePolicy();

  const sym = createTypeSpecSymbol({
    name: namePolicy.getName(props.name, props.nameKind),
    refkey: props.refkey ?? core.refkey(props.name),
    flags: props.flags
  })

  let children: core.Children;
  if (sym.flags & core.OutputSymbolFlags.MemberContainer) {
    children = <core.MemberScope owner={sym}>{props.children}</core.MemberScope>;
  } else {
    children = () => props.children;
  }

  return <core.Declaration symbol={sym}>{children}</core.Declaration>;
}
