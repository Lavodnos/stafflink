import { useMemo, useRef, useState } from "react";

import type { BlacklistEntry } from "@/features/blacklist";
import { Card, SectionHeader } from "../../components/ui";
import { ListToolbar } from "../../components/common/ListToolbar";
import { PermissionNotice } from "../../components/common/PermissionNotice";
import { VirtualizedTableBody } from "../../components/common/VirtualizedTableBody";

type BlacklistListCardProps = {
  entries: BlacklistEntry[];
  canRead: boolean;
  canManage: boolean;
  isLoading: boolean;
  isDeleting: boolean;
  onCreate: () => void;
  onEdit: (entry: BlacklistEntry) => void;
  onDelete: (entry: BlacklistEntry) => void;
};

function filterEntries(entries: BlacklistEntry[], term: string) {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return entries;
  return entries.filter((entry) =>
    [entry.dni, entry.nombres, entry.estado, entry.descripcion]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized)),
  );
}

export function BlacklistListCard({
  entries,
  canRead,
  canManage,
  isLoading,
  isDeleting,
  onCreate,
  onEdit,
  onDelete,
}: BlacklistListCardProps) {
  const [search, setSearch] = useState("");
  const tableRef = useRef<HTMLDivElement>(null);
  const filtered = useMemo(
    () => filterEntries(entries, search),
    [entries, search],
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
              aria-label="Exportar blacklist"
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
              + Nueva entrada
            </button>
          </div>
        }
      />
      {!canRead && (
        <PermissionNotice message="No tienes permiso para ver la blacklist." />
      )}
      {!isLoading && canRead && filtered.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sin registros.
        </p>
      )}

      {canRead && (
        <>
          <ListToolbar
            search={search}
            onSearchChange={setSearch}
            placeholder="Buscar..."
            ariaLabel="Buscar en blacklist"
            disabled={!canRead}
          />

          <div
            ref={tableRef}
            className="max-h-[520px] overflow-auto rounded-2xl border border-gray-200 dark:border-gray-800"
          >
            <table className="min-w-full text-left text-sm text-gray-700 dark:text-gray-200">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">DNI</th>
                  <th className="px-4 py-3">Nombres</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Descripción</th>
                  {canManage && (
                    <th className="px-4 py-3 text-right">Acciones</th>
                  )}
                </tr>
              </thead>
              <VirtualizedTableBody
                items={filtered}
                rowHeight={56}
                colSpan={canManage ? 5 : 4}
                containerRef={tableRef}
                className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900"
                renderRow={(entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/80"
                  >
                    <td className="px-4 py-3 text-xs uppercase text-gray-500 dark:text-gray-400">
                      {entry.dni}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      {entry.nombres}
                    </td>
                    <td className="px-4 py-3">
                      <span className="pill">{entry.estado}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {entry.descripcion || "—"}
                    </td>
                    {canManage && (
                      <td className="space-x-2 px-4 py-3 text-right">
                        <button
                          type="button"
                          className="btn-secondary px-3 py-1 text-sm"
                          onClick={() => onEdit(entry)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn-secondary px-3 py-1 text-sm"
                          onClick={() => onDelete(entry)}
                          disabled={isDeleting}
                        >
                          Eliminar
                        </button>
                      </td>
                    )}
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
