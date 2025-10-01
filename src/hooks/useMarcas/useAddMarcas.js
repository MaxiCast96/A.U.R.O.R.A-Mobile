// hooks/marcas/useAddMarcas.js
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const useAddMarca = () => {
    const { getAuthHeaders } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addMarca = async (marcaData) => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            
            // Agregar campos de texto
            formData.append('nombre', marcaData.nombre);
            formData.append('descripcion', marcaData.descripcion);
            formData.append('paisOrigen', marcaData.paisOrigen);
            
            // Agregar líneas como array
            marcaData.lineas.forEach(linea => {
                formData.append('lineas', linea);
            });
            
            // Agregar imagen si existe
            if (marcaData.logo) {
                formData.append('logo', {
                    uri: marcaData.logo,
                    type: 'image/jpeg',
                    name: 'logo.jpg'
                });
            }

            const response = await fetch('https://aurora-production-7e57.up.railway.app/api/marcas', {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear la marca');
            }

            const data = await response.json();
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        addMarca,
        loading,
        error
    };
};