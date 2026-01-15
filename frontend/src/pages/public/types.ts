import type { PublicCandidatePayload } from "../../modules/public/api";

export type PublicApplyFormData = Omit<
  PublicCandidatePayload,
  "convocatoria_slug"
> & {
  distrito_otro?: string;
};
