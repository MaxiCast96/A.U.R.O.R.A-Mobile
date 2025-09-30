import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

export const useEditCategoria = () => {
    // Estados del formulario
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [icono, setIcono] = useState('');
    
    // Estados de control
    const [loading, setLoading] = useState(false);
    const [categoriaId, setCategoriaId] = useState(null);
    const [initialData, setInitialData] = useState(null);
    const [errors, setErrors] = useState({});

    /**
     * Cargar datos de la categoría en el formulario
     */
    const loadCategoriaData = (categoria) => {
        if (!categoria) return;
        
        setCategoriaId(categoria._id);
        setNombre(categoria.nombre || '');
        setDescripcion(categoria.descripcion || '');
        setIcono(categoria.icono || '');
        setErrors({});
        
        setInitialData(categoria);
    };

    /**
     * Limpiar formulario
     */
    const clearForm = () => {
        setNombre('');
        setDescripcion('');
        setIcono('');
        setCategoriaId(null);
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
            icono: icono || ''
        };
        
        // Comparar datos
        return JSON.stringify(currentData) !== JSON.stringify({
            nombre: initialData.nombre,
            descripcion: initialData.descripcion,
            icono: initialData.icono || ''
        });
    };

    /**
     * Actualizar categoría
     */
    const updateCategoria = async () => {
        if (!categoriaId) {
            Alert.alert('Error', 'No se puede actualizar la categoría');
            return null;
        }

        if (!validateForm()) return null;

        if (!hasChanges()) {
            Alert.alert('Sin cambios', 'No se han detectado cambios en los datos de la categoría');
            return null;
        }

        setLoading(true);
        
        const categoriaData = {
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            icono: icono || ''
        };

        try {
            const response = await fetch(`https://aurora-production-7e57.up.railway.app/api/categoria/${categoriaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoriaData),
            });

            const responseData = await response.json();

            if (response.ok) {
                clearForm();
                return responseData;
            } else {
                throw new Error(responseData.message || 'Error al actualizar categoría');
            }
        } catch (error) {
            console.error('Error updating categoria:', error);
            Alert.alert('Error', error.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        // Estados del formulario
        nombre,
        setNombre,
        descripcion,
        setDescripcion,
        icono,
        setIcono,
        
        // Estados de control
        loading,
        categoriaId,
        initialData,
        errors,
        
        // Funciones
        loadCategoriaData,
        clearForm,
        validateField,
        validateForm,
        hasChanges,
        updateCategoria,
    };
};