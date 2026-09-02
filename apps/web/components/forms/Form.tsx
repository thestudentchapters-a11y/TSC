'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/* ── Form primitives — brand-styled, accessible, error-aware ─────────────── */

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-ink">
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-gold-deep">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls =
  'w-full rounded-[4px] border border-hairline bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:bg-cream';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputCls, 'min-h-[120px] resize-y', props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputCls, 'cursor-pointer', props.className)} />;
}

export function Checkbox({
  label,
  id,
  error,
  ...props
}: { label: React.ReactNode; id: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1">
      <div className="flex items-start gap-2.5">
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-[3px] border-hairline accent-brand"
          {...props}
        />
        <label htmlFor={id} className="text-[13px] leading-6 text-ink/80">
          {label}
        </label>
      </div>
      {error && (
        <p role="alert" className="pl-7 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/** Animated success state with a drawing checkmark. */
export function FormSuccess({
  title = 'Submitted successfully',
  message,
  onReset,
  resetLabel = 'Submit another',
}: {
  title?: string;
  message: string;
  onReset?: () => void;
  resetLabel?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-4 rounded-md border border-gold/50 bg-gold-50/60 px-6 py-12 text-center"
      role="status"
    >
      <motion.svg
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
        aria-hidden
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.05 }}
      >
        <motion.circle
          cx="36"
          cy="36"
          r="32"
          stroke="#1457A2"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
        <motion.path
          d="M22 37.5 L31.5 47 L50 27"
          stroke="#F6A61D"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
          fill="none"
        />
      </motion.svg>
      <div className="space-y-1.5">
        <h3 className="font-display text-xl font-bold">{title}</h3>
        <p className="mx-auto max-w-md text-sm leading-6 text-muted">{message}</p>
      </div>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="cta-underline font-display text-xs font-bold uppercase tracking-[0.14em] text-brand"
        >
          {resetLabel}
        </button>
      )}
    </motion.div>
  );
}
