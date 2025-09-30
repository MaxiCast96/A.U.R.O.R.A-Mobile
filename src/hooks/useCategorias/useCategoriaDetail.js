import { useState } from 'react';

export const useCategoriaDetail = () => {
    const [loading, setLoading] = useState(false);

    /**
     * Eliminar categoría
     */
    const deleteCategoria = async (id) => {
        setLoading(true);
        try {
            const response = await fetch(`https://aurora-production-7e57.up.railway.app/api/categoria/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar categoría');
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting categoria:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        deleteCategoria,
    };
};