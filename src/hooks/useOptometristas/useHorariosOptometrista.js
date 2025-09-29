import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

export const useHorariosOptometrista = (initialDisponibilidad = []) => {
    const [disponibilidad, setDisponibilidad] = useState(initialDisponibilidad);
    const [showLimitAlert, setShowLimitAlert] = useState(false);

    // Días de la semana
    const diasSemana = [
        { key: 'lunes', label: 'Lunes' },
        { key: 'martes', label: 'Martes' },
        { key: 'miercoles', label: 'Miércoles' },
        { key: 'jueves', label: 'Jueves' },
        { key: 'viernes', label: 'Viernes' },
        { key: 'sabado', label: 'Sábado' },
        { key: 'domingo', label: 'Domingo' }
    ];

    // Horas disponibles (8:00 AM a 4:00 PM)
    const horasDisponibles = [
        '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
    ];

    // Normalizar la disponibilidad para trabajar con formato uniforme
    const normalizeDisponibilidad = (disponibilidad) => {
        if (!Array.isArray(disponibilidad)) return [];
        
        const normalized = [];
        disponibilidad.forEach(item => {
            if (item.hora) {
                // Formato nuevo: cada hora individual
                normalized.push({
                    dia: item.dia,
                    hora: item.hora
                });
            } else if (item.horaInicio && item.horaFin) {
                // Formato antiguo: rangos de horas
                const startIndex = horasDisponibles.indexOf(item.horaInicio);
                const endHour = item.horaFin.includes(':00') ? 
                    item.horaFin.split(':')[0] + ':00' : 
                    item.horaFin;
                const endIndex = horasDisponibles.indexOf(endHour);
                
                if (startIndex >= 0 && endIndex > startIndex) {
                    for (let i = startIndex; i < endIndex; i++) {
                        normalized.push({
                            dia: item.dia,
                            hora: horasDisponibles[i]
                        });
                    }
                } else if (startIndex >= 0 && endIndex === -1) {
                    // Solo una hora
                    normalized.push({
                        dia: item.dia,
                        hora: item.horaInicio
                    });
                }
            }
        });
        
        return normalized;
    };

    // Función para verificar si una hora está seleccionada para un día
    const isHoraSelected = (dia, hora) => {
        const normalized = normalizeDisponibilidad(disponibilidad);
        return normalized.some(d => d.dia === dia && d.hora === hora);
    };

    // Función helper para obtener la siguiente hora
    const getNextHour = (hora) => {
        const currentIndex = horasDisponibles.indexOf(hora);
        if (currentIndex >= 0 && currentIndex < horasDisponibles.length - 1) {
            return horasDisponibles[currentIndex + 1];
        }
        if (hora === '16:00') {
            return '17:00';
        }
        // Para la última hora, agregar 1 hora más
        const [hourPart] = hora.split(':');
        return `${parseInt(hourPart) + 1}:00`;
    };

    // Función mejorada para manejar selección de horas individuales
    const handleHoraToggle = (dia, hora) => {
        const normalized = normalizeDisponibilidad(disponibilidad);
        
        // Buscar si ya existe esta combinación día-hora
        const existingIndex = normalized.findIndex(item => 
            item.dia === dia && item.hora === hora
        );
        
        let newDisponibilidad;
        if (existingIndex >= 0) {
            // Si ya existe, la removemos (toggle off)
            newDisponibilidad = normalized.filter((_, index) => index !== existingIndex);
        } else {
            // Verificar límite de 44 horas semanales antes de agregar
            if (normalized.length >= 44) {
                showHourLimitAlert();
                return;
            }
            // Si no existe, la agregamos (toggle on)
            newDisponibilidad = [...normalized, { dia, hora }];
        }
        
        // Convertir de vuelta al formato esperado por el backend
        const backendFormat = newDisponibilidad.map(item => ({
            dia: item.dia,
            hora: item.hora,
            horaInicio: item.hora,
            horaFin: getNextHour(item.hora)
        }));
        
        setDisponibilidad(backendFormat);
    };

    // Función para contar horas seleccionadas por día
    const getSelectedHoursCount = (dia) => {
        const normalized = normalizeDisponibilidad(disponibilidad);
        return normalized.filter(d => d.dia === dia).length;
    };

    // Función para limpiar todos los horarios de un día
    const clearDaySchedule = (dia) => {
        const normalized = normalizeDisponibilidad(disponibilidad);
        const filteredNormalized = normalized.filter(item => item.dia !== dia);
        
        // Convertir de vuelta al formato del backend
        const backendFormat = filteredNormalized.map(item => ({
            dia: item.dia,
            hora: item.hora,
            horaInicio: item.hora,
            horaFin: getNextHour(item.hora)
        }));
        
        setDisponibilidad(backendFormat);
    };

    // Función para seleccionar todas las horas de un día
    const selectAllDaySchedule = (dia) => {
        const normalized = normalizeDisponibilidad(disponibilidad);
        // Remover cualquier horario existente para este día
        const filteredNormalized = normalized.filter(item => item.dia !== dia);
        
        // Calcular cuántas horas ya están ocupadas sin este día
        const horasOcupadas = filteredNormalized.length;
        
        // Calcular cuántas horas podemos agregar sin superar 44
        const horasDisponiblesParaAgregar = 44 - horasOcupadas;
        
        // Si no hay espacio para ninguna hora, mostrar alerta y salir
        if (horasDisponiblesParaAgregar <= 0) {
            showHourLimitAlert();
            return;
        }
        
        // Determinar cuántas horas agregar (máximo las disponibles en el día o las que quepan)
        const horasAgregar = Math.min(horasDisponibles.length, horasDisponiblesParaAgregar);
        
        // Agregar las horas que quepan para este día
        const newHorarios = horasDisponibles.slice(0, horasAgregar).map(hora => ({ dia, hora }));
        const allHorarios = [...filteredNormalized, ...newHorarios];
        
        // Convertir al formato del backend
        const backendFormat = allHorarios.map(item => ({
            dia: item.dia,
            hora: item.hora,
            horaInicio: item.hora,
            horaFin: getNextHour(item.hora)
        }));
        
        setDisponibilidad(backendFormat);
        
        // Si no se pudieron agregar todas las horas del día, mostrar alerta
        if (horasAgregar < horasDisponibles.length) {
            showHourLimitAlert();
        }
    };

    // Función para mostrar alerta de límite de horas
    const showHourLimitAlert = () => {
        setShowLimitAlert(true);
        Alert.alert(
            'Límite de horas alcanzado',
            'Máximo 44 horas semanales por optometrista',
            [{ text: 'Entendido', onPress: () => setShowLimitAlert(false) }]
        );
    };

    // Obtener total de horas semanales
    const getTotalHoras = () => {
        return normalizeDisponibilidad(disponibilidad).length;
    };

    // Función para obtener las horas de un día específico
    const getHorasByDay = (dia) => {
        const normalized = normalizeDisponibilidad(disponibilidad);
        const horas = normalized
            .filter(d => d.dia === dia)
            .map(d => d.hora)
            .filter(hora => hora && horasDisponibles.includes(hora));
        
        // Ordenar por el índice en horasDisponibles para mantener el orden correcto
        return horas.sort((a, b) => {
            const indexA = horasDisponibles.indexOf(a);
            const indexB = horasDisponibles.indexOf(b);
            return indexA - indexB;
        });
    };

    // Función para validar horarios
    const validateHorarios = () => {
        const totalHoras = getTotalHoras();
        
        if (totalHoras === 0) {
            return 'Debe configurar al menos una hora de disponibilidad';
        }
        
        if (totalHoras > 44) {
            return 'No puede exceder las 44 horas semanales';
        }
        
        return null; // Sin errores
    };

    // Limpiar todos los horarios
    const clearAllSchedules = () => {
        setDisponibilidad([]);
    };

    // Efecto para sincronizar con disponibilidad inicial
    useEffect(() => {
        if (Array.isArray(initialDisponibilidad) && initialDisponibilidad.length > 0) {
            setDisponibilidad(initialDisponibilidad);
        }
    }, [initialDisponibilidad]);

    return {
        // Estados
        disponibilidad,
        setDisponibilidad,
        showLimitAlert,
        
        // Constantes
        diasSemana,
        horasDisponibles,
        
        // Funciones de verificación
        isHoraSelected,
        getSelectedHoursCount,
        getTotalHoras,
        getHorasByDay,
        validateHorarios,
        
        // Funciones de manipulación
        handleHoraToggle,
        clearDaySchedule,
        selectAllDaySchedule,
        clearAllSchedules,
        
        // Utilidades
        normalizeDisponibilidad,
        showHourLimitAlert
    };
};