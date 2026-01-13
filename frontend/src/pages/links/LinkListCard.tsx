import { useMemo, useRef, useState } from "react";

import type { Link } from "@/features/links";
import { Card, SectionHeader } from "../../components/ui";
import { ListToolbar } from "../../components/common/ListToolbar";
import { PermissionNotice } from "../../components/common/PermissionNotice";
import { VirtualizedTableBody } from "../../components/common/VirtualizedTableBody";

type LinkListCardProps = {
  links: Link[];
  canRead: boolean;
  canManage: boolean;
  canClose: boolean;
  canReadCandidates: boolean;
  isLoading: boolean;
  isStatusPending: boolean;
  onCreate: () => void;
  onEdit: (id: string) => void;
  onViewCandidates: (link: Link) => void;
  onChangeStatus: (linkId: string, action: "expire" | "revoke" | "activate") => void;
};

function filterLinks(items: Link[], term: string) {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter((link) =>
    [link.titulo, link.slug, link.modalidad, link.condicion, link.campaign]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized)),
  );
}

const formatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function LinkListCard({
  links,
  canRead,
  canManage,
  canClose,
  canReadCandidates,
  isLoading,
  isStatusPending,
  onCreate,
  onEdit,
  onViewCandidates,
  onChangeStatus,
}: LinkListCardProps) {
  const [search, setSearch] = useState("");
  const tableRef = useRef<HTMLDivElement>(null);
  const filtered = useMemo(() => filterLinks(links, search), [links, search]);

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
                aria-label="Exportar links"
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
                + Crear link
              </button>
            )}
          </div>
        }
      />
      {!canRead && (
        <PermissionNotice message="No tienes permiso para ver links." />
      )}
      {!isLoading && canRead && links.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Sin links.</p>
      )}

      {canRead && (
        <>
          <ListToolbar
            search={search}
            onSearchChange={setSearch}
            placeholder="Buscar..."
            ariaLabel="Buscar links"
          />
          <div
            ref={tableRef}
            className="max-h-[520px] overflow-auto rounded-2xl border border-gray-200 dark:border-gray-800"
          >
            <table className="min-w-full text-left text-sm text-gray-700 dark:text-gray-200">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Campaña</th>
                  <th className="px-4 py-3">Modalidad</th>
                  <th className="px-4 py-3">Condición</th>
                  <th className="px-4 py-3">Expira</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <VirtualizedTableBody
                items={filtered}
                rowHeight={60}
                colSpan={8}
                containerRef={tableRef}
                className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900"
                renderRow={(link) => (
                  <tr
                    key={link.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/80"
                  >
                    <td className="px-4 py-3 text-xs uppercase text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{link.slug}</span>
                        <button
                          type="button"
                          className="text-[11px] font-semibold text-brand-600 hover:underline dark:text-brand-400"
                          onClick={() => {
                            const url = `${window.location.origin}/apply/${link.slug}`;
                            navigator.clipboard?.writeText(url);
                          }}
                        >
                          Copiar link
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      {link.titulo}
                    </td>
                    <td className="px-4 py-3">{link.campaign}</td>
                    <td className="px-4 py-3">{link.modalidad}</td>
                    <td className="px-4 py-3">{link.condicion}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {formatter.format(new Date(link.expires_at))}
                    </td>
                    <td className="px-4 py-3">
                      <span className="pill">{link.estado}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2 text-xs">
                        <button
                          type="button"
                          className="btn-secondary px-3 py-1.5"
                          disabled={!canReadCandidates}
                          onClick={() => onViewCandidates(link)}
                        >
                          Ver candidatos
                        </button>
                        {canManage && (
                          <>
                            <button
                              type="button"
                              className="btn-primary px-3 py-1.5"
                              onClick={() => onEdit(link.id)}
                            >
                              Editar
                            </button>
                            {canClose && (
                              <>
                                {link.estado === "activo" && (
                                  <button
                                    type="button"
                                    className="rounded-full border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-900/20"
                                    onClick={() =>
                                      onChangeStatus(link.id, "expire")
                                    }
                                    disabled={isStatusPending}
                                  >
                                    Expirar
                                  </button>
                                )}
                                {link.estado !== "activo" && (
                                  <button
                                    type="button"
                                    className="rounded-full border border-emerald-200 px-3 py-1.5 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/40 dark:text-emerald-200 dark:hover:bg-emerald-900/20"
                                    onClick={() =>
                                      onChangeStatus(link.id, "activate")
                                    }
                                    disabled={isStatusPending}
                                  >
                                    Activar
                                  </button>
                                )}
                              </>
                            )}
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
