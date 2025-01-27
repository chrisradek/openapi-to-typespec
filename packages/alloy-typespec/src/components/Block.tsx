import { Children, code } from "@alloy-js/core";

export interface BlockProps {
  children?: Children;
}
export function Block(props: BlockProps) {
  if (!props.children) {
    return code`{}`;
  }

  return <>
    {"{"}
      {props.children}
    {"}"}
  </>;
}
