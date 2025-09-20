// utils/validators.js

/**
 * Utilidades para validación y formateo de datos
 * Específicamente para el sistema de gestión de clientes de la óptica
 */

/**
 * Formatea automáticamente el DUI mientras el usuario escribe
 * @param {string} value - Valor actual del DUI
 * @returns {string} DUI formateado
 */
export const formatDUI = (value) => {
    // Remover todos los caracteres que no sean números
    const cleanValue = value.replace(/\D/g, '');
    
    // Limitar a 9 dígitos máximo
    const limitedValue = cleanValue.substring(0, 9);
    
    // Agregar guión automáticamente después del 8vo dígito
    if (limitedValue.length > 8) {
        return `${limitedValue.substring(0, 8)}-${limitedValue.substring(8)}`;
    }
    
    return limitedValue;
};

/**
 * Formatea automáticamente el teléfono con prefijo +503
 * @param {string} value - Valor actual del teléfono
 * @returns {string} Teléfono formateado
 */
export const formatTelefono = (value) => {
    // Si está vacío, retornar vacío
    if (!value) return '';
    
    // Si ya tiene +503, trabajar solo con los números después
    let cleanValue = value.replace(/\D/g, '');
    
    // Si empieza con 503, removerlo para evitar duplicación
    if (cleanValue.startsWith('503')) {
        cleanValue = cleanValue.substring(3);
    }
    
    // Limitar a 8 dígitos máximo (números salvadoreños)
    cleanValue = cleanValue.substring(0, 8);
    
    // Retornar con prefijo si hay números
    return cleanValue ? `+503 ${cleanValue}` : '';
};

/**
 * Obtiene solo los números del teléfono (sin +503)
 * @param {string} telefono - Teléfono formateado
 * @returns {string} Solo los 8 dígitos del número
 */
export const getTelefonoNumbers = (telefono) => {
    const cleanValue = telefono.replace(/\D/g, '');
    if (cleanValue.startsWith('503')) {
        return cleanValue.substring(3);
    }
    return cleanValue;
};

/**
 * Valida el formato del DUI salvadoreño
 * @param {string} dui - DUI a validar
 * @returns {boolean} True si es válido
 */
export const validateDUI = (dui) => {
    const duiRegex = /^\d{8}-\d{1}$/;
    return duiRegex.test(dui);
};

/**
 * Valida el formato del teléfono salvadoreño
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean} True si es válido
 */
export const validateTelefono = (telefono) => {
    const numbers = getTelefonoNumbers(telefono);
    return numbers.length === 8 && /^\d{8}$/.test(numbers);
};

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Valida que un campo no esté vacío
 * @param {string} value - Valor a validar
 * @returns {boolean} True si no está vacío
 */
export const validateRequired = (value) => {
    return value && value.toString().trim() !== '';
};

/**
 * Valida edad mínima
 * @param {string|number} edad - Edad a validar
 * @returns {boolean} True si es válida (18 años o más)
 */
export const validateEdad = (edad) => {
    const edadNum = Number(edad);
    return !isNaN(edadNum) && edadNum >= 18 && edadNum <= 120;
};

/**
 * Valida contraseña
 * @param {string} password - Contraseña a validar
 * @returns {boolean} True si es válida (mínimo 6 caracteres)
 */
export const validatePassword = (password) => {
    return password && password.length >= 6;
};

/**
 * Obtiene mensaje de error para un campo específico
 * @param {string} field - Campo a validar
 * @param {any} value - Valor del campo
 * @returns {string|null} Mensaje de error o null si es válido
 */
export const getFieldError = (field, value) => {
    switch (field) {
        case 'nombre':
            return !validateRequired(value) ? 'El nombre es obligatorio' : null;
        case 'apellido':
            return !validateRequired(value) ? 'El apellido es obligatorio' : null;
        case 'edad':
            if (!validateRequired(value)) return 'La edad es obligatoria';
            if (!validateEdad(value)) return 'La edad debe ser entre 18 y 120 años';
            return null;
        case 'dui':
            if (!validateRequired(value)) return 'El DUI es obligatorio';
            if (!validateDUI(value)) return 'El DUI debe tener el formato 12345678-9';
            return null;
        case 'telefono':
            if (!validateRequired(value)) return 'El teléfono es obligatorio';
            if (!validateTelefono(value)) return 'El teléfono debe tener 8 dígitos';
            return null;
        case 'correo':
            if (!validateRequired(value)) return 'El correo es obligatorio';
            if (!validateEmail(value)) return 'Ingresa un correo electrónico válido';
            return null;
        case 'password':
            if (!validateRequired(value)) return 'La contraseña es obligatoria';
            if (!validatePassword(value)) return 'La contraseña debe tener al menos 6 caracteres';
            return null;
        case 'departamento':
            return !validateRequired(value) ? 'El departamento es obligatorio' : null;
        case 'ciudad':
            return !validateRequired(value) ? 'La ciudad es obligatoria' : null;
        default:
            return null;
    }
};