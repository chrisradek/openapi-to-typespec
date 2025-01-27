import {
  Child,
  Children,
  code,
  Indent,
  mapJoin,
  Name,
  refkey as coreRefKey,
  children,
} from "@alloy-js/core";
import { Block } from "./Block.jsx";
import { useTypeSpecNamePolicy } from "../name-policy.js";
import { BaseDeclarationProps, Declaration } from "./Declaration.jsx";

export interface ModelDeclarationProps extends BaseDeclarationProps {
  baseModel?: Child;
  sourceModel?: Child;
}

export function ModelDeclaration(props: ModelDeclarationProps) {
  let showEmptyBlock: boolean = true;
  let parentModel: undefined | Children;
  if (props.baseModel) {
    parentModel = code` extends ${props.baseModel}`;
  } else if (props.sourceModel) {
    parentModel = code` is ${props.sourceModel}`;
    showEmptyBlock = false;
  }

  let block: undefined | Children;
  if (props.children) {
    block = <Block>
      {props.children}
    </Block>;
  } else if (showEmptyBlock) {
    block = <Block />;
  }

  return <Declaration {...props} nameKind="model">
    model <Name />{parentModel}{block ? code`${" "}${block}` : ';'}
  </Declaration>;
}

export interface ModelPropertyProps {
  name: string;
  optional?: boolean;

  type: Children;
  defaultValue?: Children;
}

export function ModelProperty({
  name,
  optional,
  type,
  defaultValue,
}: ModelPropertyProps) {
  const namePolicy = useTypeSpecNamePolicy();
  const propName = namePolicy.getName(name, "model-property");
  return <>{propName}{optional ? "?" : ""}: {type}{defaultValue && <> = {defaultValue}</>};</>;
}

export interface ModelExpressionProps {
  children?: Children;
}

export function ModelExpression({ children }: ModelExpressionProps) {
  return code`
    {
      ${children}
    }
  `;
}
