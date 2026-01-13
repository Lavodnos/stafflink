import { useMemo, useRef, useState } from "react";

import type { Campaign } from "@/features/campaigns";
import { Card, SectionHeader } from "../../components/ui";
import { ListToolbar } from "../../components/common/ListToolbar";
import { PermissionNotice } from "../../components/common/PermissionNotice";
import { VirtualizedTableBody } from "../../components/common/VirtualizedTableBody";

type CampaignListCardProps = {
  campaigns: Campaign[];
  canRead: boolean;
  canManage: boolean;
  isLoading: boolean;
  onCreate: () => void;
  onEdit: (campaign: Campaign) => void;
};

function filterCampaigns(campaigns: Campaign[], term: string) {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return campaigns;
  return campaigns.filter((campaign) =>
    [campaign.nombre, campaign.codigo, campaign.area, campaign.sede]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized)),
  );
}

export function CampaignListCard({
  campaigns,
  canRead,
  canManage,
  isLoading,
  onCreate,
  onEdit,
}: CampaignListCardProps) {
  const [search, setSearch] = useState("");
  const tableRef = useRef<HTMLDivElement>(null);
  const filtered = useMemo(
    () => filterCampaigns(campaigns, search),
    [campaigns, search],
  );

  return (
    <Card className="space-y-3">
      <SectionHeader
        title="Listado"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-secondary px-3 py-2 text-sm"
              aria-label="Exportar campañas"
              disabled
              title="Exportación pendiente"
            >
              Exportar
            </button>
            <button
              type="button"
              className="btn-primary px-4 py-2 text-sm"
              disabled={!canManage}
              onClick={onCreate}
            >
              + Crear campaña
            </button>
          </div>
        }
      />
      {!canRead && (
        <PermissionNotice message="No tienes permiso para ver campañas." />
      )}
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Buscar..."
        ariaLabel="Buscar campañas"
        disabled={!canRead}
      />

      {isLoading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Cargando…</p>
      )}
      {!isLoading && canRead && filtered.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sin campañas registradas.
        </p>
      )}

      {canRead && filtered.length > 0 && (
        <div
          ref={tableRef}
          className="max-h-[520px] overflow-auto rounded-2xl border border-gray-200 dark:border-gray-800"
        >
          <table className="min-w-full text-left text-sm text-gray-700 dark:text-gray-200">
            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Área</th>
                <th className="px-4 py-3">Sede</th>
                <th className="px-4 py-3">Estado</th>
                {canManage && (
                  <th className="px-4 py-3 text-right">Acciones</th>
                )}
              </tr>
            </thead>
            <VirtualizedTableBody
              items={filtered}
              rowHeight={56}
              colSpan={canManage ? 6 : 5}
              containerRef={tableRef}
              className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900"
              renderRow={(campaign) => (
                <tr
                  key={campaign.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/80"
                >
                  <td className="px-4 py-3 text-xs uppercase text-gray-500 dark:text-gray-400">
                    {campaign.codigo || "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                    {campaign.nombre}
                  </td>
                  <td className="px-4 py-3">{campaign.area || "—"}</td>
                  <td className="px-4 py-3">{campaign.sede || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="pill">{campaign.estado}</span>
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="btn-primary px-3 py-1 text-sm"
                        onClick={() => onEdit(campaign)}
                      >
                        Editar
                      </button>
                    </td>
                  )}
                </tr>
              )}
            />
          </table>
        </div>
      )}
    </Card>
  );
}
