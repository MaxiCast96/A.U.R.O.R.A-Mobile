import React, { createContext, useContext, useState } from 'react';

const ScrollContext = createContext();

export const useScroll = () => {
    const context = useContext(ScrollContext);
    if (!context) {
        throw new Error('useScroll must be used within a ScrollProvider');
    }
    return context;
};

export const ScrollProvider = ({ children }) => {
    const [isTabBarVisible, setIsTabBarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const handleScroll = (scrollY) => {
        const threshold = 10;
        const scrollDiff = scrollY - lastScrollY;
        
        if (Math.abs(scrollDiff) > threshold) {
            if (scrollDiff > 0 && isTabBarVisible) {
                // Scroll hacia abajo - ocultar
                setIsTabBarVisible(false);
            } else if (scrollDiff < 0 && !isTabBarVisible) {
                // Scroll hacia arriba - mostrar
                setIsTabBarVisible(true);
            }
        }
        setLastScrollY(scrollY);
    };

    const value = {
        isTabBarVisible,
        handleScroll,
    };

    return (
        <ScrollContext.Provider value={value}>
            {children}
        </ScrollContext.Provider>
    );
}; 