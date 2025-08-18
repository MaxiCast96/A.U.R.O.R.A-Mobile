import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    RefreshControl, 
    Alert,
    TouchableOpacity,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Importación de componentes separados
import CitaCard from '../components/Citas/CitaCard';
import CitaDetailModal from '../components/Citas/CitaDetailModal';
import EmptyState from '../components/Citas/EmptyState';
import FilterSearchBar from '../components/Citas/FiltrerSearchBar';

/**
 * Pantalla de Citas Renovada
 * 
 * Esta pantalla muestra las citas programadas en la óptica con un diseño
 * moderno y elegante, siguiendo la estética de la aplicación.
 * Incluye vista rápida de citas, modal de detalle completo, filtros y búsqueda.
 * 
 * Funcionalidades principales:
 * - Lista de citas con diseño moderno y tarjetas elegantes
 * - 5 estados de citas: Agendada, Pendiente, Confirmada, Cancelada, Completada
 * - Vista rápida de información esencial de cada cita
 * - Modal de detalle completo con toda la información
 * - Filtros de ordenamiento: Más reciente, Más próxima, Más lejana
 * - Búsqueda por motivo de cita
 * - Pull to refresh para actualizar datos
 * - Estados de carga, error y lista vacía
 * - Integración con la paleta de colores y tipografía Lato
 */
