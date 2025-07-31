import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

/**
 * Hook personalizado para manejar notificaciones
 * 
 * Este hook proporciona funciones para mostrar diferentes tipos
 * de notificaciones y alertas de manera consistente.
 * 
 * @returns {object} - Objeto con funciones de notificación
 */
const useNotification = () => {
    const [isVisible, setIsVisible] = useState(false);

    /**
     * Mostrar alerta de éxito
     */
    const showSuccess = useCallback((title, message, onPress) => {
        Alert.alert(
            title || 'Éxito',
            message,
            [
                {
                    text: 'OK',
                    onPress: onPress,
                },
            ]
        );
    }, []);

    /**
     * Mostrar alerta de error
     */
    const showError = useCallback((title, message, onPress) => {
        Alert.alert(
            title || 'Error',
            message,
            [
                {
                    text: 'OK',
                    onPress: onPress,
                },
            ]
        );
    }, []);

    /**
     * Mostrar alerta de confirmación
     */
    const showConfirmation = useCallback((title, message, onConfirm, onCancel) => {
        Alert.alert(
            title || 'Confirmar',
            message,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                    onPress: onCancel,
                },
                {
                    text: 'Confirmar',
                    style: 'destructive',
                    onPress: onConfirm,
                },
            ]
        );
    }, []);

    /**
     * Mostrar alerta con opciones
     */
    const showOptions = useCallback((title, message, options) => {
        Alert.alert(
            title || 'Opciones',
            message,
            options,
            { cancelable: true }
        );
    }, []);

    /**
     * Mostrar alerta de información
     */
    const showInfo = useCallback((title, message, onPress) => {
        Alert.alert(
            title || 'Información',
            message,
            [
                {
                    text: 'Entendido',
                    onPress: onPress,
                },
            ]
        );
    }, []);

    /**
     * Mostrar alerta de advertencia
     */
    const showWarning = useCallback((title, message, onPress) => {
        Alert.alert(
            title || 'Advertencia',
            message,
            [
                {
                    text: 'OK',
                    onPress: onPress,
                },
            ]
        );
    }, []);

    return {
        isVisible,
        setIsVisible,
        showSuccess,
        showError,
        showConfirmation,
        showOptions,
        showInfo,
        showWarning,
    };
};

export default useNotification; 