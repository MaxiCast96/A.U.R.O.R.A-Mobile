import { useState, useEffect } from 'react';

/**
 * Hook personalizado para manejar peticiones HTTP
 * 
 * Este hook simplifica el manejo de peticiones HTTP proporcionando
 * estados de carga, error y datos de manera consistente.
 * 
 * @param {string} url - URL de la API
 * @param {object} options - Opciones de la petición (método, headers, body, etc.)
 * @param {boolean} immediate - Si se debe ejecutar la petición inmediatamente
 * @returns {object} - Objeto con data, loading, error y refetch
 */
const useFetch = (url, options = {}, immediate = true) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Función para ejecutar la petición HTTP
     */
    const fetchData = async (customUrl = url, customOptions = options) => {
        try {
            setLoading(true);
            setError(null);

            // Configuración por defecto
            const defaultOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                ...customOptions,
            };

            const response = await fetch(customUrl, defaultOptions);

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setData(result);
            
        } catch (err) {
            setError(err.message || 'Error en la petición');
            console.error('Error en useFetch:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Función para hacer POST requests
     */
    const post = async (body) => {
        return fetchData(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });
    };

    /**
     * Función para hacer PUT requests
     */
    const put = async (body) => {
        return fetchData(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        });
    };

    /**
     * Función para hacer DELETE requests
     */
    const del = async () => {
        return fetchData(url, {
            ...options,
            method: 'DELETE',
        });
    };

    /**
     * Función para hacer PATCH requests
     */
    const patch = async (body) => {
        return fetchData(url, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    };

    // Ejecutar la petición inmediatamente si immediate es true
    useEffect(() => {
        if (immediate && url) {
            fetchData();
        }
    }, [url, immediate]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        post,
        put,
        del,
        patch,
    };
};

export default useFetch; 