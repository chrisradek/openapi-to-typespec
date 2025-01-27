import {
  Child,
  children,
  Children,
  childrenArray,
  code,
  Declaration,
  DeclarationProps,
  findKeyedChild,
  mapJoin,
  Name,
  refkey,
  Refkey,
  Scope,
  taggedComponent,
} from "@alloy-js/core";
import { useTypeSpecScope } from "../symbols/scopes.js";
import { useTypeSpecNamePolicy } from "../name-policy.js";

export interface OperationDeclarationProps extends DeclarationProps {
  sourceOperation?: Children;
  returnType?: Children;
}

export const operationParametersTag = Symbol();

export function OperationDeclaration({
  sourceOperation,
  ...props
}: OperationDeclarationProps) {
  const children = childrenArray(() => props.children);
  const parametersChild = findKeyedChild(children, operationParametersTag);

  // TODO: Check if inside interface scope - omit `op` in this case

  let signature: Child;
  if (sourceOperation) {
    signature = code` is ${sourceOperation}`;
  } else {
    signature =
      <Scope name={props.name} kind="operation">
        ({parametersChild}): {props.returnType || "void"}
      </Scope>;
  }

  return <Declaration {...props}>
    op <Name />{signature};
  </Declaration>;
}

export interface ParameterDescriptor {
  type: Children;
  refkey: Refkey;
  optional?: boolean;
}

function isParameterDescriptor(
  value: Children | ParameterDescriptor,
): value is ParameterDescriptor {
  return (
    typeof value === "object" && value !== null && Object.hasOwn(value, "type")
  );
}

export interface OperationParametersProps {
  parameters?: Record<string, Children | ParameterDescriptor>;
  children?: Children;
}

OperationDeclaration.Parameters = taggedComponent(
  operationParametersTag,
  function Parameters(props: OperationParametersProps) {
    const namePolicy = useTypeSpecNamePolicy();
    let value: Children | undefined;

    if (props.children) {
      value = props.children;
    } else if (props.parameters) {
      const scope = useTypeSpecScope();
      if (scope.kind !== "operation") {
        throw new Error(
          "Can't declare operation parameter in non-operation scope",
        );
      }

      // join params
      value = mapJoin(
        new Map(Object.entries(props.parameters)),
        (key, value) => {
          const descriptor: ParameterDescriptor = isParameterDescriptor(value) ?
            value
          : { refkey: refkey(), type: value };
          const optionality = descriptor.optional ? "?" : "";
          // TODO: create symbol for augmenters?

          return <>{namePolicy.getName(key, "operation-parameter")}{optionality}: {descriptor.type}</>;
        },
        { joiner: ", " },
      );
    }

    return value;
  },
);
