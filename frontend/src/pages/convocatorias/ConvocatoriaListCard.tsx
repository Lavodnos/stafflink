import { useMemo, useRef, useState } from "react";

import type { Convocatoria } from "@/features/convocatorias";
import type { Campaign } from "@/features/campaigns";
import { Card, SectionHeader } from "../../components/ui";
import { ListToolbar } from "../../components/common/ListToolbar";
import { PermissionNotice } from "../../components/common/PermissionNotice";
import { VirtualizedTableBody } from "../../components/common/VirtualizedTableBody";

type ConvocatoriaListCardProps = {
  convocatorias: Convocatoria[];
  campaigns: Campaign[];
  canRead: boolean;
  canManage: boolean;
  canReadCandidates: boolean;
  isLoading: boolean;
  isDeletePending: boolean;
  onCreate: () => void;
  onEdit: (id: string) => void;
  onViewCandidates: (convocatoria: Convocatoria) => void;
  onDelete: (id: string) => void;
};

function filterConvocatorias(
  items: Convocatoria[],
  term: string,
  campaignLookup: Map<string, string>,
) {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter((convocatoria) =>
    [
      convocatoria.titulo,
      convocatoria.slug,
      convocatoria.modalidad,
      convocatoria.condicion,
      convocatoria.hora_gestion,
      String(convocatoria.cuotas ?? ""),
      convocatoria.campaign,
      campaignLookup.get(convocatoria.campaign) ?? "",
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized)),
  );
}

const formatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
  timeStyle: "short",
});

const notify = (message: string, type: "success" | "error" = "success") => {
  window.dispatchEvent(
    new CustomEvent("app:toast", { detail: { message, type } }),
  );
};

const copyToClipboard = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);
  return ok;
};

export function ConvocatoriaListCard({
  convocatorias,
  campaigns,
  canRead,
  canManage,
  canReadCandidates,
  isLoading,
  isDeletePending,
  onCreate,
  onEdit,
  onViewCandidates,
  onDelete,
}: ConvocatoriaListCardProps) {
  const [search, setSearch] = useState("");
  const tableRef = useRef<HTMLDivElement>(null);
  const campaignLookup = useMemo(
    () => new Map(campaigns.map((campaign) => [campaign.id, campaign.nombre])),
    [campaigns],
  );
  const filtered = useMemo(
    () => filterConvocatorias(convocatorias, search, campaignLookup),
    [convocatorias, search, campaignLookup],
  );
  const formatDate = (value: string | null | undefined) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return formatter.format(date);
  };

  return (
    <Card className="space-y-3">
      <SectionHeader
        title="Listado"
        actions={
          <div className="flex items-center gap-2">
            {canManage && (
              <button
                type="button"
                className="btn-secondary px-3 py-2 text-sm"
                aria-label="Exportar convocatorias"
                disabled
                title="Exportación pendiente"
              >
                Exportar
              </button>
            )}
            {canManage && (
              <button
                type="button"
                className="btn-primary px-4 py-2 text-sm"
                onClick={onCreate}
              >
                + Crear convocatoria
              </button>
            )}
          </div>
        }
      />
      {!canRead && (
        <PermissionNotice message="No tienes permiso para ver convocatorias." />
      )}
      {!isLoading && canRead && convocatorias.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Sin convocatorias.</p>
      )}

      {canRead && (
        <>
          <ListToolbar
            search={search}
            onSearchChange={setSearch}
            placeholder="Buscar..."
            ariaLabel="Buscar convocatorias"
          />
          <div
            ref={tableRef}
            className="max-h-[520px] overflow-auto rounded-2xl border border-gray-200 dark:border-gray-800"
          >
            <table className="min-w-full text-left text-sm text-gray-700 dark:text-gray-200">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">Título convocatoria</th>
                  <th className="px-4 py-3">Modalidad</th>
                  <th className="px-4 py-3">Condición</th>
                  <th className="px-4 py-3">Horario</th>
                  <th className="px-4 py-3">Campaña</th>
                  <th className="px-4 py-3">N° convocados</th>
                  <th className="px-4 py-3">Fecha inicio</th>
                  <th className="px-4 py-3">Expira</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <VirtualizedTableBody
                items={filtered}
                rowHeight={60}
                colSpan={10}
                containerRef={tableRef}
                className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900"
                renderRow={(convocatoria) => (
                  <tr
                    key={convocatoria.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/80"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      {convocatoria.titulo}
                    </td>
                    <td className="px-4 py-3">{convocatoria.modalidad}</td>
                    <td className="px-4 py-3">{convocatoria.condicion}</td>
                    <td className="px-4 py-3">{convocatoria.hora_gestion || "-"}</td>
                    <td className="px-4 py-3">
                      {campaignLookup.get(convocatoria.campaign) ??
                        convocatoria.campaign}
                    </td>
                    <td className="px-4 py-3">
                      {Number.isFinite(convocatoria.cuotas)
                        ? convocatoria.cuotas
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(convocatoria.created_at)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(convocatoria.expires_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="pill">{convocatoria.estado}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2 text-xs">
                        <button
                          type="button"
                          className="btn-secondary px-3 py-1.5"
                          disabled={!canReadCandidates}
                          onClick={() => onViewCandidates(convocatoria)}
                        >
                          Detalles de postulantes
                        </button>
                        {canManage && (
                          <>
                            <button
                              type="button"
                              className="btn-primary px-3 py-1.5"
                              onClick={() => onEdit(convocatoria.id)}
                            >
                              Editar convocatoria
                            </button>
                            <button
                              type="button"
                              className="btn-secondary px-3 py-1.5"
                              onClick={async () => {
                                const url = `${window.location.origin}/apply/${convocatoria.slug}`;
                                try {
                                  const ok = await copyToClipboard(url);
                                  notify(
                                    ok
                                      ? "Link copiado al portapapeles."
                                      : "No se pudo copiar el link.",
                                    ok ? "success" : "error",
                                  );
                                } catch {
                                  notify("No se pudo copiar el link.", "error");
                                }
                              }}
                            >
                              Generar link
                            </button>
                            <button
                              type="button"
                              className="rounded-full border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-900/20"
                              onClick={() => {
                                if (
                                  !window.confirm(
                                    "¿Seguro que deseas eliminar esta convocatoria?",
                                  )
                                ) {
                                  return;
                                }
                                onDelete(convocatoria.id);
                              }}
                              disabled={isDeletePending}
                            >
                              Eliminar convocatoria
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              />
            </table>
          </div>
        </>
      )}
    </Card>
  );
}
