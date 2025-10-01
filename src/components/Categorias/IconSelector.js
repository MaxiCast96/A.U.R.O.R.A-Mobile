import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    TextInput,
    FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Lista de iconos disponibles (similar a los de Lucide)
const AVAILABLE_ICONS = [
    'cube-outline', 'cube', 'shirt-outline', 'shirt',
    'fast-food-outline', 'fast-food', 'home-outline', 'home',
    'car-outline', 'car', 'desktop-outline', 'desktop',
    'phone-portrait-outline', 'phone-portrait', 'book-outline', 'book',
    'musical-notes-outline', 'musical-notes', 'fitness-outline', 'fitness',
    'basketball-outline', 'basketball', 'game-controller-outline', 'game-controller',
    'camera-outline', 'camera', 'tvOutline', 'tv',
    'watch-outline', 'watch', 'glasses-outline', 'glasses',
    'bag-outline', 'bag', 'briefcase-outline', 'briefcase',
    'gift-outline', 'gift', 'heart-outline', 'heart',
    'star-outline', 'star', 'diamond-outline', 'diamond',
    'leaf-outline', 'leaf', 'rose-outline', 'rose',
    'pizza-outline', 'pizza', 'beer-outline', 'beer',
    'cafe-outline', 'cafe', 'restaurant-outline', 'restaurant',
    'ice-cream-outline', 'ice-cream', 'nutrition-outline', 'nutrition',
    'medkit-outline', 'medkit', 'fitness', 'body-outline',
    'bicycle-outline', 'bicycle', 'barbell-outline', 'barbell',
    'construct-outline', 'construct', 'hardware-chip-outline', 'hardware-chip',
    'build-outline', 'build', 'color-palette-outline', 'color-palette',
    'brush-outline', 'brush', 'cut-outline', 'cut',
    'images-outline', 'images', 'film-outline', 'film',
    'school-outline', 'school', 'library-outline', 'library',
    'balloon-outline', 'balloon', 'footsteps-outline', 'footsteps'
];

const IconSelector = ({ visible, selectedIcon, onSelect, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredIcons = AVAILABLE_ICONS.filter(icon =>
        icon.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderIconItem = ({ item }) => {
        const isSelected = item === selectedIcon;
        
        return (
            <TouchableOpacity
                style={[
                    styles.iconItem,
                    isSelected && styles.iconItemSelected
                ]}
                onPress={() => onSelect(item)}
            >
                <Ionicons 
                    name={item} 
                    size={32} 
                    color={isSelected ? '#009BBF' : '#1A1A1A'} 
                />
                <Text 
                    style={[
                        styles.iconName,
                        isSelected && styles.iconNameSelected
                    ]}
                    numberOfLines={1}
                >
                    {item}
                </Text>
            </TouchableOpacity>
        );
    };

    const handleClose = () => {
        setSearchQuery('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Ionicons name="grid" size={24} color="#FFFFFF" />
                        <Text style={styles.headerTitle}>Seleccionar Icono</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={handleClose}
                    >
                        <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666666" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar icono..."
                        placeholderTextColor="#999999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#666666" />
                        </TouchableOpacity>
                    )}
                </View>

                <FlatList
                    data={filteredIcons}
                    renderItem={renderIconItem}
                    keyExtractor={(item) => item}
                    numColumns={4}
                    contentContainerStyle={styles.iconGrid}
                    showsVerticalScrollIndicator={false}
                />

                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={styles.confirmButton}
                        onPress={handleClose}
                    >
                        <Text style={styles.confirmButtonText}>Confirmar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        backgroundColor: '#009BBF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        margin: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#1A1A1A',
    },
    iconGrid: {
        padding: 8,
    },
    iconItem: {
        flex: 1,
        aspectRatio: 1,
        margin: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E5E5E5',
        padding: 8,
    },
    iconItemSelected: {
        borderColor: '#009BBF',
        backgroundColor: '#009BBF15',
    },
    iconName: {
        fontSize: 10,
        fontFamily: 'Lato-Regular',
        color: '#666666',
        marginTop: 4,
        textAlign: 'center',
    },
    iconNameSelected: {
        color: '#009BBF',
        fontFamily: 'Lato-Bold',
    },
    footer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    confirmButton: {
        backgroundColor: '#009BBF',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 16,
        fontFamily: 'Lato-Bold',
        color: '#FFFFFF',
    },
});

export default IconSelector;