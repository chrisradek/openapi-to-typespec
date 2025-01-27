import { Children, code, Name, OutputSymbolFlags, Refkey } from "@alloy-js/core";
import { BaseDeclarationProps, Declaration } from "./Declaration.jsx";
import { useTypeSpecNamePolicy } from "../name-policy.js";
import { createTypeSpecSymbol, TypeSpecOutputSymbol } from "../symbols/typespec-output-symbol.js";
import { Block } from "./Block.jsx";

export interface UnionDeclarationProps extends Omit<BaseDeclarationProps, "flags"> {}

export function UnionDeclaration(props: UnionDeclarationProps) {
  return <Declaration {...props} flags={OutputSymbolFlags.StaticMemberContainer} nameKind="union">
    union <Name /> <Block>
      {props.children}
    </Block>
  </Declaration>;
}

export interface UnionVariantProps {
  type: Children;
  name?: string;
  /**
   * refkey is only relevant if `name` is also provided.
   */
  refkey?: Refkey;
}

export function UnionVariant(props: UnionVariantProps) {
  const namePolicy = useTypeSpecNamePolicy();
  const name = props.name && namePolicy.getName(props.name, "union-variant");

  let sym: TypeSpecOutputSymbol | undefined = undefined;
  if (name && props.refkey) {
    sym = createTypeSpecSymbol({
      name,
      refkey: props.refkey,
      flags: OutputSymbolFlags.StaticMember,
    });
  }

  const nameLabel = name && `${name}: `;

  return code`${nameLabel}${props.type},`
}