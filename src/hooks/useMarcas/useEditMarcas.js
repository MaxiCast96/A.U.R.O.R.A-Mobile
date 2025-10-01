// hooks/marcas/useEditMarcas.js
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Importar useAuth

export const useEditMarca = () => {
    const { getAuthHeaders } = useAuth(); // Usar el hook useAuth aquí
    
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

    // Función auxiliar para validar IDs
    const isValidMongoId = (id) => {
        if (!id) return false;
        // Verificar que no sea un ID temporal
        if (typeof id === 'string' && id.startsWith('temp_')) {
            return false;
        }
        // Verificar formato básico de ObjectId (24 caracteres hex)
        if (typeof id === 'string' && id.length === 24 && /^[0-9a-fA-F]+$/.test(id)) {
            return true;
        }
        return false;
    };

    /**
     * Cargar datos de la marca en el formulario
     */
    const loadMarcaData = (marca) => {
        if (!marca) return;
        
        // Validar que el ID no sea temporal
        if (!isValidMongoId(marca._id)) {
            Alert.alert('Error', 'No se puede editar una marca temporal');
            return;
        }
        
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
     * Función para debuggear FormData
     */
    const debugFormData = (formData) => {
        console.log('FormData contents:');
        for (let [key, value] of formData._parts) {
            console.log(`${key}:`, value);
        }
    };

    /**
     * Actualizar marca
     */
    const updateMarca = async () => {
        // Validar que el ID no sea temporal
        if (!marcaId || !isValidMongoId(marcaId)) {
            Alert.alert('Error', 'No se puede actualizar una marca temporal');
            return null;
        }

        if (!validateForm()) return null;

        if (!hasChanges()) {
            Alert.alert('Sin cambios', 'No se han detectado cambios en los datos de la marca');
            return null;
        }

        setLoading(true);
        
        try {
            const formData = new FormData();
            formData.append('nombre', nombre.trim());
            formData.append('descripcion', descripcion.trim());
            formData.append('paisOrigen', paisOrigen.trim());
            
            lineas.forEach(linea => {
                formData.append('lineas', linea);
            });
            
            // Si hay nueva imagen, enviarla
            if (logo && logo !== initialData.logo) {
                // Verificar que la imagen existe
                if (logo.startsWith('file://') || logo.startsWith('http')) {
                    formData.append('logo', {
                        uri: logo,
                        type: 'image/jpeg',
                        name: 'logo.jpg'
                    });
                }
            } else if (logo && typeof logo === 'string') {
                // Si es la misma imagen, enviar la URL como string
                formData.append('logo', logo);
            }

            console.log('URL de actualización:', `https://aurora-production-7e57.up.railway.app/api/marcas/${marcaId}`);
            console.log('Método: PUT');
            console.log('Datos enviados:', {
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                paisOrigen: paisOrigen.trim(),
                lineas: lineas,
                tieneLogo: !!logo
            });

            // Debug FormData
            debugFormData(formData);

            const headers = getAuthHeaders();
            console.log('Headers de autenticación:', Object.keys(headers));

            // IMPORTANTE: Para FormData, NO incluir Content-Type, el navegador lo establecerá automáticamente con el boundary
            const fetchHeaders = {
                'Authorization': headers['Authorization'],
                // Eliminar 'Content-Type' para FormData
            };

            // Hacer la petición con timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout

            const response = await fetch(`https://aurora-production-7e57.up.railway.app/api/marcas/${marcaId}`, {
                method: 'PUT',
                headers: fetchHeaders,
                body: formData,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            let responseData;
            try {
                responseData = await response.json();
                console.log('Respuesta del servidor:', responseData);
            } catch (jsonError) {
                console.error('Error parseando JSON:', jsonError);
                throw new Error('Respuesta inválida del servidor');
            }

            if (response.ok) {
                // Asegurarnos de que la respuesta incluya el _id
                const updatedMarca = {
                    ...responseData,
                    _id: marcaId // Siempre mantener el ID original
                };
                console.log('Marca actualizada devuelta:', updatedMarca);
                clearForm();
                return updatedMarca;
            } else {
                const errorMessage = responseData.message || `Error ${response.status} al actualizar marca`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error updating marca:', error);
            
            // Mensajes de error más específicos
            let errorMessage = 'Error al actualizar la marca';
            if (error.name === 'AbortError') {
                errorMessage = 'La solicitud tardó demasiado tiempo. Verifica tu conexión a internet.';
            } else if (error.message.includes('Network request failed')) {
                errorMessage = 'Error de conexión. Verifica tu internet y que el servidor esté funcionando.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
            } else {
                errorMessage = error.message;
            }
            
            Alert.alert('Error', errorMessage);
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
        isValidMongoId,
    };
};