import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, Loader } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ReportStatsProps {
  stats?: {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
  };
  isLoading: boolean;
}

export default function ReportStats({ stats, isLoading }: ReportStatsProps) {
  const { t } = useTranslation();
  
  if (isLoading) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">{t('reports.dashboard')}</h3>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-16 mb-1"></div>
                  <div className="h-6 bg-muted rounded w-12"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statItems = [
    {
      label: t('reports.totalReports'),
      value: stats?.total || 0,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
      testId: "stat-total"
    },
    {
      label: t('reports.resolved'), 
      value: stats?.resolved || 0,
      icon: CheckCircle,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      testId: "stat-resolved"
    },
    {
      label: t('reports.pending'),
      value: stats?.pending || 0,
      icon: Clock,
      color: "text-accent",
      bgColor: "bg-accent/10",
      testId: "stat-pending"
    },
    {
      label: t('reports.inProgress'),
      value: stats?.inProgress || 0,
      icon: Loader,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      testId: "stat-progress"
    },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">{t('reports.dashboard')}</h3>
      <div className="grid grid-cols-2 gap-4">
        {statItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Card key={item.label} className="shadow-sm" data-testid={item.testId}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">{item.label}</p>
                    <p className={`text-2xl font-bold ${item.color}`} data-testid={`${item.testId}-value`}>
                      {item.value}
                    </p>
                  </div>
                  <div className={`w-10 h-10 ${item.bgColor} rounded-full flex items-center justify-center`}>
                    <IconComponent size={20} className={item.color} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
