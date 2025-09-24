/**
 * Utilidades de validación para formularios de lentes
 * 
 * Contiene todas las funciones de validación necesarias para los campos
 * específicos de lentes, incluyendo medidas, precios, y datos generales.
 */

/**
 * Validar nombre del lente
 * @param {string} nombre - Nombre a validar
 * @returns {string|null} Error o null si es válido
 */
export const validateNombreLente = (nombre) => {
    if (!nombre || nombre.trim().length === 0) {
        return 'El nombre del lente es requerido';
    }
    
    if (nombre.trim().length < 2) {
        return 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (nombre.trim().length > 100) {
        return 'El nombre no puede exceder 100 caracteres';
    }
    
    return null;
};

/**
 * Validar descripción del lente
 * @param {string} descripcion - Descripción a validar
 * @returns {string|null} Error o null si es válido
 */
export const validateDescripcionLente = (descripcion) => {
    if (!descripcion || descripcion.trim().length === 0) {
        return 'La descripción es requerida';
    }
    
    if (descripcion.trim().length < 10) {
        return 'La descripción debe tener al menos 10 caracteres';
    }
    
    if (descripcion.trim().length > 500) {
        return 'La descripción no puede exceder 500 caracteres';
    }
    
    return null;
};

/**
 * Validar precio
 * @param {string|number} precio - Precio a validar
 * @param {string} campo - Nombre del campo para el mensaje de error
 * @returns {string|null} Error o null si es válido
 */
export const validatePrecio = (precio, campo = 'precio') => {
    if (!precio && precio !== 0) {
        return `El ${campo} es requerido`;
    }
    
    const precioNum = parseFloat(precio);
    
    if (isNaN(precioNum)) {
        return `El ${campo} debe ser un número válido`;
    }
    
    if (precioNum <= 0) {
        return `El ${campo} debe ser mayor a 0`;
    }
    
    if (precioNum > 99999.99) {
        return `El ${campo} no puede exceder $99,999.99`;
    }
    
    // Validar que tenga máximo 2 decimales
    const decimalPart = precio.toString().split('.')[1];
    if (decimalPart && decimalPart.length > 2) {
        return `El ${campo} puede tener máximo 2 decimales`;
    }
    
    return null;
};

/**
 * Validar medida
 * @param {string|number} medida - Medida a validar
 * @param {string} campo - Nombre del campo para el mensaje de error
 * @param {number} min - Valor mínimo permitido
 * @param {number} max - Valor máximo permitido
 * @returns {string|null} Error o null si es válido
 */
export const validateMedida = (medida, campo, min = 0.1, max = 999.9) => {
    if (!medida && medida !== 0) {
        return `${campo} es requerido`;
    }
    
    const medidaNum = parseFloat(medida);
    
    if (isNaN(medidaNum)) {
        return `${campo} debe ser un número válido`;
    }
    
    if (medidaNum < min) {
        return `${campo} debe ser mayor a ${min}mm`;
    }
    
    if (medidaNum > max) {
        return `${campo} no puede exceder ${max}mm`;
    }
    
    // Validar que tenga máximo 2 decimales
    const decimalPart = medida.toString().split('.')[1];
    if (decimalPart && decimalPart.length > 2) {
        return `${campo} puede tener máximo 2 decimales`;
    }
    
    return null;
};

/**
 * Validar ancho del puente
 * @param {string|number} anchoPuente - Ancho del puente a validar
 * @returns {string|null} Error o null si es válido
 */
export const validateAnchoPuente = (anchoPuente) => {
    return validateMedida(anchoPuente, 'El ancho del puente', 10, 30);
};

/**
 * Validar altura del lente
 * @param {string|number} altura - Altura a validar
 * @returns {string|null} Error o null si es válido
 */
export const validateAltura = (altura) => {
    return validateMedida(altura, 'La altura', 20, 80);
};

/**
 * Validar ancho total
 * @param {string|number} ancho - Ancho total a validar
 * @returns {string|null} Error o null si es válido
 */
export const validateAnchoTotal = (ancho) => {
    return validateMedida(ancho, 'El ancho total', 100, 200);
};

/**
 * Validar precio base vs precio actual
 * @param {string|number} precioBase - Precio base
 * @param {string|number} precioActual - Precio actual
 * @returns {string|null} Error o null si es válido
 */
export const validatePrecios = (precioBase, precioActual) => {
    const base = parseFloat(precioBase);
    const actual = parseFloat(precioActual);
    
    if (isNaN(base) || isNaN(actual)) {
        return null; // Las validaciones individuales se encargan de esto
    }
    
    if (actual > base) {
        return 'El precio actual no puede ser mayor al precio base';
    }
    
    return null;
};

/**
 * Validar stock
 * @param {string|number} stock - Stock a validar
 * @returns {string|null} Error o null si es válido
 */
export const validateStock = (stock) => {
    if (stock === '' || stock === null || stock === undefined) {
        return null; // Stock puede ser 0 o vacío
    }
    
    const stockNum = parseInt(stock);
    
    if (isNaN(stockNum)) {
        return 'El stock debe ser un número entero';
    }
    
    if (stockNum < 0) {
        return 'El stock no puede ser negativo';
    }
    
    if (stockNum > 9999) {
        return 'El stock no puede exceder 9999 unidades';
    }
    
    return null;
};

/**
 * Validar fecha de creación
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {string|null} Error o null si es válido
 */
export const validateFechaCreacion = (fecha) => {
    if (!fecha) {
        return 'La fecha de creación es requerida';
    }
    
    const fechaObj = new Date(fecha);
    const hoy = new Date();
    
    if (isNaN(fechaObj.getTime())) {
        return 'La fecha debe tener un formato válido';
    }
    
    if (fechaObj > hoy) {
        return 'La fecha de creación no puede ser futura';
    }
    
    // Validar que no sea muy antigua (más de 50 años)
    const cincuentaAnosAtras = new Date();
    cincuentaAnosAtras.setFullYear(hoy.getFullYear() - 50);
    
    if (fechaObj < cincuentaAnosAtras) {
        return 'La fecha de creación no puede ser anterior a 50 años';
    }
    
    return null;
};

/**
 * Validar selección requerida (para dropdowns)
 * @param {string} valor - Valor seleccionado
 * @param {string} campo - Nombre del campo para el mensaje de error
 * @returns {string|null} Error o null si es válido
 */
export const validateSeleccionRequerida = (valor, campo) => {
    if (!valor || valor === '') {
        return `${campo} es requerido`;
    }
    
    return null;
};

/**
 * Función principal para validar un campo específico de lente
 * @param {string} campo - Nombre del campo
 * @param {any} valor - Valor a validar
 * @param {any} valores - Objeto con todos los valores para validaciones cruzadas
 * @returns {string|null} Error o null si es válido
 */
export const getFieldError = (campo, valor, valores = {}) => {
    switch (campo) {
        case 'nombre':
            return validateNombreLente(valor);
            
        case 'descripcion':
            return validateDescripcionLente(valor);
            
        case 'categoriaId':
            return validateSeleccionRequerida(valor, 'La categoría');
            
        case 'marcaId':
            return validateSeleccionRequerida(valor, 'La marca');
            
        case 'material':
            return validateSeleccionRequerida(valor, 'El material');
            
        case 'color':
            return validateSeleccionRequerida(valor, 'El color');
            
        case 'tipoLente':
            return validateSeleccionRequerida(valor, 'El tipo de lente');
            
        case 'linea':
            return validateSeleccionRequerida(valor, 'La línea');
            
        case 'anchoPuente':
            return validateAnchoPuente(valor);
            
        case 'altura':
            return validateAltura(valor);
            
        case 'ancho':
            return validateAnchoTotal(valor);
            
        case 'precioBase':
            return validatePrecio(valor, 'precio base');
            
        case 'precioActual':
            const errorPrecio = validatePrecio(valor, 'precio actual');
            if (errorPrecio) return errorPrecio;
            
            // Validación cruzada con precio base
            if (valores.precioBase) {
                return validatePrecios(valores.precioBase, valor);
            }
            return null;
            
        case 'stock':
            return validateStock(valor);
            
        case 'fechaCreacion':
            return validateFechaCreacion(valor);
            
        default:
            return null;
    }
};

/**
 * Validar formulario completo de lente
 * @param {Object} datos - Objeto con todos los datos del formulario
 * @returns {Object} Objeto con errores por campo
 */
export const validateLenteForm = (datos) => {
    const errores = {};
    
    // Campos requeridos
    const camposRequeridos = [
        'nombre', 'descripcion', 'categoriaId', 'marcaId', 
        'material', 'color', 'tipoLente', 'linea',
        'anchoPuente', 'altura', 'ancho', 
        'precioBase', 'precioActual', 'fechaCreacion'
    ];
    
    camposRequeridos.forEach(campo => {
        const error = getFieldError(campo, datos[campo], datos);
        if (error) {
            errores[campo] = error;
        }
    });
    
    return errores;
};

/**
 * Formatear precio para mostrar
 * @param {number} precio - Precio a formatear
 * @returns {string} Precio formateado
 */
export const formatPrecio = (precio) => {
    if (!precio && precio !== 0) return '$0.00';
    return `$${parseFloat(precio).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Formatear medida para mostrar
 * @param {number} medida - Medida a formatear
 * @returns {string} Medida formateada
 */
export const formatMedida = (medida) => {
    if (!medida && medida !== 0) return '0mm';
    return `${parseFloat(medida).toFixed(1)}mm`;
};