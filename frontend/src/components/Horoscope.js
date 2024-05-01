import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Container, AppBar,
    Toolbar, IconButton, Typography, Button, List, ListItem, Hidden, Drawer, TextField, Snackbar, Alert, Modal
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import GamesIcon from '@mui/icons-material/Games';
import HistoryIcon from '@mui/icons-material/History';
import StarsIcon from '@mui/icons-material/Stars';
import LuckyNumbersIcon from '@mui/icons-material/Filter9Plus';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CasinoIcon from '@mui/icons-material/Casino';
import { useNavigate, Link } from 'react-router-dom';

const Horoscope = () => {
    const [horoscopes, setHoroscopes] = useState([]);
    const [signo, setSigno] = useState('');
    const [prediccion, setPrediccion] = useState('');
    const [editingHoroscope, setEditingHoroscope] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const fetchHoroscopes = useCallback(async () => {
        try {
            const response = await axios.get(`https://loteria.zipply.app/api/horoscope`);
            setHoroscopes(response.data);
        } catch (error) {
            console.error("Error al obtener los horóscopos:", error);
        }
    }, []);

    const allSigns = ["Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo", "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"];

    // Calcula los signos que aún no tienen un horóscopo
    const availableSigns = allSigns.filter(sign => !horoscopes.some(horoscope => horoscope.sign === sign));

    const availableSignsRef = useRef();
    availableSignsRef.current = availableSigns;

    useEffect(() => {
        fetchHoroscopes();
    }, [fetchHoroscopes]);

    useEffect(() => {
        if (availableSignsRef.current.length > 0) {
            setSigno(availableSignsRef.current[0]);
        }
    }, [horoscopes]);

    const handleDrawerToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const startEditing = (horoscope) => {
        setEditingHoroscope(horoscope);
        setPrediccion(horoscope.horoscope);
        setOpenModal(true);
    };

    const finishEditing = async () => {
        if (editingHoroscope) {
            try {
                const response = await axios.put(`https://loteria.zipply.app/api/horoscope/${editingHoroscope._id}`, {
                    horoscope: prediccion,
                    date: new Date()
                });

                if (response.status === 200) {
                    setSnackbarMessage("Horóscopo actualizado exitosamente.");
                    setOpenSnackbar(true);
                    fetchHoroscopes();
                } else {
                    setSnackbarMessage("Error al actualizar horóscopo.");
                    setOpenSnackbar(true);
                }
            } catch (error) {
                console.error("Error al actualizar horóscopo:", error);
            }

            setOpenModal(false);
            setEditingHoroscope(null);
            setPrediccion('');
        }
    };

    const cancelEditing = () => {
        setOpenModal(false);
        setEditingHoroscope(null);
        setPrediccion('');
    };

    const updateHoroscope = async () => {
        try {
            const horoscopeToUpdate = horoscopes.find(h => h.sign === signo);
            if (horoscopeToUpdate) {
                const response = await axios.put(`https://loteria.zipply.app/api/horoscope/${horoscopeToUpdate._id}`, {
                    horoscope: prediccion,
                    date: new Date()
                });

                if (response.status === 200) {
                    setSnackbarMessage("Horóscopo actualizado exitosamente.");
                    setOpenSnackbar(true);
                    fetchHoroscopes();
                } else {
                    setSnackbarMessage("Error al actualizar horóscopo.");
                    setOpenSnackbar(true);
                }
            } else {
                setSnackbarMessage("Selecciona un signo válido.");
                setOpenSnackbar(true);
            }
        } catch (error) {
            console.error("Error al actualizar horóscopo:", error);
        }
    };

    const resetHoroscopes = async () => {
        try {
            const response = await axios.put(`https://loteria.zipply.app/api/horoscope/reset`);
            if (response.status === 200) {
                setSnackbarMessage("Horóscopos reiniciados con éxito.");
                setOpenSnackbar(true);
                fetchHoroscopes();
            } else {
                setSnackbarMessage("Error al reiniciar horóscopos.");
                setOpenSnackbar(true);
            }
        } catch (error) {
            console.error("Error al reiniciar horóscopos:", error);
        }
    };

    const deleteHoroscope = async (id) => {
        try {
            const response = await axios.delete(`https://loteria.zipply.app/api/horoscope/${id}`);

            if (response.status === 200) {
                setSnackbarMessage("Horóscopo eliminado exitosamente.");
                setOpenSnackbar(true);
                fetchHoroscopes();
            } else {
                setSnackbarMessage("Error al eliminar horóscopo.");
                setOpenSnackbar(true);
            }
        } catch (error) {
            console.error("Error al eliminar horóscopo:", error);
        }
    }

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
                        Horoscopo
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
                    <TextField
                        select
                        label="Signo"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={signo}
                        onChange={(e) => setSigno(e.target.value)}
                        SelectProps={{
                            native: true,
                        }}
                    >
                        {horoscopes.map((horoscope) => (
                            <option key={horoscope.sign} value={horoscope.sign}>
                                {horoscope.sign}
                            </option>
                        ))}
                    </TextField>
                    <TextField label="Predicción" variant="outlined" fullWidth multiline rows={4} margin="normal" value={prediccion} onChange={(e) => setPrediccion(e.target.value)} />
                    <Button variant="contained" color="primary" onClick={updateHoroscope} sx={{ marginRight: 2 }}>  {/* Actualizado */}
                        Actualizar Horóscopo  {/* Texto del botón actualizado */}
                    </Button>
                    <Button variant="contained" color="secondary" onClick={resetHoroscopes}>
                        Reiniciar Horóscopos
                    </Button>
                    <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#333' }}>
                                    <TableCell align='center' style={{ color: 'white' }}>Fecha</TableCell>
                                    <TableCell align='center' style={{ color: 'white' }}>Signo</TableCell>
                                    <TableCell align='center' style={{ color: 'white' }}>Predicción</TableCell>
                                    <TableCell align='center' style={{ color: 'white' }} sx={{ width: 50 }}>
                                        Acciones
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {horoscopes.map(horoscope => (
                                    <TableRow key={horoscope._id} sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}>
                                        <TableCell>{new Date(horoscope.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{horoscope.sign}</TableCell>
                                        <TableCell>{horoscope.horoscope}</TableCell>
                                        <TableCell>
                                            <IconButton color="primary" onClick={() => startEditing(horoscope)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="secondary" onClick={() => deleteHoroscope(horoscope._id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <Modal
                                open={openModal}
                                onClose={cancelEditing}
                                aria-labelledby="modal-modal-title"
                                aria-describedby="modal-modal-description"
                            >
                                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                                    <Typography id="modal-modal-title" variant="h6" component="h2">
                                        Editar Horóscopo
                                    </Typography>
                                    <TextField label="Predicción" variant="outlined" fullWidth multiline rows={4} margin="normal" value={prediccion} onChange={(e) => setPrediccion(e.target.value)} />
                                    <Button variant="contained" color="primary" onClick={finishEditing} sx={{ marginRight: 2 }}>
                                        Guardar Cambios
                                    </Button>
                                    <Button variant="contained" color="secondary" onClick={cancelEditing}>
                                        Cancelar
                                    </Button>
                                </Box>
                            </Modal>
                        </Table>
                    </TableContainer>

                    <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                </Container>
            </Box>
        </Box>
    );
}

export default Horoscope;