const Citas = () => {
    const { getAuthHeaders } = useAuth();
    
    // Estados principales
    const [citas, setCitas] = useState([]);
    const [filteredCitas, setFilteredCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Estados del modal de detalle
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCita, setSelectedCita] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Estados de filtros y búsqueda
    const [searchText, setSearchText] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('reciente');

    /**
     * Función para cargar citas desde el backend
     * Incluye manejo de errores y estados de carga
     */
    const loadCitas = async () => {
        try {
            setLoading(true);
            
            const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/citas', {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                setCitas(data);
            } else {
                Alert.alert(
                    'Error de conexión', 
                    'No se pudieron cargar las citas. Verifica tu conexión a internet.',
                    [{ text: 'Entendido', style: 'default' }]
                );
            }
        } catch (error) {
            console.error('Error al cargar citas:', error);
            Alert.alert(
                'Error de red', 
                'Hubo un problema al conectar con el servidor. Intenta nuevamente.',
                [{ text: 'Reintentar', onPress: loadCitas, style: 'default' }]
            );
        } finally {
            setLoading(false);
        }
    };

    /**
     * Función para refrescar la lista mediante pull-to-refresh
     * Proporciona feedback visual al usuario durante la actualización
     */
    const onRefresh = async () => {
        setRefreshing(true);
        await loadCitas();
        setRefreshing(false);
    };

    /**
     * Función para abrir el modal de detalle de una cita
     * @param {Object} cita - Objeto con los datos de la cita
     * @param {number} index - Índice de la cita en la lista filtrada
     */
    const handleViewMore = (cita, index) => {
        setSelectedCita(cita);
        setSelectedIndex(index);
        setModalVisible(true);
    };

    /**
     * Función para cerrar el modal de detalle
     */
    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedCita(null);
        setSelectedIndex(0);
    };

    /**
     * Función para filtrar y ordenar citas según búsqueda y filtros seleccionados
     */
    const filterAndSortCitas = () => {
        let filtered = [...citas];

        // Aplicar filtro de búsqueda por motivo de cita
        if (searchText.trim()) {
            filtered = filtered.filter(cita => 
                cita.motivoCita?.toLowerCase().includes(searchText.toLowerCase().trim())
            );
        }

        // Aplicar ordenamiento según filtro seleccionado
        switch (selectedFilter) {
            case 'reciente':
                // Ordenar por fecha de creación (más reciente primero)
                // Si no hay campo de creación, usar fecha de cita
                filtered.sort((a, b) => {
                    const dateA = new Date(a.fecha || a.createdAt);
                    const dateB = new Date(b.fecha || b.createdAt);
                    return dateB - dateA;
                });
                break;
            
            case 'proxima':
                // Ordenar por fecha de cita (más próxima primero)
                filtered.sort((a, b) => {
                    const dateA = new Date(a.fecha);
                    const dateB = new Date(b.fecha);
                    return dateA - dateB;
                });
                break;
            
            case 'lejana':
                // Ordenar por fecha de cita (más lejana primero)
                filtered.sort((a, b) => {
                    const dateA = new Date(a.fecha);
                    const dateB = new Date(b.fecha);
                    return dateB - dateA;
                });
                break;
            
            default:
                // Por defecto, más reciente
                filtered.sort((a, b) => {
                    const dateA = new Date(a.fecha || a.createdAt);
                    const dateB = new Date(b.fecha || b.createdAt);
                    return dateB - dateA;
                });
        }

        return filtered;
    };

    /**
     * Obtener estadísticas rápidas de las citas con los 5 estados
     */
    const getCitasStats = () => {
        const total = citas.length;
        const agendadas = citas.filter(cita => cita.estado?.toLowerCase() === 'agendada').length;
        const pendientes = citas.filter(cita => cita.estado?.toLowerCase() === 'pendiente').length;
        const confirmadas = citas.filter(cita => cita.estado?.toLowerCase() === 'confirmada').length;
        const canceladas = citas.filter(cita => cita.estado?.toLowerCase() === 'cancelada').length;
        const completadas = citas.filter(cita => 
            cita.estado?.toLowerCase() === 'completada' || 
            cita.estado?.toLowerCase() === 'completado'
        ).length;
        
        return { total, agendadas, pendientes, confirmadas, canceladas, completadas };
    };

    /**
     * Efecto para actualizar la lista filtrada cuando cambian los datos, búsqueda o filtros
     */
    useEffect(() => {
        const filtered = filterAndSortCitas();
        setFilteredCitas(filtered);
    }, [citas, searchText, selectedFilter]);

    /**
     * Cargar citas al montar el componente
     */
    useEffect(() => {
        loadCitas();
    }, []);

    /**
     * Renderizar cada tarjeta de cita
     */
    const renderCitaItem = ({ item, index }) => (
        <CitaCard 
            cita={item}
            index={index}
            onPress={handleViewMore}
        />
    );

    const stats = getCitasStats();

    return (
        <View style={styles.container}>
            {/* Configuración de la barra de estado */}
            <StatusBar barStyle="light-content" backgroundColor="#009BBF" />
            
            {/* Header principal con gradiente */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.headerText}>
                        <Text style={styles.headerTitle}>Citas Programadas</Text>
                        <Text style={styles.headerSubtitle}>
                            Gestiona todas las citas de la óptica
                        </Text>
                    </View>
                    
                    {/* Ícono decorativo del header */}
                    <View style={styles.headerIcon}>
                        <Ionicons name="calendar" size={28} color="#FFFFFF" />
                    </View>
                </View>
                
                {/* Estadísticas rápidas con 5 estados */}
                {!loading && stats.total > 0 && (
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.total}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.pendientes}</Text>
                            <Text style={styles.statLabel}>Pendientes</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.confirmadas}</Text>
                            <Text style={styles.statLabel}>Confirmadas</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.completadas}</Text>
                            <Text style={styles.statLabel}>Completadas</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Barra de filtros y búsqueda */}
            <FilterSearchBar
                searchText={searchText}
                onSearchChange={setSearchText}
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
            />
            
            {/* Lista de citas */}
            <FlatList
                data={filteredCitas}
                keyExtractor={(item, index) => (item._id ? item._id.toString() : `cita-${index}`)}
                renderItem={renderCitaItem}
                contentContainerStyle={[
                    styles.listContainer,
                    filteredCitas.length === 0 && styles.emptyListContainer
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#009BBF']}
                        tintColor="#009BBF"
                        title="Actualizando citas..."
                        titleColor="#666666"
                    />
                }
                ListEmptyComponent={() => {
                    // Mostrar diferentes mensajes según si hay búsqueda activa o no
                    if (searchText.trim()) {
                        return (
                            <EmptyState 
                                title="No se encontraron citas"
                                subtitle={`No hay citas que coincidan con "${searchText}"`}
                                icon="search-outline"
                            />
                        );
                    }
                    return (
                        <EmptyState 
                            title="No hay citas programadas"
                            subtitle="Las nuevas citas aparecerán aquí cuando sean agendadas"
                            icon="calendar-outline"
                        />
                    );
                }}
                showsVerticalScrollIndicator={false}
                bounces={true}
                style={styles.list}
            />

            {/* Modal de detalle de cita */}
            <CitaDetailModal
                visible={modalVisible}
                cita={selectedCita}
                index={selectedIndex}
                onClose={handleCloseModal}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal de la pantalla
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    
    // Header principal con diseño moderno
    header: {
        backgroundColor: '#009BBF',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    
    // Contenido del header
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    
    // Texto del header
    headerText: {
        flex: 1,
    },
    
    // Título principal del header
    headerTitle: {
        fontSize: 24,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    
    // Subtítulo del header
    headerSubtitle: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#E0F7FF',
        opacity: 0.9,
    },
    
    // Ícono decorativo del header
    headerIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 16,
    },
    
    // Contenedor de estadísticas expandido para 5 estados
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    
    // Item individual de estadística
    statItem: {
        alignItems: 'center',
        flex: 1,
        paddingHorizontal: 1,
    },
    
    // Número de la estadística
    statNumber: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    
    // Etiqueta de la estadística
    statLabel: {
        fontSize: 10,
        fontFamily: 'Lato-Regular',
        color: '#E0F7FF',
        opacity: 0.9,
        textAlign: 'center',
    },
    
    // Divisor entre estadísticas
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 8,
    },
    
    // Lista principal
    list: {
        flex: 1,
    },
    
    // Contenedor de la lista
    listContainer: {
        padding: 16,
        paddingBottom: 100, // Espacio para el tab bar
    },
    
    // Contenedor cuando la lista está vacía
    emptyListContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
});

export default Citas;

