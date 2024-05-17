import { jwtDecode } from 'jwt-decode';

/**
 * Decodifica el token JWT guardado en sessionStorage y retorna el rol del usuario.
 * @returns {string|null} Aquí retorna el rol del usuario, si no lo obtiene lo pone en Null.
 */
export function getRoleFromJWT() {
    const token = sessionStorage.getItem('jwt');
    if (!token) {
        console.error('No JWT token found in sessionStorage');
        return null;
    }
    try {
        const decoded = jwtDecode(token);
        return decoded.role;
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
}

  