import { Children, code, Name } from "@alloy-js/core";
import { BaseDeclarationProps, Declaration } from "./Declaration.jsx";

export interface AliasDeclarationProps
  extends Omit<BaseDeclarationProps, "children"> {
  type: Children;
  templateParameters?: Children;
}

export function AliasDeclaration({
  type,
  templateParameters,
  ...props
}: AliasDeclarationProps) {
  const template = templateParameters ?
    code`<${templateParameters}>`
  : templateParameters;

  return <Declaration {...props} nameKind="alias">
    alias <Name />{template} = {type};
  </Declaration>;
}
