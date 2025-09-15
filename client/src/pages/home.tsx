import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import PWAHeader from "@/components/pwa-header";
import BottomNavigation from "@/components/bottom-navigation";
import ReportStats from "@/components/report-stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Plus, History, User } from "lucide-react";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
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
    enabled: !!user,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/reports/stats"], 
    retry: false,
    enabled: !!user,
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const displayName = (user as any)?.firstName 
    ? `${(user as any).firstName}${(user as any)?.lastName ? ` ${(user as any).lastName}` : ''}`
    : (user as any)?.email?.split('@')[0] || 'Citizen';

  return (
    <div className="min-h-screen bg-background pb-20">
      <PWAHeader />
      
      <div className="pt-16">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold" data-testid="text-welcome">
                Welcome, {displayName}
              </h2>
              <p className="text-white/80">Citizen Portal</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User size={24} />
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Stats Dashboard */}
          <ReportStats stats={stats as any} isLoading={statsLoading} />

          {/* Recent Reports */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Recent Reports</h4>
            {reportsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
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
            ) : reports && (reports as any)?.length > 0 ? (
              <div className="space-y-3">
                {(reports as any)?.slice(0, 5).map((report: any) => (
                  <Card key={report.id} className="shadow-sm" data-testid={`card-report-${report.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        {report.photoUrl && (
                          <img 
                            src={report.photoUrl} 
                            alt="Report evidence" 
                            className="w-12 h-12 rounded-lg object-cover"
                            data-testid={`img-report-${report.id}`}
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-semibold capitalize" data-testid={`text-report-title-${report.id}`}>
                                {report.category.replace('_', ' ')} Issue
                              </h5>
                              <p className="text-muted-foreground text-sm" data-testid={`text-report-location-${report.id}`}>
                                {report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                              </p>
                              <p className="text-xs text-muted-foreground" data-testid={`text-report-date-${report.id}`}>
                                {new Date(report.createdAt).toLocaleDateString()}
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
                              data-testid={`status-report-${report.id}`}
                            >
                              {report.status.replace('_', ' ')}
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
                  <p>No reports yet</p>
                  <p className="text-sm mt-1">Start by reporting your first civic issue</p>
                </div>
              </Card>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-semibold mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => setLocation('/report')}
                className="py-3 px-4 shadow-sm"
                data-testid="button-new-report"
              >
                <Plus size={16} className="mr-2" />
                New Report
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation('/manage-reports')}
                className="py-3 px-4 shadow-sm"
                data-testid="button-view-all"
              >
                <History size={16} className="mr-2" />
                View All Reports
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation activeTab="home" />
    </div>
  );
}
