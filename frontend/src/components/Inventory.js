import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chip,
  Box,
  CssBaseline,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  List,
  ListItem,
  Hidden,
  Drawer, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import GamesIcon from '@mui/icons-material/Games';
import HistoryIcon from '@mui/icons-material/History';
import StarsIcon from '@mui/icons-material/Stars';
import CasinoIcon from '@mui/icons-material/Casino';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, Link } from 'react-router-dom';
import InventoryModal from './InventoryModal'; // Asegúrate que la ruta de importación sea correcta
import MaterialTable from '@material-table/core';
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import { getRoleFromJWT } from '../utils/AuthUtils';
import InventoryEditModal from './InventoryEditModal'; // Asegúrate que la ruta de importación sea correcta
import { useSnackbar } from 'notistack';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Estado inicial a "cerrado"
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const token = sessionStorage.getItem('jwt');
  const [userRole, setUserRole] = useState('visitante');

  useEffect(() => {
    const role = getRoleFromJWT();
    if (role) {
      setUserRole(role);
    }
  }, []);
  useEffect(() => {
    fetchInventory();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/dashboard/logout');
      if (response.ok) {
        sessionStorage.removeItem('jwt');
        navigate('/');
      } else {
        console.error('Error during logout.');
        enqueueSnackbar('Error al cerrar sesión.', { variant: 'error' });
      }
    } catch (error) {
      console.error('Network error during logout.', error);
      enqueueSnackbar('Error de red al cerrar sesión.', { variant: 'error' });
    }
  };

  const sidebarItems = [
    { text: 'Nuevo Juego', icon: <GamesIcon />, path: "/Dashboard" },
    { text: 'Juegos Pasados', icon: <HistoryIcon />, path: "/Inventory" },
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
        {userRole === 'admin' && sidebarItems.map((item) => (
          <ListItem button key={item.text} component={Link} to={item.path}>
            {item.icon}
            {sidebarOpen && <Typography variant="body1" sx={{ marginLeft: 1 }}>{item.text}</Typography>}
          </ListItem>
        ))}
        {userRole === 'visitor' && (
          <ListItem button component={Link} to="/Inventory">
            <HistoryIcon />
            {sidebarOpen && <Typography variant="body1" sx={{ marginLeft: 1 }}>Inventario</Typography>}
          </ListItem>
        )}
      </List>
    </div>
  );

  const handleDeleteClick = (id) => {
    setDeleteItemId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteItemId) {
      await handleDelete(deleteItemId);
    }
    setDeleteConfirmOpen(false);
    setDeleteItemId(null);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setDeleteItemId(null);
  };

  const fetchInventory = async () => {
    const token = sessionStorage.getItem('jwt');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    try {
      const response = await axios.get('/api/inventory', config);
      setInventory(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      enqueueSnackbar('Error al cargar el inventario.', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    const token = sessionStorage.getItem('jwt');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    try {
      const response = await axios.delete(`/api/inventory/${id}`, config);
      if (response.status === 200) {
        fetchInventory();
        enqueueSnackbar('Item eliminado correctamente.', { variant: 'success' });
      } else {
        console.error('Failed to delete the item');
        enqueueSnackbar('Error al eliminar el item.', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting the item:', error);
      enqueueSnackbar('Error al eliminar el item.', { variant: 'error' });
    }
  };

  const handleOpenModal = (item, mode) => {
    setSelectedItem(item);
    if (mode === 'edit') {
      setIsEditing(true);
      setEditModalOpen(true);
    } else if (mode === 'add') {
      setAddModalOpen(true);
    } else if (mode === 'view') {
      setIsEditing(false);
      setEditModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setAddModalOpen(false);
    setSelectedItem(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSelectedItem(prev => ({ ...prev, [name]: value }));
  };

  const fetchItem = async (id) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    try {
      const response = await axios.get(`/api/inventory/${id}`, config);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch item details:', error);
      throw error;
    }
  };

  const handleSubmit = async (event, item, images = []) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    if (Array.isArray(images)) {
      images.forEach((img) => {
        if (img.file) {
          formData.append('images', img.file);
        }
      });
    }

    const token = sessionStorage.getItem('jwt');
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    };

    try {
      const response = await axios({
        method: 'post',
        url: '/api/inventory',
        data: formData,
        headers: config.headers
      });

      if (response.status === 200 || response.status === 201) {
        fetchInventory();
        handleCloseModal();
        enqueueSnackbar('Item agregado correctamente.', { variant: 'success' });
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
      enqueueSnackbar('Error al enviar el formulario.', { variant: 'error' });
    }
  };

  const exportColumns = [
    { title: 'Marca', field: 'brand' },
    { title: 'Modelo', field: 'model' },
    { title: '# Serial', field: 'serialNumber' },
    { title: '# de Inventario', field: 'inventoryNumber' },
    { title: 'Ubicación', field: 'ubication' },
    { title: 'Condición', field: 'condition', render: rowData => rowData.condition }
  ];

  const exportData = async (exportFunc) => {
    const token = sessionStorage.getItem('jwt');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    try {
      const response = await axios.get('/api/inventory', config);
      if (response.data) {
        exportFunc(exportColumns, response.data);
      }
    } catch (error) {
      console.error('Failed to fetch full inventory for export:', error);
      enqueueSnackbar('Error al cargar el inventario completo para exportar.', { variant: 'error' });
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
            Inventario Laboratorios FAECO
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
        <Container maxWidth="lg">
          <Button variant="outlined" onClick={() => handleOpenModal(null, 'add')}>Agregar</Button>
          <MaterialTable
            title="Inventario FAECO"
            columns={[
              { title: 'Marca', field: 'brand' },
              { title: 'Modelo', field: 'model' },
              { title: '# Serial', field: 'serialNumber' },
              { title: '# de Inventario', field: 'inventoryNumber' },
              { title: 'Ubicacion', field: 'ubication' },
              {
                title: 'Condicion',
                field: 'condition',
                render: rowData => {
                  const colorMap = {
                    Excelente: 'success',
                    Bueno: 'info',
                    Decente: 'warning',
                    Malo: 'error'
                  };
                  return <Chip label={rowData.condition} variant="outlined" color={colorMap[rowData.condition] || 'default'} />;
                }
              },
              {
                title: 'Acciones',
                field: 'actions',
                render: rowData => (
                  <>
                    <IconButton onClick={() => handleOpenModal(rowData, 'view')} style={{ color: 'blue' }}>
                      <VisibilityIcon />
                    </IconButton>
                    {
                      <>
                        <IconButton onClick={() => handleOpenModal(rowData, 'edit')} style={{ color: 'green' }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteClick(rowData._id)} style={{ color: 'red' }}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    }
                  </>
                )
              }
            ]}
            data={inventory}
            options={{
              actionsColumnIndex: -1,
              exportMenu: [{
                label: 'Exportar PDF',
                exportFunc: (cols, datas) => exportData((cols, datas) => ExportPdf(cols, datas, 'InventarioFAECO_PDF')),
              }, {
                label: 'Exportar CSV',
                exportFunc: (cols, datas) => exportData((cols, datas) => ExportCsv(cols, datas, 'InventarioFAECO_CSV')),
              }]
            }}
          />
          {editModalOpen && (
            <InventoryEditModal
              open={editModalOpen}
              handleClose={handleCloseModal}
              item={selectedItem}
              readOnly={!isEditing}
              fetchItem={fetchItem}
              fetchInventory={fetchInventory}
            />
          )}
          {addModalOpen && (
            <InventoryModal
              open={addModalOpen}
              handleClose={handleCloseModal}
              handleSubmit={handleSubmit}
              item={selectedItem}
              handleChange={handleChange}
            />
          )}
          <Dialog
            open={deleteConfirmOpen}
            onClose={handleCloseDeleteConfirm}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{"Confirmacion de borrado"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Estas seguro que deseas borrar este item? No se puede recuperar.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteConfirm} color="primary">
                Cancelar
              </Button>
              <Button onClick={handleConfirmDelete} color="secondary" autoFocus>
                Borrar
              </Button>
            </DialogActions>
          </Dialog>

        </Container>
      </Box>
    </Box>

  );
}

export default Inventory;
