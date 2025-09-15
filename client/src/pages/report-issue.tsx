import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import PWAHeader from "@/components/pwa-header";
import BottomNavigation from "@/components/bottom-navigation";
import PhotoUpload from "@/components/photo-upload";
import LocationPicker from "@/components/location-picker";
import LoadingSpinner from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArrowLeft, Droplets, Construction, Zap, Trash2, Info } from "lucide-react";

interface ReportData {
  category: string;
  description: string;
  photo: File | null;
  location: { lat: number; lng: number } | null;
  address: string;
}

export default function ReportIssue() {
  const [step, setStep] = useState<'category' | 'photo' | 'location'>('category');
  const [reportData, setReportData] = useState<ReportData>({
    category: '',
    description: '',
    photo: null,
    location: null,
    address: '',
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const categories = [
    { id: 'drainage', name: 'Drainage', description: 'Water clogging, sewage issues', icon: Droplets, color: 'blue' },
    { id: 'pothole', name: 'Pothole', description: 'Road damage, broken pavement', icon: Construction, color: 'orange' },
    { id: 'wire', name: 'Naked Wire', description: 'Exposed electrical wires', icon: Zap, color: 'red' },
    { id: 'garbage', name: 'Garbage', description: 'Waste accumulation, litter', icon: Trash2, color: 'green' },
  ];

  const submitMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('category', reportData.category);
      formData.append('description', reportData.description);
      formData.append('latitude', reportData.location!.lat.toString());
      formData.append('longitude', reportData.location!.lng.toString());
      formData.append('address', reportData.address);
      
      if (reportData.photo) {
        formData.append('photo', reportData.photo);
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Report Submitted Successfully!",
        description: `Your report has been assigned ID #${data.reportId}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reports/stats'] });
      setLocation('/');
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCategorySelect = (categoryId: string) => {
    setReportData(prev => ({ ...prev, category: categoryId }));
    setTimeout(() => setStep('photo'), 300);
  };

  const handlePhotoCapture = (file: File) => {
    setReportData(prev => ({ ...prev, photo: file }));
  };

  const handleLocationCapture = (location: { lat: number; lng: number }, address: string) => {
    setReportData(prev => ({ ...prev, location, address }));
  };

  const canSubmit = reportData.category && reportData.location;

  return (
    <div className="min-h-screen bg-background pb-20">
      <PWAHeader />
      
      <div className="pt-16">
        {/* Header with back button */}
        <div className="bg-card border-b border-border p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => step === 'category' ? setLocation('/') : 
                step === 'photo' ? setStep('category') : setStep('photo')}
              className="w-10 h-10 p-0 rounded-full"
              data-testid="button-back"
            >
              <ArrowLeft size={20} />
            </Button>
            <h2 className="text-xl font-semibold">Report Issue</h2>
          </div>
        </div>

        <div className="p-4">
          {step === 'category' && (
            <div data-testid="step-category">
              <h3 className="text-lg font-semibold mb-4">Select Problem Category</h3>
              <div className="grid grid-cols-2 gap-4">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Card 
                      key={category.id}
                      className="cursor-pointer hover:shadow-md hover:border-primary transition-all"
                      onClick={() => handleCategorySelect(category.id)}
                      data-testid={`card-category-${category.id}`}
                    >
                      <CardContent className="p-4 text-center">
                        <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center
                          ${category.color === 'blue' ? 'bg-blue-100' : 
                            category.color === 'orange' ? 'bg-orange-100' :
                            category.color === 'red' ? 'bg-red-100' : 'bg-green-100'}`}>
                          <IconComponent 
                            size={24} 
                            className={`${category.color === 'blue' ? 'text-blue-600' : 
                              category.color === 'orange' ? 'text-orange-600' :
                              category.color === 'red' ? 'text-red-600' : 'text-green-600'}`}
                          />
                        </div>
                        <h4 className="font-semibold mb-1">{category.name}</h4>
                        <p className="text-muted-foreground text-sm">{category.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info size={20} className="text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium">Reporting Guidelines</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Select the category that best describes your issue. You'll be able to provide more details in the next steps.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'photo' && (
            <div data-testid="step-photo">
              <h3 className="text-lg font-semibold mb-4">Upload Photo</h3>
              
              {/* Selected category display */}
              {reportData.category && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {(() => {
                        const category = categories.find(c => c.id === reportData.category);
                        const IconComponent = category?.icon || Droplets;
                        return <IconComponent size={20} className="text-primary" />;
                      })()}
                    </div>
                    <div>
                      <p className="font-medium capitalize">
                        {categories.find(c => c.id === reportData.category)?.name} Issue
                      </p>
                      <p className="text-muted-foreground text-sm">Selected category</p>
                    </div>
                  </div>
                </div>
              )}

              <PhotoUpload 
                onPhotoCapture={handlePhotoCapture} 
                onContinue={() => setStep('location')}
              />

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Additional Description (Optional)</label>
                <Textarea 
                  placeholder="Provide any additional details about the issue..."
                  value={reportData.description}
                  onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  data-testid="textarea-description"
                />
              </div>
            </div>
          )}

          {step === 'location' && (
            <div data-testid="step-location">
              <h3 className="text-lg font-semibold mb-4">Select Location</h3>
              
              <LocationPicker 
                onLocationCapture={handleLocationCapture}
              />

              <Button 
                className="w-full py-4 text-lg font-semibold mt-4"
                disabled={!canSubmit || submitMutation.isPending}
                onClick={() => submitMutation.mutate()}
                data-testid="button-submit-report"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Report"}
              </Button>

              <div className="bg-muted rounded-lg p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <Info size={20} className="text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium">Location Guidelines</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Accurate location helps authorities respond faster. Make sure you're at the exact location of the issue when capturing coordinates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation activeTab="report" />
      {submitMutation.isPending && <LoadingSpinner />}
    </div>
  );
}
