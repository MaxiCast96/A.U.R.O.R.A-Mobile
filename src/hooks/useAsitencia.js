import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para gestionar la asistencia de empleados
 * 
 * Conectado con la base de datos de sucursales y empleados
 */
export const useAsistencia = () => {
    const { getAuthHeaders } = useAuth();
    
    // Estados principales
    const [empleados, setEmpleados] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [empleadosPorSucursal, setEmpleadosPorSucursal] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Filtros
    const [selectedFilter, setSelectedFilter] = useState('todos'); // 'todos', 'disponibles', 'no-disponibles'
    const [selectedSucursalFilter, setSelectedSucursalFilter] = useState('todas'); // 'todas' o ID de sucursal

    /**
     * Cargar sucursales desde el backend
     */
    const loadSucursales = async () => {
        try {
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/sucursales', {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                const sucursalesData = Array.isArray(data) ? data : (data.sucursales || []);
                // Filtrar solo sucursales activas
                const sucursalesActivas = sucursalesData.filter(s => s.activo === true);
                setSucursales(sucursalesActivas);
                return sucursalesActivas;
            }
            return [];
        } catch (error) {
            console.error('Error al cargar sucursales:', error);
            return [];
        }
    };

    /**
     * Cargar empleados desde el backend
     */
    const loadEmpleados = async () => {
        try {
            setLoading(true);
            
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/empleados', {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                // Filtrar solo empleados activos
                const empleadosActivos = data.filter(emp => 
                    emp.estado?.toLowerCase() === 'activo'
                );
                setEmpleados(empleadosActivos);
                return empleadosActivos;
            } else {
                Alert.alert(
                    'Error de conexión', 
                    'No se pudieron cargar los empleados.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return [];
            }
        } catch (error) {
            console.error('Error al cargar empleados:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al conectar con el servidor.',
                [{ text: 'Reintentar', onPress: loadData, style: 'default' }]
            );
            return [];
        } finally {
            setLoading(false);
        }
    };

    /**
     * Cargar todos los datos
     */
    const loadData = async () => {
        const [sucursalesData, empleadosData] = await Promise.all([
            loadSucursales(),
            loadEmpleados()
        ]);
        
        if (empleadosData.length > 0) {
            agruparEmpleadosPorSucursal(empleadosData, sucursalesData);
        }
    };

    /**
     * Agrupar empleados por sucursal
     */
    const agruparEmpleadosPorSucursal = (empleadosData, sucursalesData) => {
        const agrupados = {};
        
        empleadosData.forEach(empleado => {
            // Obtener ID de la sucursal
            const sucursalId = empleado.sucursalId?._id || empleado.sucursalId;
            
            // Buscar la sucursal en el array de sucursales
            const sucursal = sucursalesData.find(s => s._id === sucursalId);
            const sucursalNombre = sucursal?.nombre || empleado.sucursalId?.nombre || 'Sin Sucursal';
            
            if (!agrupados[sucursalNombre]) {
                agrupados[sucursalNombre] = {
                    id: sucursalId,
                    nombre: sucursalNombre,
                    empleados: [],
                    disponibles: 0,
                    noDisponibles: 0,
                    total: 0
                };
            }
            
            // Añadir estado de disponibilidad (por defecto disponible)
            const empleadoConDisponibilidad = {
                ...empleado,
                disponible: empleado.disponible !== undefined ? empleado.disponible : true
            };
            
            agrupados[sucursalNombre].empleados.push(empleadoConDisponibilidad);
            agrupados[sucursalNombre].total += 1;
            
            if (empleadoConDisponibilidad.disponible) {
                agrupados[sucursalNombre].disponibles += 1;
            } else {
                agrupados[sucursalNombre].noDisponibles += 1;
            }
        });
        
        setEmpleadosPorSucursal(agrupados);
    };

    /**
     * Toggle disponibilidad de un empleado
     */
    const toggleDisponibilidad = async (empleadoId, sucursalNombre) => {
        try {
            // Actualizar localmente
            const empleadosActualizados = empleados.map(emp => {
                if (emp._id === empleadoId) {
                    return { ...emp, disponible: !emp.disponible };
                }
                return emp;
            });
            
            setEmpleados(empleadosActualizados);
            agruparEmpleadosPorSucursal(empleadosActualizados, sucursales);
            
            return true;
        } catch (error) {
            console.error('Error al actualizar disponibilidad:', error);
            Alert.alert('Error', 'No se pudo actualizar la disponibilidad.');
            return false;
        }
    };

    /**
     * Refrescar datos
     */
    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    /**
     * Obtener sucursales filtradas
     */
    const getSucursalesFiltradas = () => {
        // Validar que empleadosPorSucursal existe y es un objeto
        if (!empleadosPorSucursal || typeof empleadosPorSucursal !== 'object') {
            return {};
        }
        
        let resultado = { ...empleadosPorSucursal };
        
        // Filtrar por sucursal específica
        if (selectedSucursalFilter !== 'todas') {
            const filtered = {};
            Object.keys(resultado).forEach(sucursalNombre => {
                const sucursalData = resultado[sucursalNombre];
                if (sucursalData.id === selectedSucursalFilter) {
                    filtered[sucursalNombre] = sucursalData;
                }
            });
            resultado = filtered;
        }
        
        // Filtrar por disponibilidad
        if (selectedFilter !== 'todos') {
            const filtered = {};
            
            Object.keys(resultado).forEach(sucursalNombre => {
                const empleadosFiltrados = resultado[sucursalNombre].empleados.filter(emp => {
                    if (selectedFilter === 'disponibles') {
                        return emp.disponible === true;
                    } else if (selectedFilter === 'no-disponibles') {
                        return emp.disponible === false;
                    }
                    return true;
                });
                
                if (empleadosFiltrados.length > 0) {
                    // Recalcular estadísticas para los empleados filtrados
                    const disponibles = empleadosFiltrados.filter(e => e.disponible).length;
                    const noDisponibles = empleadosFiltrados.filter(e => !e.disponible).length;
                    
                    filtered[sucursalNombre] = {
                        ...resultado[sucursalNombre],
                        empleados: empleadosFiltrados,
                        disponibles,
                        noDisponibles,
                        total: empleadosFiltrados.length
                    };
                }
            });
            
            resultado = filtered;
        }
        
        return resultado;
    };

    /**
     * Obtener estadísticas generales
     */
    const getEstadisticasGenerales = () => {
        // Validar que empleadosPorSucursal existe
        if (!empleadosPorSucursal || typeof empleadosPorSucursal !== 'object') {
            return {
                totalDisponibles: 0,
                totalNoDisponibles: 0,
                totalEmpleados: 0,
                porcentajeDisponibles: 0,
                totalSucursales: 0
            };
        }
        
        let totalDisponibles = 0;
        let totalNoDisponibles = 0;
        let totalEmpleados = 0;
        
        Object.values(empleadosPorSucursal).forEach(sucursal => {
            totalDisponibles += sucursal.disponibles;
            totalNoDisponibles += sucursal.noDisponibles;
            totalEmpleados += sucursal.total;
        });
        
        const porcentajeDisponibles = totalEmpleados > 0 
            ? Math.round((totalDisponibles / totalEmpleados) * 100) 
            : 0;
        
        return {
            totalDisponibles,
            totalNoDisponibles,
            totalEmpleados,
            porcentajeDisponibles,
            totalSucursales: Object.keys(empleadosPorSucursal).length
        };
    };

    // Cargar datos al montar
    useEffect(() => {
        loadData();
    }, []);

    return {
        // Datos
        empleados,
        sucursales,
        empleadosPorSucursal: getSucursalesFiltradas(),
        
        // Estados UI
        loading,
        refreshing,
        
        // Filtros
        selectedFilter,
        selectedSucursalFilter,
        setSelectedFilter,
        setSelectedSucursalFilter,
        
        // Acciones
        onRefresh,
        toggleDisponibilidad,
        getEstadisticasGenerales
    };
};