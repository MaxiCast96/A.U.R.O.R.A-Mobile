import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para gestionar el flujo completo de recuperación de contraseña
 * 
 * Este hook encapsula toda la lógica relacionada con:
 * - Solicitud de código de recuperación (ForgotPassword)
 * - Verificación de código con temporizador (VerifyCode)
 * - Reseteo de contraseña con validaciones (ResetPassword)
 * - Manejo de estados de carga y errores
 * - Validaciones de formulario
 * 
 * @returns {Object} Objeto con estados y funciones para el flujo de recuperación
 */
export const usePasswordRecovery = () => {
    const { API } = useAuth();
    
    // Estados para ForgotPassword
    const [correo, setCorreo] = useState('');
    
    // Estados para VerifyCode
    const [codigo, setCodigo] = useState('');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
    const [canResend, setCanResend] = useState(false);
    
    // Estados para ResetPassword
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Estados generales
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Función para validar el formulario de solicitud de código
     * @param {string} email - Email a validar
     */
    const validateEmailForm = (email = correo) => {
        const newErrors = {};
        if (!email) {
            newErrors.correo = 'El correo es requerido';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.correo = 'El correo no es válido';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Función para validar el código de verificación
     * @param {string} code - Código a validar
     */
    const validateCode = (code = codigo) => {
        const newErrors = {};
        if (!code || code.length !== 6) {
            newErrors.codigo = 'Ingresa el código completo de 6 dígitos';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Función para validar el formulario de nueva contraseña
     * @param {string} newPassword - Nueva contraseña
     * @param {string} confirmPass - Confirmación de contraseña
     */
    const validatePasswordForm = (newPassword = password, confirmPass = confirmPassword) => {
        const newErrors = {};
        
        if (!newPassword) {
            newErrors.password = 'La contraseña es requerida';
        } else if (newPassword.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            newErrors.password = 'Debe contener al menos: 1 mayúscula, 1 minúscula y 1 número';
        }

        if (!confirmPass) {
            newErrors.confirmPassword = 'Confirma tu contraseña';
        } else if (newPassword !== confirmPass) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Función para enviar el código de recuperación al email
     * @param {string} email - Email al que enviar el código
     */
    const sendRecoveryCode = async (email = correo) => {
        if (!validateEmailForm(email)) {
            return false;
        }

        try {
            setIsLoading(true);
            
            const response = await fetch(`${API}/api/empleados/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo: email }),
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, data };
            } else {
                Alert.alert('Error', data.message || 'Error al enviar código de verificación');
                return { success: false, error: data.message };
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Error de conexión. Inténtalo de nuevo.');
            return { success: false, error: 'Error de conexión' };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Función para verificar el código de recuperación
     * @param {string} email - Email del usuario
     * @param {string} code - Código de verificación
     */
    const verifyRecoveryCode = async (email, code = codigo) => {
        if (!validateCode(code)) {
            return false;
        }

        try {
            setIsLoading(true);
            
            const response = await fetch(`${API}/api/empleados/verify-reset-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    correo: email,
                    code: code
                }),
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, data };
            } else {
                setErrors({ codigo: 'Código incorrecto o expirado' });
                Alert.alert('Error', data.message || 'Código incorrecto o expirado');
                return { success: false, error: data.message };
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Error de conexión. Inténtalo de nuevo.');
            return { success: false, error: 'Error de conexión' };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Función para resetear la contraseña
     * @param {string} email - Email del usuario
     * @param {string} code - Código de verificación
     * @param {string} newPassword - Nueva contraseña
     */
    const resetPassword = async (email, code, newPassword = password) => {
        if (!validatePasswordForm(newPassword, confirmPassword)) {
            return false;
        }

        try {
            setIsLoading(true);
            
            const response = await fetch(`${API}/api/empleados/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    correo: email, 
                    code: code,
                    newPassword: newPassword 
                }),
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, data };
            } else {
                Alert.alert('Error', data.message || 'Error al cambiar la contraseña');
                return { success: false, error: data.message };
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Error de conexión. Inténtalo de nuevo.');
            return { success: false, error: 'Error de conexión' };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Función para reenviar el código de verificación
     * @param {string} email - Email al que reenviar el código
     */
    const resendCode = async (email) => {
        try {
            setIsLoading(true);

            const response = await fetch(`${API}/api/empleados/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo: email }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Código Reenviado', 'Se ha enviado un nuevo código a tu correo');
                // Reiniciar el temporizador
                setTimeLeft(300);
                setCanResend(false);
                setCodigo('');
                return { success: true };
            } else {
                Alert.alert('Error', data.message || 'Error al reenviar código');
                return { success: false, error: data.message };
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Error de conexión. Inténtalo de nuevo.');
            return { success: false, error: 'Error de conexión' };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Función para formatear el tiempo restante en MM:SS
     * @param {number} seconds - Segundos a formatear
     */
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    /**
     * Función para manejar el cambio de código
     * Limpia errores automáticamente
     * @param {string} code - Nuevo código
     */
    const handleCodeChange = (code) => {
        setCodigo(code);
        setErrors({});
    };

    /**
     * Función para manejar cuando se completa el código
     * @param {string} code - Código completo
     */
    const handleCodeComplete = (code) => {
        setCodigo(code);
        setErrors({});
    };

    /**
     * Función para limpiar todos los estados
     * Útil al navegar entre pantallas
     */
    const clearStates = () => {
        setCorreo('');
        setCodigo('');
        setPassword('');
        setConfirmPassword('');
        setErrors({});
        setIsLoading(false);
        setTimeLeft(300);
        setCanResend(false);
    };

    /**
     * Función para inicializar con un email prellenado
     * @param {string} email - Email a precargar
     */
    const initializeWithEmail = (email) => {
        setCorreo(email);
        setErrors({});
    };

    /**
     * Efecto para manejar el temporizador del código
     */
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    // Retornar todos los estados y funciones necesarias
    return {
        // Estados de formularios
        correo,
        codigo,
        password,
        confirmPassword,
        
        // Estados de UI
        errors,
        isLoading,
        timeLeft,
        canResend,
        
        // Funciones de cambio de estado
        setCorreo,
        setCodigo,
        setPassword,
        setConfirmPassword,
        handleCodeChange,
        handleCodeComplete,
        
        // Funciones de validación
        validateEmailForm,
        validateCode,
        validatePasswordForm,
        
        // Funciones de API
        sendRecoveryCode,
        verifyRecoveryCode,
        resetPassword,
        resendCode,
        
        // Funciones de utilidad
        formatTime,
        clearStates,
        initializeWithEmail
    };
};