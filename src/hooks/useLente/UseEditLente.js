import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para gestionar la edición de lentes existentes
 * 
 * Este hook encapsula toda la lógica relacionada con:
 * - Estados del formulario de editar lente
 * - Carga de datos del lente existente
 * - Validación de campos
 * - Envío de datos actualizados al servidor
 * - Limpieza del formulario
 * - Manejo de estados de carga
 * 
 * @returns {Object} Objeto con estados y funciones para editar lentes
 */
export const useEditLente = () => {
    const { getAuthHeaders } = useAuth();
    
    // ===========================================
    // ESTADOS DEL FORMULARIO
    // ===========================================
    // Información Básica
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');

    // Categorización
    const [categoriaId, setCategoriaId] = useState('');
    const [marcaId, setMarcaId] = useState('');
    const [linea, setLinea] = useState('');

    // Características Físicas
    const [material, setMaterial] = useState('');
    const [color, setColor] = useState('');
    const [tipoLente, setTipoLente] = useState('');

    // Medidas del Lente
    const [anchoPuente, setAnchoPuente] = useState('');
    const [altura, setAltura] = useState('');
    const [ancho, setAncho] = useState('');

    // Información de Precios
    const [precioBase, setPrecioBase] = useState('');
    const [precioActual, setPrecioActual] = useState('');
    const [enPromocion, setEnPromocion] = useState(false);

    // Información Adicional
    const [fechaCreacion, setFechaCreacion] = useState('');

    // Sucursales
    const [sucursales, setSucursales] = useState([]);

    // Estados de datos externos
    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);

    // Estados de control
    const [loading, setLoading] = useState(false);
    const [lenteId, setLenteId] = useState(null);
    const [initialData, setInitialData] = useState(null);
    const [errors, setErrors] = useState({});

    // ===========================================
    // FUNCIONES DE INICIALIZACIÓN
    // ===========================================

    /**
     * Cargar datos del lente existente en el formulario
     * @param {Object} lente - Objeto con los datos del lente
     */
    const loadLenteData = (lente) => {
        if (!lente) return;
        
        setLenteId(lente._id);
        setNombre(lente.nombre || '');
        setDescripcion(lente.descripcion || '');
        
        // Manejar IDs de categoría y marca (pueden ser objetos populados)
        setCategoriaId(typeof lente.categoriaId === 'object' ? lente.categoriaId._id : lente.categoriaId || '');
        setMarcaId(typeof lente.marcaId === 'object' ? lente.marcaId._id : lente.marcaId || '');
        
        setLinea(lente.linea || '');
        setMaterial(lente.material || '');
        setColor(lente.color || '');
        setTipoLente(lente.tipoLente || '');
        
        // Cargar medidas
        if (lente.medidas) {
            setAnchoPuente(lente.medidas.anchoPuente?.toString() || '');
            setAltura(lente.medidas.altura?.toString() || '');
            setAncho(lente.medidas.ancho?.toString() || '');
        } else {
            setAnchoPuente('');
            setAltura('');
            setAncho('');
        }
        
        setPrecioBase(lente.precioBase?.toString() || '');
        setPrecioActual(lente.precioActual?.toString() || '');
        setEnPromocion(lente.enPromocion || false);
        
        // Formatear fecha
        if (lente.fechaCreacion) {
            const fecha = new Date(lente.fechaCreacion);
            setFechaCreacion(fecha.toISOString().split('T')[0]);
        } else {
            setFechaCreacion('');
        }
        
        // Cargar sucursales
        setSucursales(lente.sucursales || []);
        
        setErrors({});
        
        // Guardar datos iniciales para comparación
        setInitialData(lente);
    };

    /**
     * Cargar categorías, marcas y sucursales desde el servidor
     */
    const loadInitialData = async () => {
        try {
            const headers = getAuthHeaders();
            
            const [categoriasRes, marcasRes, sucursalesRes] = await Promise.all([
                fetch('https://a-u-r-o-r-a.onrender.com/api/categorias', { headers }),
                fetch('https://a-u-r-o-r-a.onrender.com/api/marcas', { headers }),
                fetch('https://a-u-r-o-r-a.onrender.com/api/sucursales', { headers })
            ]);

            if (categoriasRes.ok) {
                const categoriasData = await categoriasRes.json();
                setCategorias(categoriasData);
            }

            if (marcasRes.ok) {
                const marcasData = await marcasRes.json();
                setMarcas(marcasData);
            }

            if (sucursalesRes.ok) {
                const sucursalesData = await sucursalesRes.json();
                setSucursalesDisponibles(sucursalesData);
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    };

    // ===========================================
    // FUNCIONES DE VALIDACIÓN
    // ===========================================

    /**
     * Validar un campo específico
     */
    const validateField = (field, value) => {
        let error = null;
        
        switch (field) {
            case 'nombre':
                if (!value || value.trim().length === 0) {
                    error = 'El nombre es requerido';
                }
                break;
            case 'descripcion':
                if (!value || value.trim().length === 0) {
                    error = 'La descripción es requerida';
                }
                break;
            case 'categoriaId':
                if (!value) {
                    error = 'La categoría es requerida';
                }
                break;
            case 'marcaId':
                if (!value) {
                    error = 'La marca es requerida';
                }
                break;
            case 'material':
                if (!value) {
                    error = 'El material es requerido';
                }
                break;
            case 'color':
                if (!value) {
                    error = 'El color es requerido';
                }
                break;
            case 'tipoLente':
                if (!value) {
                    error = 'El tipo de lente es requerido';
                }
                break;
            case 'linea':
                if (!value) {
                    error = 'La línea es requerida';
                }
                break;
            case 'anchoPuente':
                if (!value || isNaN(value) || parseFloat(value) <= 0) {
                    error = 'El ancho del puente debe ser un número positivo';
                }
                break;
            case 'altura':
                if (!value || isNaN(value) || parseFloat(value) <= 0) {
                    error = 'La altura debe ser un número positivo';
                }
                break;
            case 'ancho':
                if (!value || isNaN(value) || parseFloat(value) <= 0) {
                    error = 'El ancho debe ser un número positivo';
                }
                break;
            case 'precioBase':
                if (!value || isNaN(value) || parseFloat(value) <= 0) {
                    error = 'El precio base debe ser un número positivo';
                }
                break;
            case 'precioActual':
                if (!value || isNaN(value) || parseFloat(value) <= 0) {
                    error = 'El precio actual debe ser un número positivo';
                }
                break;
            default:
                break;
        }
        
        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
        return !error;
    };

    /**
     * Validar formulario completo antes de enviar
     */
    const validateForm = () => {
        const fields = {
            nombre,
            descripcion,
            categoriaId,
            marcaId,
            material,
            color,
            tipoLente,
            linea,
            anchoPuente,
            altura,
            ancho,
            precioBase,
            precioActual
        };

        let isValid = true;

        Object.keys(fields).forEach(field => {
            const fieldValid = validateField(field, fields[field]);
            if (!fieldValid) {
                isValid = false;
            }
        });

        return isValid;
    };

    /**
     * Verificar si hay cambios en los datos
     */
    const hasChanges = () => {
        if (!initialData) return false;
        
        const currentData = {
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            categoriaId,
            marcaId,
            linea,
            material,
            color,
            tipoLente,
            precioBase: parseFloat(precioBase) || 0,
            precioActual: parseFloat(precioActual) || 0,
            enPromocion,
            fechaCreacion: new Date(fechaCreacion),
            medidas: {
                anchoPuente: parseFloat(anchoPuente) || 0,
                altura: parseFloat(altura) || 0,
                ancho: parseFloat(ancho) || 0
            }
        };
        
        // Obtener IDs correctos de los datos iniciales
        const initialCategoriaId = typeof initialData.categoriaId === 'object' 
            ? initialData.categoriaId._id 
            : initialData.categoriaId;
        const initialMarcaId = typeof initialData.marcaId === 'object' 
            ? initialData.marcaId._id 
            : initialData.marcaId;
        
        // Comparar datos básicos
        if (currentData.nombre !== (initialData.nombre || '') ||
            currentData.descripcion !== (initialData.descripcion || '') ||
            currentData.categoriaId !== initialCategoriaId ||
            currentData.marcaId !== initialMarcaId ||
            currentData.linea !== (initialData.linea || '') ||
            currentData.material !== (initialData.material || '') ||
            currentData.color !== (initialData.color || '') ||
            currentData.tipoLente !== (initialData.tipoLente || '') ||
            currentData.precioBase !== (initialData.precioBase || 0) ||
            currentData.precioActual !== (initialData.precioActual || 0) ||
            currentData.enPromocion !== (initialData.enPromocion || false)) {
            return true;
        }
        
        // Comparar medidas
        const initialMedidas = initialData.medidas || {};
        if (currentData.medidas.anchoPuente !== (initialMedidas.anchoPuente || 0) ||
            currentData.medidas.altura !== (initialMedidas.altura || 0) ||
            currentData.medidas.ancho !== (initialMedidas.ancho || 0)) {
            return true;
        }
        
        // Comparar fecha
        const initialFecha = initialData.fechaCreacion 
            ? new Date(initialData.fechaCreacion).toISOString().split('T')[0] 
            : '';
        if (fechaCreacion !== initialFecha) {
            return true;
        }
        
        return false;
    };

    // ===========================================
    // FUNCIONES DE MANEJO DE DATOS
    // ===========================================

    /**
     * Actualizar stock de una sucursal específica
     */
    const updateSucursalStock = (sucursalId, stock) => {
        setSucursales(prev => 
            prev.map(s => 
                s.sucursalId === sucursalId 
                    ? { ...s, stock: parseInt(stock) || 0 }
                    : s
            )
        );
    };

    // ===========================================
    // FUNCIONES DE LIMPIEZA
    // ===========================================

    /**
     * Limpiar todos los campos del formulario
     */
    const clearForm = () => {
        setNombre('');
        setDescripcion('');
        setCategoriaId('');
        setMarcaId('');
        setLinea('');
        setMaterial('');
        setColor('');
        setTipoLente('');
        setAnchoPuente('');
        setAltura('');
        setAncho('');
        setPrecioBase('');
        setPrecioActual('');
        setEnPromocion(false);
        setFechaCreacion('');
        setSucursales([]);
        setLenteId(null);
        setInitialData(null);
        setErrors({});
    };

    // ===========================================
    // FUNCIONES DE ACTUALIZACIÓN
    // ===========================================

    /**
     * Actualizar lente en el servidor
     * @param {Function} onSuccess - Callback ejecutado cuando se actualiza exitosamente
     */
    const updateLente = async (onSuccess) => {
        if (!lenteId) {
            Alert.alert('Error', 'No se puede actualizar el lente');
            return false;
        }

        if (!validateForm()) return false;

        // Verificar si hay cambios
        if (!hasChanges()) {
            Alert.alert('Sin cambios', 'No se han detectado cambios en los datos del lente');
            return false;
        }

        setLoading(true);
        
        const lenteData = {
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            categoriaId,
            marcaId,
            material,
            color,
            tipoLente,
            precioBase: parseFloat(precioBase),
            precioActual: parseFloat(precioActual),
            linea,
            medidas: {
                anchoPuente: parseFloat(anchoPuente),
                altura: parseFloat(altura),
                ancho: parseFloat(ancho)
            },
            enPromocion,
            fechaCreacion: new Date(fechaCreacion),
            sucursales: sucursales.filter(s => s.stock > 0)
        };

        try {
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/lentes/${lenteId}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(lenteData),
            });

            const responseData = await response.json();

            if (response.ok) {
                clearForm();
                if (onSuccess) {
                    onSuccess(responseData);
                }
                return true;
            } else {
                Alert.alert(
                    'Error al actualizar lente', 
                    responseData.message || 'No se pudo actualizar el lente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Error al actualizar lente:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al conectar con el servidor.',
                [{ text: 'Entendido', style: 'default' }]
            );
            return false;
        } finally {
            setLoading(false);
        }
    };

    // ===========================================
    // RETORNO DEL HOOK
    // ===========================================
    return {
        // Estados del formulario - Información Básica
        nombre,
        setNombre,
        descripcion,
        setDescripcion,
        
        // Estados del formulario - Categorización
        categoriaId,
        setCategoriaId,
        marcaId,
        setMarcaId,
        linea,
        setLinea,
        
        // Estados del formulario - Características Físicas
        material,
        setMaterial,
        color,
        setColor,
        tipoLente,
        setTipoLente,
        
        // Estados del formulario - Medidas del Lente
        anchoPuente,
        setAnchoPuente,
        altura,
        setAltura,
        ancho,
        setAncho,
        
        // Estados del formulario - Información de Precios
        precioBase,
        setPrecioBase,
        precioActual,
        setPrecioActual,
        enPromocion,
        setEnPromocion,
        
        // Estados del formulario - Información Adicional
        fechaCreacion,
        setFechaCreacion,
        
        // Estados del formulario - Sucursales
        sucursales,
        setSucursales,
        updateSucursalStock,
        
        // Estados de datos externos
        categorias,
        marcas,
        sucursalesDisponibles,
        
        // Estados de control
        loading,
        lenteId,
        initialData,
        errors,
        
        // Funciones de inicialización
        loadLenteData,
        loadInitialData,
        
        // Funciones de validación
        validateForm,
        validateField,
        hasChanges,
        
        // Funciones de limpieza
        clearForm,
        
        // Funciones de actualización
        updateLente
    };
};