import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width - 80;
const TAB_WIDTH = TAB_BAR_WIDTH / 4;

const FloatingTabBar = ({ state, descriptors, navigation }) => {
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: state.index,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
        }).start();
    }, [state.index]);

    const translateX = slideAnim.interpolate({
        inputRange: [0, 1, 2, 3],
        outputRange: [6, TAB_WIDTH + 6, TAB_WIDTH * 2 + 6, TAB_WIDTH * 3 + 6],
    });

    if (!state || !state.routes) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                {/* Píldora deslizante animada */}
                <Animated.View 
                    style={[
                        styles.slidingPill,
                        { transform: [{ translateX }] }
                    ]} 
                />

                {/* Renderizamos cada tab */}
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    
                    const label = options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                        ? options.title
                        : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    // Definir íconos para cada ruta
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = isFocused ? 'home' : 'home-outline';
                    } else if (route.name === 'Asistencia') {
                        iconName = isFocused ? 'clipboard' : 'clipboard-outline';
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
                            activeOpacity={0.7}
                        >
                            <View style={styles.tabContent}>
                                <Ionicons 
                                    name={iconName} 
                                    size={24}
                                    color={isFocused ? '#FFFFFF' : '#999999'} 
                                />
                                <Text style={[
                                    styles.tabText,
                                    isFocused ? styles.tabTextFocused : styles.tabTextUnfocused
                                ]}>
                                    {label}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        left: 40,
        right: 40,
        zIndex: 1000,
    },
    
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        paddingVertical: 8,
        paddingHorizontal: 6,
        height: 70,
        shadowColor: '#009BBF',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#E8ECF0',
    },
    
    slidingPill: {
        position: 'absolute',
        top: 8,
        left: 0,
        width: TAB_WIDTH - 12,
        height: 54,
        backgroundColor: '#009BBF',
        borderRadius: 22,
        shadowColor: '#009BBF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        height: 52,
    },
    
    tabContent: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
    },
    
    tabText: {
        fontSize: 10,
        fontFamily: 'Lato-Bold',
        textAlign: 'center',
    },
    
    tabTextFocused: {
        color: '#FFFFFF',
    },
    
    tabTextUnfocused: {
        color: '#999999',
    },
});

export default FloatingTabBar;