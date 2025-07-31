import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigation';
import SplashScreen from '../screens/SplashScreen';
import Login from '../screens/Login';
import Register from '../screens/Register';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();

/**
 * Componente de carga mientras se verifica la autenticación
 */
const LoadingScreen = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#009BBF" />
    </View>
);

/**
 * Navegación principal de la aplicación
 * 
 * Esta función maneja toda la estructura de navegación de la app.
 * Usamos un Stack Navigator para poder tener una splash screen que luego
 * navegue al login o directamente al main según el estado de autenticación.
 * 
 * Flujo de navegación:
 * 1. Splash Screen (pantalla de carga con logo y animación)
 * 2. Login (si no está autenticado) o Main (si está autenticado)
 * 3. Register (pantalla de registro)
 * 4. Main (tab navigator con las pantallas principales)
 */
export default function Navigation() {
    const { isAuthenticated, isLoading } = useAuth();

    // Mostrar pantalla de carga mientras se verifica la autenticación
    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                    headerShown: false,
                }}
            >
                {/* Pantalla de carga inicial */}
                <Stack.Screen name="Splash" component={SplashScreen} />
                
                {/* Pantalla de login */}
                <Stack.Screen name="Login" component={Login} />
                
                {/* Pantalla de registro */}
                <Stack.Screen name="Register" component={Register} />
                
                {/* Navegación principal con tabs */}
                <Stack.Screen name="Main" component={TabNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}