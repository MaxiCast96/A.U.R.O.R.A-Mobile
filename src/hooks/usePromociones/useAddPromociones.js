// hooks/promociones/useAddPromocion.js
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const useAddPromocion = () => {
    const { getAuthHeaders } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addPromocion = async (promocionData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('https://aurora-production-7e57.up.railway.app/api/promociones', {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(promocionData),
            });

            if (!response.ok) {
                throw new Error('Error al crear la promoción');
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
        addPromocion,
        loading,
        error
    };
};
