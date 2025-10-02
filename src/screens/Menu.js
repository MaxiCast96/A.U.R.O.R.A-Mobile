import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity,
    TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../utils/i18n';

const MenuScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [searchText, setSearchText] = useState('');
    const { t } = useI18n();

    const menuSections = [
        {
            title: 'PRINCIPAL',
            items: [
                { 
                    icon: 'home-outline', 
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
                    onPress: () => navigation.navigate('Optometristas')
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
                    onPress: () => navigation.navigate('Accesorios')
                },
                { 
                    icon: 'cube-outline', 
                    title: 'Personalizados', 
                    subtitle: 'Productos personalizados',
                    color: '#49AA4C',
                    onPress: () => navigation.navigate('Personalizados')
                },
                { 
                    icon: 'pricetag-outline', 
                    title: 'Categorías', 
                    subtitle: 'Categorías de productos',
                    color: '#49AA4C',
                    onPress: () => navigation.navigate('Categorias')
                },
                { 
                    icon: 'business-outline', 
                    title: 'Marcas', 
                    subtitle: 'Marcas disponibles',
                    color: '#49AA4C',
                    onPress: () => navigation.navigate('Marcas')
                },
                { 
                    icon: 'gift-outline', 
                    title: 'Promociones', 
                    subtitle: 'Ofertas y promociones',
                    color: '#49AA4C',
                    onPress: () => navigation.navigate('Promociones')
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
                    color: '#D01B5F',
                    onPress: () => navigation.navigate('Citas')
                },
                { 
                    icon: 'document-text-outline', 
                    title: 'Historial Médico', 
                    subtitle: 'Historial de pacientes',
                    color: '#D01B5F',
                    onPress: () => navigation.navigate('HistorialMedico')
                },
                { 
                    icon: 'medical-outline', 
                    title: 'Recetas', 
                    subtitle: 'Prescripciones médicas',
                    color: '#D01B5F',
                    onPress: () => navigation.navigate('Recetas')
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
                    onPress: () => navigation.navigate('Sucursales')
                },
                { 
                    icon: 'card-outline', 
                    title: t('sales_title'), 
                    subtitle: t('sales_subtitle'),
                    color: '#6B7280',
                    onPress: () => navigation.navigate('Ventas')
                },
                { 
                    icon: 'stats-chart-outline', 
                    title: t('reports_title'), 
                    subtitle: t('reports_subtitle'),
                    color: '#6B7280',
                    onPress: () => navigation.navigate('Reportes')
                },
                { 
                    icon: 'receipt-outline', 
                    title: t('invoices_title'), 
                    subtitle: t('invoices_subtitle'),
                    color: '#6B7280',
                    onPress: () => navigation.navigate('Facturas')
                },
                { 
                    icon: 'settings-outline', 
                    title: 'Configuración', 
                    subtitle: 'Configuración del sistema',
                    color: '#6B7280',
                    onPress: () => navigation.navigate('Configuracion')
                }
            ]
        }
    ];

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

    const renderMenuItem = (item, index) => (
        <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
        >
            <View style={styles.menuItemContent}>
                <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                    <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.menuItemText}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D0D5DD" />
        </TouchableOpacity>
    );

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
                <Text style={styles.headerTitle}>Menú</Text>
                <Text style={styles.headerSubtitle}>Explora todas las funcionalidades</Text>
            </View>

            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={20} color="#98A2B3" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar funcionalidades..."
                        placeholderTextColor="#98A2B3"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText ? (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={20} color="#98A2B3" />
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
                        <View style={styles.essentialsTitleContainer}>
                            <Text style={styles.essentialsTitle}>Esenciales Óptica</Text>
                        </View>
                        
                        <View style={styles.essentialsGrid}>
                            <TouchableOpacity 
                                style={styles.essentialItem}
                                onPress={() => navigation.navigate('Citas')}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.essentialIconWrapper, styles.shadowEffect]}>
                                    <View style={[styles.essentialIcon, { backgroundColor: '#D01B5F' }]}>
                                        <Ionicons name="calendar" size={28} color="#FFFFFF" />
                                    </View>
                                </View>
                                <Text style={styles.essentialText}>Citas</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.essentialItem}
                                onPress={() => navigation.navigate('Clientes')}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.essentialIconWrapper, styles.shadowEffect]}>
                                    <View style={[styles.essentialIcon, { backgroundColor: '#009BBF' }]}>
                                        <Ionicons name="people" size={28} color="#FFFFFF" />
                                    </View>
                                </View>
                                <Text style={styles.essentialText}>Clientes</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.essentialItem}
                                onPress={() => navigation.navigate('Lentes')}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.essentialIconWrapper, styles.shadowEffect]}>
                                    <View style={[styles.essentialIcon, { backgroundColor: '#49AA4C' }]}>
                                        <Ionicons name="glasses" size={28} color="#FFFFFF" />
                                    </View>
                                </View>
                                <Text style={styles.essentialText}>Lentes</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.essentialItem}
                                onPress={() => navigation.navigate('Reportes')}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.essentialIconWrapper, styles.shadowEffect]}>
                                    <View style={[styles.essentialIcon, { backgroundColor: '#6B7280' }]}>
                                        <Ionicons name="stats-chart" size={28} color="#FFFFFF" />
                                    </View>
                                </View>
                                <Text style={styles.essentialText}>Reportes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Secciones del menú */}
                {getFilteredSections().map((section, index) => renderMenuSection(section, index))}

                {/* Mensaje si no hay resultados */}
                {searchText && getFilteredSections().length === 0 && (
                    <View style={styles.noResultsContainer}>
                        <View style={styles.noResultsIconContainer}>
                            <Ionicons name="search-outline" size={56} color="#D0D5DD" />
                        </View>
                        <Text style={styles.noResultsText}>No se encontraron resultados</Text>
                        <Text style={styles.noResultsSubtext}>
                            Intenta con otros términos de búsqueda
                        </Text>
                    </View>
                )}

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
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 24,
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    headerTitle: {
        fontSize: 32,
        fontFamily: 'Lato-Bold',
        color: '#101828',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 15,
        fontFamily: 'Lato-Regular',
        color: '#667085',
    },
    searchContainer: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: '#FFFFFF',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1.5,
        borderColor: '#EAECF0',
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#101828',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    essentialsSection: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 24,
        marginTop: 24,
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 6,
    },
    essentialsTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    essentialsTitle: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#101828',
        flex: 1,
    },
    essentialsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    essentialItem: {
        alignItems: 'center',
        flex: 1,
    },
    essentialIconWrapper: {
        marginBottom: 10,
    },
    essentialIcon: {
        width: 60,
        height: 60,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shadowEffect: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    essentialText: {
        fontSize: 13,
        fontFamily: 'Lato-Bold',
        color: '#344054',
        textAlign: 'center',
    },
    section: {
        marginHorizontal: 24,
        marginTop: 32,
    },
    sectionTitle: {
        fontSize: 13,
        fontFamily: 'Lato-Bold',
        color: '#667085',
        marginBottom: 16,
        letterSpacing: 1,
    },
    sectionContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F7',
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
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
        color: '#101828',
        marginBottom: 4,
    },
    menuItemSubtitle: {
        fontSize: 13,
        fontFamily: 'Lato-Regular',
        color: '#667085',
        lineHeight: 18,
    },
    noResultsContainer: {
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    noResultsIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#F2F4F7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    noResultsText: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#344054',
        marginBottom: 8,
        textAlign: 'center',
    },
    noResultsSubtext: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#667085',
        textAlign: 'center',
        lineHeight: 20,
    },
    spacer: {
        height: 40,
    },
});

export default MenuScreen;