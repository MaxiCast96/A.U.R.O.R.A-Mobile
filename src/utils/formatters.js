import { useMemo } from 'react';
import { useSettings } from '../context/SettingsContext';

// Hook to provide formatting helpers based on settings
export const useFormatters = () => {
  const { language, currency, dateFormat } = useSettings();

  const fmt = useMemo(() => {
    const locale = language === 'en' ? 'en-US' : 'es-SV';

    const formatCurrency = (value) => {
      try {
        return new Intl.NumberFormat(locale, { style: 'currency', currency: currency || 'USD' }).format(Number(value || 0));
      } catch {
        // Fallback simple
        return `${currency || 'USD'} ${Number(value || 0).toFixed(2)}`;
      }
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      if (dateFormat === 'DD/MM/YYYY') {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      }
      // default YYYY-MM-DD
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${yyyy}-${mm}-${dd}`;
    };

    return { formatCurrency, formatDate };
  }, [language, currency, dateFormat]);

  return fmt;
};
