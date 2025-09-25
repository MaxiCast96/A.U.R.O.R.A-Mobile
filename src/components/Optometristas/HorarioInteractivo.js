import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHorariosOptometrista } from '../../hooks/useOptometristas/useHorariosOptometrista';

/**
 * Componente HorariosInteractivo
 * 
 * Componente interactivo para gestionar horarios de disponibilidad del optometrista
 * Vista vertical optimizada para móvil sin scroll horizontal
 * 
 * Props:
 * @param {Array} disponibilidad - Array de horarios de disponibilidad inicial
 * @param {Function} onChange - Función callback que se ejecuta cuando cambian los horarios
 * @param {string} error - Mensaje de error para mostrar
 */
const HorariosInteractivo = ({ disponibilidad = [], onChange, error }) => {
    const {
        // Estados y datos
        disponibilidad: horarios,
        setDisponibilidad,
        diasSemana,
        horasDisponibles,
        
        // Funciones de verificación
        isHoraSelected,
        getSelectedHoursCount,
        getTotalHoras,
        
        // Funciones de manipulación
        handleHoraToggle,
        clearDaySchedule,
        selectAllDaySchedule,
    } = useHorariosOptometrista(disponibilidad);

    // Sincronizar cambios con el componente padre
    React.useEffect(() => {
        if (onChange) {
            onChange(horarios);
        }
    }, [horarios, onChange]);

    /*
    // Debug para verificar que los datos se estén cargando
    React.useEffect(() => {
        console.log('🕐 HorariosInteractivo - Disponibilidad inicial:', disponibilidad);
        console.log('🕐 HorariosInteractivo - Horarios del hook:', horarios);
        console.log('🕐 HorariosInteractivo - Días semana:', diasSemana);
        console.log('🕐 HorariosInteractivo - Horas disponibles:', horasDisponibles);
    }, [disponibilidad, horarios, diasSemana, horasDisponibles]);
    */

    const totalHoras = getTotalHoras();
    const isOverLimit = totalHoras > 44;

    return (
        <View style={styles.container}>
            {/* Header con título e indicador de horas */}
            <View style={styles.header}>
                <Text style={styles.title}>Horarios de Disponibilidad</Text>
                <Text style={styles.subtitle}>
                    Selecciona las horas disponibles para cada día. Puedes elegir horas no consecutivas.
                </Text>
                
                {/* Indicador de horas totales */}
                <View style={[
                    styles.horasIndicator,
                    isOverLimit ? styles.horasIndicatorError : styles.horasIndicatorSuccess
                ]}>
                    <Ionicons 
                        name="time-outline" 
                        size={16} 
                        color={isOverLimit ? "#FFFFFF" : "#065F46"} 
                    />
                    <Text style={[
                        styles.horasIndicatorText,
                        isOverLimit ? styles.horasIndicatorTextError : styles.horasIndicatorTextSuccess
                    ]}>
                        {totalHoras} horas semanales
                    </Text>
                    {isOverLimit && <Text style={styles.warningIcon}>!</Text>}
                </View>
            </View>

            {/* Contenedor principal de horarios - VISTA VERTICAL */}
            <View style={[
                styles.horariosContainer,
                error ? styles.horariosContainerError : styles.horariosContainerNormal
            ]}>
                {/* Renderizar cada día como una sección vertical */}
                {diasSemana.map((dia, diaIndex) => {
                    const selectedCount = getSelectedHoursCount(dia.key);
                    
                    return (
                        <View key={dia.key} style={[
                            styles.diaSection,
                            diaIndex === diasSemana.length - 1 && styles.ultimaDiaSection
                        ]}>
                            {/* Header del día */}
                            <View style={styles.diaHeader}>
                                <View style={styles.diaInfo}>
                                    <Text style={styles.diaNombre}>{dia.label}</Text>
                                    <Text style={[
                                        styles.diaHorasCount,
                                        selectedCount > 0 ? styles.diaHorasCountActive : styles.diaHorasCountInactive
                                    ]}>
                                        {selectedCount}h seleccionadas
                                    </Text>
                                </View>
                                
                                {/* Controles del día */}
                                <View style={styles.diaControles}>
                                    <TouchableOpacity
                                        style={styles.controlButtonTodo}
                                        onPress={() => selectAllDaySchedule(dia.key)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.controlButtonTodoText}>Todo</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity
                                        style={styles.controlButtonLimpiar}
                                        onPress={() => clearDaySchedule(dia.key)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.controlButtonLimpiarText}>Limpiar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Grid de horas para este día */}
                            <View style={styles.horasGrid}>
                                {horasDisponibles.map((hora, horaIndex) => {
                                    const isSelected = isHoraSelected(dia.key, hora);
                                    
                                    return (
                                        <TouchableOpacity
                                            key={`${dia.key}-${hora}`}
                                            style={[
                                                styles.horaButton,
                                                isSelected ? styles.horaButtonSelected : styles.horaButtonUnselected,
                                                // Margins para el grid 3x3
                                                horaIndex < 6 && styles.horaButtonMarginBottom, // Margin bottom excepto última fila
                                            ]}
                                            onPress={() => handleHoraToggle(dia.key, hora)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={[
                                                styles.horaButtonText,
                                                isSelected ? styles.horaButtonTextSelected : styles.horaButtonTextUnselected
                                            ]}>
                                                {hora}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    );
                })}

                {/* Footer con leyenda */}
                <View style={styles.footer}>
                    <View style={styles.leyenda}>
                        <View style={styles.leyendaItem}>
                            <View style={styles.leyendaColorDisponible} />
                            <Text style={styles.leyendaText}>Disponible</Text>
                        </View>
                        <View style={styles.leyendaItem}>
                            <View style={styles.leyendaColorNoDisponible} />
                            <Text style={styles.leyendaText}>No disponible</Text>
                        </View>
                    </View>
                    <Text style={styles.totalText}>
                        Total: {totalHoras} horas
                    </Text>
                </View>
            </View>

            {/* Error message */}
            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color="#DC2626" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        textAlign: 'center',
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    horasIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
    },
    horasIndicatorSuccess: {
        backgroundColor: '#D1FAE5',
        borderWidth: 2,
        borderColor: '#10B981',
    },
    horasIndicatorError: {
        backgroundColor: '#EF4444',
        borderWidth: 2,
        borderColor: '#DC2626',
    },
    horasIndicatorText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
    },
    horasIndicatorTextSuccess: {
        color: '#065F46',
    },
    horasIndicatorTextError: {
        color: '#FFFFFF',
    },
    warningIcon: {
        color: '#FFFFFF',
        fontFamily: 'Lato-Bold',
        fontSize: 16,
    },
    
    // Contenedor principal - VISTA VERTICAL
    horariosContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        // Removida maxHeight para mostrar todo el contenido
    },
    horariosContainerNormal: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    horariosContainerError: {
        borderWidth: 2,
        borderColor: '#DC2626',
    },
    // Removido scrollView style
    
    // Sección de cada día
    diaSection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    ultimaDiaSection: {
        borderBottomWidth: 0,
        paddingBottom: 16, // Padding extra para el último día
    },
    
    // Header de cada día
    diaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    diaInfo: {
        flex: 1,
    },
    diaNombre: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#374151',
        marginBottom: 2,
    },
    diaHorasCount: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
    },
    diaHorasCountActive: {
        color: '#009BBF',
    },
    diaHorasCountInactive: {
        color: '#9CA3AF',
    },
    
    // Controles del día
    diaControles: {
        flexDirection: 'row',
        gap: 8,
    },
    controlButtonTodo: {
        backgroundColor: '#009BBF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: 'center',
    },
    controlButtonTodoText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'Lato-Bold',
    },
    controlButtonLimpiar: {
        backgroundColor: '#6B7280',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: 'center',
    },
    controlButtonLimpiarText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'Lato-Bold',
    },
    
    // Grid de horas (3x3) para cada día
    horasGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    horaButton: {
        width: '31%', // 3 botones por fila con espacios
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 40,
    },
    horaButtonMarginRight: {
        // marginRight ya no es necesario con justifyContent: 'space-between'
    },
    horaButtonMarginBottom: {
        marginBottom: 8,
    },
    horaButtonSelected: {
        backgroundColor: '#009BBF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    horaButtonUnselected: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    horaButtonText: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
    },
    horaButtonTextSelected: {
        color: '#FFFFFF',
    },
    horaButtonTextUnselected: {
        color: '#6B7280',
    },
    
    // Footer fijo
    footer: {
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leyenda: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    leyendaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    leyendaColorDisponible: {
        width: 12,
        height: 12,
        backgroundColor: '#009BBF',
        borderRadius: 3,
    },
    leyendaColorNoDisponible: {
        width: 12,
        height: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 3,
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    leyendaText: {
        fontSize: 11,
        fontFamily: 'Lato-Regular',
        color: '#6B7280',
    },
    totalText: {
        fontSize: 11,
        fontFamily: 'Lato-Regular',
        color: '#6B7280',
    },
    
    // Error
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 4,
        gap: 4,
    },
    errorText: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#DC2626',
        flex: 1,
    },
});

export default HorariosInteractivo;