// hooks/marcas/useEditMarcas.js
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export const useEditMarca = () => {
    const { getAuthHeaders } = useAuth();
    
    // Estados del formulario
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [paisOrigen, setPaisOrigen] = useState('');
    const [lineas, setLineas] = useState([]);
    const [logo, setLogo] = useState(null);
    
    // Estados de control
    const [loading, setLoading] = useState(false);
    const [marcaId, setMarcaId] = useState(null);
    const [initialData, setInitialData] = useState(null);
    const [errors, setErrors] = useState({});

    /**
     * Cargar datos de la marca en el formulario
     */
    const loadMarcaData = (marca) => {
        if (!marca) return;
        
        setMarcaId(marca._id);
        setNombre(marca.nombre || '');
        setDescripcion(marca.descripcion || '');
        setPaisOrigen(marca.paisOrigen || '');
        setLineas(marca.lineas || []);
        setLogo(marca.logo || null);
        setErrors({});
        
        setInitialData(marca);
    };

    /**
     * Limpiar formulario
     */
    const clearForm = () => {
        setNombre('');
        setDescripcion('');
        setPaisOrigen('');
        setLineas([]);
        setLogo(null);
        setMarcaId(null);
        setInitialData(null);
        setErrors({});
    };

    /**
     * Validar campo individual
     */
    const validateField = (field, value) => {
        let error = null;
        
        switch (field) {
            case 'nombre':
                if (!value?.trim()) error = 'El nombre es obligatorio';
                break;
            case 'descripcion':
                if (!value?.trim()) error = 'La descripción es obligatoria';
                break;
            case 'paisOrigen':
                if (!value?.trim()) error = 'El país de origen es obligatorio';
                break;
            case 'lineas':
                if (!value || value.length === 0) error = 'Debe seleccionar al menos una línea';
                break;
        }
        
        setErrors(prev => ({ ...prev, [field]: error }));
        return !error;
    };

    /**
     * Validar formulario completo
     */
    const validateForm = () => {
        const fieldsToValidate = {
            nombre,
            descripcion,
            paisOrigen,
            lineas,
        };

        let isValid = true;

        Object.keys(fieldsToValidate).forEach(field => {
            if (!validateField(field, fieldsToValidate[field])) {
                isValid = false;
            }
        });

        return isValid;
    };

    /**
     * Verificar si hay cambios
     */
    const hasChanges = () => {
        if (!initialData) return false;
        
        const currentData = {
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            paisOrigen: paisOrigen.trim(),
            lineas: lineas.sort(),
            logo: logo
        };
        
        const initialDataSorted = {
            ...initialData,
            lineas: initialData.lineas?.sort() || []
        };
        
        return JSON.stringify(currentData) !== JSON.stringify(initialDataSorted);
    };

    /**
     * Actualizar marca
     */
    const updateMarca = async () => {
        if (!marcaId) {
            Alert.alert('Error', 'No se puede actualizar la marca');
            return null;
        }

        if (!validateForm()) return null;

        if (!hasChanges()) {
            Alert.alert('Sin cambios', 'No se han detectado cambios en los datos de la marca');
            return null;
        }

        setLoading(true);
        
        const formData = new FormData();
        formData.append('nombre', nombre.trim());
        formData.append('descripcion', descripcion.trim());
        formData.append('paisOrigen', paisOrigen.trim());
        
        lineas.forEach(linea => {
            formData.append('lineas', linea);
        });
        
        // Si hay nueva imagen, enviarla
        if (logo && logo !== initialData.logo) {
            formData.append('logo', {
                uri: logo,
                type: 'image/jpeg',
                name: 'logo.jpg'
            });
        } else if (logo) {
            // Si es la misma imagen, enviar la URL
            formData.append('logo', logo);
        }

        try {
            const response = await fetch(`https://aurora-production-7e57.up.railway.app/api/marcas/${marcaId}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const responseData = await response.json();

            if (response.ok) {
                clearForm();
                return responseData;
            } else {
                throw new Error(responseData.message || 'Error al actualizar marca');
            }
        } catch (error) {
            console.error('Error updating marca:', error);
            Alert.alert('Error', error.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Manejar selección de líneas
     */
    const toggleLinea = (linea) => {
        if (lineas.includes(linea)) {
            setLineas(lineas.filter(l => l !== linea));
        } else {
            setLineas([...lineas, linea]);
        }
    };

    return {
        // Estados del formulario
        nombre,
        setNombre,
        descripcion,
        setDescripcion,
        paisOrigen,
        setPaisOrigen,
        lineas,
        setLineas,
        logo,
        setLogo,
        
        // Estados de control
        loading,
        marcaId,
        initialData,
        errors,
        
        // Funciones
        loadMarcaData,
        clearForm,
        validateField,
        validateForm,
        hasChanges,
        updateMarca,
        toggleLinea,
    };
};