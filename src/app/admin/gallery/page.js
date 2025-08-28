'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Paper,
  Chip
} from '@mui/material'
import { 
  Delete, 
  ArrowBack, 
  CloudUpload, 
  PhotoLibrary,
  Visibility,
  Close,
  LocationOn,
  Movie
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'

export default function GalleryPage() {
  const router = useRouter()

  const [images, setImages] = useState([])
  const [locations, setLocations] = useState([])
  const [screens, setScreens] = useState([])

  // Initialize with empty strings to keep Select components controlled
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedScreen, setSelectedScreen] = useState('')

  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [refreshFlag, setRefreshFlag] = useState(false)
  const [loading, setLoading] = useState(true)

  // Image viewer dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Build conditional query params only if values are not empty
        const params = new URLSearchParams()
        if (selectedLocation && selectedLocation !== '') {
          params.append('location', selectedLocation)
        }
        if (selectedScreen && selectedScreen !== '') {
          params.append('screen', selectedScreen)
        }
        
        const [locRes, imgRes] = await Promise.all([
          fetch('/api/admin/locations'),
          fetch(`/api/admin/gallery?${params.toString()}`)
        ])

        if (!locRes.ok) throw new Error('Failed to load locations')
        if (!imgRes.ok) throw new Error('Failed to load images')

        const locData = await locRes.json()
        const imgData = await imgRes.json()

        setLocations(locData.locations || [])
        setImages(imgData.images || [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedLocation, selectedScreen, refreshFlag])

  // Load screens when location changes
  useEffect(() => {
    async function loadScreens() {
      if (!selectedLocation || selectedLocation === '') {
        setScreens([])
        setSelectedScreen('')
        return
      }
      
      try {
        const res = await fetch(`/api/admin/screens?location=${selectedLocation}`)
        const data = await res.json()
        setScreens(data.screens || [])
      } catch (e) {
        console.error('Failed to load screens:', e)
        setScreens([])
      }
    }
    loadScreens()
  }, [selectedLocation])

  function handleFileChange(e) {
    setFile(e.target.files[0])
    setError('')
    setSuccess('')
  }

  async function uploadImage() {
    if (!file) {
      setError('Please select an image file')
      return
    }
    if (!selectedLocation || selectedLocation === '') {
      setError('Please select a location')
      return
    }
    
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('location', selectedLocation)
      formData.append('screen', selectedScreen || '') // Screen is optional
      formData.append('alt', file.name)

      const res = await fetch('/api/admin/gallery/images/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setSuccess('Image uploaded successfully')
      setFile(null)
      setError('')
      setRefreshFlag(f => !f)
    } catch (e) {
      setError(e.message)
      setSuccess('')
    } finally {
      setUploading(false)
    }
  }

  async function deleteImage(imageId) {
    if (!confirm('Are you sure you want to delete this image?')) return
    try {
      const res = await fetch(`/api/admin/gallery/${imageId}`, { 
        method: 'DELETE' 
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Delete failed')

      setSuccess('Image deleted successfully')
      setError('')
      setRefreshFlag(f => !f)
    } catch (e) {
      setError(e.message)
      setSuccess('')
    }
  }

  function viewImage(image) {
    setSelectedImage(image)
    setViewDialogOpen(true)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2, boxShadow: 1 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.back()}>
          Back
        </Button>
        <PhotoLibrary sx={{ color: 'primary.main' }} />
        <Typography variant="h5" fontWeight="bold">Gallery Management</Typography>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Alert Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Upload Section */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <CloudUpload sx={{ mr: 1 }} />
            Upload New Images
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Location</InputLabel>
                <Select 
                  value={selectedLocation} 
                  onChange={e => {
                    setSelectedLocation(e.target.value || '')
                    setSelectedScreen('') // Reset screen when location changes
                  }}
                  label="Location"
                >
                  {locations.map(loc => (
                    <MenuItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Screen (Optional)</InputLabel>
                <Select 
                  value={selectedScreen} 
                  onChange={e => setSelectedScreen(e.target.value || '')} 
                  disabled={!selectedLocation || screens.length === 0}
                  label="Screen (Optional)"
                >
                  <MenuItem value="">No specific screen</MenuItem>
                  {screens.map(scr => (
                    <MenuItem key={scr.id} value={scr.id}>
                      {scr.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              component="label"
              disabled={uploading}
              startIcon={<CloudUpload />}
            >
              {file ? 'Change Image' : 'Select Image'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>

            {file && (
              <Typography variant="body2" color="text.secondary">
                Selected: {file.name}
              </Typography>
            )}

            <Button
              variant="contained"
              onClick={uploadImage}
              disabled={uploading || !file || !selectedLocation}
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </Box>
        </Paper>

        {/* Filter Section */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Filter Images</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select 
                  value={selectedLocation} 
                  onChange={e => {
                    setSelectedLocation(e.target.value || '')
                    setSelectedScreen('') // Reset screen when location changes
                  }}
                  label="Location"
                  sx={{minWidth: "200px"}}
                >
                  <MenuItem value="">All Locations</MenuItem>
                  {locations.map(loc => (
                    <MenuItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Screen</InputLabel>
                <Select 
                  value={selectedScreen} 
                  onChange={e => setSelectedScreen(e.target.value || '')} 
                  disabled={!selectedLocation || screens.length === 0}
                  label="Screen"
                  sx={{minWidth: "200px"}}
                >
                  <MenuItem value="">All Screens</MenuItem>
                  {screens.map(scr => (
                    <MenuItem key={scr.id} value={scr.id}>
                      {scr.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Images Grid */}
        {images.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <PhotoLibrary sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No images found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {selectedLocation ? 'No images found for the selected filters' : 'Upload your first images to get started'}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {images.map(img => (
              <Grid item key={img.id || img._id} xs={12} sm={6} md={4} lg={3}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={img.url}
                    alt={img.alt || 'Gallery Image'}
                    sx={{ 
                      objectFit: 'cover',
                      cursor: 'pointer'
                    }}
                    onClick={() => viewImage(img)}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {img.alt || 'No description'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Uploaded: {new Date(img.createdAt).toLocaleDateString()}
                    </Typography>
                    
                    <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {img.location && (
                        <Chip
                          label={img.location.name}
                          size="small"
                          icon={<LocationOn />}
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      {img.screen && (
                        <Chip
                          label={img.screen.name}
                          size="small"
                          icon={<Movie />}
                          color="secondary"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => viewImage(img)}
                      startIcon={<Visibility />}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => deleteImage(img.id || img._id)}
                      startIcon={<Delete />}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Image Viewer Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {selectedImage?.alt || 'Image'}
          </Typography>
          <IconButton onClick={() => setViewDialogOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box>
              <img
                src={selectedImage.url}
                alt={selectedImage.alt}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selectedImage.location && (
                  <Chip
                    label={selectedImage.location.name}
                    icon={<LocationOn />}
                    color="primary"
                  />
                )}
                {selectedImage.screen && (
                  <Chip
                    label={selectedImage.screen.name}
                    icon={<Movie />}
                    color="secondary"
                  />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Uploaded: {new Date(selectedImage.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
