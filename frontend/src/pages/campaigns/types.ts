import type { Campaign } from "@/features/campaigns";

export type CampaignFormState = {
  id?: string;
  codigo: string;
  area?: string;
  nombre: string;
  sede?: string;
  estado: Campaign["estado"] | "activa" | "inactiva";
};
