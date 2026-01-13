type PermissionNoticeProps = {
  message: string;
  size?: 'xs' | 'sm';
  className?: string;
};

export function PermissionNotice({ message, size = 'sm', className }: PermissionNoticeProps) {
  const sizeClass = size === 'xs' ? 'text-xs' : 'text-sm';
  return (
    <p className={`${sizeClass} text-gray-500 dark:text-gray-400 ${className ?? ''}`.trim()}>
      {message}
    </p>
  );
}
