import { useState } from 'react';

export const useAddCategoria = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addCategoria = async (categoriaData) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('https://aurora-production-7e57.up.railway.app/api/categoria', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoriaData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear categoría');
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
        addCategoria,
        loading,
        error
    };
};