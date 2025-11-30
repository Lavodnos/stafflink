import { forwardRef } from 'react';
import cn from 'clsx';

type CardProps = React.HTMLAttributes<HTMLDivElement>;
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('card', className)}
      {...props}
    />
  );
}

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};
export function SectionHeader({ title, subtitle, actions }: SectionHeaderProps) {
  return (
    <header className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  );
}

type FieldProps = {
  label: string;
  hint?: string;
  children: React.ReactNode;
};
export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="label flex flex-col gap-1">
      <span className="font-semibold text-gray-900 dark:text-white">{label}</span>
      {children}
      {hint && <span className="text-xs text-gray-500 dark:text-gray-400">{hint}</span>}
    </label>
  );
}

type ErrorTextProps = { message?: string };
export function ErrorText({ message }: ErrorTextProps) {
  if (!message) return null;
  return <span className="text-xs text-red-600">{message}</span>;
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export const Input = forwardRef<HTMLInputElement, InputProps>(function InputBase({ className, ...props }, ref) {
  return <input ref={ref} className={cn('input', className)} {...props} />;
});

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function SelectBase(
  { className, children, ...props },
  ref,
) {
  return (
    <select ref={ref} className={cn('input', className)} {...props}>
      {children}
    </select>
  );
});

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function TextareaBase(
  { className, ...props },
  ref,
) {
  return <textarea ref={ref} className={cn('input min-h-[80px]', className)} {...props} />;
});

type PillProps = React.HTMLAttributes<HTMLSpanElement>;
export function Pill({ className, ...props }: PillProps) {
  return <span className={cn('pill', className)} {...props} />;
}
