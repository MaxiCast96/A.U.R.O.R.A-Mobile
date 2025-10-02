import React, { useRef, useEffect } from 'react';
import { View, Image, StyleSheet, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

const SplashScreen = () => {
    const navigation = useNavigation();
    const { isAuthenticated } = useAuth();
    
    // Animación maestra para controlar desenfoque
    const focusProgress = useRef(new Animated.Value(0)).current;
    
    // Animaciones de movimiento del logo
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.7)).current;
    const logoTranslateY = useRef(new Animated.Value(30)).current;
    
    // 5 Ondas de agua
    const wave1Scale = useRef(new Animated.Value(0)).current;
    const wave1Opacity = useRef(new Animated.Value(0)).current;
    const wave2Scale = useRef(new Animated.Value(0)).current;
    const wave2Opacity = useRef(new Animated.Value(0)).current;
    const wave3Scale = useRef(new Animated.Value(0)).current;
    const wave3Opacity = useRef(new Animated.Value(0)).current;
    const wave4Scale = useRef(new Animated.Value(0)).current;
    const wave4Opacity = useRef(new Animated.Value(0)).current;
    const wave5Scale = useRef(new Animated.Value(0)).current;
    const wave5Opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            // Fase 1: ENTRADA - Enfoque progresivo + flotando desde abajo
            Animated.parallel([
                Animated.timing(focusProgress, {
                    toValue: 1,
                    duration: 1400,
                    easing: Easing.bezier(0.33, 0, 0.67, 1),
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 1200,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(logoScale, {
                    toValue: 1,
                    duration: 1200,
                    easing: Easing.out(Easing.back(1.2)),
                    useNativeDriver: true,
                }),
                Animated.timing(logoTranslateY, {
                    toValue: 0,
                    duration: 1200,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                })
            ]),
            
            // Fase 2: IMPACTO - Rebote + 5 ondas
            Animated.parallel([
                // Rebote del logo
                Animated.sequence([
                    Animated.spring(logoScale, {
                        toValue: 1.18,
                        friction: 3,
                        tension: 80,
                        useNativeDriver: true,
                    }),
                    Animated.spring(logoScale, {
                        toValue: 0.96,
                        friction: 4,
                        tension: 60,
                        useNativeDriver: true,
                    }),
                    Animated.spring(logoScale, {
                        toValue: 1,
                        friction: 6,
                        tension: 50,
                        useNativeDriver: true,
                    })
                ]),
                
                // Onda 1 (más interna)
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(wave1Scale, {
                            toValue: 1.1,
                            duration: 650,
                            easing: Easing.out(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(wave1Opacity, {
                            toValue: 0.55,
                            duration: 120,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.timing(wave1Opacity, {
                        toValue: 0,
                        duration: 380,
                        useNativeDriver: true,
                    })
                ]),
                
                // Onda 2
                Animated.sequence([
                    Animated.delay(90),
                    Animated.parallel([
                        Animated.timing(wave2Scale, {
                            toValue: 1.4,
                            duration: 750,
                            easing: Easing.out(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(wave2Opacity, {
                            toValue: 0.45,
                            duration: 130,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.timing(wave2Opacity, {
                        toValue: 0,
                        duration: 420,
                        useNativeDriver: true,
                    })
                ]),
                
                // Onda 3
                Animated.sequence([
                    Animated.delay(180),
                    Animated.parallel([
                        Animated.timing(wave3Scale, {
                            toValue: 1.7,
                            duration: 850,
                            easing: Easing.out(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(wave3Opacity, {
                            toValue: 0.35,
                            duration: 140,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.timing(wave3Opacity, {
                        toValue: 0,
                        duration: 480,
                        useNativeDriver: true,
                    })
                ]),
                
                // Onda 4
                Animated.sequence([
                    Animated.delay(270),
                    Animated.parallel([
                        Animated.timing(wave4Scale, {
                            toValue: 2,
                            duration: 950,
                            easing: Easing.out(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(wave4Opacity, {
                            toValue: 0.28,
                            duration: 150,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.timing(wave4Opacity, {
                        toValue: 0,
                        duration: 550,
                        useNativeDriver: true,
                    })
                ]),
                
                // Onda 5 (más externa)
                Animated.sequence([
                    Animated.delay(360),
                    Animated.parallel([
                        Animated.timing(wave5Scale, {
                            toValue: 2.3,
                            duration: 1050,
                            easing: Easing.out(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(wave5Opacity, {
                            toValue: 0.2,
                            duration: 160,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.timing(wave5Opacity, {
                        toValue: 0,
                        duration: 620,
                        useNativeDriver: true,
                    })
                ])
            ]),
            
            // Pausa
            Animated.delay(300),
            
            // Fase 3: SALIDA
            Animated.parallel([
                Animated.timing(focusProgress, {
                    toValue: 0,
                    duration: 800,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 0,
                    duration: 800,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(logoScale, {
                    toValue: 0.7,
                    duration: 800,
                    easing: Easing.in(Easing.back(1.2)),
                    useNativeDriver: true,
                }),
                Animated.timing(logoTranslateY, {
                    toValue: -30,
                    duration: 800,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                })
            ])
        ]).start(() => {
            handleNavigateAfterSplash();
        });
    }, []);

    const handleNavigateAfterSplash = () => {
        if (isAuthenticated) {
            navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        } else {
            navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        }
    };

    const blurLayer1Opacity = focusProgress.interpolate({
        inputRange: [0, 0.5, 0.8, 1],
        outputRange: [0.2, 0.15, 0.06, 0],
        extrapolate: 'clamp'
    });

    const blurLayer2Opacity = focusProgress.interpolate({
        inputRange: [0, 0.4, 0.7, 0.9, 1],
        outputRange: [0, 0.25, 0.3, 0.15, 0],
        extrapolate: 'clamp'
    });

    const clearLayerOpacity = focusProgress.interpolate({
        inputRange: [0, 0.6, 1],
        outputRange: [0, 0.5, 1],
        extrapolate: 'clamp'
    });

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#A4D5DD', '#FFFFFF']}
                locations={[0, 0.7]}
                style={styles.gradient}
            />
            
            {/* 5 Ondas de agua */}
            <Animated.View 
                style={[
                    styles.wave,
                    {
                        opacity: wave1Opacity,
                        transform: [{ scale: wave1Scale }]
                    }
                ]}
            />
            <Animated.View 
                style={[
                    styles.wave,
                    {
                        opacity: wave2Opacity,
                        transform: [{ scale: wave2Scale }]
                    }
                ]}
            />
            <Animated.View 
                style={[
                    styles.wave,
                    {
                        opacity: wave3Opacity,
                        transform: [{ scale: wave3Scale }]
                    }
                ]}
            />
            <Animated.View 
                style={[
                    styles.wave,
                    {
                        opacity: wave4Opacity,
                        transform: [{ scale: wave4Scale }]
                    }
                ]}
            />
            <Animated.View 
                style={[
                    styles.wave,
                    {
                        opacity: wave5Opacity,
                        transform: [{ scale: wave5Scale }]
                    }
                ]}
            />
            
            {/* Capa borrosa 1 */}
            <Animated.View 
                style={{
                    position: 'absolute',
                    opacity: Animated.multiply(logoOpacity, blurLayer1Opacity),
                    transform: [
                        { translateY: logoTranslateY },
                        { scale: Animated.multiply(logoScale, 1.06) }
                    ],
                    alignItems: 'center'
                }}
            >
                <Image
                    source={require('../assets/ap.png')}
                    style={styles.logo}
                    resizeMode="contain"
                    blurRadius={8}
                />
            </Animated.View>

            {/* Capa borrosa 2 */}
            <Animated.View 
                style={{
                    position: 'absolute',
                    opacity: Animated.multiply(logoOpacity, blurLayer2Opacity),
                    transform: [
                        { translateY: logoTranslateY },
                        { scale: Animated.multiply(logoScale, 1.03) }
                    ],
                    alignItems: 'center'
                }}
            >
                <Image
                    source={require('../assets/ap.png')}
                    style={styles.logo}
                    resizeMode="contain"
                    blurRadius={4}
                />
            </Animated.View>

            {/* Capa nítida */}
            <Animated.View 
                style={{
                    opacity: Animated.multiply(logoOpacity, clearLayerOpacity),
                    transform: [
                        { translateY: logoTranslateY },
                        { scale: logoScale }
                    ],
                    alignItems: 'center'
                }}
            >
                <Image
                    source={require('../assets/ap.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '100%',
    },
    logo: {
        width: 280,
        height: 180,
    },
    wave: {
        position: 'absolute',
        width: 350,
        height: 350,
        borderRadius: 175,
        borderWidth: 2.5,
        borderColor: '#00BCD4',
        backgroundColor: 'transparent',
    }
});

export default SplashScreen;