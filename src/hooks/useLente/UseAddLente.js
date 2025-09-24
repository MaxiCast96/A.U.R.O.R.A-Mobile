import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para gestionar la creación de nuevos lentes
 * 
 * Este hook encapsula toda la lógica relacionada con:
 * - Estados del formulario de agregar lente
 * - Validación de campos
 * - Envío de datos al servidor
 * - Limpieza del formulario
 * - Manejo de estados de carga
 * 
 * @returns {Object} Objeto con estados y funciones para agregar lentes
 */
export const useAddLente = () => {
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
    const [errors, setErrors] = useState({});

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
        const newErrors = {};

        Object.keys(fields).forEach(field => {
            const fieldValid = validateField(field, fields[field]);
            if (!fieldValid) {
                isValid = false;
            }
        });

        return isValid;
    };

    // ===========================================
    // FUNCIONES DE DATOS EXTERNOS
    // ===========================================

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
                // Inicializar sucursales con stock 0
                setSucursales(sucursalesData.map(s => ({
                    sucursalId: s._id,
                    nombreSucursal: s.nombre,
                    stock: 0
                })));
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
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
        setErrors({});
    };

    // ===========================================
    // FUNCIONES DE CREACIÓN
    // ===========================================

    /**
     * Crear un nuevo lente en el servidor
     * @param {Function} onSuccess - Callback ejecutado cuando se crea exitosamente
     */
    const createLente = async (onSuccess) => {
        if (!validateForm()) return false;

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
            imagenes: [],
            enPromocion,
            fechaCreacion: new Date(fechaCreacion),
            sucursales: sucursales.filter(s => s.stock > 0)
        };

        try {
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/lentes', {
                method: 'POST',
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
                    'Error al crear lente', 
                    responseData.message || 'No se pudo crear el lente.',
                    [{ text: 'Entendido', style: 'default' }]
                );
                return false;
            }
        } catch (error) {
            console.error('Error al crear lente:', error);
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
        errors,
        
        // Funciones de validación
        validateForm,
        validateField,
        
        // Funciones de datos externos
        loadInitialData,
        
        // Funciones de limpieza
        clearForm,
        
        // Funciones de creación
        createLente
    };
};