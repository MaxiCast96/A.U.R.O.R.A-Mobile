// hooks/marcas/useMarcasDetail.js
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const useMarcaDetail = () => {
    const { getAuthHeaders } = useAuth();
    const [loading, setLoading] = useState(false);

    /**
     * Eliminar marca
     */
    const deleteMarca = async (id) => {
        if (!id || id === 'undefined') {
            throw new Error('ID de marca no válido');
        }

        setLoading(true);
        try {
            const response = await fetch(`https://aurora-production-7e57.up.railway.app/api/marcas/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar marca');
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting marca:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        deleteMarca,
    };
};