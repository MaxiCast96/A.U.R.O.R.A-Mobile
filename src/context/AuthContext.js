import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
 */
const AuthContext = createContext();

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
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

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
            const storedToken = await AsyncStorage.getItem('authToken');
            const storedUser = await AsyncStorage.getItem('userData');
            
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Error al cargar token:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Función de login
     */
    const login = async (email, password) => {
        try {
            setIsLoading(true);
            
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo: email, password }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                // Guardar token y datos del usuario
                await AsyncStorage.setItem('authToken', data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(data.user));
                
                setToken(data.token);
                setUser(data.user);
                setIsAuthenticated(true);
                
                return { success: true, message: 'Login exitoso' };
            } else {
                return { 
                    success: false, 
                    message: data.message || 'Credenciales incorrectas' 
                };
            }
        } catch (error) {
            console.error('Error en login:', error);
            return { 
                success: false, 
                message: 'Error de conexión. Inténtalo de nuevo.' 
            };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Función de logout
     */
    const logout = async () => {
        try {
            // Limpiar datos almacenados
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userData');
            
            // Limpiar estado
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            
            return { success: true, message: 'Logout exitoso' };
        } catch (error) {
            console.error('Error en logout:', error);
            return { 
                success: false, 
                message: 'Error al cerrar sesión' 
            };
        }
    };

    /**
     * Verificar si el token es válido
     */
    const verifyToken = async () => {
        if (!token) return false;
        
        try {
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            
            return response.ok;
        } catch (error) {
            console.error('Error al verificar token:', error);
            return false;
        }
    };

    /**
     * Obtener headers con token para peticiones autenticadas
     */
    const getAuthHeaders = () => {
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    };

    const value = {
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        logout,
        verifyToken,
        getAuthHeaders,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 