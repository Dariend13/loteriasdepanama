import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
    AppBar, Toolbar, Typography, Button, Drawer, List, ListItem, Container, TextField, MenuItem, IconButton, Hidden, CssBaseline, Box, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import GamesIcon from '@mui/icons-material/Games';
import HistoryIcon from '@mui/icons-material/History';
import StarsIcon from '@mui/icons-material/Stars';
import LuckyNumbersIcon from '@mui/icons-material/Filter9Plus';
import CasinoIcon from '@mui/icons-material/Casino';
import { enqueueSnackbar, useSnackbar } from 'notistack';


function LoteriaNacionalFields(props) {
    const {
        gamesList, currentGameId, handleSelectGame, formData,
        handleChange, campoDisabled, botonDisabled,
        handleCompleteGame, handleCreateNewGame
    } = props;
    return (
        <>
            {gamesList.length > 0 && (
                <TextField
                    select
                    label="Seleccionar Juego"
                    fullWidth
                    variant="outlined"
                    value={currentGameId || ""}
                    onChange={handleSelectGame}
                    margin="normal"
                >
                    {gamesList.map((game) => (
                        <MenuItem key={game._id} value={game._id}>
                            {game.tipoSorteo} - {game.fecha}
                        </MenuItem>
                    ))}
                </TextField>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <TextField
                    select
                    label="Tipo de Sorteo"
                    fullWidth
                    variant="outlined"
                    name="tipoSorteo"
                    value={formData.tipoSorteo}
                    onChange={handleChange}
                    margin="normal"
                >
                    {['Miercolito', 'Gordito', 'Dominical'].map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </TextField>

                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ flex: '1' }}>
                        <TextField
                            label="Fecha"
                            type="date"
                            fullWidth
                            variant="outlined"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleChange}
                            margin="normal"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            disabled={campoDisabled}
                        />
                        <TextField
                            label="Primer Premio"
                            fullWidth
                            variant="outlined"
                            name="primerPremio"
                            value={formData.primerPremio}
                            onChange={handleChange}
                            margin="normal"
                            disabled={campoDisabled}
                        />
                        <TextField
                            label="Segundo Premio"
                            fullWidth
                            variant="outlined"
                            name="segundoPremio"
                            value={formData.segundoPremio}
                            onChange={handleChange}
                            margin="normal"
                            disabled={campoDisabled}
                        />
                        <TextField
                            label="Tercer Premio"
                            fullWidth
                            variant="outlined"
                            name="tercerPremio"
                            value={formData.tercerPremio}
                            onChange={handleChange}
                            margin="normal"
                            disabled={campoDisabled}
                        />
                        <TextField
                            label="Serie"
                            fullWidth
                            variant="outlined"
                            name="serie"
                            value={formData.serie}
                            onChange={handleChange}
                            margin="normal"
                            disabled={campoDisabled}
                        />
                        <TextField
                            label="Letras"
                            fullWidth
                            variant="outlined"
                            name="letras"
                            value={formData.letras}
                            onChange={handleChange}
                            margin="normal"
                            disabled={campoDisabled}
                        />
                    </div>

                    <div style={{ flex: '1' }}>
                        <TextField
                            label="#Número de Sorteo"
                            fullWidth
                            variant="outlined"
                            name="numeroSorteo"
                            value={formData.numeroSorteo}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            label="Lugares Vendidos (Primer Premio)"
                            fullWidth
                            variant="outlined"
                            name="lugaresVendidosPrimerPremio"
                            value={formData.lugaresVendidosPrimerPremio}
                            onChange={handleChange}
                            margin="normal"
                            disabled={campoDisabled}
                        />
                        <TextField
                            label="Lugares Vendidos (Segundo Premio)"
                            fullWidth
                            variant="outlined"
                            name="lugaresVendidosSegundoPremio"
                            value={formData.lugaresVendidosSegundoPremio}
                            onChange={handleChange}
                            margin="normal"
                            disabled={campoDisabled}
                        />
                        <TextField
                            label="Lugares Vendidos (Tercer Premio)"
                            fullWidth
                            variant="outlined"
                            name="lugaresVendidosTercerPremio"
                            value={formData.lugaresVendidosTercerPremio}
                            onChange={handleChange}
                            margin="normal"
                            disabled={campoDisabled}
                        />
                        <TextField
                            label="Folio"
                            fullWidth
                            variant="outlined"
                            name="folio"
                            value={formData.folio}
                            onChange={handleChange}
                            margin="normal"
                            disabled={campoDisabled}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '16px', marginTop: '20px' }}>
                    <Button variant="contained" color="primary" type="submit" disabled={botonDisabled}>
                        Agregar
                    </Button>
                    <Button variant="contained" color='success' onClick={handleCompleteGame} disabled={botonDisabled}>
                        Completado
                    </Button>
                    <Button variant="contained" color='secondary' onClick={handleCreateNewGame}>
                        Crear Nuevo Juego
                    </Button>
                </div>
            </div>
        </>
    );
}

