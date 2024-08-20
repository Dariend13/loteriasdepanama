import React, { useState } from 'react';
import axios from 'axios';
import {
  Box, Button, Typography, Container, Paper, Input, CircularProgress, Snackbar, Alert, LinearProgress
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

const FileCompressor = () => {
  const [file, setFile] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleCompress = async () => {
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setProgress(0);

    try {
      const response = await axios.post('/api/compress', formData, {
        responseType: 'blob',
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Crear el nombre del archivo con el sufijo -compress antes de la extensión
      const originalName = file.name;
      const dotIndex = originalName.lastIndexOf('.');
      const newName = `${originalName.substring(0, dotIndex)}-compress${originalName.substring(dotIndex)}`;

      setDownloadUrl(url);
      setSnackbarMessage('Archivo comprimido con éxito');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // Crear un enlace para descargar el archivo con el nuevo nombre
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', newName); // Asignar el nuevo nombre al archivo
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (error) {
      console.error('Error al comprimir el archivo:', error);
      setSnackbarMessage('Error al comprimir el archivo');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Comprimir Archivos
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Input 
            type="file" 
            onChange={handleFileChange} 
            inputProps={{ accept: '.pdf,image/*' }} 
          />
        </Box>
        {loading && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}
        <Button
          variant="contained"
          color="primary"
          startIcon={<CloudUploadIcon />}
          onClick={handleCompress}
          disabled={!file || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Comprimir y Descargar'}
        </Button>
        {downloadUrl && (
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" color="secondary" href={downloadUrl} download="compressed_file">
              Descargar archivo comprimido
            </Button>
          </Box>
        )}
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FileCompressor;
