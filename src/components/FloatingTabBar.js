import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

/**
 * Tab Bar Flotante Personalizado
 * 
 * Este componente reemplaza el tab bar por defecto de React Navigation
 * con un diseño más moderno y flotante. Tiene forma de píldora y
 * se posiciona en la parte inferior de la pantalla.
 * 
 * Características:
 * - Diseño flotante con sombras
 * - Forma de píldora con bordes redondeados
 * - Solo el tab seleccionado muestra texto (al lado del icono)
 * - Color azul (#009BBF) para el tab seleccionado
 * - Tamaño compacto y circular
 * - Contorno circular para botones seleccionados
 * - Transiciones suaves entre estados
 */
const FloatingTabBar = ({ state, descriptors, navigation }) => {
    // Verificamos que el estado de navegación existe para evitar errores
    if (!state || !state.routes) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                {/* Renderizamos cada tab dinámicamente */}
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    
                    // Obtenemos el texto del tab (label o title)
                    const label = options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                        ? options.title
                        : route.name;

                    // Verificamos si este tab está seleccionado
                    const isFocused = state.index === index;

                    // Función que se ejecuta al presionar el tab
                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        // Solo navegamos si no está ya seleccionado
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    // Función para press largo (por si queremos agregar funcionalidad)
                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    // Definimos qué icono mostrar según el tab
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = isFocused ? 'home' : 'home-outline';
                    } else if (route.name === 'Citas') {
                        iconName = isFocused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'More') {
                        iconName = isFocused ? 'grid' : 'grid-outline';
                    }

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.tabButton}
                            activeOpacity={0.7} // Opacidad al presionar para feedback visual
                        >
                            <Animated.View 
                                style={[
                                    styles.tabContent,
                                    isFocused && styles.tabContentFocused
                                ]}
                            >
                                {/* Icono del tab - todos del mismo tamaño */}
                                <Ionicons 
                                    name={iconName} 
                                    size={20} // Tamaño más pequeño y consistente
                                    color={isFocused ? '#FFFFFF' : '#666666'} 
                                />
                                
                                {/* Solo mostramos texto en el tab seleccionado */}
                                {isFocused && (
                                    <Animated.Text 
                                        style={[
                                            styles.tabText,
                                            isFocused && styles.tabTextFocused
                                        ]}
                                    >
                                        {label}
                                    </Animated.Text>
                                )}
                            </Animated.View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal del tab bar
    container: {
        position: 'absolute', // Posición absoluta para que flote
        bottom: 20, // 20px desde abajo
        left: 50, // Más centrado - menos espacio desde la izquierda
        right: 50, // Más centrado - menos espacio desde la derecha
        zIndex: 1000, // Para que aparezca por encima de todo
    },
    
    // El tab bar en sí (la píldora)
    tabBar: {
        flexDirection: 'row', // Tabs en fila horizontal
        backgroundColor: '#FFFFFF', // Fondo blanco
        borderRadius: 30, // Bordes más redondeados para forma más circular
        paddingHorizontal: 4, // Padding horizontal más pequeño para menos espacios
        paddingVertical: 8, // Padding vertical para dar altura y no verse aplastado
        height: 70, // Altura fija para dar más presencia
        
        // Sombras para efecto flotante
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5, // Elevación para Android
        
        // Borde sutil
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    
    // Cada botón individual del tab
    tabButton: {
        flex: 1, // Distribuye el espacio equitativamente
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6, // Padding vertical para dar altura
    },
    
    // Contenido interno de cada tab
    tabContent: {
        flexDirection: 'row', // Icono y texto en fila horizontal
        alignItems: 'center', // Centrados verticalmente
        justifyContent: 'center',
        paddingHorizontal: 8, // Padding horizontal para dar espacio al texto
        paddingVertical: 8, // Padding vertical para dar altura
        borderRadius: 30, // Bordes muy redondeados para forma circular
        minWidth: 45, // Ancho mínimo más pequeño
        minHeight: 45, // Altura mínima para dar presencia
        // Transición suave para cambios de estado
        transition: 'all 0.3s ease',
    },
    
    // Estilo cuando el tab está seleccionado
    tabContentFocused: {
        backgroundColor: '#009BBF', // Color azul de la marca
        borderRadius: 30, // Bordes muy redondeados para forma circular
        // Transición suave para el cambio de color
        transition: 'all 0.3s ease',
    },
    
    // Texto del tab (solo para el tab seleccionado)
    tabText: {
        fontSize: 10, // Tamaño de fuente más pequeño
        color: '#FFFFFF',
        marginLeft: 4, // Espacio entre icono y texto
        fontWeight: '500',
        // Transición suave para la aparición del texto
        transition: 'all 0.3s ease',
    },
    
    // Texto cuando está seleccionado
    tabTextFocused: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});

export default FloatingTabBar; 