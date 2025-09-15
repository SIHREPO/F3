import { useState, useEffect } from "react";
import { Building2, Download, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './language-selector';

export default function PWAHeader() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-primary text-primary-foreground z-50 shadow-md">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <Building2 size={24} />
          <h1 className="text-lg font-semibold">{t('app.title')}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <LanguageSelector 
            variant="ghost" 
            size="sm"
            className="text-primary-foreground hover:bg-white/10" 
          />
          {showInstallButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleInstall}
              className="text-primary-foreground hover:bg-white/10 p-2"
              data-testid="button-install-pwa"
            >
              <Download size={20} />
            </Button>
          )}
          {!!user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-white/10 p-2"
              data-testid="button-logout"
            >
              <LogOut size={20} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
