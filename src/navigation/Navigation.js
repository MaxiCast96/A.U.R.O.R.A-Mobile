import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigation';
import Profile from '../screens/Profile';
import SplashScreen from '../screens/SplashScreen';
import Login from '../screens/Login';
import Welcome from '../screens/Welcome';
import Menu from '../screens/Menu';
import Clientes from '../screens/Clientes';
import Empleados from '../screens/Empleados';
import Lentes from '../screens/Lentes';
import Accesorios from '../screens/Accesorios';
import Categorias from '../screens/Categoria';
import Personalizados from '../screens/Personalizados'; // Nueva importación
import ForgotPassword from '../screens/ForgotPassword';
import VerifyCode from '../screens/VerifyCode';
import ResetPassword from '../screens/ResetPassword';
import PasswordSuccess from '../screens/PasswordSucces';
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
 * 3. Main (tab navigator con las pantallas principales)
 * 4. Menu (pantalla de operaciones - accesible desde tabs y directamente)
 * 5. Pantallas de gestión (Clientes, Empleados, Lentes, Accesorios, Personalizados, etc.)
 * 6. Flujo de recuperación de contraseña (ForgotPassword -> VerifyCode -> ResetPassword -> PasswordSuccess)
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

                {/* Pantalla de Bienvenida */}
                <Stack.Screen name="Welcome" component={Welcome} />

                {/* Pantalla de login */}
                <Stack.Screen name="Login" component={Login} />

                {/* ===== PANTALLAS DE RECUPERACIÓN DE CONTRASEÑA ===== */}
                <Stack.Screen
                    name="ForgotPassword"
                    component={ForgotPassword}
                />
                <Stack.Screen
                    name="VerifyCode"
                    component={VerifyCode}
                />
                <Stack.Screen
                    name="ResetPassword"
                    component={ResetPassword}
                />
                <Stack.Screen
                    name="PasswordSuccess"
                    component={PasswordSuccess}
                />

                {/* Navegación principal con tabs */}
                <Stack.Screen name="Main" component={TabNavigator} />

                {/* ===== PANTALLAS DE PERFIL ===== */}
                <Stack.Screen name="Profile" component={Profile} />

                {/* ===== PANTALLAS DE GESTIÓN ===== */}
                {/* Navegación de Clientes */}
                <Stack.Screen name="Clientes" component={Clientes} />

                {/* Navegación de Empleados */}
                <Stack.Screen name="Empleados" component={Empleados} />

                {/* Navegación de Lentes */}
                <Stack.Screen name="Lentes" component={Lentes} />

                {/* Navegación de Accesorios */}
                <Stack.Screen name="Accesorios" component={Accesorios} />

                {/* Navegación de Categorías */}
                <Stack.Screen name="Categorias" component={Categorias} />

                {/* Navegación de Productos Personalizados - NUEVA PANTALLA */}
                <Stack.Screen name="Personalizados" component={Personalizados} />

                {/* Pantalla de menú - acceso directo para navegación desde otras pantallas */}
                <Stack.Screen
                    name="MenuDirect"
                    component={Menu}
                    options={{
                        headerShown: true,
                        title: 'Operaciones',
                        headerStyle: {
                            backgroundColor: '#009BBF',
                        },
                        headerTintColor: '#FFFFFF',
                        headerTitleStyle: {
                            fontFamily: 'Lato-Bold',
                        },
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}