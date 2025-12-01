import { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useLinks } from '@/features/links';
import { useCampaigns } from '@/features/campaigns';
import {
  useCandidates,
  type Candidate,
  type CandidateAssignment,
  type CandidateDocuments,
  type CandidateProcess,
} from '@/features/candidates';
import { useBlacklist } from '@/features/blacklist';
import { usePermission } from '../modules/auth/usePermission';

export function DashboardPage() {
  const canReadCampaigns = usePermission('campaigns.read');
  const canReadLinks = usePermission('links.read');
  const canReadCandidates = usePermission('candidates.read');
  const canReadBlacklist = usePermission('blacklist.read');

  const { data: campaigns = [] } = useCampaigns(canReadCampaigns);
  const { data: links = [] } = useLinks(canReadLinks);
  const { data: candidates = [] } = useCandidates(canReadCandidates);
  const { data: blacklist = [] } = useBlacklist(canReadBlacklist);

  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false,
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const summary = [
    { title: 'Campañas', value: campaigns.length, to: '/campaigns' },
    { title: 'Links', value: links.length, to: '/links' },
    { title: 'Candidatos', value: candidates.length, to: '/candidates' },
    { title: 'Blacklist', value: blacklist.length, to: '/blacklist' },
  ];

  // --------- Métricas derivadas ---------
  const funnelCounts = useMemo(() => {
    const total = candidates.length;
    const docsCompletos = candidates.filter((c) => {
      const d = (c as Candidate & { documents?: CandidateDocuments }).documents ?? {};
      const flags = [
        d.cv_entregado,
        d.dni_entregado,
        d.certificado_entregado,
        d.recibo_servicio_entregado,
        d.ficha_datos_entregado,
        d.autorizacion_datos_entregado,
      ];
      return flags.every((v) => v === true);
    }).length;

    const aptos = candidates.filter((c) => {
      const p = (c as Candidate & { process?: CandidateProcess }).process ?? {};
      const status = p.status_final?.toLowerCase?.();
      return status === 'apto' || status === 'aprobado';
    }).length;

    const contratados = candidates.filter((c) => {
      const p = (c as Candidate & { process?: CandidateProcess }).process ?? {};
      const a = (c as Candidate & { assignment?: CandidateAssignment }).assignment ?? {};
      const status = p.status_final?.toLowerCase?.();
      const estadoAsig = a.estado?.toLowerCase?.();
      return status === 'contratado' || estadoAsig === 'activo';
    }).length;

    return { total, docsCompletos, aptos, contratados };
  }, [candidates]);

  const canalSeries = useMemo(() => {
    const counts = new Map<string, number>();
    candidates.forEach((c) => {
      const key = (c.enteraste_oferta ?? 'No especificado').trim();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    return {
      labels: entries.map(([k]) => k),
      data: entries.map(([, v]) => v),
    };
  }, [candidates]);

  const docsPorCampana = useMemo(() => {
    const linkById = new Map(links.map((l) => [l.id, l] as const));
    const campById = new Map(campaigns.map((c) => [c.id, c] as const));

    const stats = new Map<string, { nombre: string; total: number; completos: number }>();

    candidates.forEach((c) => {
      const link = linkById.get(c.link_id);
      if (!link) return;
      const camp = campById.get(link.campaign);
      const key = camp?.id ?? 'desconocida';
      const nombre = camp?.nombre ?? 'Sin campaña';
      const item = stats.get(key) ?? { nombre, total: 0, completos: 0 };
      item.total += 1;

      const d = (c as Candidate & { documents?: CandidateDocuments }).documents ?? {};
      const flags = [
        d.cv_entregado,
        d.dni_entregado,
        d.certificado_entregado,
        d.recibo_servicio_entregado,
        d.ficha_datos_entregado,
        d.autorizacion_datos_entregado,
      ];
      if (flags.every((v) => v === true)) item.completos += 1;
      stats.set(key, item);
    });

    const labels = Array.from(stats.values()).map((s) => s.nombre);
    const data = Array.from(stats.values()).map((s) => (s.total ? Math.round((s.completos / s.total) * 100) : 0));
    return { labels, data };
  }, [candidates, links, campaigns]);

  const contratadosPorCampana = useMemo(() => {
    const linkById = new Map(links.map((l) => [l.id, l] as const));
    const campById = new Map(campaigns.map((c) => [c.id, c] as const));
    const now = new Date();
    const windowStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = new Map<string, { nombre: string; contratados: number; pendientes: number }>();

    candidates.forEach((c) => {
      if (!c.created_at) return;
      const created = new Date(c.created_at);
      if (created < windowStart) return;

      const link = linkById.get(c.link_id);
      const camp = link ? campById.get(link.campaign) : undefined;
      const key = camp?.id ?? 'desconocida';
      const nombre = camp?.nombre ?? 'Sin campaña';
      const item = stats.get(key) ?? { nombre, contratados: 0, pendientes: 0 };

      const p = (c as Candidate & { process?: CandidateProcess }).process ?? {};
      const a = (c as Candidate & { assignment?: CandidateAssignment }).assignment ?? {};
      const status = p.status_final?.toLowerCase?.();
      const estadoAsig = a.estado?.toLowerCase?.();
      const isContratado = status === 'contratado' || estadoAsig === 'activo';
      if (isContratado) item.contratados += 1;
      else item.pendientes += 1;

      stats.set(key, item);
    });

    const labels = Array.from(stats.values()).map((s) => s.nombre);
    const dataContratados = Array.from(stats.values()).map((s) => s.contratados);
    const dataPendientes = Array.from(stats.values()).map((s) => s.pendientes);
    return { labels, dataContratados, dataPendientes };
  }, [candidates, links, campaigns]);

  // --------- Config de gráficos ---------
  const funnelOptions: ApexOptions = {
    chart: { background: 'transparent', toolbar: { show: false } },
    dataLabels: { enabled: true },
    plotOptions: {
      bar: { horizontal: true, borderRadius: 6, barHeight: '60%' },
    },
    colors: ['#6c8dff', '#4fd1c5', '#f9d770', '#22c55e'],
    xaxis: {
      categories: ['Registrados', 'Docs completos', 'Aptos', 'Contratados'],
      labels: { style: { colors: isDark ? '#9fb3d1' : '#475467' } },
    },
    yaxis: { labels: { style: { colors: isDark ? '#9fb3d1' : '#475467' } } },
    grid: { borderColor: isDark ? '#1f2a3d' : '#e4e7ec' },
    theme: { mode: isDark ? 'dark' : 'light' },
  };

  const canalOptions: ApexOptions = {
    chart: { type: 'donut', background: 'transparent', toolbar: { show: false } },
    labels: canalSeries.labels,
    colors: ['#6c8dff', '#4fd1c5', '#f9d770', '#fb7185', '#22c55e', '#94a3b8'],
    legend: { position: 'bottom', labels: { colors: isDark ? '#e8eefc' : '#0f172a' } },
    dataLabels: { enabled: false },
    theme: { mode: isDark ? 'dark' : 'light' },
  };

  const docsCampOptions: ApexOptions = {
    chart: { type: 'bar', background: 'transparent', toolbar: { show: false } },
    plotOptions: { bar: { columnWidth: '55%', borderRadius: 6 } },
    colors: ['#6c8dff'],
    dataLabels: { enabled: true, formatter: (val) => `${val}%` },
    xaxis: {
      categories: docsPorCampana.labels,
      labels: { rotateAlways: false, style: { colors: isDark ? '#9fb3d1' : '#475467' } },
    },
    yaxis: { max: 100, labels: { style: { colors: isDark ? '#9fb3d1' : '#475467' } } },
    grid: { borderColor: isDark ? '#1f2a3d' : '#e4e7ec' },
    theme: { mode: isDark ? 'dark' : 'light' },
  };

  const contratadosOptions: ApexOptions = {
    chart: { type: 'bar', stacked: true, background: 'transparent', toolbar: { show: false } },
    plotOptions: { bar: { columnWidth: '55%', borderRadius: 6 } },
    colors: ['#22c55e', '#f59e0b'],
    dataLabels: { enabled: false },
    xaxis: {
      categories: contratadosPorCampana.labels,
      labels: { style: { colors: isDark ? '#9fb3d1' : '#475467' } },
    },
    yaxis: { labels: { style: { colors: isDark ? '#9fb3d1' : '#475467' } } },
    legend: { labels: { colors: isDark ? '#e8eefc' : '#0f172a' } },
    grid: { borderColor: isDark ? '#1f2a3d' : '#e4e7ec' },
    theme: { mode: isDark ? 'dark' : 'light' },
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <Link key={item.title} to={item.to} className="card transition hover:shadow-theme-lg">
            <p className="text-sm text-gray-500 dark:text-[#9fb3d1]">{item.title}</p>
            <p className="mt-2 text-3xl font-semibold">{item.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Embudo de candidatos</h3>
              <p className="text-sm text-gray-500 dark:text-[#9fb3d1]">
                Registrados → Documentos completos → Aptos → Contratados
              </p>
            </div>
          </div>
          <Chart
            options={funnelOptions}
            series={[{ name: 'Candidatos', data: [
              funnelCounts.total,
              funnelCounts.docsCompletos,
              funnelCounts.aptos,
              funnelCounts.contratados,
            ] }]}
            type="bar"
            height={300}
          />
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Canal de origen</h3>
              <p className="text-sm text-gray-500 dark:text-[#9fb3d1]">Distribución de “¿Cómo te enteraste?”</p>
            </div>
          </div>
          {canalSeries.labels.length ? (
            <Chart options={canalOptions} series={canalSeries.data} type="donut" height={300} />
          ) : (
            <p className="text-sm text-gray-500">Sin datos de candidatos</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Docs completos por campaña</h3>
              <p className="text-sm text-gray-500 dark:text-[#9fb3d1]">Porcentaje de checklist completado</p>
            </div>
          </div>
          {docsPorCampana.labels.length ? (
            <Chart options={docsCampOptions} series={[{ name: '% completo', data: docsPorCampana.data }]} type="bar" height={300} />
          ) : (
            <p className="text-sm text-gray-500">Sin datos de candidatos</p>
          )}
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Contratados vs pendientes (últimos 30 días)</h3>
              <p className="text-sm text-gray-500 dark:text-[#9fb3d1]">Por campaña</p>
            </div>
          </div>
          {contratadosPorCampana.labels.length ? (
            <Chart
              options={contratadosOptions}
              series={[
                { name: 'Contratados', data: contratadosPorCampana.dataContratados },
                { name: 'Pendientes', data: contratadosPorCampana.dataPendientes },
              ]}
              type="bar"
              height={300}
            />
          ) : (
            <p className="text-sm text-gray-500">Sin datos recientes</p>
          )}
        </div>
      </div>
    </div>
  );
}
