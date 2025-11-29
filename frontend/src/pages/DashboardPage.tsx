import { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useCampaigns } from '../modules/campaigns/hooks';
import { useLinks } from '../modules/links/hooks';
import { useCandidates } from '../modules/candidates/hooks';
import { useBlacklist } from '../modules/blacklist/hooks';
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

  // Datos de ejemplo para gráfico temporal (placeholder)
  const trendSeries = useMemo(
    () => [
      { name: 'Campañas', data: [4, 6, 5, 7, 9, 8, 10] },
      { name: 'Links', data: [6, 8, 9, 11, 13, 12, 15] },
      { name: 'Candidatos', data: [10, 12, 11, 14, 16, 18, 21] },
    ],
    [],
  );

  const trendOptions: ApexOptions = {
    chart: {
      background: 'transparent',
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    colors: ['#6c8dff', '#4fd1c5', '#f9d770'],
    xaxis: {
      categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
      labels: {
        style: { colors: isDark ? '#9fb3d1' : '#475467' },
      },
      axisBorder: { color: isDark ? '#1f2a3d' : '#e4e7ec' },
      axisTicks: { color: isDark ? '#1f2a3d' : '#e4e7ec' },
    },
    yaxis: {
      labels: { style: { colors: isDark ? '#9fb3d1' : '#475467' } },
    },
    grid: {
      borderColor: isDark ? '#1f2a3d' : '#e4e7ec',
    },
    legend: {
      labels: { colors: isDark ? '#e8eefc' : '#0f172a' },
    },
    theme: { mode: isDark ? 'dark' : 'light' },
  };

  const statusSeries = useMemo(() => {
    const activos = links.filter((l) => l.estado === 'activo' || l.estado === 'activa').length;
    const inactivos = links.length - activos;
    return [
      { name: 'Activos', data: [activos] },
      { name: 'Inactivos', data: [inactivos] },
    ];
  }, [links]);

  const statusOptions: ApexOptions = {
    chart: { type: 'bar', background: 'transparent', toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: '45%', borderRadius: 6 } },
    colors: ['#4fd1c5', '#f97066'],
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Links'],
      labels: { style: { colors: isDark ? '#9fb3d1' : '#475467' } },
    },
    yaxis: {
      labels: { style: { colors: isDark ? '#9fb3d1' : '#475467' } },
    },
    grid: { borderColor: isDark ? '#1f2a3d' : '#e4e7ec' },
    legend: { labels: { colors: isDark ? '#e8eefc' : '#0f172a' } },
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
              <h3 className="text-lg font-semibold">Evolución semanal</h3>
              <p className="text-sm text-gray-500 dark:text-[#9fb3d1]">Placeholder de tendencia (datos estáticos)</p>
            </div>
          </div>
          <Chart options={trendOptions} series={trendSeries} type="area" height={300} />
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Estado de links</h3>
              <p className="text-sm text-gray-500 dark:text-[#9fb3d1]">Activos vs inactivos (conteo actual)</p>
            </div>
          </div>
          <Chart options={statusOptions} series={statusSeries} type="bar" height={300} />
        </div>
      </div>
    </div>
  );
}
