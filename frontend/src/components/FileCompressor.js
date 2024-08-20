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
  const [compressionInfo, setCompressionInfo] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setCompressionInfo(null);
  };

  const handleCompress = async () => {
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setProgress(0);

    try {
      const response = await axios.post('/api/compress', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      const { downloadUrl, originalSize, compressedSize } = response.data;
      setDownloadUrl(downloadUrl);
      setCompressionInfo({
        originalSize,
        compressedSize,
        difference: originalSize - compressedSize,
        reductionPercentage: ((originalSize - compressedSize) / originalSize) * 100,
      });
      setSnackbarMessage('Archivo comprimido con éxito');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
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

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        {compressionInfo && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">
              Tamaño original: {formatBytes(compressionInfo.originalSize)}
            </Typography>
            <Typography variant="body1">
              Tamaño comprimido: {formatBytes(compressionInfo.compressedSize)}
            </Typography>
            <Typography variant="body1">
              Diferencia: {formatBytes(compressionInfo.difference)} ({compressionInfo.reductionPercentage.toFixed(2)}% reducido)
            </Typography>
            <Button
              variant="outlined"
              color="secondary"
              href={downloadUrl}
              download={`${file.name.split('.').slice(0, -1).join('.')}-compress.${file.name.split('.').pop()}`}
            >
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
