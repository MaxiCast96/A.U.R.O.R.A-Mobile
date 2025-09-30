// hooks/promociones/usePromocionesDetail.js (mejorado)
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const usePromocionDetail = () => {
    const { getAuthHeaders } = useAuth();
    const [loading, setLoading] = useState(false);

    /**
     * Eliminar promoción
     */
    const deletePromocion = async (id) => {
        // Validar ID antes de hacer la petición
        if (!id || id === 'undefined') {
            throw new Error('ID de promoción no válido');
        }

        setLoading(true);
        try {
            const response = await fetch(`https://aurora-production-7e57.up.railway.app/api/promociones/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar promoción');
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting promocion:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Cambiar estado de la promoción
     */
    const updatePromocionEstado = async (id, activo) => {
        // Validar ID antes de hacer la petición
        if (!id || id === 'undefined') {
            throw new Error('ID de promoción no válido');
        }

        setLoading(true);
        try {
            const response = await fetch(`https://aurora-production-7e57.up.railway.app/api/promociones/${id}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ activo }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar estado');
            }
            
            return true;
        } catch (error) {
            console.error('Error updating estado:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        deletePromocion,
        updatePromocionEstado,
    };
};