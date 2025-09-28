import { useMemo } from 'react';
import { useSettings } from '../context/SettingsContext';

const MESSAGES = {
  es: {
    operations_title: 'Operaciones',
    search_placeholder: 'Buscar...',
    status: 'Estado',
    no_data: 'No hay datos',
    from_label: 'Desde (YYYY-MM-DD)',
    to_label: 'Hasta (YYYY-MM-DD)',
    sort_asc: 'Ascendente',
    sort_desc: 'Descendente',

    sales_title: 'Ventas',
    sales_subtitle: 'Gestión de ventas',
    search_sales_placeholder: 'Buscar por cliente, método o sucursal...',
    loading_sales: 'Cargando ventas...',
    see: 'Ver',
    edit: 'Editar',
    delete: 'Eliminar',
    branch: 'Sucursal',
    invoices_title: 'Facturas',
    invoices_subtitle: 'Listado de facturas (pedidos)',
    search_invoices_placeholder: 'Buscar por cliente, total o estado...',
    loading_invoices: 'Cargando facturas...',
    reports_title: 'Reportes y Estadísticas',
    reports_subtitle: 'Indicadores clave del negocio',
    kpi_income_month: 'Ingresos Mes',
    kpi_sales_month: 'Ventas Mes',
    kpi_active_clients: 'Clientes Activos',
    kpi_today_appointments: 'Citas Hoy',
    monthly_sales: 'Ventas mensuales',
    appointment_status: 'Estado de citas',
    popular_products: 'Productos populares',

    // Settings
    settings_title: 'Configuración',
    settings_subtitle: 'Preferencias de la aplicación',
    settings_appearance: 'Apariencia',
    settings_language: 'Idioma',
    settings_notifications: 'Notificaciones',
    settings_currency: 'Moneda',
    settings_date_format: 'Formato de fecha',
    settings_push: 'Notificaciones push',
    settings_push_sub: 'Recibe alertas y recordatorios',
    theme_light: 'Claro',
    theme_dark: 'Oscuro',
    theme_system: 'Sistema',
  },
  en: {
    operations_title: 'Operations',
    search_placeholder: 'Search...',
    status: 'Status',
    no_data: 'No data',
    from_label: 'From (YYYY-MM-DD)',
    to_label: 'To (YYYY-MM-DD)',
    sort_asc: 'Ascending',
    sort_desc: 'Descending',

    sales_title: 'Sales',
    sales_subtitle: 'Sales management',
    search_sales_placeholder: 'Search by customer, method or branch...',
    loading_sales: 'Loading sales...',
    see: 'View',
    edit: 'Edit',
    delete: 'Delete',
    branch: 'Branch',
    invoices_title: 'Invoices',
    invoices_subtitle: 'Invoices list (orders)',
    search_invoices_placeholder: 'Search by customer, total or status...',
    loading_invoices: 'Loading invoices...',
    reports_title: 'Reports & Analytics',
    reports_subtitle: 'Key business indicators',
    kpi_income_month: 'Income (month)',
    kpi_sales_month: 'Sales (month)',
    kpi_active_clients: 'Active clients',
    kpi_today_appointments: 'Appointments today',
    monthly_sales: 'Monthly sales',
    appointment_status: 'Appointments status',
    popular_products: 'Popular products',

    // Settings
    settings_title: 'Settings',
    settings_subtitle: 'App preferences',
    settings_appearance: 'Appearance',
    settings_language: 'Language',
    settings_notifications: 'Notifications',
    settings_currency: 'Currency',
    settings_date_format: 'Date format',
    settings_push: 'Push notifications',
    settings_push_sub: 'Receive alerts and reminders',
    theme_light: 'Light',
    theme_dark: 'Dark',
    theme_system: 'System',
  },
};

export const useI18n = () => {
  const { language } = useSettings();
  const dict = useMemo(() => (MESSAGES[language] || MESSAGES.es), [language]);
  const t = (key) => dict[key] || key;
  return { t };
};
