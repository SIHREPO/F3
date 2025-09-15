import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import PWAHeader from "@/components/pwa-header";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { History, X, MapPin, Calendar, Camera } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Report } from "@shared/schema";

interface ReportDetailsModalProps {
  report: Report | null;
  onClose: () => void;
}

function ReportDetailsModal({ report, onClose }: ReportDetailsModalProps) {
  const { t } = useTranslation();
  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold" data-testid="text-modal-title">
            {t('reports.reportDetails')}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-testid="button-close-modal"
          >
            <X size={20} />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Report ID */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">{t('reports.reportId')}</h4>
            <p className="text-sm font-mono" data-testid="text-report-id">
              #{report.reportId}
            </p>
          </div>

          {/* Category */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">{t('reports.category')}</h4>
            <p className="capitalize font-medium" data-testid="text-report-category">
              {t(`categories.${report.category}`)}
            </p>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">{t('reports.status')}</h4>
            <span 
              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                report.status === 'resolved' 
                  ? 'bg-secondary/10 text-secondary'
                  : report.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-accent/10 text-accent'
              }`}
              data-testid="status-modal-report"
            >
              {t(`status.${report.status}`)}
            </span>
          </div>

          {/* Description */}
          {report.description && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">{t('reports.description')}</h4>
              <p className="text-sm" data-testid="text-report-description">
                {report.description}
              </p>
            </div>
          )}

          {/* Photo */}
          {report.photoUrl && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">{t('reports.photoEvidence')}</h4>
              <img 
                src={report.photoUrl} 
                alt={t('reports.reportEvidence')} 
                className="w-full rounded-lg object-cover max-h-48"
                data-testid="img-modal-report"
              />
            </div>
          )}

          {/* Location */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <MapPin size={14} />
              {t('reports.location')}
            </h4>
            <p className="text-sm" data-testid="text-modal-location">
              {report.address || `${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}`}
            </p>
          </div>

          {/* Date */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Calendar size={14} />
              {t('reports.reportedOn')}
            </h4>
            <p className="text-sm" data-testid="text-modal-date">
              {report.createdAt ? new Date(report.createdAt).toLocaleString() : t('common.notAvailable')}
            </p>
          </div>

          {/* Last Updated */}
          {report.updatedAt && report.createdAt && report.updatedAt !== report.createdAt && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">{t('reports.lastUpdated')}</h4>
              <p className="text-sm" data-testid="text-modal-updated">
                {new Date(report.updatedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ManageReports() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: t('errors.unauthorized'),
        description: t('auth.loggedOutRetrying'),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [user, authLoading, toast]);

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/reports"],
    retry: false,
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const userReports = (reports as Report[]) || [];

  return (
    <>
      <div className="min-h-screen bg-background pb-20">
        <PWAHeader />
        
        <div className="pt-16">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold" data-testid="text-manage-title">
                  {t('navigation.manageReports')}
                </h2>
                <p className="text-white/80">{t('reports.reportHistory')}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <History size={24} />
              </div>
            </div>
          </div>

          <div className="p-4">
            {/* Reports List */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">{t('reports.yourReports')}</h4>
                <span className="text-sm text-muted-foreground" data-testid="text-report-count">
                  {userReports.length} {userReports.length === 1 ? t('reports.reportCount') : t('reports.reportCountPlural')}
                </span>
              </div>
              
              {reportsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="p-4">
                      <div className="animate-pulse flex space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : userReports.length > 0 ? (
                <div className="space-y-3">
                  {userReports.map((report) => (
                    <Card 
                      key={report.id} 
                      className="shadow-sm cursor-pointer hover:shadow-md transition-shadow" 
                      data-testid={`card-manage-report-${report.id}`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          {report.photoUrl ? (
                            <img 
                              src={report.photoUrl} 
                              alt={t('reports.reportEvidence')} 
                              className="w-12 h-12 rounded-lg object-cover"
                              data-testid={`img-manage-report-${report.id}`}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <Camera size={20} className="text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="font-semibold capitalize" data-testid={`text-manage-report-title-${report.id}`}>
                                  {t(`categories.${report.category}`)}
                                </h5>
                                <p className="text-muted-foreground text-sm" data-testid={`text-manage-report-id-${report.id}`}>
                                  #{report.reportId}
                                </p>
                                <p className="text-muted-foreground text-sm" data-testid={`text-manage-report-location-${report.id}`}>
                                  {report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                                </p>
                                <p className="text-xs text-muted-foreground" data-testid={`text-manage-report-date-${report.id}`}>
                                  {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                              <span 
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  report.status === 'resolved' 
                                    ? 'bg-secondary/10 text-secondary'
                                    : report.status === 'in_progress'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-accent/10 text-accent'
                                }`}
                                data-testid={`status-manage-report-${report.id}`}
                              >
                                {t(`status.${report.status}`)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <History size={48} className="mx-auto mb-4 opacity-50" />
                    <p data-testid="text-no-reports">{t('reports.noReports')}</p>
                    <p className="text-sm mt-1">{t('reports.startReporting')}</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>

        <BottomNavigation activeTab="manage" />
      </div>

      {/* Report Details Modal */}
      <ReportDetailsModal 
        report={selectedReport} 
        onClose={() => setSelectedReport(null)} 
      />
    </>
  );
}