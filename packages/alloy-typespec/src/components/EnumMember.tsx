import { OutputSymbolFlags, Refkey, useBinder, useMemberScope } from "@alloy-js/core";
import { useTypeSpecNamePolicy } from "../name-policy.js";
import {
  createTypeSpecSymbol,
  TypeSpecOutputSymbol,
} from "../symbols/typespec-output-symbol.js";
import { ValueExpression } from "./ValueExpression.jsx";
import { printIdentifier } from "@typespec/compiler";

export interface EnumMemberProps {
  name: string;
  value?: string | number;
  refkey?: Refkey;
}

export function EnumMember(props: EnumMemberProps) {
  const namePolicy = useTypeSpecNamePolicy();
  const name = namePolicy.getName(props.name, "enum-member");

  let sym: TypeSpecOutputSymbol | undefined = undefined;
  if (props.refkey) {
    sym = createTypeSpecSymbol({
      name,
      refkey: props.refkey,
      flags: OutputSymbolFlags.StaticMember,
    });
  }

  const nameCode = printIdentifier(sym ? sym.name : name);
  const valueCode = props.value ?
    <ValueExpression value={props.value} />
  : props.value;

  return <>{nameCode}{valueCode && <>: {valueCode}</>},</>;
}
