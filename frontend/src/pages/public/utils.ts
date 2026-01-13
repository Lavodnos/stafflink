import type { PublicApplyFormData } from "./types";

export const toUpper = (value?: string) => (value ? value.toUpperCase() : value);

export const digitsOnly = (value: string) => value.replace(/\D+/g, "");

export function getDistritoValue(data: PublicApplyFormData) {
  if (data.distrito === "OTRO") {
    return toUpper(data.distrito_otro)?.trim() ?? "";
  }
  return toUpper(data.distrito);
}
