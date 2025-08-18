import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';

const Welcome = () => {
    const navigation = useNavigation();

    const handleGoToLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Degradado superior */}
            <LinearGradient
                colors={['#A4D5DD', '#FFFFFF']}
                locations={[0, 0.6]}
                style={styles.gradient}
            />
            <View style={styles.centeredContent}>
                {/* Logo de la óptica */}
                <Image
                    source={require('../assets/ojoo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                {/* Título y mensaje de bienvenida */}
                <Text style={styles.title}>
                    ¡BIENVENIDO A ÓPTICA LA INTELIGENTE!
                </Text>
                <Text style={styles.subtitle}>
                    ¡Haz clic en el botón para comenzar!
                </Text>

                {/* Botón de login */}
                <Button
                    title="Iniciar sesión"
                    onPress={handleGoToLogin}
                    variant="primary"
                    size="large"
                    style={styles.loginButton}
                />

                {/* Indicador inferior */}
                <View style={styles.indicator} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '60%',
    },
    centeredContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    logo: {
        width: 200,
        height: 140,
        marginBottom: 24,
        marginTop: 10,
    },
    title: {
        fontFamily: 'Lato',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#009BBF',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 32,
        letterSpacing: 1.5,
    },
    subtitle: {
        fontFamily: 'Lato-Regular',
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    loginButton: {
        width: 220,
        backgroundColor: '#009BBF',
        marginBottom: 32,
    },
    indicator: {
        width: 60,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        marginTop: 16,
    },
});

export default Welcome;