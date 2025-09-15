import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import PWAHeader from "@/components/pwa-header";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { Shield, Eye, Users, Clock, CheckCircle, AlertTriangle, MapPin, Search, Filter, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AuthorityDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: t('errors.unauthorized'),
        description: t('auth.loggedOutRetrying'),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login?userType=authority";
      }, 500);
    }
  }, [user, authLoading, toast]);

  // Check if user is actually an authority
  useEffect(() => {
    if (user && (user as any)?.userType !== 'authority') {
      toast({
        title: t('errors.accessDenied'),
        description: t('errors.authorityAccessRequired'),
        variant: "destructive",
      });
      setLocation('/');
    }
  }, [user, toast, setLocation]);

  const { data: allReports, isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/authority/reports"],
    retry: false,
    enabled: !!user && (user as any).userType === 'authority',
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/authority/stats"], 
    retry: false,
    enabled: !!user && (user as any).userType === 'authority',
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
    : (user as any)?.email?.split('@')[0] || 'Authority';

  // Mock stats until API is implemented
  const authorityStats = (stats as any) || {
    totalReports: 0,
    pendingReports: 0,
    inProgressReports: 0,
    resolvedReports: 0,
    myAssigned: 0,
  };

  // Process and filter reports
  const reports = (allReports as any[]) || [];
  
  // Filtered and searched reports
  const filteredReports = useMemo(() => {
    if (!reports) return [];
    
    let filtered = [...reports];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(report => report.category === categoryFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(report => 
        report.reportId?.toLowerCase().includes(searchLower) ||
        report.category?.toLowerCase().includes(searchLower) ||
        report.address?.toLowerCase().includes(searchLower) ||
        report.description?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [reports, statusFilter, categoryFilter, searchTerm]);
  
  // Get available categories from reports for filter dropdown
  const availableCategories = useMemo(() => {
    if (!reports || !Array.isArray(reports)) return [];
    const categories = Array.from(new Set(reports.map((report: any) => report.category)));
    return categories.filter(Boolean);
  }, [reports]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <PWAHeader />
      
      <div className="pt-16">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-secondary to-primary text-white p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold" data-testid="text-welcome">
                {t('authority.welcome')}, {displayName}
              </h2>
              <p className="text-white/80">{t('authority.portal')}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Shield size={24} />
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Authority Stats Dashboard */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">{t('reports.overview')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card className="shadow-sm" data-testid="stat-total-reports">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{t('reports.totalReports')}</p>
                      <p className="text-2xl font-bold text-primary" data-testid="stat-total-reports-value">
                        {(authorityStats as any).totalReports}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users size={20} className="text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm" data-testid="stat-pending-reports">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{t('reports.pending')}</p>
                      <p className="text-2xl font-bold text-accent" data-testid="stat-pending-reports-value">
                        {(authorityStats as any).pendingReports}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                      <Clock size={20} className="text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm" data-testid="stat-in-progress-reports">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{t('reports.inProgress')}</p>
                      <p className="text-2xl font-bold text-blue-600" data-testid="stat-in-progress-reports-value">
                        {(authorityStats as any).inProgressReports}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <AlertTriangle size={20} className="text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm" data-testid="stat-resolved-reports">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{t('reports.resolved')}</p>
                      <p className="text-2xl font-bold text-secondary" data-testid="stat-resolved-reports-value">
                        {(authorityStats as any).resolvedReports}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                      <CheckCircle size={20} className="text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reports Management */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">{t('reports.allReports')} ({filteredReports.length})</h4>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-filters"
              >
                <Filter size={16} className="mr-2" />
                {t('common.filters')}
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('reports.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-reports"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setSearchTerm('')}
                    data-testid="button-clear-search"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {showFilters && (
                <Card className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t('reports.status')}</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger data-testid="select-status-filter">
                          <SelectValue placeholder={t('reports.allStatuses')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('reports.allStatuses')}</SelectItem>
                          <SelectItem value="pending">{t('reports.pending')}</SelectItem>
                          <SelectItem value="in_progress">{t('reports.inProgress')}</SelectItem>
                          <SelectItem value="resolved">{t('reports.resolved')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t('reports.category')}</label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger data-testid="select-category-filter">
                          <SelectValue placeholder={t('reports.allCategories')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('reports.allCategories')}</SelectItem>
                          {availableCategories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {(statusFilter !== 'all' || categoryFilter !== 'all' || searchTerm) && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStatusFilter('all');
                          setCategoryFilter('all');
                          setSearchTerm('');
                        }}
                        data-testid="button-clear-filters"
                      >
                        {t('reports.clearFilters')}
                      </Button>
                    </div>
                  )}
                </Card>
              )}
            </div>
            
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
            ) : filteredReports && filteredReports.length > 0 ? (
              <div className="space-y-3">
                {filteredReports.map((report: any) => (
                  <Card 
                    key={report.id} 
                    className="shadow-sm cursor-pointer hover:shadow-md transition-shadow" 
                    data-testid={`card-report-${report.id}`}
                    onClick={() => {
                      setSelectedReport(report);
                      setShowDetailModal(true);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        {report.photoUrl && (
                          <img 
                            src={report.photoUrl} 
                            alt={t('reports.reportEvidence')} 
                            className="w-12 h-12 rounded-lg object-cover"
                            data-testid={`img-report-${report.id}`}
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-semibold capitalize flex items-center" data-testid={`text-report-title-${report.id}`}>
                                {report.category.replace('_', ' ')} {t('reportForm.issue')}
                                {report.reportId && (
                                  <span className="ml-2 text-xs text-muted-foreground">#{report.reportId}</span>
                                )}
                              </h5>
                              <p className="text-muted-foreground text-sm flex items-center" data-testid={`text-report-location-${report.id}`}>
                                <MapPin size={12} className="mr-1" />
                                {report.address || `${report.latitude?.toFixed(4)}, ${report.longitude?.toFixed(4)}`}
                              </p>
                              <p className="text-xs text-muted-foreground" data-testid={`text-report-date-${report.id}`}>
                                {new Date(report.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge 
                              variant={report.status === 'resolved' ? 'secondary' : 
                                      report.status === 'in_progress' ? 'default' : 'outline'}
                              data-testid={`status-report-${report.id}`}
                            >
                              {report.status.replace('_', ' ')}
                            </Badge>
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
                  <Shield size={48} className="mx-auto mb-4 opacity-50" />
                  <p>{t('authority.noReportsToManage')}</p>
                  <p className="text-sm mt-1">{t('authority.noReportsMessage')}</p>
                </div>
              </Card>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-semibold mb-3">{t('authority.quickActions')}</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => setLocation('/authority/reports')}
                className="py-3 px-4 shadow-sm"
                data-testid="button-manage-reports"
              >
                <Users size={16} className="mr-2" />
                {t('authority.manageReports')}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation('/authority/analytics')}
                className="py-3 px-4 shadow-sm"
                data-testid="button-view-analytics"
              >
                <Eye size={16} className="mr-2" />
                {t('authority.viewAnalytics')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Report View Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{t('reports.reportDetails')}</span>
              {selectedReport && (
                <Badge 
                  variant={selectedReport.status === 'resolved' ? 'secondary' : 
                          selectedReport.status === 'in_progress' ? 'default' : 'outline'}
                  data-testid="modal-report-status"
                >
                  {selectedReport.status.replace('_', ' ')}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="font-semibold mb-3">{t('reports.basicInformation')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('reports.reportId')}</label>
                    <p className="font-mono" data-testid="modal-report-id">{selectedReport.reportId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('reports.category')}</label>
                    <p className="capitalize" data-testid="modal-report-category">
                      {selectedReport.category?.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('reports.status')}</label>
                    <p className="capitalize" data-testid="modal-report-status-text">
                      {selectedReport.status?.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('authority.submittedDate')}</label>
                    <p data-testid="modal-report-date">
                      {new Date(selectedReport.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Location Info */}
              <div>
                <h4 className="font-semibold mb-3">{t('reports.locationInformation')}</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('reports.address')}</label>
                    <p className="text-sm" data-testid="modal-report-address">
                      {selectedReport.address || t('reports.addressNotProvided')}
                    </p>
                  </div>
                  {selectedReport.latitude && selectedReport.longitude && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t('reports.coordinates')}</label>
                      <p className="text-sm font-mono" data-testid="modal-report-coordinates">
                        {selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Description */}
              {selectedReport.description && (
                <>
                  <div>
                    <h4 className="font-semibold mb-3">{t('reports.description')}</h4>
                    <p className="text-sm" data-testid="modal-report-description">
                      {selectedReport.description}
                    </p>
                  </div>
                  <Separator />
                </>
              )}

              {/* Evidence Photo */}
              {selectedReport.photoUrl && (
                <div>
                  <h4 className="font-semibold mb-3">{t('reports.evidencePhoto')}</h4>
                  <div className="rounded-lg overflow-hidden border">
                    <img 
                      src={selectedReport.photoUrl} 
                      alt={t('reports.reportEvidence')} 
                      className="w-full max-h-96 object-contain bg-muted"
                      data-testid="modal-report-photo"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                  data-testid="button-close-modal"
                >
                  {t('common.close')}
                </Button>
                <Button
                  onClick={() => {
                    // Future: Implement status update functionality
                    toast({
                      title: t('errors.featureComingSoon'),
                      description: "Status update functionality will be implemented in the next phase.",
                    });
                  }}
                  data-testid="button-update-status"
                >
                  {t('reports.updateStatus')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNavigation activeTab="home" />
    </div>
  );
}