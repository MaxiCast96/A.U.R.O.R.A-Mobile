import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';

const PasswordSuccess = () => {
    const navigation = useNavigation();

    const handleGoToLogin = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#A4D5DD', '#FFFFFF']}
                locations={[0, 0.5]}
                style={styles.gradient}
            />

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Ionicons 
                            name="checkmark-circle" 
                            size={80} 
                            color="#22C55E" 
                        />
                    </View>

                    <Text style={styles.title}>¡Contraseña Cambiada!</Text>
                    
                    <Text style={styles.subtitle}>
                        Tu contraseña ha sido actualizada exitosamente.
                        Ya puedes iniciar sesión con tu nueva contraseña.
                    </Text>

                    <Button
                        title="Iniciar Sesión"
                        onPress={handleGoToLogin}
                        variant="primary"
                        size="large"
                        style={styles.loginButton}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Si tienes problemas para acceder, contacta al administrador
                    </Text>
                </View>
            </ScrollView>
        </View>
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
        height: '50%',
    },
    scrollContainer: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#009BBF',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    loginButton: {
        minWidth: 200,
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#999999',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default PasswordSuccess;