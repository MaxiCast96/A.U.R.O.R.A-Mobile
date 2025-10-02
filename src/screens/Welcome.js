import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';
import FeatureCard from '../components/FeatureCard';

const Welcome = () => {
    const navigation = useNavigation();

    const handleGoToLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Degradado superior */}
                <LinearGradient
                    colors={['#A4D5DD', '#FFFFFF']}
                    locations={[0, 0.7]}
                    style={styles.gradient}
                />

                {/* Contenido principal */}
                <View style={styles.topSection}>
                    {/* Logo de la óptica */}
                    <Image
                        source={require('../assets/ojoo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    {/* Título dividido con mejor jerarquía visual */}
                    <View style={styles.titleContainer}>
                        <Text style={styles.welcomeText}>BIENVENIDO A</Text>
                        <View style={styles.brandContainer}>
                            <Text style={styles.brandOptica}>ÓPTICA</Text>
                            <Text style={styles.brandInteligente}>LA INTELIGENTE</Text>
                        </View>
                        <View style={styles.sloganContainer}>
                            <Text style={styles.sloganMira}>MIRA BIEN, </Text>
                            <Text style={styles.sloganLuce}>LUCE BIEN</Text>
                        </View>
                    </View>

                    
                </View>

                

                {/* Sección inferior con botón */}
                <View style={styles.bottomSection}>
                    <Text style={styles.callToAction}>
                        Comienza a optimizar tu gestión
                    </Text>
                    
                    <Button
                        title="Iniciar sesión"
                        onPress={handleGoToLogin}
                        variant="primary"
                        size="large"
                        style={styles.loginButton}
                    />

                    
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '50%',
    },
    topSection: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 20,
    },
    logo: {
        width: 140,
        height: 200,
        marginBottom: 24,
        marginTop: 40,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    welcomeText: {
        fontFamily: 'Lato-Regular',
        fontSize: 16,
        color: '#3C3C3B',
        letterSpacing: 2,
        marginBottom: 8,
        marginTop: 0,
    },
    brandContainer: {
        alignItems: 'center',
        marginBottom: 8,
    },
    brandOptica: {
        fontFamily: 'Lato-Bold',
        fontSize: 32,
        fontWeight: 'bold',
        color: '#3C3C3B',
        letterSpacing: 1,
    },
    brandInteligente: {
        fontFamily: 'Lato-Bold',
        fontSize: 32,
        fontWeight: 'bold',
        color: '#009BBF',
        letterSpacing: 1,
        marginTop: -4,
    },
    sloganContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sloganMira: {
        fontFamily: 'Lato-Bold',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#49AA4C',
        letterSpacing: 1,
    },
    sloganLuce: {
        fontFamily: 'Lato-Bold',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#D01B5F',
        letterSpacing: 1,
    },
    description: {
        fontFamily: 'Lato-Regular',
        fontSize: 15,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    featuresSection: {
        paddingHorizontal: 24,
        paddingVertical: 24,
        gap: 16,
    },
    bottomSection: {
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingTop: 181,
        paddingBottom: 32,
    },
    callToAction: {
        fontFamily: 'Lato-Regular',
        fontSize: 16,
        color: '#3C3C3B',
        textAlign: 'center',
        marginBottom: 14,
        lineHeight: 24,
    },
    loginButton: {
        width: '100%',
        maxWidth: 330,
        backgroundColor: '#009BBF',
        marginBottom: 10,
    },
    pageIndicatorContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    pageIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E5E7EB',
    },
    pageIndicatorActive: {
        width: 24,
        backgroundColor: '#009BBF',
    },
});

export default Welcome;