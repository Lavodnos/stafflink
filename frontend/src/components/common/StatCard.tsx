import { Link } from 'react-router-dom';

type StatCardProps = {
  label: string;
  value: number | string;
  to: string;
};

export function StatCard({ label, value, to }: StatCardProps) {
  return (
    <Link to={to} className="card transition hover:shadow-theme-lg">
      <p className="text-sm text-gray-500 dark:text-[#9fb3d1]">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </Link>
  );
}
