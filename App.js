import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import Navigation from './src/navigation/Navigation';

/**
 * Componente principal de la aplicación
 * 
 * Este es el punto de entrada de la aplicación móvil. Aquí configuramos
 * los providers globales y la navegación principal.
 * 
 * Estructura:
 * - AuthProvider: Maneja el estado global de autenticación
 * - Navigation: Maneja toda la navegación de la app
 */
export default function App() {
    return (
        <AuthProvider>
            <Navigation />
        </AuthProvider>
    );
}