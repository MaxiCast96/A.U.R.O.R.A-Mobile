import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import Citas from '../screens/Citas';
import Menu from '../screens/Menu'; 
import FloatingTabBar from '../components/FloatingTabBar';

const Tab = createBottomTabNavigator();

/**
 * Navegador de tabs principal
 * 
 * Aquí configuramos las pantallas principales de la app:
 * - Home: Pantalla de inicio
 * - Menu: Pantalla de operaciones y menú principal
 * - Citas: Gestión de citas médicas
 * - More: Opciones adicionales
 * 
 * Usamos un tab bar personalizado (FloatingTabBar) en lugar del
 * tab bar por defecto para tener un diseño más moderno y flotante.
 * 
 * También configuramos transiciones suaves entre pantallas para
 * una mejor experiencia de usuario.
 */
const TabNavigator = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false, // No mostramos headers en las pantallas
            // Configuración para transiciones suaves
            animation: 'slide_from_right', // Animación de deslizamiento
            animationDuration: 300, // Duración de la animación en ms
            // Configuración adicional para transiciones más suaves
            gestureEnabled: true, // Habilitar gestos
            gestureDirection: 'horizontal', // Dirección del gesto
        }}
        // Usamos nuestro tab bar personalizado en lugar del por defecto
        tabBar={props => <FloatingTabBar {...props} />}
    >
        {/* Pantalla de inicio */}
        <Tab.Screen 
            name="Home" 
            component={Home} 
            options={{ 
                title: 'Inicio',
                tabBarLabel: 'Inicio', // Texto que aparece en el tab
                // Configuración específica para esta pantalla
                animation: 'slide_from_right',
            }} 
        />

        {/* Pantalla de menú principal - NUEVA */}
        <Tab.Screen 
            name="More" 
            component={Menu} 
            options={{ 
                title: 'Operaciones',
                tabBarLabel: 'Menú',
                // Configuración específica para esta pantalla
                animation: 'slide_from_right',
            }} 
        />
        
        {/* Pantalla de citas */}
        <Tab.Screen 
            name="Citas" 
            component={Citas} 
            options={{ 
                title: 'Citas',
                tabBarLabel: 'Citas',
                // Configuración específica para esta pantalla
                animation: 'slide_from_right',
            }} 
        />

       
    </Tab.Navigator>
);

export default TabNavigator;