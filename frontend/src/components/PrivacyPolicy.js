import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ textAlign: 'center' }}>Política de Privacidad</h1>
            <p>Última actualización: 12 de agosto de 2024</p>

            <p>En Zipply Tech, respetamos tu privacidad y estamos comprometidos a protegerla. Es importante destacar que nuestra aplicación no requiere que te registres ni que inicies sesión, y no recopilamos, almacenamos, ni compartimos ninguna información personal o identificable, incluyendo direcciones IP, datos del dispositivo móvil, o cualquier otro tipo de información.</p>

            <h2>1. Información que No Recopilamos</h2>
            <p>Nuestra aplicación no recopila ninguna información personal, incluyendo pero no limitándose a:</p>
            <ul>
                <li>Nombres</li>
                <li>Direcciones de correo electrónico</li>
                <li>Números de teléfono</li>
                <li>Direcciones IP</li>
                <li>Datos del dispositivo móvil (como tipo de dispositivo o sistema operativo)</li>
            </ul>

            <h2>2. Seguridad</h2>
            <p>Dado que no recopilamos ninguna información, no es necesario implementar medidas de seguridad adicionales para proteger datos personales. Sin embargo, seguimos comprometidos con la creación de una experiencia de usuario segura y confiable.</p>

            <h2>3. Cambios a esta Política</h2>
            <p>Nos reservamos el derecho de actualizar esta política de privacidad en cualquier momento. Cualquier cambio se reflejará en esta página, y te recomendamos revisarla periódicamente.</p>

            <h2>4. Contacto</h2>
            <p>Si tienes alguna pregunta sobre nuestra política de privacidad, no dudes en contactarnos en <a href="mailto:support@zipplytech.com">support@zipplytech.com</a>.</p>
        </div>
    );
};

export default PrivacyPolicy;
