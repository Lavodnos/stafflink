import type { PublicCandidatePayload } from "../../modules/public/api";

export type PublicApplyFormData = Omit<PublicCandidatePayload, "link_slug"> & {
  distrito_otro?: string;
};
