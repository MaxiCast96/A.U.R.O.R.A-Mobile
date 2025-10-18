import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastAndroid } from 'react-native';

/**
 * Contexto de Autenticación
 * 
 * Este contexto maneja el estado global de autenticación de la aplicación,
 * incluyendo el token, información del usuario y funciones de login/logout.
 * 
 * Funcionalidades:
 * - Almacenamiento persistente del token
 * - Información del usuario logueado
 * - Funciones de login y logout
 * - Estado de carga de autenticación
 * - Verificación de token
 */
const AuthContext = createContext(null);

/**
 * Hook personalizado para usar el contexto de autenticación
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

/**
 * Proveedor del contexto de autenticación
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // URL base de la API
    const API_URL = "https://aurora-production-6d8b.up.railway.app";

    /**
     * Cargar token guardado al iniciar la app
     */
    useEffect(() => {
        loadStoredToken();
    }, []);

    /**
     * Cargar el token almacenado en AsyncStorage
     */
    const loadStoredToken = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            const storedUser = await AsyncStorage.getItem('userData');
            
            console.log('Token almacenado:', storedToken ? 'Existe' : 'No existe');
            console.log('Usuario almacenado:', storedUser ? 'Existe' : 'No existe');
            
            if (storedToken) {
                setAuthToken(storedToken);
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
                setIsAuthenticated(true);
                console.log('Autenticación restaurada desde storage');
            } else {
                console.log('No hay sesión previa guardada');
            }
        } catch (error) {
            console.error('Error al cargar token:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Limpiar la sesión
     */
    const clearSession = async () => {
        try {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("userData");
            setUser(null);
            setAuthToken(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Error al limpiar sesión:', error);
        }
    };

    /**
     * Función de login
     */
    const login = async (correo, password) => {
    try {
        setIsLoading(true);

        console.log('Intentando login con:', correo);

        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ correo: correo, password }),
            credentials: 'include',
        });

        console.log('Response status:', response.status);

        let data = {};
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // Si no es JSON, evita el error y muestra mensaje
            ToastAndroid.show("Respuesta inesperada del servidor.", ToastAndroid.SHORT);
            return false;
        }
        console.log('Response data:', data);

        if (response.ok && data.token) {
            await AsyncStorage.setItem('token', data.token);
            await AsyncStorage.setItem('userData', JSON.stringify(data.user));
            setAuthToken(data.token);
            setUser(data.user);
            setIsAuthenticated(true);
            console.log('Login exitoso, token guardado');
            ToastAndroid.show("Inicio de sesión exitoso", ToastAndroid.SHORT);
            return true;
        } else {
            console.log('Login fallido:', data.message);
            ToastAndroid.show(data.message || "Credenciales incorrectas", ToastAndroid.SHORT);
            return false;
        }
    } catch (error) {
        console.error('Error en login:', error);
        ToastAndroid.show(error.message || "Error de conexión con el servidor", ToastAndroid.SHORT);
        return false;
    } finally {
        setIsLoading(false);
    }
};

    /**
     * Función de logout
     */
    const logout = useCallback(async () => {
        try {
            console.log('Cerrando sesión...');
            
            // Intentar cerrar sesión en el servidor
            await fetch(`${API_URL}/api/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Error during logout:", error);
        } finally {
            await clearSession();
            console.log('Sesión cerrada correctamente');
            ToastAndroid.show("Sesión cerrada correctamente", ToastAndroid.SHORT);
        }
    }, [API_URL]);

    /**
     * Verificar si el token es válido
     */
    const verifyToken = async () => {
        if (!authToken) {
            console.log('No hay token para verificar');
            return false;
        }
        
        try {
            console.log('Verificando token...');
            
            const response = await fetch(`${API_URL}/api/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            
            const isValid = response.ok;
            console.log('Token válido:', isValid);
            
            if (!isValid) {
                // Si el token no es válido, limpiar la sesión
                await clearSession();
            }
            
            return isValid;
        } catch (error) {
            console.error('Error al verificar token:', error);
            return false;
        }
    };

    /**
     * Obtener headers con token para peticiones autenticadas
     */
    const getAuthHeaders = () => {
        if (!authToken) {
            console.warn('No hay token disponible para headers de autenticación');
            return {
                'Content-Type': 'application/json',
            };
        }
        
        return {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        };
    };

    /**
     * Actualizar información del usuario
     */
    const updateUser = async (userData) => {
        try {
            setUser(userData);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            console.log('Información del usuario actualizada');
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
        }
    };

    const value = {
        user,
        authToken,
        token: authToken, // Alias para compatibilidad
        isLoading,
        loading: isLoading, // Alias para compatibilidad
        isAuthenticated,
        login,
        logout,
        verifyToken,
        getAuthHeaders,
        updateUser,
        API: API_URL,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext };