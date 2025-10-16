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
import HistorialMedico from '../screens/HistorialMedico';
import Recetas from '../screens/Recetas';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { SettingsProvider, useSettings } from '../context/SettingsContext';

const Stack = createNativeStackNavigator();

const LoadingScreen = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#009BBF" />
    </View>
);

const ThemedNavigation = () => {
    const { resolvedTheme } = useSettings();
    const navTheme = resolvedTheme === 'dark' ? NavDarkTheme : NavDefaultTheme;
    
    return (
        <NavigationContainer theme={navTheme}>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{ 
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Welcome" component={Welcome} />
                <Stack.Screen name="Login" component={Login} />
                
                {/* Recuperación de contraseña */}
                <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
                <Stack.Screen name="VerifyCode" component={VerifyCode} />
                <Stack.Screen name="ResetPassword" component={ResetPassword} />
                <Stack.Screen name="PasswordSuccess" component={PasswordSuccess} />
                
                {/* Navegación principal con tabs */}
                <Stack.Screen 
                    name="Main" 
                    component={TabNavigator}
                    options={{ headerShown: false }}
                />
                
                {/* Perfil - SIN HEADER */}
                <Stack.Screen 
                    name="Profile" 
                    component={Profile}
                    options={{ headerShown: false }}
                />
                
                {/* Gestión de Personal */}
                <Stack.Screen 
                    name="Clientes" 
                    component={Clientes}
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="Empleados" 
                    component={Empleados}
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="Optometristas" 
                    component={Optometristas}
                    options={{ headerShown: false }}
                />
                
                {/* Productos */}
                <Stack.Screen 
                    name="Lentes" 
                    component={Lentes}
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="Accesorios" 
                    component={Accesorios}
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="Personalizados" 
                    component={Personalizados}
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="Categorias" 
                    component={Categorias}
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="Marcas" 
                    component={Marcas}
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="Promociones" 
                    component={Promociones}
                    options={{ headerShown: false }}
                />
                
                {/* Médico - SIN HEADER */}
                <Stack.Screen 
                    name="HistorialMedico" 
                    component={HistorialMedico}
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="Recetas" 
                    component={Recetas}
                    options={{ headerShown: false }}
                />
                
                {/* Administración */}
                <Stack.Screen 
                    name="Sucursales" 
                    component={Sucursales}
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="Ventas" 
                    component={Ventas}
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="Reportes" 
                    component={Reportes}
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="Facturas" 
                    component={Facturas}
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="Configuracion" 
                    component={Configuracion}
                    options={{ headerShown: false }}
                />
                
                {/* Menú directo */}
                <Stack.Screen 
                    name="MenuDirect" 
                    component={Menu} 
                    options={{
                        headerShown: true,
                        title: 'Operaciones',
                        headerStyle: { backgroundColor: '#009BBF' },
                        headerTintColor: '#FFFFFF',
                        headerTitleStyle: { fontFamily: 'Lato-Bold' },
                    }} 
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default function Navigation() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <SettingsProvider>
            <ThemedNavigation />
        </SettingsProvider>
    );
}