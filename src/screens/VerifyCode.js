import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CodeInput from '../components/CodeInput';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const VerifyCode = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { API } = useAuth();
    const { correo } = route.params;

    const [codigo, setCodigo] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCodeComplete = (code) => {
        setCodigo(code);
        setErrors({});
    };

    const handleCodeChange = (code) => {
        setCodigo(code);
        setErrors({});
    };

    const handleVerifyCode = async () => {
        if (!codigo || codigo.length !== 6) {
            setErrors({ codigo: 'Ingresa el código completo de 6 dígitos' });
            return;
        }

        try {
            setIsLoading(true);
            
            const response = await fetch(`${API}/api/empleados/verify-reset-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    correo,
                    code: codigo
                }),
            });

            const data = await response.json();

            if (response.ok) {
                navigation.navigate('ResetPassword', {
                    correo,
                    codigo
                });
            } else {
                setErrors({ codigo: 'Código incorrecto o expirado' });
                Alert.alert('Error', data.message || 'Código incorrecto o expirado');
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Error de conexión. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            setIsLoading(true);

            const response = await fetch(`${API}/api/empleados/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Código Reenviado', 'Se ha enviado un nuevo código a tu correo');
                setTimeLeft(300);
                setCanResend(false);
                setCodigo('');
            } else {
                Alert.alert('Error', data.message || 'Error al reenviar código');
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
                            <Ionicons name="key-outline" size={50} color="#009BBF" />
                        </View>
                        <Text style={styles.title}>Verificar Código</Text>
                        <Text style={styles.subtitle}>
                            Ingresa el código de 6 dígitos que enviamos a
                        </Text>
                        <Text style={styles.email}>{correo}</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.codeLabel}>Código de Verificación</Text>
                        <CodeInput
                            length={6}
                            value={codigo}
                            onChangeText={handleCodeChange}
                            onComplete={handleCodeComplete}
                            error={errors.codigo}
                        />

                        <Button
                            title="Verificar Código"
                            onPress={handleVerifyCode}
                            variant="primary"
                            size="large"
                            disabled={isLoading || codigo.length !== 6}
                            style={styles.verifyButton}
                        />

                        <View style={styles.resendContainer}>
                            {!canResend ? (
                                <Text style={styles.timerText}>
                                    Reenviar código en {formatTime(timeLeft)}
                                </Text>
                            ) : (
                                <TouchableOpacity onPress={handleResendCode} disabled={isLoading}>
                                    <Text style={styles.resendText}>
                                        ¿No recibiste el código? Reenviar
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Revisa tu bandeja de entrada y la carpeta de spam
                        </Text>
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
        marginBottom: 30,
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
        marginBottom: 8,
    },
    email: {
        fontSize: 15,
        color: '#009BBF',
        fontWeight: '600',
        textAlign: 'center',
    },
    form: {
        marginBottom: 20,
    },
    codeLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 10,
    },
    verifyButton: {
        marginTop: 25,
        marginBottom: 15,
    },
    resendContainer: {
        alignItems: 'center',
    },
    timerText: {
        fontSize: 13,
        color: '#666666',
        textAlign: 'center',
    },
    resendText: {
        fontSize: 13,
        color: '#009BBF',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    footerText: {
        fontSize: 13,
        color: '#999999',
        textAlign: 'center',
        lineHeight: 18,
    },
});

export default VerifyCode;