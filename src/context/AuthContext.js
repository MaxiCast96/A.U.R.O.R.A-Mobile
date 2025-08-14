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
            
            console.log('Token almacenado:', storedToken ? 'Existe' : 'No existe');
            console.log('Usuario almacenado:', storedUser ? 'Existe' : 'No existe');
            
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
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
     * Función de login
     */
    const login = async (email, password) => {
        try {
            setIsLoading(true);
            
            console.log('Intentando login con:', email);
            
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo: email, password }),
            });

            console.log('Response status:', response.status);
            
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok && data.token) {
                // Guardar token y datos del usuario
                await AsyncStorage.setItem('authToken', data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(data.user));
                
                setToken(data.token);
                setUser(data.user);
                setIsAuthenticated(true);
                
                console.log('Login exitoso, token guardado');
                
                return { success: true, message: 'Login exitoso' };
            } else {
                console.log('Login fallido:', data.message);
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
            console.log('Cerrando sesión...');
            
            // Limpiar datos almacenados
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userData');
            
            // Limpiar estado
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            
            console.log('Sesión cerrada correctamente');
            
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
        if (!token) {
            console.log('No hay token para verificar');
            return false;
        }
        
        try {
            console.log('Verificando token...');
            
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            
            const isValid = response.ok;
            console.log('Token válido:', isValid);
            
            if (!isValid) {
                // Si el token no es válido, limpiar la sesión
                await logout();
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
        if (!token) {
            console.warn('No hay token disponible para headers de autenticación');
            return {
                'Content-Type': 'application/json',
            };
        }
        
        return {
            'Authorization': `Bearer ${token}`,
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
        token,
        isLoading,
        isAuthenticated,
        login,
        logout,
        verifyToken,
        getAuthHeaders,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};