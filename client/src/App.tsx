import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { AIChatbot } from "@/components/ai-chatbot";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import AuthorityDashboard from "@/pages/authority-dashboard";
import ReportIssue from "@/pages/report-issue";
import ManageReports from "@/pages/manage-reports";
import NotFound from "@/pages/not-found";

// Placeholder components for authority routes
function AuthorityReports() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authority Reports</h1>
        <p className="text-gray-600 dark:text-gray-300">This page is under construction. Here you will be able to view and manage all citizen reports.</p>
      </div>
    </div>
  );
}

function AuthorityAnalytics() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authority Analytics</h1>
        <p className="text-gray-600 dark:text-gray-300">This page is under construction. Here you will be able to view detailed analytics and reports.</p>
      </div>
    </div>
  );
}

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (user as any)?.userType === 'authority' ? (
        <>
          <Route path="/" component={AuthorityDashboard} />
          <Route path="/authority" component={AuthorityDashboard} />
          <Route path="/authority/reports">
            <AuthorityReports />
          </Route>
          <Route path="/authority/analytics">
            <AuthorityAnalytics />
          </Route>
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/report" component={ReportIssue} />
          <Route path="/manage-reports" component={ManageReports} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Router />
      {isAuthenticated && <AIChatbot />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
