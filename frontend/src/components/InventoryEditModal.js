import React, { useState, useEffect } from 'react';
import {
    Button, Modal, Box, TextField, Typography, Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    maxWidth: '800px',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto',
    maxHeight: '90vh',
};

const fieldLabels = {
    brand: "Marca",
    model: "Modelo",
    serialNumber: "Número de Serie",
    inventoryNumber: "Número de Inventario",
    condition: "Condición",
    description: "Descripción",
    additionalInformation: "Información Adicional"
};

const InventoryEditModal = ({ open, handleClose, item, fetchInventory, fetchItem, readOnly = false }) => {
    const [currentItem, setCurrentItem] = useState(item || {});
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (open && item && item._id) {
            setLoading(true);
            fetchItem(item._id)
                .then(data => {
                    setCurrentItem(data);
                    setImages(data.images.map(url => ({ url })));
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching item details:', error);
                    setLoading(false);
                });
        }
    }, [item, open, fetchItem]);

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
                method: 'put',
                url: `https://panel2.zipply.app/api/inventory/${item._id}`,
                data: formData,
                headers: config.headers
            });

            if (response.status === 200 || response.status === 201) {
                fetchInventory();
                enqueueSnackbar('Item editado correctamente.', { variant: 'success' });
                handleClose();
            }
        } catch (error) {
            console.error('Error submitting the form:', error);
            enqueueSnackbar('Error al editar el item.', { variant: 'error' });
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style} component="form" onSubmit={(e) => handleSubmit(e, currentItem, images)}>
                <IconButton
                    color="inherit"
                    onClick={handleClose}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    {readOnly ? "Ver Inventario" : "Edit Item"}
                </Typography>
                <Grid container spacing={2}>
                    {Object.keys(fieldLabels).map((field) => (
                        <Grid item xs={12} sm={field === 'description' || field === 'additionalInformation' ? 12 : 6} key={field}>
                            {field === 'condition' ? (
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>{fieldLabels[field]}</InputLabel>
                                    <Select
                                        label={fieldLabels[field]}
                                        name={field}
                                        value={currentItem[field]}
                                        onChange={(e) => setCurrentItem({ ...currentItem, condition: e.target.value })}
                                        disabled={readOnly}
                                    >
                                        <MenuItem value="Excelente">Excelente</MenuItem>
                                        <MenuItem value="Bueno">Bueno</MenuItem>
                                        <MenuItem value="Decente">Decente</MenuItem>
                                        <MenuItem value="Malo">Malo</MenuItem>
                                    </Select>
                                </FormControl>
                            ) : (
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    label={fieldLabels[field]}
                                    name={field}
                                    value={currentItem[field]}
                                    onChange={(e) => setCurrentItem({ ...currentItem, [field]: e.target.value })}
                                    multiline={field === 'description' || field === 'additionalInformation'}
                                    rows={field === 'description' || field === 'additionalInformation' ? 4 : 1}
                                    disabled={readOnly}
                                />
                            )}
                        </Grid>
                    ))}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                            {images.map((img, index) => (
                                <Box key={index} sx={{ position: 'relative', width: 200, height: 200 }}>
                                    <img src={img.url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>
                            ))}
                        </Box>
                    </Grid>
                </Grid>
                {!readOnly && (
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                        Update
                    </Button>
                )}
            </Box>
        </Modal>
    );
};

export default InventoryEditModal;
