import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Input from '../components/Login/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { API } = useAuth();
    const { correo, codigo } = route.params;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        
        if (!password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            newErrors.password = 'Debe contener al menos: 1 mayúscula, 1 minúscula y 1 número';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Confirma tu contraseña';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleResetPassword = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            
            const response = await fetch(`${API}/api/empleados/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    correo, 
                    code: codigo,
                    newPassword: password 
                }),
            });

            const data = await response.json();

            if (response.ok) {
                navigation.navigate('PasswordSuccess');
            } else {
                Alert.alert('Error', data.message || 'Error al cambiar la contraseña');
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Error de conexión. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#A4D5DD', '#FFFFFF']}
                locations={[0, 0.5]}
                style={styles.gradient}
            />

            <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color="#009BBF" />
            </TouchableOpacity>

            <KeyboardAvoidingView 
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="lock-closed-outline" size={50} color="#009BBF" />
                        </View>
                        <Text style={styles.title}>Nueva Contraseña</Text>
                        <Text style={styles.subtitle}>
                            Crea una contraseña segura para tu cuenta
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Nueva Contraseña"
                            placeholder="Ingresa tu nueva contraseña"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={true}
                            icon="lock-closed-outline"
                            error={errors.password}
                        />

                        <Input
                            label="Confirmar Contraseña"
                            placeholder="Confirma tu nueva contraseña"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={true}
                            icon="lock-closed-outline"
                            error={errors.confirmPassword}
                        />

                        <View style={styles.requirements}>
                            <Text style={styles.requirementsTitle}>Requisitos de la contraseña:</Text>
                            <Text style={[
                                styles.requirement,
                                password.length >= 6 && styles.requirementMet
                            ]}>
                                • Mínimo 6 caracteres
                            </Text>
                            <Text style={[
                                styles.requirement,
                                /(?=.*[a-z])/.test(password) && styles.requirementMet
                            ]}>
                                • Al menos una letra minúscula
                            </Text>
                            <Text style={[
                                styles.requirement,
                                /(?=.*[A-Z])/.test(password) && styles.requirementMet
                            ]}>
                                • Al menos una letra mayúscula
                            </Text>
                            <Text style={[
                                styles.requirement,
                                /(?=.*\d)/.test(password) && styles.requirementMet
                            ]}>
                                • Al menos un número
                            </Text>
                        </View>

                        <Button
                            title="Cambiar Contraseña"
                            onPress={handleResetPassword}
                            variant="primary"
                            size="large"
                            disabled={isLoading}
                            style={styles.resetButton}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        height: '40%',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    keyboardView: {
        flex: 1,
        paddingTop: 80,
    },
    scrollContainer: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 25,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#009BBF',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 22,
    },
    form: {
        marginBottom: 20,
    },
    requirements: {
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        marginBottom: 15,
    },
    requirementsTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 6,
    },
    requirement: {
        fontSize: 11,
        color: '#666666',
        marginBottom: 3,
    },
    requirementMet: {
        color: '#22C55E',
        fontWeight: '500',
    },
    resetButton: {
        marginTop: 10,
    },
});

export default ResetPassword;