const Dashboard = () => {
    const { DateTime } = require('luxon');

    const fechaPanama = DateTime.now().setZone('America/Panama').toISODate();
    const [formData, setFormData] = useState({
        tipoSorteo: '',
        fecha: fechaPanama,
        numeroSorteo: '----',
        primerPremio: '----',
        lugaresVendidosPrimerPremio: '----',
        letras: '----',
        serie: '----',
        folio: '----',
        segundoPremio: '----',
        lugaresVendidosSegundoPremio: '----',
        tercerPremio: '----',
        lugaresVendidosTercerPremio: '----'
    });

    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false); // Estado inicial a "cerrado"

    const handleDrawerToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const transformDateToInputFormat = (dateString) => {
        // Convierte la fecha al formato y zona horaria de Panamá
        return DateTime.fromISO(dateString).setZone('America/Panama').toISODate();
    };

    function convertDate(dateString) {
        // Esta función convierte el formato dd-mm-yyyy a yyyy-mm-dd
        const parts = dateString.split('-');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }


    const [isInProgress, setIsInProgress] = useState(true);
    const [currentGameId, setCurrentGameId] = useState(null); // Nuevo estado para el ID del juego actual
    const [gamesList, setGamesList] = useState([]);
    const [campoDisabled, setCampoDisabled] = useState(true);
    const [botonDisabled, setBotonDisabled] = useState(true);
    const [selectedGameNacional, setSelectedGameNacional] = useState("loteriaNacional");


    const loadGames = async () => {
        const token = sessionStorage.getItem('jwt');
        try {
            const response = await axios.get('https://loteria.zipply.app/api/games/listinprogress', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setGamesList(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        loadGames();
    }, []);

    // Nueva función para manejar la selección de un juego
    const handleSelectGame = (e) => {
        const selectedGame = gamesList.find(game => game._id === e.target.value);

        if (selectedGame) {
            // Crea una copia profunda de selectedGame
            const clonedGame = JSON.parse(JSON.stringify(selectedGame));

            // Transforma la fecha de la copia
            clonedGame.fecha = transformDateToInputFormat(clonedGame.fecha);

            setFormData(clonedGame);
            setCurrentGameId(clonedGame._id);
            setIsInProgress(!isGameCompleted(clonedGame));
            setCampoDisabled(false);
            setBotonDisabled(false);
        } else {
            setCampoDisabled(true);
            setBotonDisabled(true);
        }
    };

    const handleCreateNewGame = async () => {
        const token = sessionStorage.getItem('jwt');

        setFormData({
            tipoSorteo: '',
            fecha: fechaPanama,
            numeroSorteo: '----',
            primerPremio: '----',
            lugaresVendidosPrimerPremio: '----',
            letras: '----',
            serie: '----',
            folio: '----',
            segundoPremio: '----',
            lugaresVendidosSegundoPremio: '----',
            tercerPremio: '----',
            lugaresVendidosTercerPremio: '----',
            status: 'in-progress'
        });
        setIsInProgress(true);
        setCurrentGameId(null);

        try {
            const response = await axios.post('https://loteria.zipply.app/api/games', formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 201) {
                console.log("Juego creado exitosamente:", response.data);
                enqueueSnackbar('Juego Creado Correctamente!', { variant: 'success' });

                // Habilitar todos los campos y botones
                setCampoDisabled(false);
                setBotonDisabled(false);

            } else {
                console.error("Error al crear el juego:", response.data.error);
            }
        } catch (error) {
            console.error("Error al enviar la petición:", error);
            enqueueSnackbar('Ocurrió un error al crear el juego. Por favor, intenta nuevamente.', { variant: 'error' });
        }

        setIsInProgress(false);
    };


    const isGameCompleted = (game) => {
        return game.primerPremio && game.letras && game.serie && game.folio && game.segundoPremio && game.tercerPremio;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = sessionStorage.getItem('jwt');

        try {
            // Asegúrate de que tienes un ID para actualizar
            if (!currentGameId) {
                console.error('No se ha seleccionado ningún juego para actualizar.');
                return;
            }

            // Log para ver qué datos se están enviando en formData
            console.log('Datos enviados:', formData);

            // Actualiza el juego específico usando su ID
            const response = await axios.put(`https://loteria.zipply.app/api/games/update/${currentGameId}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response:', response.data);
            enqueueSnackbar('Juego Creado Correctamente!', { variant: 'success' });
            // Si quieres reflejar los cambios en el frontend, actualiza tu estado aquí
            setFormData(prev => ({ ...prev, ...formData }));

        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error);
            enqueueSnackbar('Error al crear el juego!', { variant: 'error ' });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;

        if (name === 'fecha') {
            finalValue = convertDate(value);
        }

        setFormData((prevData) => ({
            ...prevData,
            [name]: finalValue,
        }));
    };

    const handleCompleteGame = async () => {
        const token = sessionStorage.getItem('jwt');

        try {
            const response = await axios.put(`https://loteria.zipply.app/api/games/complete/${currentGameId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setIsInProgress(false);
                enqueueSnackbar('Juego marcado como completado!', { variant: 'success' });
            } else {
                enqueueSnackbar('Error al marcar el juego como completado.', { variant: 'error' });
            }

        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
            console.error('Error:', error);
            enqueueSnackbar('Error al marcar el juego como completado.', { variant: 'error' });
        }
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

    const handleRadioButtonChange = (event) => {
        setSelectedGameNacional(event.target.value);
    };


    function LaTicaFields({ onSubmit }) {
        const { enqueueSnackbar } = useSnackbar();
        const [formData, setFormData] = useState({
            fecha: '',
            dia: '',
            primerPremio: '--',
            segundoPremio: '--',
            tercerPremio: '--'
        });
        const [gamesList, setGamesList] = useState([]);
        const [currentGameId, setCurrentGameId] = useState(null);
        const [botonDisabled, setBotonDisabled] = useState(true);

        const handleSubmitUpdate = async (e) => {
            e.preventDefault();

            const token = sessionStorage.getItem('jwt');

            try {
                // Asegúrate de que tienes un ID para actualizar
                if (!currentGameId) {
                    console.error('No se ha seleccionado ningún juego para actualizar.');
                    return;
                }

                // Log para ver qué datos se están enviando en formData
                console.log('Datos enviados:', formData);

                // Actualiza el juego específico usando su ID
                const response = await axios.put(`https://loteria.zipply.app/api/games/update/tica/${currentGameId}`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('Response:', response.data);

                // Si quieres reflejar los cambios en el frontend, actualiza tu estado aquí
                setFormData(prev => ({ ...prev, ...formData }));
                enqueueSnackbar("Juego actualizado correctamente!", { variant: 'success' });
            } catch (error) {
                console.error('Error:', error.response ? error.response.data : error);
            }
        };

        useEffect(() => {
            const fetchGames = async () => {
                const token = sessionStorage.getItem('jwt');
                try {
                    const response = await axios.get('https://loteria.zipply.app/api/games/tica/listinprogress', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    setGamesList(response.data);
                } catch (error) {
                    console.error("Error al obtener la lista de juegos:", error);
                }
            };

            fetchGames();
        }, []);

        const handleSelectGame = (e) => {
            const selectedGame = gamesList.find(game => game._id === e.target.value);

            if (selectedGame) {
                const clonedGame = JSON.parse(JSON.stringify(selectedGame));
                clonedGame.fecha = transformDateToInputFormat(clonedGame.fecha); // Asume que tienes una función llamada transformDateToInputFormat

                setFormData(clonedGame);
                setCurrentGameId(clonedGame._id);
                setBotonDisabled(false);
            } else {
                setBotonDisabled(true);
            }
        };

        const handleChange = (event) => {
            const { name, value } = event.target;
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        };

        const handleAddGame = async () => {
            const token = sessionStorage.getItem('jwt');
            try {
                const response = await axios.post('https://loteria.zipply.app/api/games/tica', formData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log("Juego creado exitosamente:", response.data);
                enqueueSnackbar('Juego Creado Correctamente!', { variant: 'success' });
                if (onSubmit) onSubmit();
            } catch (error) {
                console.error("Error al agregar el juego:", error);
                enqueueSnackbar("Error al crear el juego!", { variant: 'error' });
            }
        };

        const handleCompleteGameTica = async () => {
            const token = sessionStorage.getItem('jwt');

            try {
                const response = await axios.put(`https://loteria.zipply.app/api/games/complete/tica/${currentGameId}`, {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    setIsInProgress(false);
                    enqueueSnackbar('Juego marcado como completado.', { variant: 'success' });
                } else {
                    enqueueSnackbar('Error al marcar el juego como completado.', { variant: 'error' });
                }

            } catch (error) {
                console.error('Error:', error.response ? error.response.data : error.message);
                console.error('Error:', error);
                enqueueSnackbar('Error al marcar el juego como completado.', { variant: 'error' });
            }
        };

        return (
            <>
                {gamesList.length > 0 && (
                    <TextField
                        select
                        label="Seleccionar Juego"
                        fullWidth
                        variant="outlined"
                        value={currentGameId || ""}
                        onChange={handleSelectGame}
                        margin="normal"
                    >
                        {gamesList.map((game) => (
                            <MenuItem key={game._id} value={game._id}>
                                La Tica - {game.fecha}
                            </MenuItem>
                        ))}
                    </TextField>
                )}
                <TextField
                    label="Fecha"
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField
                    label="Dia de Juego"
                    name="dia"
                    value={formData.dia}
                    onChange={handleChange}
                    fullWidth
                />
                <TextField
                    label="# de Sorteo"
                    name="numeroSorteo"
                    value={formData.numeroSorteo}
                    onChange={handleChange}
                    fullWidth
                />
                <TextField
                    label="Primer Premio"
                    name="primerPremio"
                    value={formData.primerPremio}
                    onChange={handleChange}
                    fullWidth
                />
                <TextField
                    label="Segundo Premio"
                    name="segundoPremio"
                    value={formData.segundoPremio}
                    onChange={handleChange}
                    fullWidth
                />
                <TextField
                    label="Tercer Premio"
                    name="tercerPremio"
                    value={formData.tercerPremio}
                    onChange={handleChange}
                    fullWidth
                />
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '16px', marginTop: '20px' }}>
                    <Button variant="contained" color="primary" onClick={handleSubmitUpdate} disabled={botonDisabled}>
                        Actualizar
                    </Button>
                    <Button variant="contained" color='success' onClick={handleCompleteGameTica} disabled={botonDisabled}>
                        Completado
                    </Button>
                    <Button variant="contained" color='secondary' onClick={handleAddGame}>
                        Crear Nuevo Juego
                    </Button>
                </div>
            </>
        );
    }

    function MonazoFields({ onSubmit }) {
        const { enqueueSnackbar } = useSnackbar();
        const [formData, setFormData] = useState({
            fecha: '',
            numeroSorteo: '',
            hora: '',
            primerPremio: '----',
            segundoPremio: '----',
            tercerPremio: '----'
        });

        const [gamesList, setGamesList] = useState([]);
        const [currentGameId, setCurrentGameId] = useState(null);
        const [botonDisabled, setBotonDisabled] = useState(true);

        const transformDateToInputFormat = (dateString) => {
            console.log("Fecha original:", dateString);  // Agrega esto para depurar
            const convertedDate = DateTime.fromISO(dateString).setZone('America/Panama').toISODate();
            console.log("Fecha convertida:", convertedDate);  // Agrega esto para depurar
            return convertedDate;
        };

        const handleChange = (event) => {
            const { name, value } = event.target;
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        };

        const handleSubmitUpdate = async () => {
            const token = sessionStorage.getItem('jwt');

            try {
                if (!currentGameId) {
                    console.error('No se ha seleccionado ningún juego para actualizar.');
                    return;
                }

                const response = await axios.put(`https://loteria.zipply.app/api/games/update/monazo/${currentGameId}`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log(response.data);  // Esto imprimirá los datos de la respuesta en la consola del navegador

                enqueueSnackbar('Juego Actualizado Correctamente!', { variant: 'success' });
                if (onSubmit) onSubmit();
            } catch (error) {
                console.error('Error:', error);
            }
        };

        useEffect(() => {
            const fetchGames = async () => {
                const token = sessionStorage.getItem('jwt');
                try {
                    const response = await axios.get('https://loteria.zipply.app/api/games/monazo/listinprogress', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    setGamesList(response.data);
                } catch (error) {
                    console.error("Error al obtener la lista de juegos:", error);
                }
            };

            fetchGames();
        }, []);

        const handleSelectGame = (e) => {
            const selectedGame = gamesList.find(game => game._id === e.target.value);

            if (selectedGame) {
                const clonedGame = JSON.parse(JSON.stringify(selectedGame));
                clonedGame.fecha = transformDateToInputFormat(clonedGame.fecha); // Asume que tienes una función llamada transformDateToInputFormat

                setFormData(clonedGame);
                setCurrentGameId(clonedGame._id);
                setBotonDisabled(false);
            } else {
                setBotonDisabled(true);
            }
        };

        const handleAddGame = async () => {
            const token = sessionStorage.getItem('jwt');
            try {
                const response = await axios.post('https://loteria.zipply.app/api/games/monazo', formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log(response.data);  // Esto imprimirá los datos de la respuesta en la consola del navegador
                enqueueSnackbar('Juego Creado Correctamente!', { variant: 'success' });
                if (onSubmit) onSubmit();
            } catch (error) {
                console.error("Error al agregar el juego:", error);
            }
        };

        const handleCompleteGame = async () => {
            const token = sessionStorage.getItem('jwt');

            try {
                const response = await axios.put(`https://loteria.zipply.app/api/games/complete/monazo/${currentGameId}`, {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log(response.data);  // Esto imprimirá los datos de la respuesta en la consola del navegador
                enqueueSnackbar('Juego marcado como completado!', { variant: 'success' });
            } catch (error) {
                console.error('Error:', error);
                enqueueSnackbar('Error al marcar el juego como completado!', { variant: 'error' });
            }
        };

        return (
            <>
                {gamesList.length > 0 && (
                    <TextField
                        select
                        label="Seleccionar Juego"
                        fullWidth
                        value={currentGameId || ""}
                        onChange={handleSelectGame}
                    >
                        {gamesList.map((game) => (
                            <MenuItem key={game._id} value={game._id}>
                                Monazo - {game.fecha}
                            </MenuItem>
                        ))}
                    </TextField>
                )}

                <TextField
                    label="Fecha"
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{
                        shrink: true,
                    }}
                />

                <TextField
                    label="# de Sorteo"
                    name="numeroSorteo"
                    value={formData.numeroSorteo}
                    onChange={handleChange}
                    fullWidth
                />

                <TextField
                    label="Hora"
                    name="hora"
                    value={formData.hora}
                    onChange={handleChange}
                    fullWidth
                />

                <TextField
                    label="Primer Premio"
                    name="primerPremio"
                    value={formData.primerPremio}
                    onChange={handleChange}
                    fullWidth
                />

                <TextField
                    label="Segundo Premio"
                    name="segundoPremio"
                    value={formData.segundoPremio}
                    onChange={handleChange}
                    fullWidth
                />

                <TextField
                    label="Tercer Premio"
                    name="tercerPremio"
                    value={formData.tercerPremio}
                    onChange={handleChange}
                    fullWidth
                />

                <div style={{ marginTop: '20px' }}>
                    <Button variant="contained" color="primary" onClick={handleSubmitUpdate} disabled={botonDisabled}>
                        Actualizar
                    </Button>
                    <Button variant="contained" color='success' onClick={handleCompleteGame} disabled={botonDisabled}>
                        Completado
                    </Button>
                    <Button variant="contained" color='secondary' onClick={handleAddGame}>
                        Crear Nuevo Juego
                    </Button>
                </div>
            </>
        );
    }

    const sidebarItems = [
        { text: 'Nuevo Juego', icon: <GamesIcon />, path: "/Dashboard" },
        { text: 'Juegos Pasados', icon: <HistoryIcon />, path: "/GameHistory" },
        { text: 'Horóscopo', icon: <StarsIcon />, path: "/Horoscope" },
        { text: 'Lotto y Pega3', icon: <CasinoIcon />, path: "/Lotto" }
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

    const renderGameFields = () => {
        switch (selectedGameNacional) {
            case "Loteria Nacional":
                return <LoteriaNacionalFields
                    gamesList={gamesList}
                    currentGameId={currentGameId}
                    handleSelectGame={handleSelectGame}
                    formData={formData}
                    handleChange={handleChange}
                    campoDisabled={campoDisabled}
                    botonDisabled={botonDisabled}
                    handleSubmit={handleSubmit}
                    handleCompleteGame={handleCompleteGame}
                    handleCreateNewGame={handleCreateNewGame}
                />;
            case "La Tica":
                return <LaTicaFields />;
            case "Monazo":
                return <MonazoFields />;
            default:
                return null;
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
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
                        Dashboard
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

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, backgroundColor: '#f4f4f4' }}>
                <Container maxWidth="sm" sx={{ padding: 3, backgroundColor: '#EEE9E9', borderRadius: '5px' }}>
                    {/* Radio buttons */}
                    <div>
                        <legend>Seleccione el juego</legend>
                        <RadioGroup row aria-label="juego" name="juego" value={selectedGameNacional} onChange={handleRadioButtonChange}>
                            <FormControlLabel value="Loteria Nacional" control={<Radio />} label="Loteria Nacional" />
                            <FormControlLabel value="La Tica" control={<Radio />} label="La Tica" />
                            <FormControlLabel value="Monazo" control={<Radio />} label="Monazo" />
                        </RadioGroup>
                    </div>
                    <form noValidate autoComplete="off" onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {renderGameFields()}

                        </div>
                    </form>
                </Container>
            </Box>

        </Box>
    );
};

export default Dashboard;