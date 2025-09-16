import { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import PWAHeader from "@/components/pwa-header";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { 
  Shield, Eye, Users, Clock, CheckCircle, AlertTriangle, MapPin, Search, Filter, X,
  BarChart3, Map, FileText, UserCircle, Plus, Edit, Trash2, Star, TrendingUp,
  Navigation, Phone, MessageSquare, Award, Activity, Target
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Employee form schema
const employeeFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  role: z.enum(["admin", "supervisor", "field_worker"]),
  department: z.enum(["drainage", "pothole", "wire", "garbage", "street_light"]),
});

type EmployeeFormData = z.infer<typeof employeeFormSchema>;

// Employee Form Modal Component
function EmployeeFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  title,
  defaultValues,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => void;
  isLoading: boolean;
  title: string;
  defaultValues?: any;
}) {
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: defaultValues || {
      firstName: '',
      lastName: '',
      email: '',
      employeeId: '',
      role: 'field_worker',
      department: 'drainage',
    },
  });

  // Reset form when modal opens/closes or defaultValues change
  useEffect(() => {
    if (isOpen && defaultValues) {
      form.reset(defaultValues);
    } else if (isOpen && !defaultValues) {
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        employeeId: '',
        role: 'field_worker',
        department: 'drainage',
      });
    }
  }, [isOpen, defaultValues, form]);

  const handleSubmit = (data: EmployeeFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="dialog-employee-form">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} data-testid="input-firstname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} data-testid="input-lastname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email address" {...field} data-testid="input-email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter employee ID" {...field} data-testid="input-employee-id" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="select-role">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="field_worker">Field Worker</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="select-form-department">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="drainage">Drainage</SelectItem>
                        <SelectItem value="pothole">Potholes</SelectItem>
                        <SelectItem value="wire">Naked Wires</SelectItem>
                        <SelectItem value="garbage">Garbage</SelectItem>
                        <SelectItem value="street_light">Street Light</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} data-testid="button-cancel">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-save-employee">
                {isLoading ? 'Saving...' : 'Save Employee'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Dashboard Tab Component
function DashboardTab() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  
  // Query for employee stats
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ["/api/authority/employees"],
    retry: false,
    enabled: !!user && (user as any).userType === 'authority',
  });

  // Query for report statistics by category
  const { data: reportStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/authority/report-stats"],
    retry: false,
    enabled: !!user && (user as any).userType === 'authority',
  });

  // Employee mutations
  const createEmployeeMutation = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      return apiRequest('POST', '/api/authority/employees', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/authority/employees"] });
      toast({
        title: "Success",
        description: "Employee added successfully",
      });
      setShowAddEmployeeModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create employee",
        variant: "destructive",
      });
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async (data: EmployeeFormData & { id: string }) => {
      return apiRequest('PUT', `/api/authority/employees/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/authority/employees"] });
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
      setShowEditEmployeeModal(false);
      setSelectedEmployee(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive",
      });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      return apiRequest('DELETE', `/api/authority/employees/${employeeId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/authority/employees"] });
      toast({
        title: "Success",
        description: "Employee removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee",
        variant: "destructive",
      });
    },
  });

  const employeeList = (employees as any[]) || [];
  const stats = (reportStats as any) || {
    drainage: 0,
    pothole: 0,
    wire: 0,
    garbage: 0,
    street_light: 0
  };

  // Filter employees by department
  const filteredEmployees = selectedDepartment === 'all' 
    ? employeeList 
    : employeeList.filter(emp => emp.department === selectedDepartment);

  // Calculate ring chart data
  const totalReports = Object.values(stats).reduce((sum: number, count: any) => sum + count, 0);
  const chartData = [
    { category: 'Drainage', count: stats.drainage, color: '#3b82f6', percentage: totalReports > 0 ? (stats.drainage / totalReports) * 100 : 0 },
    { category: 'Potholes', count: stats.pothole, color: '#ef4444', percentage: totalReports > 0 ? (stats.pothole / totalReports) * 100 : 0 },
    { category: 'Wires', count: stats.wire, color: '#f59e0b', percentage: totalReports > 0 ? (stats.wire / totalReports) * 100 : 0 },
    { category: 'Garbage', count: stats.garbage, color: '#10b981', percentage: totalReports > 0 ? (stats.garbage / totalReports) * 100 : 0 },
    { category: 'Street Light', count: stats.street_light, color: '#8b5cf6', percentage: totalReports > 0 ? (stats.street_light / totalReports) * 100 : 0 },
  ];

  return (
    <div className="space-y-6" data-testid="dashboard-tab">
      {/* Employee Management Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Management
          </CardTitle>
          <Button size="sm" onClick={() => setShowAddEmployeeModal(true)} data-testid="button-add-employee">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment} data-testid="select-department">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="drainage">Drainage</SelectItem>
                <SelectItem value="pothole">Potholes</SelectItem>
                <SelectItem value="wire">Naked Wires</SelectItem>
                <SelectItem value="garbage">Garbage</SelectItem>
                <SelectItem value="street_light">Street Light</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {employeesLoading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No employees found. Add employees to manage departments.
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <Card key={employee.id} className="p-4" data-testid={`card-employee-${employee.id}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium" data-testid={`text-employee-name-${employee.id}`}>
                          {employee.firstName} {employee.lastName}
                        </h4>
                        <p className="text-sm text-muted-foreground" data-testid={`text-employee-id-${employee.id}`}>
                          ID: {employee.employeeId}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowEditEmployeeModal(true);
                        }}
                        data-testid={`button-edit-employee-${employee.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteEmployeeMutation.mutate(employee.id)}
                        disabled={deleteEmployeeMutation.isPending}
                        data-testid={`button-delete-employee-${employee.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Badge variant="secondary" data-testid={`badge-department-${employee.id}`}>
                      {employee.department}
                    </Badge>
                    <Badge variant="outline" data-testid={`badge-role-${employee.id}`}>
                      {employee.role}
                    </Badge>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Statistics Ring Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Report Statistics by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Ring Chart */}
              <div className="relative w-64 h-64" data-testid="ring-chart">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                  {chartData.map((item, index) => {
                    const radius = 70;
                    const strokeWidth = 20;
                    const normalizedRadius = radius - strokeWidth * 0.5;
                    const circumference = normalizedRadius * 2 * Math.PI;
                    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -chartData.slice(0, index).reduce((acc, prev) => 
                      acc + (prev.percentage / 100) * circumference, 0);

                    return (
                      <circle
                        key={item.category}
                        stroke={item.color}
                        fill="transparent"
                        strokeWidth={strokeWidth}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        r={normalizedRadius}
                        cx="100"
                        cy="100"
                        data-testid={`ring-segment-${item.category.toLowerCase()}`}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold" data-testid="text-total-reports">{totalReports}</span>
                  <span className="text-sm text-muted-foreground">Total Reports</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3 flex-1">
                {chartData.map((item) => (
                  <div key={item.category} className="flex items-center justify-between" data-testid={`legend-item-${item.category.toLowerCase()}`}>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="font-medium">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold" data-testid={`count-${item.category.toLowerCase()}`}>{item.count}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Employee Modal */}
      <EmployeeFormModal
        isOpen={showAddEmployeeModal}
        onClose={() => setShowAddEmployeeModal(false)}
        onSubmit={(data) => createEmployeeMutation.mutate(data)}
        isLoading={createEmployeeMutation.isPending}
        title="Add New Employee"
      />

      {/* Edit Employee Modal */}
      <EmployeeFormModal
        isOpen={showEditEmployeeModal}
        onClose={() => {
          setShowEditEmployeeModal(false);
          setSelectedEmployee(null);
        }}
        onSubmit={(data) => updateEmployeeMutation.mutate({ ...data, id: selectedEmployee?.id })}
        isLoading={updateEmployeeMutation.isPending}
        title="Edit Employee"
        defaultValues={selectedEmployee}
      />
    </div>
  );
}

// Maps Tab Component
function MapsTab() {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // Query for report locations with density data
  const { data: reportLocations, isLoading: locationsLoading } = useQuery({
    queryKey: ["/api/authority/report-locations"],
    retry: false,
    enabled: !!user && (user as any).userType === 'authority',
  });

  return (
    <div className="space-y-6" data-testid="maps-tab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Report Density Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted rounded-lg flex items-center justify-center" data-testid="map-container">
            {locationsLoading ? (
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading map data...</p>
              </div>
            ) : (
              <div className="text-center">
                <Map className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Interactive map will load here</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Areas with more reports will be highlighted in gradient colors
                </p>
              </div>
            )}
          </div>
          
          {/* Map Legend */}
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <span className="text-sm">Low Density</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span className="text-sm">Medium Density</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">High Density</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Reports Tab Component  
function ReportsTab() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Query for all reports
  const { data: allReports, isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/authority/reports"],
    retry: false,
  });

  // Mutation for assigning reports
  const assignMutation = useMutation({
    mutationFn: async (data: { reportId: string; employeeId: string }) => {
      return apiRequest('POST', '/api/authority/assign-report', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/authority/reports"] });
      toast({
        title: "Success",
        description: "Report assigned successfully",
      });
      setShowDetailModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign report",
        variant: "destructive",
      });
    },
  });

  const reports = (allReports as any[]) || [];

  const handleAssignToMe = (report: any) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Unable to get user information",
        variant: "destructive",
      });
      return;
    }

    assignMutation.mutate({
      reportId: report.id,
      employeeId: user.id,
    });
  };

  const handleRouteToLocation = (report: any) => {
    if (report.latitude && report.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6" data-testid="reports-tab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Manage Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reports found.
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card 
                  key={report.id} 
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedReport(report);
                    setShowDetailModal(true);
                  }}
                  data-testid={`card-report-${report.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-medium" data-testid={`text-report-id-${report.id}`}>
                          {report.reportId}
                        </h4>
                        <p className="text-sm text-muted-foreground" data-testid={`text-category-${report.id}`}>
                          {report.category} • {report.status}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1" data-testid={`text-address-${report.id}`}>
                          {report.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        variant={report.status === 'pending' ? 'destructive' : 
                                report.status === 'in_progress' ? 'default' : 'secondary'}
                        data-testid={`badge-status-${report.id}`}
                      >
                        {report.status}
                      </Badge>
                      {report.assignedTo && (
                        <span className="text-xs text-muted-foreground" data-testid={`text-assigned-${report.id}`}>
                          Assigned
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl" data-testid="dialog-report-detail">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Report ID</label>
                  <p data-testid="detail-report-id">{selectedReport.reportId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <p data-testid="detail-category">{selectedReport.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge data-testid="detail-status">{selectedReport.status}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p data-testid="detail-created">
                    {new Date(selectedReport.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="mt-1" data-testid="detail-description">
                  {selectedReport.description || 'No description provided'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Location</label>
                <p className="mt-1" data-testid="detail-location">{selectedReport.address}</p>
              </div>

              {selectedReport.photoUrl && (
                <div>
                  <label className="text-sm font-medium">Photo Evidence</label>
                  <img 
                    src={selectedReport.photoUrl} 
                    alt="Report evidence" 
                    className="mt-2 max-w-full h-48 object-cover rounded-lg"
                    data-testid="img-evidence"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={() => handleAssignToMe(selectedReport)}
                  disabled={selectedReport.assignedTo || assignMutation.isPending}
                  data-testid="button-assign-to-me"
                >
                  <Target className="h-4 w-4 mr-2" />
                  {assignMutation.isPending ? 'Assigning...' : selectedReport.assignedTo ? 'Already Assigned' : 'Assign to Me'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleRouteToLocation(selectedReport)}
                  data-testid="button-route-location"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Route to Location
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Admin Profile Tab Component
function AdminProfileTab() {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // Query for employee performance data
  const { data: performance, isLoading: performanceLoading } = useQuery({
    queryKey: ["/api/authority/my-performance"],
    retry: false,
  });

  const performanceData = (performance as any) || {
    activeReports: 0,
    resolvedReports: 0,
    flaggedReports: 0,
    averageRating: 0,
    satisfactionRate: 0
  };

  return (
    <div className="space-y-6" data-testid="admin-profile-tab">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            Employee Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <UserCircle className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold" data-testid="text-profile-name">
                {(user as any)?.firstName} {(user as any)?.lastName}
              </h3>
              <p className="text-muted-foreground" data-testid="text-profile-email">
                {(user as any)?.email}
              </p>
              <p className="text-sm" data-testid="text-employee-id">
                Employee ID: {(user as any)?.employeeId || 'Not Set'}
              </p>
              <Badge variant="outline" data-testid="badge-user-role">
                {(user as any)?.role || 'Authority'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {performanceLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg" data-testid="stat-active-reports">
                <div className="text-2xl font-bold text-blue-600">{performanceData.activeReports}</div>
                <div className="text-sm text-blue-600">Active Reports</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg" data-testid="stat-resolved-reports">
                <div className="text-2xl font-bold text-green-600">{performanceData.resolvedReports}</div>
                <div className="text-sm text-green-600">Resolved</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg" data-testid="stat-flagged-reports">
                <div className="text-2xl font-bold text-red-600">{performanceData.flaggedReports}</div>
                <div className="text-sm text-red-600">Flagged</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg" data-testid="stat-rating">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="text-2xl font-bold text-yellow-600">
                    {performanceData.averageRating.toFixed(1)}
                  </span>
                </div>
                <div className="text-sm text-yellow-600">Avg Rating</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg" data-testid="stat-satisfaction">
                <div className="text-2xl font-bold text-purple-600">
                  {performanceData.satisfactionRate.toFixed(0)}%
                </div>
                <div className="text-sm text-purple-600">Satisfaction</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent User Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              No recent feedback available
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Authority Dashboard Component
export default function AuthorityDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");

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

  return (
    <div className="min-h-screen bg-background">
      <PWAHeader />
      
      <div className="container mx-auto px-4 py-6 pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2" data-testid="text-welcome">
            Welcome, {displayName}
          </h1>
          <p className="text-muted-foreground">
            Manage civic reports and oversee field operations
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4" data-testid="tabs-list">
            <TabsTrigger value="dashboard" className="flex items-center gap-2" data-testid="tab-dashboard">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="maps" className="flex items-center gap-2" data-testid="tab-maps">
              <Map className="h-4 w-4" />
              Maps
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2" data-testid="tab-reports">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2" data-testid="tab-profile">
              <UserCircle className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="maps" className="mt-6">
            <MapsTab />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ReportsTab />
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <AdminProfileTab />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation activeTab="home" />
    </div>
  );
}