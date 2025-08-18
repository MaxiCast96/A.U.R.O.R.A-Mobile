import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';

/**
 * Componente CodeInput para códigos de verificación
 * 
 * Props:
 * - length: número de dígitos (default: 6)
 * - onComplete: función que se ejecuta cuando se completa el código
 * - onChangeText: función que se ejecuta en cada cambio
 * - value: valor controlado del código
 * - error: mensaje de error
 */
const CodeInput = ({ 
    length = 6, 
    onComplete, 
    onChangeText, 
    value = '', 
    error = '' 
}) => {
    const [code, setCode] = useState(value.split(''));
    const inputs = useRef([]);

    useEffect(() => {
        setCode(value.split(''));
    }, [value]);

    const handleChangeText = (text, index) => {
        // Solo permitir números
        const numericText = text.replace(/[^0-9]/g, '');
        
        if (numericText.length > 1) {
            // Si se pega un código completo
            const newCode = numericText.slice(0, length).split('');
            const updatedCode = [...code];
            
            newCode.forEach((digit, i) => {
                if (index + i < length) {
                    updatedCode[index + i] = digit;
                }
            });
            
            setCode(updatedCode);
            onChangeText && onChangeText(updatedCode.join(''));
            
            // Enfocar la siguiente casilla disponible o la última
            const nextIndex = Math.min(index + newCode.length, length - 1);
            inputs.current[nextIndex]?.focus();
            
            // Verificar si está completo
            if (updatedCode.every(digit => digit !== '') && updatedCode.length === length) {
                onComplete && onComplete(updatedCode.join(''));
            }
            
            return;
        }

        // Actualizar el código
        const newCode = [...code];
        newCode[index] = numericText;
        setCode(newCode);
        onChangeText && onChangeText(newCode.join(''));

        // Auto-avanzar al siguiente campo si se ingresó un dígito
        if (numericText && index < length - 1) {
            inputs.current[index + 1]?.focus();
        }

        // Verificar si el código está completo
        if (newCode.every(digit => digit !== '') && newCode.length === length) {
            onComplete && onComplete(newCode.join(''));
        }
    };

    const handleKeyPress = (e, index) => {
        // Retroceder al campo anterior si se presiona backspace en un campo vacío
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleFocus = (index) => {
        // Seleccionar todo el texto al enfocar
        setTimeout(() => {
            inputs.current[index]?.setSelection(0, 1);
        }, 100);
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                {Array.from({ length }, (_, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => inputs.current[index] = ref}
                        style={[
                            styles.input,
                            error && styles.inputError,
                            code[index] && styles.inputFilled
                        ]}
                        value={code[index] || ''}
                        onChangeText={(text) => handleChangeText(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        onFocus={() => handleFocus(index)}
                        keyboardType="numeric"
                        maxLength={1}
                        textAlign="center"
                        selectTextOnFocus
                    />
                ))}
            </View>
            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    input: {
        width: 45,
        height: 55,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    inputFilled: {
        borderColor: '#009BBF',
        backgroundColor: '#F0F9FB',
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        textAlign: 'center',
        marginTop: 8,
    },
});

export default CodeInput;