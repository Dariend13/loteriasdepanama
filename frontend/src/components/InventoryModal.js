import React, { useState } from 'react';
import {
    Button, Modal, Box, TextField, Typography, IconButton, IconButton, Grid, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';

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

const defaultItem = {
    brand: '',
    model: '',
    serialNumber: '',
    inventoryNumber: '',
    condition: '',
    description: '',
    additionalInformation: '',
    images: []
};

const InventoryModal = ({ open, handleClose, handleSubmit, handleOpen }) => {
    const [currentItem, setCurrentItem] = useState(defaultItem);
    const [images, setImages] = useState([]);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prevImages => [...prevImages, { url: reader.result, file }]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (index) => {
        setImages(prevImages => prevImages.filter((_, i) => i !== index));
    };

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
                    Agregar Nuevo Inventario
                </Typography>
                <Grid container spacing={2}>
                    {['brand', 'model', 'serialNumber', 'inventoryNumber'].map((field, index) => (
                        <Grid item xs={12} sm={6} key={field}>
                            <TextField
                                margin="normal"
                                fullWidth
                                label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                                name={field}
                                value={currentItem[field]}
                                onChange={(e) => setCurrentItem({ ...currentItem, [field]: e.target.value })}
                            />
                        </Grid>
                    ))}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Condicion</InputLabel>
                            <Select
                                label="Condition"
                                name="condition"
                                value={currentItem.condition}
                                onChange={(e) => setCurrentItem({ ...currentItem, condition: e.target.value })}
                            >
                                <MenuItem value="Excelente">Excelente</MenuItem>
                                <MenuItem value="Bueno">Bueno</MenuItem>
                                <MenuItem value="Decente">Decente</MenuItem>
                                <MenuItem value="Malo">Malo</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={6}>
                        <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => document.getElementById('icon-button-file').click()}>
                            <input accept="image/*" id="icon-button-file" type="file" style={{ display: 'none' }} onChange={handleImageChange} />
                            <PhotoCamera />
                        </IconButton>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                            {images.map((img, index) => (
                                <Box key={index} sx={{ position: 'relative', width: '100%', maxWidth: 100, height: 100 }}>
                                    <img src={img.url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <IconButton
                                        size="small"
                                        sx={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}
                                        onClick={() => handleRemoveImage(index)}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    </Grid>
                    {['description', 'additionalInformation'].map((field, index) => (
                        <Grid item xs={12} key={field}>
                            <TextField
                                margin="normal"
                                fullWidth
                                label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                                name={field}
                                value={currentItem[field]}
                                onChange={(e) => setCurrentItem({ ...currentItem, [field]: e.target.value })}
                                multiline
                                rows={4}
                            />
                        </Grid>
                    ))}
                </Grid>
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    Add
                </Button>
            </Box>
        </Modal>

    );
};

export default InventoryModal;
