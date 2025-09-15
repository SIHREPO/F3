import { useTranslation } from 'react-i18next';

export default function LoadingSpinner() {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50" data-testid="loading-spinner">
      <div className="bg-card rounded-lg p-6 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
          <span className="font-medium">{t('common.processing')}</span>
        </div>
      </div>
    </div>
  );
}
