import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Modal as RNModal, 
    TouchableOpacity, 
    TouchableWithoutFeedback,
    Dimensions
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

/**
 * Componente Modal reutilizable
 * 
 * Este componente permite crear modales con diferentes estilos
 * y funcionalidades para mostrar información o formularios.
 * 
 * Props:
 * - visible: boolean para mostrar/ocultar el modal
 * - onClose: función que se ejecuta al cerrar el modal
 * - title: título del modal
 * - children: contenido del modal
 * - variant: 'default' | 'fullscreen' | 'bottom'
 * - showCloseButton: boolean para mostrar botón de cerrar
 * - style: estilos adicionales
 */
const Modal = ({ 
    visible, 
    onClose, 
    title, 
    children, 
    variant = 'default',
    showCloseButton = true,
    style = {}
}) => {
    return (
        <RNModal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={[
                            styles.modal,
                            styles[variant],
                            style
                        ]}>
                            {/* Header del modal */}
                            {(title || showCloseButton) && (
                                <View style={styles.header}>
                                    {title && (
                                        <Text style={styles.title}>{title}</Text>
                                    )}
                                    {showCloseButton && (
                                        <TouchableOpacity
                                            onPress={onClose}
                                            style={styles.closeButton}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons 
                                                name="close" 
                                                size={24} 
                                                color="#666666" 
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                            
                            {/* Contenido del modal */}
                            <View style={styles.content}>
                                {children}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </RNModal>
    );
};

const styles = StyleSheet.create({
    // Overlay del modal
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // Modal base
    modal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        maxWidth: width * 0.9,
        maxHeight: height * 0.8,
    },
    
    // Variantes del modal
    default: {
        width: width * 0.9,
        minHeight: 200,
    },
    
    fullscreen: {
        width: width,
        height: height,
        borderRadius: 0,
    },
    
    bottom: {
        width: width,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        position: 'absolute',
        bottom: 0,
    },
    
    // Header del modal
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    
    // Título del modal
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        flex: 1,
    },
    
    // Botón de cerrar
    closeButton: {
        padding: 4,
    },
    
    // Contenido del modal
    content: {
        padding: 20,
        flex: 1,
    },
});

export default Modal; 