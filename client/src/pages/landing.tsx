import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, User, Shield } from "lucide-react";
import PWAHeader from "@/components/pwa-header";
import { useTranslation } from 'react-i18next';

export default function Landing() {
  const { t } = useTranslation();
  const handleLogin = (userType: "citizen" | "authority") => {
    // Store user type preference for after auth
    localStorage.setItem("preferredUserType", userType);
    window.location.href = `/api/login?userType=${userType}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <PWAHeader />
      
      <div className="pt-16 min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-6">
          {/* Logo/Hero Section */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
              <Building2 className="text-3xl text-primary-foreground" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">{t('auth.welcome')}</h2>
            <p className="text-muted-foreground text-lg">{t('app.tagline')}</p>
          </div>

          {/* User Type Selection */}
          <div className="space-y-4 mb-8">
            <Card 
              className="p-6 cursor-pointer hover:bg-muted transition-colors shadow-md"
              onClick={() => handleLogin('citizen')}
              data-testid="button-login-citizen"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="text-primary" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{t('auth.loginAsCitizen')}</h3>
                  <p className="text-muted-foreground">{t('auth.citizenDescription')}</p>
                </div>
                <div className="text-muted-foreground">→</div>
              </div>
            </Card>

            <Card 
              className="p-6 cursor-pointer hover:bg-muted transition-colors shadow-md"
              onClick={() => handleLogin('authority')}
              data-testid="button-login-authority"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Shield className="text-secondary" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{t('auth.loginAsAuthority')}</h3>
                  <p className="text-muted-foreground">{t('auth.authorityDescription')}</p>
                </div>
                <div className="text-muted-foreground">→</div>
              </div>
            </Card>
          </div>

          {/* Info Section */}
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium">{t('auth.secureAuth')}</p>
                <p className="text-muted-foreground text-sm mt-1">
                  {t('auth.chooseRole')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
