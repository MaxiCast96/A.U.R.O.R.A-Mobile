import React from 'react';
import { NavigationContainer, DefaultTheme as NavDefaultTheme, DarkTheme as NavDarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigation';
import Profile from '../screens/Profile';
import SplashScreen from '../screens/SplashScreen';
import Login from '../screens/Login';
import Welcome from '../screens/Welcome';
import Menu from '../screens/Menu';
import Clientes from '../screens/Clientes';
import Empleados from '../screens/Empleados';
import Sucursales from '../screens/Sucursales';
import Ventas from '../screens/Ventas';
import Reportes from '../screens/Reportes';
import Facturas from '../screens/Facturas';
import Configuracion from '../screens/Configuracion';
import ForgotPassword from '../screens/ForgotPassword';
import VerifyCode from '../screens/VerifyCode';
import ResetPassword from '../screens/ResetPassword';
import PasswordSuccess from '../screens/PasswordSucces';
import Optometristas from '../screens/Optometristas';
import Citas from '../screens/Citas';
import Lentes from '../screens/Lentes';
import Accesorios from '../screens/Accesorios';
import Personalizados from '../screens/Personalizados';
import Categorias from '../screens/Categoria';
import Marcas from '../screens/Marcas';
import Promociones from '../screens/Promociones';
// ===== PANTALLAS MÉDICAS =====
import HistorialMedico from '../screens/HistorialMedico';
import Recetas from '../screens/Recetas';
// ================================
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { SettingsProvider, useSettings } from '../context/SettingsContext';

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
 */
const ThemedNavigation = () => {
    const { resolvedTheme } = useSettings();
    const navTheme = resolvedTheme === 'dark' ? NavDarkTheme : NavDefaultTheme;
    return (
        <NavigationContainer theme={navTheme}>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{ headerShown: false }}
            >
                {/* Pantalla de carga inicial */}
                <Stack.Screen name="Splash" component={SplashScreen} />
                
                {/* Pantalla de Bienvenida */}
                <Stack.Screen name="Welcome" component={Welcome} />
                
                {/* Pantalla de login */}
                <Stack.Screen name="Login" component={Login} />
                
                {/* ===== PANTALLAS DE RECUPERACIÓN DE CONTRASEÑA ===== */}
                <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
                <Stack.Screen name="VerifyCode" component={VerifyCode} />
                <Stack.Screen name="ResetPassword" component={ResetPassword} />
                <Stack.Screen name="PasswordSuccess" component={PasswordSuccess} />
                
                {/* Navegación principal con tabs */}
                <Stack.Screen name="Main" component={TabNavigator} />
                
                {/* ===== PANTALLAS DE PERFIL ===== */}
                <Stack.Screen name="Profile" component={Profile} />
                
                {/* ===== PANTALLAS DE GESTIÓN ===== */}
                <Stack.Screen name="Clientes" component={Clientes} />
                <Stack.Screen name="Empleados" component={Empleados} />
                <Stack.Screen name="Sucursales" component={Sucursales} />
                <Stack.Screen name="Ventas" component={Ventas} />
                <Stack.Screen name="Reportes" component={Reportes} />
                <Stack.Screen name="Facturas" component={Facturas} />
                <Stack.Screen name="Optometristas" component={Optometristas} />
                
                {/* ===== PANTALLAS MÉDICAS ===== */}
                <Stack.Screen 
                    name="HistorialMedico" 
                    component={HistorialMedico}
                    options={{
                        headerShown: true,
                        title: 'Historial Médico',
                        headerStyle: { backgroundColor: '#009BBF' },
                        headerTintColor: '#FFFFFF',
                        headerTitleStyle: { fontFamily: 'Lato-Bold' },
                    }}
                />
                <Stack.Screen 
                    name="Recetas" 
                    component={Recetas}
                    options={{
                        headerShown: true,
                        title: 'Gestión de Recetas',
                        headerStyle: { backgroundColor: '#009BBF' },
                        headerTintColor: '#FFFFFF',
                        headerTitleStyle: { fontFamily: 'Lato-Bold' },
                    }}
                />
                
                {/* Navegación de Configuración */}
                <Stack.Screen name="Configuracion" component={Configuracion} />
                
                {/* Pantalla de menú - acceso directo */}
                <Stack.Screen name="MenuDirect" component={Menu} options={{
                    headerShown: true,
                    title: 'Operaciones',
                    headerStyle: { backgroundColor: '#009BBF' },
                    headerTintColor: '#FFFFFF',
                    headerTitleStyle: { fontFamily: 'Lato-Bold' },
                }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default function Navigation() {
    const { isAuthenticated, isLoading } = useAuth();

    // Mostrar pantalla de carga mientras se verifica la autenticación
    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <SettingsProvider>
            <ThemedNavigation />
        </SettingsProvider>
    );
}