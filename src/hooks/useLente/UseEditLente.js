import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export const useEditLente = () => {
    const { getAuthHeaders } = useAuth();

    // Estados del formulario
    const [nombre, setNombre] = useState('');
    const [marca, setMarca] = useState('');
    const [tipo, setTipo] = useState('');
    const [precio, setPrecio] = useState('');
    const [stock, setStock] = useState('');
    const [imagen, setImagen] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [lenteId, setLenteId] = useState(null);

    // Cargar datos para edición
    const loadLenteData = (lente) => {
        setLenteId(lente._id);
        setNombre(lente.nombre || '');
        setMarca(lente.marca || '');
        setTipo(lente.tipo || '');
        setPrecio(lente.precio?.toString() || '');
        setStock(lente.stock?.toString() || '');
        setImagen(lente.imagen || '');
        setErrors({});
    };

    // Validación simple
    const validateForm = () => {
        const newErrors = {};
        if (!nombre.trim()) newErrors.nombre = 'El nombre es requerido';
        if (!marca.trim()) newErrors.marca = 'La marca es requerida';
        if (!tipo.trim()) newErrors.tipo = 'El tipo es requerido';
        if (!precio || isNaN(parseFloat(precio))) newErrors.precio = 'Precio inválido';
        if (!stock || isNaN(parseInt(stock))) newErrors.stock = 'Stock inválido';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Actualizar lente
    const updateLente = async (onSuccess) => {
        if (!lenteId) return false;
        if (!validateForm()) return false;
        setLoading(true);
        try {
            const response = await fetch(`https://a-u-r-o-r-a.onrender.com/api/lentes/${lenteId}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre,
                    marca,
                    tipo,
                    precio: parseFloat(precio),
                    stock: parseInt(stock),
                    imagen
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setErrors({});
                if (onSuccess) onSuccess(data);
                Alert.alert('Lente actualizado', 'El lente ha sido actualizado exitosamente.');
                return true;
            } else {
                Alert.alert('Error', data.message || 'No se pudo actualizar el lente.');
                return false;
            }
        } catch (error) {
            Alert.alert('Error de red', 'Hubo un problema al conectar con el servidor.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        nombre, setNombre,
        marca, setMarca,
        tipo, setTipo,
        precio, setPrecio,
        stock, setStock,
        imagen, setImagen,
        loading, setLoading,
        errors, setErrors,
        lenteId,
        loadLenteData,
        validateForm,
        updateLente
    };
};