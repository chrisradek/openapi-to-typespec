import { Binder, OutputScope } from "@alloy-js/core";
import { TypeSpecOutputSymbol } from "./typespec-output-symbol.js";

export interface TypeSpecMemberScope extends OutputScope {
  kind: "member";
  owner: TypeSpecOutputSymbol;
}

export function createTypeSpecMemberScope(
  binder: Binder,
  parent: OutputScope,
  owner: TypeSpecOutputSymbol,
) {
  return binder.createScope<TypeSpecMemberScope>({
    kind: "member",
    name: "members",
    owner,
    parent,
  });
}
