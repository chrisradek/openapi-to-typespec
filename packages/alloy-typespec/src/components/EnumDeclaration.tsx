import {
  Name,
  OutputSymbolFlags,
} from "@alloy-js/core";
import { Block } from "./Block.jsx";
import { BaseDeclarationProps, Declaration } from "./Declaration.jsx";

export interface EnumDeclarationProps extends Omit<BaseDeclarationProps, "flags"> {}

export function EnumDeclaration(props: EnumDeclarationProps) {
  return <Declaration {...props} flags={OutputSymbolFlags.StaticMemberContainer} nameKind="enum">
    enum <Name /> <Block>
      {props.children}
    </Block>
  </Declaration>;
}
