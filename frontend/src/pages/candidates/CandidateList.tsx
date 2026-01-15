import { useMemo, useRef, useState } from "react";

import type { Candidate } from "@/features/candidates";
import { Card, SectionHeader } from "../../components/ui";
import { ListToolbar } from "../../components/common/ListToolbar";
import { PermissionNotice } from "../../components/common/PermissionNotice";
import { VirtualizedTableBody } from "../../components/common/VirtualizedTableBody";

type CandidateListProps = {
  candidates: Candidate[];
  isLoading: boolean;
  canRead: boolean;
  canCreate: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
};

function filterCandidates(candidates: Candidate[], term: string) {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return candidates;
  return candidates.filter((candidate) =>
    [
      candidate.nombres_completos,
      candidate.numero_documento,
      candidate.modalidad,
      candidate.condicion,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized)),
  );
}

export function CandidateList({
  candidates,
  isLoading,
  canRead,
  canCreate,
  onSelect,
  onCreate,
}: CandidateListProps) {
  const [search, setSearch] = useState("");
  const tableRef = useRef<HTMLDivElement>(null);
  const filteredList = useMemo(
    () => filterCandidates(candidates, search),
    [candidates, search],
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
              aria-label="Exportar candidatos"
              disabled
              title="Exportación pendiente"
            >
              Exportar
            </button>
            <button
              type="button"
              className="btn-primary px-4 py-2 text-sm"
              disabled={!canCreate}
              onClick={onCreate}
            >
              + Crear candidato
            </button>
          </div>
        }
      />
      {!canRead && (
        <PermissionNotice message="No tienes permiso para ver candidatos." />
      )}
      {!isLoading && canRead && filteredList.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sin candidatos.
        </p>
      )}

      {canRead && (
        <>
          <ListToolbar
            search={search}
            onSearchChange={setSearch}
            placeholder="Buscar..."
            ariaLabel="Buscar candidatos"
            disabled={!canRead}
          />

          <div
            ref={tableRef}
            className="max-h-[520px] overflow-auto rounded-2xl border border-gray-200 dark:border-gray-800"
          >
            <table className="min-w-full text-left text-sm text-gray-700 dark:text-gray-200">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Modalidad</th>
                  <th className="px-4 py-3">Condición</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <VirtualizedTableBody
                items={filteredList}
                rowHeight={56}
                colSpan={5}
                containerRef={tableRef}
                className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900"
                renderRow={(candidate) => (
                  <tr
                    key={candidate.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/80"
                  >
                    <td className="px-4 py-3 text-xs text-gray-500 uppercase dark:text-gray-400">
                      {candidate.numero_documento}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      {candidate.nombres_completos}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {candidate.modalidad || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {candidate.condicion || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="btn-secondary px-3 py-1 text-sm"
                        onClick={() => onSelect(candidate.id)}
                      >
                        Ver / Editar
                      </button>
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
