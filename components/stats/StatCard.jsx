import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';

export default function StatCard({ title, value, subtitle, icon: Icon, isLoading, accent = 'blue' }) {
  const accents = {
    blue:   { bg: 'bg-blue-500/10',   icon: 'text-blue-500',   border: 'border-blue-500/20' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-500', border: 'border-purple-500/20' },
    emerald:{ bg: 'bg-emerald-500/10',icon: 'text-emerald-500',border: 'border-emerald-500/20' },
    orange: { bg: 'bg-orange-500/10', icon: 'text-orange-500', border: 'border-orange-500/20' },
    primary:{ bg: 'bg-primary/10',    icon: 'text-primary',    border: 'border-primary/20' },
  };
  const a = accents[accent] ?? accents.blue;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{formatNumber(value)}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${a.bg} border ${a.border}`}>
              <Icon className={`h-5 w-5 ${a.icon}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
