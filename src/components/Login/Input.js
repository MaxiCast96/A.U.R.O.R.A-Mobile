import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

/**
 * Componente Input reutilizable
 * 
 * Este componente permite crear campos de entrada con diferentes
 * estilos y funcionalidades como mostrar/ocultar contraseña.
 * 
 * Props:
 * - label: Etiqueta del campo
 * - placeholder: Texto de placeholder
 * - value: Valor del input
 * - onChangeText: Función que se ejecuta al cambiar el texto
 * - secureTextEntry: boolean para campos de contraseña
 * - error: Mensaje de error
 * - disabled: boolean para deshabilitar el input
 * - icon: nombre del icono de Ionicons
 * - style: estilos adicionales
 */
const Input = ({ 
    label, 
    placeholder, 
    value, 
    onChangeText, 
    secureTextEntry = false,
    error = '',
    disabled = false,
    icon = null,
    style = {}
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, style]}>
            {/* Etiqueta del campo */}
            {label && (
                <Text style={styles.label}>{label}</Text>
            )}
            
            {/* Contenedor del input */}
            <View style={[
                styles.inputContainer,
                isFocused && styles.inputContainerFocused,
                error ? styles.inputContainerError : null,
                disabled && styles.inputContainerDisabled
            ]}>
                {/* Icono izquierdo (si existe) */}
                {icon && (
                    <Ionicons 
                        name={icon} 
                        size={20} 
                        color={isFocused ? '#009BBF' : '#666666'} 
                        style={styles.leftIcon}
                    />
                )}
                
                {/* Campo de texto */}
                <TextInput
                    style={[
                        styles.input,
                        icon && styles.inputWithLeftIcon,
                        secureTextEntry && styles.inputWithRightIcon
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor="#999999"
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    editable={!disabled}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                
                {/* Icono derecho para mostrar/ocultar contraseña */}
                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.rightIcon}
                    >
                        <Ionicons 
                            name={isPasswordVisible ? 'eye-off' : 'eye'} 
                            size={20} 
                            color="#666666" 
                        />
                    </TouchableOpacity>
                )}
            </View>
            
            {/* Mensaje de error */}
            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal
    container: {
        marginBottom: 16,
    },
    
    // Etiqueta del campo
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    
    // Contenedor del input
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        minHeight: 48,
    },
    
    // Estado enfocado
    inputContainerFocused: {
        borderColor: '#009BBF',
        borderWidth: 2,
    },
    
    // Estado de error
    inputContainerError: {
        borderColor: '#EF4444',
        borderWidth: 2,
    },
    
    // Estado deshabilitado
    inputContainerDisabled: {
        backgroundColor: '#F3F4F6',
        opacity: 0.6,
    },
    
    // Campo de texto
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1A1A1A',
        paddingVertical: 0,
    },
    
    // Input con icono izquierdo
    inputWithLeftIcon: {
        marginLeft: 8,
    },
    
    // Input con icono derecho
    inputWithRightIcon: {
        marginRight: 8,
    },
    
    // Icono izquierdo
    leftIcon: {
        marginRight: 8,
    },
    
    // Icono derecho
    rightIcon: {
        padding: 4,
    },
    
    // Texto de error
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
        marginLeft: 4,
    },
});

export default Input; 