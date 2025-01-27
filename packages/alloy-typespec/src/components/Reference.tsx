import { Refkey } from "@alloy-js/core";
import { ref } from "../symbols/reference.js";

export interface ReferenceProps {
  refkey: Refkey;
}

export function Reference({ refkey }: ReferenceProps) {
  const reference = ref(refkey);
  return <>{reference}</>;
}