import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Animated,
    TouchableOpacity,
    Image,
    Platform,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useHome } from '../hooks/useHome';
import KPICards from '../components/Home/KPICards';
import DashboardCharts from '../components/Home/DashboardCharts';

const HomeScreen = () => {
    const navigation = useNavigation();

    const {
        stats,
        estadoCitas,
        profileData,
        refreshing,
        fadeAnim,
        onRefresh,
        getProfilePhotoUrl,
        getUserName,
        handleCreateLentes,
        handleCreateCita,
        handleCreateReceta,
        handleCreatePromocion
    } = useHome();

    const handleProfilePress = () => {
        navigation.navigate('Profile');
    };

    const renderQuickActionButton = (title, icon, onPress) => (
        <TouchableOpacity
            style={styles.actionCircle}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={['#009BBF', '#007A9A']}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Ionicons name={icon} size={26} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.actionLabel}>{title}</Text>
        </TouchableOpacity>
    );

    const profilePhotoUrl = getProfilePhotoUrl();
    const userName = getUserName();

    return (
        <View style={styles.container}>
            {/* Capa de relleno detrás del header */}
            <View style={styles.headerFiller} />

            {/* Header */}
            <LinearGradient
                colors={['#009BBF', '#007A9A']}
                style={styles.headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.logoContainer}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={require('../../src/assets/Logo-para-fondo-blanco.png')}
                            style={styles.logo}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>

                    <View style={styles.greetingContainer}>
                        <Text style={styles.greetingLabel}>Bienvenido</Text>
                        <Text style={styles.greetingName}>{userName}</Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleProfilePress}
                        activeOpacity={0.8}
                    >
                        <View style={styles.profileImageContainer}>
                            {profilePhotoUrl ? (
                                <Image
                                    source={{ uri: profilePhotoUrl }}
                                    style={styles.profileImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <Ionicons name="person" size={32} color="#009BBF" />
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#009BBF']}
                        tintColor="#009BBF"
                    />
                }
            >
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* KPI Cards */}
                    <KPICards stats={stats} />

                    {/* Acciones Rápidas */}
                    <View style={styles.quickActionsContainer}>
                        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
                        <View style={styles.actionsRow}>
                            {renderQuickActionButton('Crear Lentes', 'glasses-outline', () => handleCreateLentes(navigation))}
                            {renderQuickActionButton('Crear Cita', 'calendar-outline', () => handleCreateCita(navigation))}
                            {renderQuickActionButton('Crear Receta', 'medical-outline', () => handleCreateReceta(navigation))}
                            {renderQuickActionButton('Crear Promoción', 'pricetag-outline', () => handleCreatePromocion(navigation))}
                        </View>
                    </View>

                    {/* Gráfica Circular - Estado de Citas */}
                    <View style={styles.chartsSection}>
                        <DashboardCharts estadoCitas={estadoCitas} />
                    </View>

                    {/* Servicios */}
                    <View style={styles.servicesSection}>
                        <View style={styles.serviceHeader}>
                            <Text style={styles.serviceTitle}>Nuestros Servicios</Text>
                        </View>

                        <View style={styles.serviceCard}>
                            <View style={styles.serviceBadge}>
                                <Ionicons name="eye-outline" size={22} color="#009BBF" />
                            </View>
                            <View style={styles.serviceContent}>
                                <Text style={styles.serviceCardTitle}>Examen de la Vista</Text>
                                <Text style={styles.serviceCardDesc}>
                                    Evaluación completa de tu salud visual con tecnología avanzada
                                </Text>
                            </View>
                        </View>

                        <View style={styles.serviceCard}>
                            <View style={styles.serviceBadge}>
                                <Ionicons name="disc-outline" size={22} color="#009BBF" />
                            </View>
                            <View style={styles.serviceContent}>
                                <Text style={styles.serviceCardTitle}>Lentes de Contacto</Text>
                                <Text style={styles.serviceCardDesc}>
                                    Adaptación personalizada y venta de lentes de contacto
                                </Text>
                            </View>
                        </View>

                        <View style={styles.serviceCard}>
                            <View style={styles.serviceBadge}>
                                <Ionicons name="glasses-outline" size={22} color="#009BBF" />
                            </View>
                            <View style={styles.serviceContent}>
                                <Text style={styles.serviceCardTitle}>Monturas y Lentes</Text>
                                <Text style={styles.serviceCardDesc}>
                                    Amplia variedad de monturas y lentes de alta calidad
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Información de la Óptica */}
                    <View style={styles.infoCardWrapper}>
                        <View style={styles.infoCard}>
                            <View style={styles.infoIconContainer}>
                                <LinearGradient
                                    colors={['#009BBF', '#007A9A']}
                                    style={styles.infoIconGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Ionicons name="storefront-outline" size={28} color="#FFFFFF" />
                                </LinearGradient>
                            </View>

                            <Text style={styles.infoTitle}>Óptica La Inteligente</Text>
                            <Text style={styles.infoText}>
                                Somos especialistas en el cuidado de tu visión.
                                Ofrecemos servicios de calidad con la mejor tecnología
                                para garantizar tu salud visual.
                            </Text>

                            <View style={styles.sloganContainer}>
                                <Text style={styles.sloganText}>
                                    <Text style={styles.sloganGreen}>MIRA BIEN, </Text>
                                    <Text style={styles.sloganPink}>LUCE BIEN</Text>
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.spacer} />
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4F7',
    },
    headerFiller: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: Platform.OS === 'ios' ? 100 : StatusBar.currentHeight + 60,
        backgroundColor: '#009BBF',
        zIndex: 1,
    },
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 2,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logoContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    logo: {
        width: 70,
        height: 70,
    },
    greetingContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    greetingLabel: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#FFFFFF',
        opacity: 0.9,
    },
    greetingName: {
        fontSize: 22,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
        marginTop: 2,
    },
    profileImageContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    profileImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#F0F4F7',
        zIndex: 0,
    },
    quickActionsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionCircle: {
        alignItems: 'center',
    },
    actionGradient: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#009BBF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
    },
    actionLabel: {
        fontSize: 11,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginTop: 8,
        textAlign: 'center',
    },
    chartsSection: {
        paddingBottom: 8,
    },
    servicesSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    serviceHeader: {
        marginBottom: 16,
    },
    serviceTitle: {
        fontSize: 18,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
    },
    serviceCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 155, 191, 0.1)',
        shadowColor: '#009BBF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    serviceBadge: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: '#009BBF15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    serviceContent: {
        flex: 1,
        justifyContent: 'center',
    },
    serviceCardTitle: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 6,
    },
    serviceCardDesc: {
        fontSize: 13,
        fontFamily: 'Lato-Regular',
        color: '#5A6C7D',
        lineHeight: 19,
    },
    infoCardWrapper: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(0, 155, 191, 0.1)',
        shadowColor: '#009BBF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
    },
    infoIconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    infoIconGradient: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#009BBF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
    },
    infoTitle: {
        fontSize: 20,
        fontFamily: 'Lato-Bold',
        color: '#1A1A1A',
        marginBottom: 12,
        textAlign: 'center',
    },
    infoText: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#5A6C7D',
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 20,
    },
    sloganContainer: {
        alignItems: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    sloganText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        textAlign: 'center',
    },
    sloganGreen: {
        color: '#49AA4C',
    },
    sloganPink: {
        color: '#D0155F',
    },
    spacer: {
        height: 100,
    },
});

export default HomeScreen;