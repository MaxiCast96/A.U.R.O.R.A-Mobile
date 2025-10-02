import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Easing } from 'react-native';
import Home from '../screens/Home';
import Citas from '../screens/Citas';
import Menu from '../screens/Menu'; 
import FloatingTabBar from '../components/FloatingTabBar';

const Tab = createBottomTabNavigator();

const TabNavigator = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            lazy: false,
            animation: 'fade',
            transitionSpec: {
                open: {
                    animation: 'timing',
                    config: {
                        duration: 400,
                        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                    },
                },
                close: {
                    animation: 'timing',
                    config: {
                        duration: 350,
                        easing: Easing.bezier(0.4, 0.0, 0.6, 1),
                    },
                },
            },
            cardStyleInterpolator: ({ current }) => ({
                cardStyle: {
                    opacity: current.progress,
                },
            }),
        }}
        tabBar={props => <FloatingTabBar {...props} />}
    >
        <Tab.Screen 
            name="Home" 
            component={Home} 
            options={{ 
                title: 'Inicio',
                tabBarLabel: 'Inicio',
            }} 
        />

        <Tab.Screen 
            name="More" 
            component={Menu} 
            options={{ 
                title: 'Operaciones',
                tabBarLabel: 'Menú',
            }} 
        />
        
        <Tab.Screen 
            name="Citas" 
            component={Citas} 
            options={{ 
                title: 'Citas',
                tabBarLabel: 'Citas',
            }} 
        />
    </Tab.Navigator>
);

export default TabNavigator;