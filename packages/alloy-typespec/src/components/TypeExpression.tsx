// TODO: Source this from @typespec/compiler
export type IntrinsicScalarName =
  | "bytes"
  | "numeric"
  | "integer"
  | "float"
  | "int64"
  | "int32"
  | "int16"
  | "int8"
  | "uint64"
  | "uint32"
  | "uint16"
  | "uint8"
  | "safeint"
  | "float32"
  | "float64"
  | "decimal"
  | "decimal128"
  | "string"
  | "plainDate"
  | "plainTime"
  | "utcDateTime"
  | "offsetDateTime"
  | "duration"
  | "boolean"
  | "url";

export type IntrinsicTypes = 
  | "null"
  | "unknown"
  | "void"
  | "never"

export interface TypeExpression {
  builtin: IntrinsicScalarName | IntrinsicTypes;
}

export function TypeExpression(props: TypeExpression) {
  return <>{props.builtin}</>;
}