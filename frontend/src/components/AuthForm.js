import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Button,
    Paper,
    TextField,
    Link,
    CssBaseline,
    Avatar,
    Grid,
    Box
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { animated, useTransition } from 'react-spring';

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [message, setMessage] = useState('');

    const transitions = useTransition(isLogin, {
        from: { transform: 'translate3d(100%,0,0)' },
        enter: { transform: 'translate3d(0%,0,0)' },
    });

    const toggleForm = (e) => {
        e.preventDefault();
        setIsLogin(!isLogin);
        setMessage(''); // Limpiar mensaje al cambiar entre inicio de sesión y registro
    };

    useEffect(() => {
        if (isLogin) {
            document.getElementById('username').focus();
        }
    }, [isLogin]);    

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form Data:', formData);
        const { username, password } = formData;
        const endpoint = isLogin ? '/api/users/login' : '/api/users/register';

        try {
            const response = await fetch(`https://loteria.zipply.app${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);

                if (data.success && isLogin) {
                    // Guarda el token en sessionStorage
                    sessionStorage.setItem('jwt', data.token);

                    console.log("Intentando redireccionar al dashboard...");
                    window.location.href = '/#/dashboard';
                }
            }

            // Limpiar el formulario después de la respuesta
            setFormData({ username: '', password: '' });
        } catch (error) {
            console.error(error);
            // Manejar errores de solicitud
            setMessage('Error de conexión');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`handleChange - name: ${name}, value: ${value}`);
        setFormData({
            ...formData,
            [name]: value,
        });
    };


    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            {transitions((style, item) => (
                <animated.div style={style}>
                    <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                            <LockOutlined />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            {item ? 'Iniciar sesión' : 'Registrarse'}
                        </Typography>
                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        autoComplete="username"
                                        name="username"
                                        required
                                        fullWidth
                                        id="username"
                                        label="Nombre de usuario"
                                        autoFocus
                                        value={formData.username}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="password"
                                        label="Contraseña"
                                        type="password"
                                        id="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        autoComplete="current-password"
                                    />
                                </Grid>
                            </Grid>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
                            >
                                {item ? 'Iniciar sesión' : 'Registrarse'}
                            </Button>
                            <Grid container justifyContent="flex-end">
                                <Grid item>
                                    <Link component="button" variant="body2" onClick={toggleForm}>
                                        {item ? '¿No tienes una cuenta? Regístrate' : '¿Ya tienes una cuenta? Iniciar sesión'}
                                    </Link>
                                </Grid>
                            </Grid>
                            {message && (
                                <Typography variant="body2" color={message.includes('error') ? 'error' : 'success'}>{message}</Typography>
                            )}
                        </Box>
                    </Paper>
                </animated.div>
            ))}
        </Container>
    );
};

export default AuthForm;
