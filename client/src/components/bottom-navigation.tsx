import { Link } from "wouter";
import { Home, Plus, User, FileText } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface BottomNavigationProps {
  activeTab: "home" | "report" | "manage" | "profile";
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const { t } = useTranslation();
  const navItems = [
    { id: "home", label: t('navigation.home'), icon: Home, path: "/" },
    { id: "report", label: t('navigation.report'), icon: Plus, path: "/report" },
    { id: "manage", label: t('navigation.manage'), icon: FileText, path: "/manage-reports" },
    { id: "profile", label: t('navigation.profile'), icon: User, path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="grid grid-cols-4 py-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Link 
              key={item.id}
              href={item.path}
              className={`flex flex-col items-center py-2 px-4 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
              data-testid={`nav-${item.id}`}
            >
              <IconComponent size={20} className="mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
