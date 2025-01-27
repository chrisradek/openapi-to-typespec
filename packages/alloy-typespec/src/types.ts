export type Type =
  | BooleanLiteral
  | Enum
  | EnumMember
  | IntrinsicType
  | Model
  | ModelProperty
  | Namespace
  | NumericLiteral
  | Operation
  | Scalar
  | StringLiteral
  | Tuple
  | Union
  | UnionVariant;

export interface BaseType {
  entityKind: "Type";
  kind: string;
}

export interface DecoratedType {
  decorators: DecoratorApplication[];
}

export interface DecoratorApplication {
  name: string;
  namespace: string;
  args: DecoratorArgument[];
}

export interface DecoratorArgument {
  value: Type | Value;
}

export interface BooleanLiteral extends BaseType {
  kind: "Boolean";
  value: boolean;
}

export interface Enum extends BaseType, DecoratedType {
  kind: "Enum";
  name: string;
  namespace?: Namespace;

  members: Record<string, EnumMember>;
}

export interface EnumMember extends BaseType, DecoratedType {
  kind: "EnumMember";
  name: string;
  enum: Enum;
  value?: string | number;
}

export interface IntrinsicType extends BaseType {
  kind: "Intrinsic";
  name: "ErrorType" | "void" | "never" | "unknown" | "null";
}

export interface ArrayModel extends BaseType, DecoratedType {}

export interface Model extends BaseType, DecoratedType {
  kind: "Model";
  name: string;
  namespace?: Namespace;

  properties: Record<string, ModelProperty>;

  // Extends
  baseModel?: Model;

  // is
  sourceModel?: Model;
}

export interface ModelProperty extends BaseType, DecoratedType {
  kind: "ModelProperty";
  name: string;
  type: Type;

  optional: boolean;
  defaultValue?: Value;

  model: Model;
}

export interface Namespace extends BaseType, DecoratedType {
  kind: "Namespace";
  name: string;
  namespace?: Namespace;

  models: Record<string, Model>;

  scalars: Record<string, Scalar>;

  operations: Record<string, Operation>;

  namespaces: Record<string, Namespace>;

  enums: Record<string, Enum>;

  unions: Record<string, Union>;
}

export interface NumericLiteral extends BaseType {
  kind: "Number";
  value: number;
}

export interface Operation extends BaseType, DecoratedType {
  kind: "Operation";
  name: string;
  namespace?: Namespace;
  //interface?: Interface;
  parameters: Model;
  returnType: Type;

  // op is
  sourceOperation?: Operation;
}

export interface Scalar extends BaseType, DecoratedType {
  kind: "Scalar";
  name: string;
  namespace?: Namespace;

  baseScalar?: Scalar;
}

export interface StringLiteral extends BaseType {
  kind: "String";
  value: string;
}

export interface Tuple extends BaseType {
  kind: "Tuple";
  values: Type[];
}

export interface Union extends BaseType, DecoratedType {
  kind: "Union";
  name?: string;
  namespace?: Namespace;
  expression: boolean;

  variants: Record<string, UnionVariant>;
}

export interface UnionVariant extends BaseType, DecoratedType {
  kind: "UnionVariant";
  name?: string;
  union: Union;
  type: Type;
}

export type Value =
  | ScalarValue
  | NumericValue
  | StringValue
  | BooleanValue
  | ObjectValue
  | ArrayValue
  | EnumValue
  | NullValue;

export interface BaseValue {
  entityKind: "Value";
  valueKind: string;
}

export interface ScalarValue extends BaseValue {
  valueKind: "ScalarValue";
  value: { name: string; args: Value[] };
}

export interface ArrayValue extends BaseValue {
  valueKind: "ArrayValue";
  values: Value[];
}

export interface ObjectValue extends BaseValue {
  valueKind: "ObjectValue";
  properties: Record<string, { name: string; value: Value }>;
}

export interface NumericValue extends BaseValue {
  valueKind: "NumericValue";
  value: number;
}

export interface StringValue extends BaseValue {
  valueKind: "StringValue";
  value: string;
}

export interface BooleanValue extends BaseValue {
  valueKind: "BooleanValue";
  value: boolean;
}

export interface EnumValue extends BaseValue {
  valueKind: "EnumValue";
  value: EnumMember;
}

export interface NullValue extends BaseValue {
  valueKind: "NullValue";
  value: null;
}
