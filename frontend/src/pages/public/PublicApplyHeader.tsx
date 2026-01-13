import geaLogo from "../../assets/gea-logo.svg";
import type { PublicLink } from "../../modules/public/api";

type PublicApplyHeaderProps = {
  link?: PublicLink | null;
  loading: boolean;
  error?: string | null;
};

const formatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function PublicApplyHeader({
  link,
  loading,
  error,
}: PublicApplyHeaderProps) {
  if (loading) {
    return <p className="text-slate-500">Cargando link…</p>;
  }
  if (error) {
    return <p className="text-red-600">{error}</p>;
  }
  if (!link) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-theme-lg">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
        <div className="flex-shrink-0">
          <img src={geaLogo} alt="GEA" className="h-16 w-auto lg:h-20" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">Campaña</p>
          <h1 className="text-3xl font-semibold text-slate-900">
            {link.titulo}
          </h1>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="pill">{link.campaign}</span>
            <span className="pill">{link.modalidad}</span>
            <span className="pill">{link.condicion}</span>
            {link.hora_gestion && (
              <span className="pill">Horario: {link.hora_gestion}</span>
            )}
            {link.descanso && (
              <span className="pill">Descanso: {link.descanso}</span>
            )}
          </div>
          <p className="text-sm text-slate-500">
            Link vigente hasta {formatter.format(new Date(link.expires_at))}
          </p>
        </div>
      </div>
    </div>
  );
}
