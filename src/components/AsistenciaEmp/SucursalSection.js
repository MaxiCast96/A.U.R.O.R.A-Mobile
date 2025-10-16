import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    LayoutAnimation,
    Platform,
    UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsistenciaEmpleadoItem from './AsistenciaEmpleadoItem';

// Habilitar animaciones en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Componente SucursalSection
 * 
 * Sección expandible que agrupa empleados por sucursal
 * con estadísticas y animaciones suaves
 * 
 * Props:
 * @param {Object} sucursal - Objeto con datos de la sucursal y empleados
 * @param {Function} onToggleDisponibilidad - Callback para cambiar disponibilidad
 */
const SucursalSection = ({ sucursal, onToggleDisponibilidad }) => {
    const [expanded, setExpanded] = useState(true);
    const rotateAnim = useRef(new Animated.Value(expanded ? 1 : 0)).current;

    /**
     * Manejar expansión/colapso con animación
     */
    const handleToggle = () => {
        // Configurar animación de layout
        LayoutAnimation.configureNext(
            LayoutAnimation.create(
                300,
                LayoutAnimation.Types.easeInEaseOut,
                LayoutAnimation.Properties.opacity
            )
        );

        // Animar icono de flecha
        Animated.timing(rotateAnim, {
            toValue: expanded ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        setExpanded(!expanded);
    };

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    /**
     * Obtener color de la sucursal basado en su nombre
     */
    const getSucursalColor = (nombre) => {
        const colores = {
            'quezaltepeque': '#FF6B6B',
            'colonia médica': '#4ECDC4',
            'santa rosa': '#FFD93D',
        };
        
        const nombreLower = nombre?.toLowerCase() || '';
        for (const [key, color] of Object.entries(colores)) {
            if (nombreLower.includes(key)) {
                return color;
            }
        }
        
        return '#009BBF';
    };

    const sucursalColor = getSucursalColor(sucursal.nombre);

    return (
        <View style={styles.container}>
            {/* Header de la sucursal */}
            <TouchableOpacity 
                style={[styles.header, { borderLeftColor: sucursalColor }]}
                onPress={handleToggle}
                activeOpacity={0.7}
            >
                <View style={styles.headerLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: `${sucursalColor}15` }]}>
                        <Ionicons name="business" size={20} color={sucursalColor} />
                    </View>
                    <View style={styles.sucursalInfo}>
                        <Text style={styles.sucursalNombre}>{sucursal.nombre}</Text>
                        <Text style={styles.sucursalTotal}>{sucursal.total} empleados</Text>
                    </View>
                </View>

                <View style={styles.headerRight}>
                    {/* Badges de estadísticas */}
                    <View style={styles.estadisticasContainer}>
                        <View style={styles.estadisticaBadge}>
                            <Ionicons name="checkmark-circle" size={14} color="#49AA4C" />
                            <Text style={[styles.estadisticaTexto, { color: '#49AA4C' }]}>
                                {sucursal.disponibles}
                            </Text>
                        </View>
                        <View style={styles.estadisticaBadge}>
                            <Ionicons name="close-circle" size={14} color="#D0155F" />
                            <Text style={[styles.estadisticaTexto, { color: '#D0155F' }]}>
                                {sucursal.noDisponibles}
                            </Text>
                        </View>
                    </View>

                    {/* Icono de expansión */}
                    <Animated.View style={{ transform: [{ rotate }] }}>
                        <Ionicons name="chevron-down" size={20} color="#666666" />
                    </Animated.View>
                </View>
            </TouchableOpacity>

            {/* Lista de empleados */}
            {expanded && (
                <View style={styles.empleadosContainer}>
                    {sucursal.empleados.map((empleado, index) => (
                        <AsistenciaEmpleadoItem
                            key={empleado._id || index}
                            empleado={empleado}
                            onToggleDisponibilidad={onToggleDisponibilidad}
                            sucursalNombre={sucursal.nombre}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sucursalInfo: {
        flex: 1,
    },
    sucursalNombre: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    sucursalTotal: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    estadisticasContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    estadisticaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    estadisticaTexto: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
    },
    empleadosContainer: {
        marginTop: 8,
        gap: 4,
    },
});

export default SucursalSection;