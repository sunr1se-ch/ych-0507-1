import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accent?: 'default' | 'warning' | 'danger' | 'success';
  delay?: number;
}

const accentClasses = {
  default: 'from-sky-500/10 to-sky-500/5 border-sky-500/20 hover:border-sky-400/40',
  warning: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 hover:border-amber-400/40',
  danger: 'from-rose-500/10 to-rose-500/5 border-rose-500/20 hover:border-rose-400/40',
  success: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-400/40',
};

export function StatCard({ title, value, subtitle, icon, accent = 'default', delay = 0 }: StatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border bg-gradient-to-br p-5',
        'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        accentClasses[accent]
      )}
      style={{
        animation: `fadeInUp 0.6s ease-out ${delay}ms both`,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400">{title}</p>
          <p className="mt-2 text-3xl font-bold font-mono tracking-tight text-white">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-zinc-400">
            {icon}
          </div>
        )}
      </div>
      <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl" />
    </div>
  );
}
