import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Container, AppBar,
    Toolbar, IconButton, Typography, Button, List, ListItem, Hidden, Drawer,
    TextField, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import GamesIcon from '@mui/icons-material/Games';
import HistoryIcon from '@mui/icons-material/History';
import StarsIcon from '@mui/icons-material/Stars';
import LuckyNumbersIcon from '@mui/icons-material/Filter9Plus';
import CasinoIcon from '@mui/icons-material/Casino';
import { useNavigate, Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';


const Lotto = () => {
    const [currentGameId, setCurrentGameId] = useState(null); // Nuevo estado para el ID del juego actual
    const [isInProgress, setIsInProgress] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fecha: new Date().toISOString().substr(0, 10),
        numeroSorteo: '',
        dia: new Date().toLocaleDateString('es-ES', { weekday: 'long' }),
        numeros: Array(6).fill('')
    });
    const [gameType, setGameType] = useState('Lotto');
    const [selectedGame, setSelectedGame] = useState(null);
    const [games, setGames] = useState([]);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        // Función para cargar los juegos del backend
        const loadGames = async () => {
            try {
                // Realiza una petición GET para obtener los juegos
                const response = await axios.get(`https://loteria.zipply.app/api/lottopega3/${gameType.toLowerCase()}`);

                // Si la respuesta es exitosa, filtra y establece los juegos en el estado
                if (response.status === 200) {
                    const filteredGames = response.data.filter(game => game.status === 'in-progress');
                    setGames(filteredGames);
                } else {
                    console.error('Error al cargar los juegos:', response.status, response.statusText);
                }
            } catch (error) {
                // Manejo de errores en caso de fallo en la petición
                console.error('Error al cargar los juegos:', error);
            }
        };
        // Llama a la función loadGames para cargar los juegos cuando el componente se monta
        loadGames();
    }, [gameType]);  // Dependencia: se vuelve a ejecutar cuando gameType cambia

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleNumberChange = (index, value) => {
        const updatedNumbers = [...formData.numeros];
        updatedNumbers[index] = value;

        setFormData(prevState => ({
            ...prevState,
            numeros: updatedNumbers
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = sessionStorage.getItem('jwt');

        try {
            const endpoint = `https://loteria.zipply.app/api/lottopega3/create/${gameType.toLowerCase()}`;
            const response = await axios.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            enqueueSnackbar('Juego creado correctamente!', { variant: 'success' });

            // Actualiza la lista de juegos
            setGames(prevGames => [response.data, ...prevGames]);
            setFormData({
                fecha: new Date().toISOString().substr(0, 10),
                numeroSorteo: '',
                dia: new Date().toLocaleDateString('es-ES', { weekday: 'long' }),
                numeros: Array(6).fill('')
            });
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
        }
    };

    const handleUpdate = async () => {
        const token = sessionStorage.getItem('jwt');

        // Actualizar juego
        try {
            const endpoint = `https://loteria.zipply.app/api/lottopega3/update/${gameType.toLowerCase()}/${selectedGame._id}`;
            await axios.put(endpoint, formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            enqueueSnackbar('Juego actualizado correctamente!', { variant: 'success' });

            // Actualizar el juego en el estado local
            const updatedGames = games.map(game =>
                game._id === selectedGame._id ? { ...game, ...formData } : game
            );
            setGames(updatedGames);
        } catch (error) {
            console.error('Error al actualizar el juego:', error);
        }
    };

    const handleGameSelect = (e) => {
        const gameId = e.target.value;
        const selectedGame = games.find(game => game._id === gameId);
        setCurrentGameId(gameId);
        setSelectedGame(selectedGame);

        // Rellenar el formulario con los datos del juego seleccionado
        const { fecha, numeroSorteo, dia, numeros } = selectedGame;
        setFormData({
            fecha,
            numeroSorteo,
            dia,
            numeros
        });
    };

    const resetFormData = () => {
        setFormData({
            numeroSorteo: '',
            dia: new Date().toLocaleDateString('es-ES', { weekday: 'long' }),
            numeros: Array(6).fill('')
        });
    };

    const handleCompleteGame = async () => {
        const token = sessionStorage.getItem('jwt');
    
        try {
            const response = await axios.put(`https://loteria.zipply.app/api/lottopega3/complete/${gameType.toLowerCase()}/${currentGameId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (response.data.success) {
                setIsInProgress(false);
                enqueueSnackbar('Juego marcado como completado!', { variant: 'success' });
    
                resetFormData(); // Resetear el formulario al estado inicial
                setSelectedGame(null); // Restablecer el juego seleccionado
            } else {
                alert('Error al marcar el juego como completado.');
            }
    
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
            console.error('Error:', error);
            alert('Error al marcar el juego como completado.');
        }
    };    

    const handleDrawerToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleLogout = async () => {
        try {
            // Realizar una petición al backend para cerrar la sesión
            const response = await fetch('https://loteria.zipply.app/dashboard/logout');

            if (response.ok) {
                // Eliminar el JWT de sessionStorage
                sessionStorage.removeItem('jwt');

                // Redirigir al usuario a la página de inicio de sesión
                navigate('/');
            } else {
                console.error('Error during logout.');
            }
        } catch (error) {
            console.error('Network error during logout.', error);
        }
    };

    const sidebarItems = [
        { text: 'Nuevo Juego', icon: <GamesIcon />, path: "/Dashboard" },
        { text: 'Lotto y Pega3', icon: <CasinoIcon />, path: "/Lotto" },
        { text: 'Juegos Pasados', icon: <HistoryIcon />, path: "/GameHistory" },
        { text: 'Horóscopo', icon: <StarsIcon />, path: "/Horoscope" },
    ];

    const drawer = (
        <div style={{ backgroundColor: '#E3E2E2', width: sidebarOpen ? 240 : 60, height: '100vh', marginTop: '64px' }}>
            {sidebarOpen && (
                <IconButton edge="end" color="inherit" onClick={handleDrawerToggle} sx={{ margin: 1, position: 'absolute', right: 0, top: 0 }}>
                    <CloseIcon />
                </IconButton>
            )}
            <List>
                {sidebarItems.map((item) => (
                    <ListItem button key={item.text} component={Link} to={item.path}>
                        {item.icon}
                        {sidebarOpen && <Typography variant="body1" sx={{ marginLeft: 1 }}>{item.text}</Typography>}
                    </ListItem>
                ))}
            </List>

        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            {/* Navbar */}
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Lotto y Pega 3
                    </Typography>
                    <Button color="inherit" startIcon={<ExitToAppIcon />} onClick={handleLogout}>
                        Cerrar Sesión
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <nav>
                <Hidden mdUp implementation="css">
                    <Drawer
                        variant="temporary"
                        open={sidebarOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{ keepMounted: true }}
                        sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240, backgroundColor: '#F2F2F2' } }}
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
                <Hidden smDown implementation="css">
                    <Drawer
                        variant="permanent"
                        sx={{
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: sidebarOpen ? 240 : 60,
                                backgroundColor: '#9C2020',
                                position: 'relative'
                            }
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
            </nav>
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, backgroundColor: '#f4f4f4' }}>
                <Container maxWidth="lg" sx={{ padding: 3 }}>
                    {/* Seleccionar un juego existente */}
                    {games.length > 0 && (
                        <FormControl fullWidth variant="outlined" margin="normal">
                            <InputLabel id="game-select-label">Selecciona un juego</InputLabel>
                            <Select
                                labelId="game-select-label"
                                id="game-select"
                                value={selectedGame?._id || ''}
                                onChange={handleGameSelect}
                                label="Selecciona un juego"
                            >
                                {games.map(game => (
                                    <MenuItem key={game._id} value={game._id}>{game.numeroSorteo}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {/* Formulario */}
                    <form onSubmit={selectedGame ? (e) => e.preventDefault() : handleSubmit}>
                        <FormControl fullWidth variant="outlined" margin="normal">
                            <InputLabel id="game-type-label">Tipo de Juego</InputLabel>
                            <Select
                                labelId="game-type-label"
                                id="game-type"
                                value={gameType}
                                onChange={(e) => setGameType(e.target.value)}
                                label="Tipo de Juego"
                            >
                                <MenuItem value="Lotto">Lotto</MenuItem>
                                <MenuItem value="Pega3">Pega3</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Fecha - Se muestra solo si no se ha seleccionado un juego para actualizar */}
                        {!selectedGame && (
                            <TextField
                                label="Fecha"
                                type="date"
                                name="fecha"
                                variant="outlined"
                                value={formData.fecha}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        )}

                        {/* Número de juego */}
                        <TextField
                            label="Número de Juego"
                            type="number"
                            name="numeroSorteo"
                            variant="outlined"
                            value={formData.numeroSorteo || ''}  // Asegurarte de que el valor nunca sea null o undefined
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            required
                        />

                        {/* Día */}
                        <TextField
                            label="Día"
                            type="text"
                            name="dia"
                            variant="outlined"
                            value={formData.dia}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            disabled
                        />

                        {/* Números */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            {formData.numeros.map((num, index) => (
                                <TextField
                                    key={index}
                                    label={`Número ${index + 1}`}
                                    type="number"
                                    variant="outlined"
                                    value={num || ''}  // Asegurarte de que el valor nunca sea null o undefined
                                    onChange={(e) => handleNumberChange(index, e.target.value)}
                                />
                            ))}
                        </div>
                        {selectedGame ? (
                            <>
                                <Button variant="contained" color="primary" onClick={handleUpdate}>Actualizar Juego</Button>
                                <Button variant="contained" color="success" onClick={handleCompleteGame} sx={{ ml: 2 }}>Completado</Button>
                            </>
                        ) : (
                            <Button type="submit" variant="contained" color="primary">Crear Juego</Button>
                        )}
                    </form>
                </Container>
            </Box>

        </Box>
    );
}

export default Lotto;
