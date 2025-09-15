import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Image, RotateCcw } from "lucide-react";

interface PhotoUploadProps {
  onPhotoCapture: (file: File) => void;
  onContinue: () => void;
}

export default function PhotoUpload({ onPhotoCapture, onContinue }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      onPhotoCapture(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRetake = () => {
    setPreview(null);
    setFile(null);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/50 transition-colors hover:border-primary hover:bg-muted">
        {!preview ? (
          <div data-testid="upload-placeholder">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <Camera size={24} className="text-muted-foreground" />
            </div>
            <h4 className="font-semibold mb-2">Add Photo Evidence</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Take a clear photo of the issue to help authorities understand the problem better
            </p>
            <input 
              type="file" 
              id="photoInput" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={handleFileChange}
              data-testid="input-photo"
            />
            <div className="space-y-2">
              <Button 
                onClick={() => document.getElementById('photoInput')?.click()}
                className="w-full shadow-sm"
                data-testid="button-take-photo"
              >
                <Camera size={16} className="mr-2" />
                Take Photo
              </Button>
              <Button 
                variant="outline"
                onClick={() => document.getElementById('photoInput')?.click()}
                className="w-full shadow-sm"
                data-testid="button-choose-gallery"
              >
                <Image size={16} className="mr-2" />
                Choose from Gallery
              </Button>
            </div>
          </div>
        ) : (
          <div data-testid="photo-preview">
            <img 
              src={preview} 
              alt="Issue photo" 
              className="w-full h-48 object-cover rounded-lg mb-4"
              data-testid="img-preview"
            />
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={handleRetake}
                className="flex-1 shadow-sm"
                data-testid="button-retake"
              >
                <RotateCcw size={16} className="mr-2" />
                Retake
              </Button>
              <Button 
                onClick={onContinue}
                className="flex-1 shadow-sm"
                data-testid="button-continue-photo"
              >
                Continue →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
