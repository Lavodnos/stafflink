type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-1">
      <p className="text-sm text-gray-500 dark:text-gray-400">{eyebrow}</p>
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">{title}</h1>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
    </header>
  );
}
