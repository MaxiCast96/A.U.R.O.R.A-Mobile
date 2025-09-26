import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Alert,
    TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

/**
 * Pantalla de Menú Principal
 * 
 * Esta pantalla muestra todas las operaciones y funcionalidades
 * disponibles en la aplicación, organizadas por secciones como
 * en el sitio web de escritorio.
 * 
 * Funcionalidades:
 * - Búsqueda de operaciones
 * - Secciones organizadas (Personal, Productos, Médico, etc.)
 * - Navegación a diferentes pantallas
 * - Diseño similar a apps móviles modernas
 */
const MenuScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [searchText, setSearchText] = useState('');

    /**
     * Secciones del menú basadas en el sitio web de escritorio
     */
    const menuSections = [
        {
            title: 'PRINCIPAL',
            items: [
                { 
                    icon: 'grid-outline', 
                    title: 'Dashboard', 
                    subtitle: 'Panel de control principal',
                    color: '#009BBF',
                    onPress: () => navigation.navigate('Home')
                }
            ]
        },
        {
            title: 'PERSONAL',
            items: [
                { 
                    icon: 'people-outline', 
                    title: 'Clientes', 
                    subtitle: 'Gestión de clientes',
                    color: '#009BBF',
                    onPress: () => navigation.navigate('Clientes')
                },
                { 
                    icon: 'person-outline', 
                    title: 'Empleados', 
                    subtitle: 'Gestión de empleados',
                    color: '#009BBF',
                    onPress: () => navigation.navigate('Empleados')
                },
                { 
                    icon: 'eye-outline', 
                    title: 'Optometristas', 
                    subtitle: 'Gestión de optometristas',
                    color: '#009BBF',
                    onPress: () => Alert.alert('Optometristas', 'Funcionalidad próximamente')
                }
            ]
        },
        {
            title: 'PRODUCTOS',
            items: [
                { 
                    icon: 'glasses-outline', 
                    title: 'Lentes', 
                    subtitle: 'Catálogo de lentes',
                    color: '#49AA4C',
                    onPress: () => navigation.navigate('Lentes')
                },
                { 
                    icon: 'bag-outline', 
                    title: 'Accesorios', 
                    subtitle: 'Accesorios para lentes',
                    color: '#49AA4C',
                    onPress: () => navigation.navigate('Accesorios') // ← ACTUALIZADO
                },
                { 
                    icon: 'cube-outline', 
                    title: 'Personalizados', 
                    subtitle: 'Productos personalizados',
                    color: '#49AA4C',
                    onPress: () => Alert.alert('Personalizados', 'Funcionalidad próximamente')
                },
                { 
                    icon: 'pricetag-outline', 
                    title: 'Categorías', 
                    subtitle: 'Categorías de productos',
                    color: '#49AA4C',
                    onPress: () => Alert.alert('Categorías', 'Funcionalidad próximamente')
                },
                { 
                    icon: 'business-outline', 
                    title: 'Marcas', 
                    subtitle: 'Marcas disponibles',
                    color: '#49AA4C',
                    onPress: () => Alert.alert('Marcas', 'Funcionalidad próximamente')
                },
                { 
                    icon: 'gift-outline', 
                    title: 'Promociones', 
                    subtitle: 'Ofertas y promociones',
                    color: '#49AA4C',
                    onPress: () => Alert.alert('Promociones', 'Funcionalidad próximamente')
                }
            ]
        },
        {
            title: 'MÉDICO',
            items: [
                { 
                    icon: 'calendar-outline', 
                    title: 'Citas', 
                    subtitle: 'Gestión de citas médicas',
                    color: '#D0155F',
                    onPress: () => navigation.navigate('Citas')
                },
                { 
                    icon: 'document-text-outline', 
                    title: 'Historial Médico', 
                    subtitle: 'Historial de pacientes',
                    color: '#D0155F',
                    onPress: () => Alert.alert('Historial Médico', 'Funcionalidad próximamente')
                },
                { 
                    icon: 'medical-outline', 
                    title: 'Recetas', 
                    subtitle: 'Recetas médicas',
                    color: '#D0155F',
                    onPress: () => Alert.alert('Recetas', 'Funcionalidad próximamente')
                }
            ]
        },
        {
            title: 'ADMINISTRACIÓN',
            items: [
                { 
                    icon: 'storefront-outline', 
                    title: 'Sucursales', 
                    subtitle: 'Gestión de sucursales',
                    color: '#6B7280',
                    onPress: () => Alert.alert('Sucursales', 'Funcionalidad próximamente')
                },
                { 
                    icon: 'analytics-outline', 
                    title: 'Reportes', 
                    subtitle: 'Reportes y estadísticas',
                    color: '#6B7280',
                    onPress: () => Alert.alert('Reportes', 'Funcionalidad próximamente')
                },
                { 
                    icon: 'settings-outline', 
                    title: 'Configuración', 
                    subtitle: 'Configuración del sistema',
                    color: '#6B7280',
                    onPress: () => Alert.alert('Configuración', 'Funcionalidad próximamente')
                }
            ]
        }
    ];

    /**
     * Filtrar elementos basado en la búsqueda
     */
    const getFilteredSections = () => {
        if (!searchText.trim()) {
            return menuSections;
        }

        return menuSections.map(section => ({
            ...section,
            items: section.items.filter(item =>
                item.title.toLowerCase().includes(searchText.toLowerCase()) ||
                item.subtitle.toLowerCase().includes(searchText.toLowerCase())
            )
        })).filter(section => section.items.length > 0);
    };

    /**
     * Renderizar item del menú
     */
    const renderMenuItem = (item, index) => (
        <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
        >
            <View style={styles.menuItemContent}>
                <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                    <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.menuItemText}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </TouchableOpacity>
    );

    /**
     * Renderizar sección del menú
     */
    const renderMenuSection = (section, sectionIndex) => {
        if (section.items.length === 0) return null;

        return (
            <View key={sectionIndex} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.sectionContent}>
                    {section.items.map((item, index) => renderMenuItem(item, index))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Operaciones</Text>
            </View>

            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={20} color="#666666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar..."
                        placeholderTextColor="#999999"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText ? (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={20} color="#666666" />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            {/* Contenido del menú */}
            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Sección destacada - Esenciales */}
                {!searchText && (
                    <View style={styles.essentialsSection}>
                        <Text style={styles.essentialsTitle}>Esenciales Óptica</Text>
                        <View style={styles.essentialsGrid}>

                            <TouchableOpacity 
                                style={styles.essentialItem}
                                onPress={() => navigation.navigate('Citas')}
                            >
                                <View style={[styles.essentialIcon, { backgroundColor: '#D0155F' }]}>
                                    <Ionicons name="calendar-outline" size={24} color="#FFFFFF" />
                                </View>
                                <Text style={styles.essentialText}>Citas</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.essentialItem}
                                onPress={() => navigation.navigate('Clientes')}
                            >
                                <View style={[styles.essentialIcon, { backgroundColor: '#009BBF' }]}>
                                    <Ionicons name="people-outline" size={24} color="#FFFFFF" />
                                </View>
                                <Text style={styles.essentialText}>Clientes</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.essentialItem}
                                onPress={() => navigation.navigate('Lentes')}
                            >
                                <View style={[styles.essentialIcon, { backgroundColor: '#49AA4C' }]}>
                                    <Ionicons name="glasses-outline" size={24} color="#FFFFFF" />
                                </View>
                                <Text style={styles.essentialText}>Lentes</Text>
                            </TouchableOpacity>

                             <TouchableOpacity 
                                style={styles.essentialItem}
                                onPress={() => navigation.navigate('Accesorios')} // ← NUEVO BOTÓN AGREGADO
                            >
                                <View style={[styles.essentialIcon, { backgroundColor: '#FF9800' }]}>
                                    <Ionicons name="bag-outline" size={24} color="#FFFFFF" />
                                </View>
                                <Text style={styles.essentialText}>Accesorios</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Secciones del menú */}
                {getFilteredSections().map((section, index) => renderMenuSection(section, index))}

                {/* Mensaje si no hay resultados */}
                {searchText && getFilteredSections().length === 0 && (
                    <View style={styles.noResultsContainer}>
                        <Ionicons name="search-outline" size={48} color="#CCCCCC" />
                        <Text style={styles.noResultsText}>No se encontraron resultados</Text>
                        <Text style={styles.noResultsSubtext}>
                            Intenta con otros términos de búsqueda
                        </Text>
                    </View>
                )}

                {/* Sección de otras operaciones */}
                {!searchText && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>OTRAS OPERACIONES</Text>
                        <View style={styles.otherOperationsGrid}>
                            <TouchableOpacity style={styles.otherOperationItem}>
                                <View style={[styles.essentialIcon, { backgroundColor: '#009BBF' }]}>
                                    <Ionicons name="card-outline" size={24} color="#FFFFFF" />
                                </View>
                                <Text style={styles.otherOperationText}>Pagos</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.otherOperationItem}>
                                <View style={[styles.essentialIcon, { backgroundColor: '#49AA4C' }]}>
                                    <Ionicons name="receipt-outline" size={24} color="#FFFFFF" />
                                </View>
                                <Text style={styles.otherOperationText}>Facturas</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.otherOperationItem}>
                                <View style={[styles.essentialIcon, { backgroundColor: '#D0155F' }]}>
                                    <Ionicons name="stats-chart-outline" size={24} color="#FFFFFF" />
                                </View>
                                <Text style={styles.otherOperationText}>Reportes</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.otherOperationItem}>
                                <View style={[styles.essentialIcon, { backgroundColor: '#6B7280' }]}>
                                    <Ionicons name="cog-outline" size={24} color="#FFFFFF" />
                                </View>
                                <Text style={styles.otherOperationText}>Ajustes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Espaciador para el tab bar */}
                <View style={styles.spacer} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    essentialsSection: {
        backgroundColor: '#FFFFFF',
        margin: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    essentialsTitle: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    essentialsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    essentialItem: {
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
    },
    essentialIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    essentialText: {
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    section: {
        marginHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'Lato-Bold',
        color: '#666666',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    sectionContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuItemText: {
        flex: 1,
    },
    menuItemTitle: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    menuItemSubtitle: {
        fontSize: 13,
        fontFamily: 'Lato-Regular',
        color: '#666666',
    },
    otherOperationsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    otherOperationItem: {
        alignItems: 'center',
        width: '48%',
        marginBottom: 16,
    },
    otherOperationText: {
        fontSize: 13,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        textAlign: 'center',
        marginTop: 8,
    },
    noResultsContainer: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    noResultsText: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#666666',
        marginTop: 16,
        textAlign: 'center',
    },
    noResultsSubtext: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#999999',
        marginTop: 8,
        textAlign: 'center',
    },
    spacer: {
        height: 40,
    },
});

export default MenuScreen;