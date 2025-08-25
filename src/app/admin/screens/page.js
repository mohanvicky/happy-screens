'use client'

import { useState, useEffect } from 'react'
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Chip,
    IconButton,
    Menu,
    MenuItem as MenuOption,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Grid,
    CardMedia,
    Avatar
} from '@mui/material'
import {
    Add,
    MoreVert,
    Edit,
    Delete,
    ArrowBack,
    Movie,
    LocationOn,
    People,
    CheckCircle,
    PhotoCamera,
    Close,
    Star,
    StarBorder
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'

const AMENITIES_LIST = [
    'AC',
    'Projector',
    'Sound System',
    'Comfortable Seating',
    'LED TV',
    'Gaming Console',
    'Karaoke',
    'Decorations Allowed',
    'Food Service',
    'Parking',
    'WiFi',
    'Snacks Available'
]

export default function ScreensManagementPage() {
    const router = useRouter()

    const [screens, setScreens] = useState([])
    const [locations, setLocations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [selectedScreen, setSelectedScreen] = useState(null)

    // Menu state
    const [anchorEl, setAnchorEl] = useState(null)
    const [menuScreen, setMenuScreen] = useState(null)

    // Image upload states
    const [uploadingImage, setUploadingImage] = useState(false)
    const [selectedImages, setSelectedImages] = useState([])
    const [imageFiles, setImageFiles] = useState([])

    // Form state with proper initialization to avoid controlled/uncontrolled errors
    const [form, setForm] = useState({
        name: '',
        description: '',
        capacity: 10,
        location: '',
        amenities: [],
        pricePerHour: 0,
        isActive: true,
        images: []
    })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const [screensRes, locationsRes] = await Promise.all([
                fetch('/api/admin/screens'),
                fetch('/api/admin/locations')
            ])

            if (!screensRes.ok) throw new Error('Failed to load screens')
            if (!locationsRes.ok) throw new Error('Failed to load locations')

            const screensData = await screensRes.json()
            const locationsData = await locationsRes.json()

            setScreens(screensData.screens || [])
            setLocations(locationsData.locations || [])
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    function openCreateDialog() {
        setIsEditing(false)
        setSelectedScreen(null)
        setForm({
            name: '',
            description: '',
            capacity: 10,
            location: '',
            amenities: [],
            pricePerHour: 0,
            isActive: true,
            images: []
        })
        setSelectedImages([])
        setImageFiles([])
        setDialogOpen(true)
        clearMessages()
    }

    function openEditDialog(screen) {
        setIsEditing(true)
        setSelectedScreen(screen)
        
        const locationId = screen.location?.id || screen.location?._id || screen.location || ''
        setForm({
            name: screen.name || '',
            description: screen.description || '',
            capacity: screen.capacity || 10,
            location: locationId,
            amenities: screen.amenities || [],
            pricePerHour: screen.pricePerHour || 0,
            isActive: screen.isActive !== undefined ? screen.isActive : true,
            images: screen.images || []
        })
        setSelectedImages(screen.images || [])
        setImageFiles([])
        setDialogOpen(true)
        handleMenuClose()
        clearMessages()
    }

    // Image upload handler
    function handleImageSelect(event) {
        const files = Array.from(event.target.files)
        
        if (files.length === 0) return

        // Validate file types
        const validFiles = files.filter(file => {
            const isValid = file.type.startsWith('image/')
            if (!isValid) {
                setError(`${file.name} is not a valid image file`)
            }
            return isValid
        })

        if (validFiles.length === 0) return

        // Create preview URLs
        const newImagePreviews = validFiles.map((file, index) => ({
            id: `temp_${Date.now()}_${index}`,
            file,
            url: URL.createObjectURL(file),
            alt: file.name,
            isPrimary: selectedImages.length === 0 && index === 0, // First image is primary if no existing images
            isNew: true
        }))

        setImageFiles(prev => [...prev, ...validFiles])
        setSelectedImages(prev => [...prev, ...newImagePreviews])
    }

    // Remove image
    // Enhanced removeImage function with Supabase deletion
async function removeImage(imageIndex) {
    const imageToRemove = selectedImages[imageIndex]
    
    // If it's an existing image (not newly uploaded), delete from Supabase
    if (imageToRemove && !imageToRemove.isNew && imageToRemove.path) {
      try {
        const response = await fetch('/api/admin/screens/images/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: imageToRemove.path })
        })
        
        if (!response.ok) {
          console.error('Failed to delete image from Supabase')
          // Continue with UI removal even if Supabase deletion fails
        }
      } catch (error) {
        console.error('Error deleting image:', error)
      }
    }
  
    setSelectedImages(prev => {
      const updated = prev.filter((_, index) => index !== imageIndex)
      // If we removed the primary image, make the first remaining image primary
      if (updated.length > 0 && !updated.some(img => img.isPrimary)) {
        updated[0].isPrimary = true
      }
      return updated
    })
    
    // Also remove from files if it's a new upload
    if (imageToRemove?.isNew) {
      setImageFiles(prev => prev.filter(file => file.name !== imageToRemove.file?.name))
    }
  }
  

    // Set primary image
    function setPrimaryImage(imageIndex) {
        setSelectedImages(prev => prev.map((img, index) => ({
            ...img,
            isPrimary: index === imageIndex
        })))
    }

    // In your Screen Management component, update the uploadImages function:

async function uploadImages() {
    if (imageFiles.length === 0) return []
  
    setUploadingImage(true)
    try {
      const uploadPromises = imageFiles.map(async (file) => {
        const formData = new FormData()
        formData.append('image', file)
        formData.append('alt', file.name)
        
        const selectedImage = selectedImages.find(img => img.file === file)
        formData.append('isPrimary', selectedImage?.isPrimary ? 'true' : 'false')
  
        const response = await fetch('/api/admin/screens/images/upload', {
          method: 'POST',
          body: formData
        })
  
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to upload ${file.name}`)
        }
        
        const data = await response.json()
        return data.image // This now includes url, path, alt, and isPrimary
      })
  
      const uploadedImages = await Promise.all(uploadPromises)
      return uploadedImages
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`)
    } finally {
      setUploadingImage(false)
    }
  }
  

    async function handleSubmit() {
        if (!form.name?.trim()) {
            setError('Screen name is required')
            return
        }
        if (!form.location) {
            setError('Location is required')
            return
        }
        if (!form.capacity || form.capacity < 1) {
            setError('Valid capacity is required')
            return
        }
        if (form.pricePerHour === undefined || form.pricePerHour < 0) {
            setError('Valid price per hour is required')
            return
        }

        try {
            // Upload new images first
            let allImages = []
            
            // Add existing images (for edit mode)
            const existingImages = selectedImages.filter(img => !img.isNew)
            allImages = [...existingImages]
            
            // Upload new images
            if (imageFiles.length > 0) {
                const uploadedImages = await uploadImages()
                allImages = [...allImages, ...uploadedImages]
            }

            const url = isEditing ? `/api/admin/screens/${selectedScreen.id}` : '/api/admin/screens'
            const method = isEditing ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    name: form.name.trim(),
                    description: form.description?.trim() || '',
                    images: allImages
                })
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.error || 'Failed to save screen')

            setSuccess(isEditing ? 'Screen updated successfully' : 'Screen created successfully')
            setDialogOpen(false)
            loadData()
        } catch (error) {
            setError(error.message)
        }
    }

    async function handleDelete() {
        if (!confirm('Are you sure you want to delete this screen?')) return

        try {
            const response = await fetch(`/api/admin/screens/${menuScreen.id}`, {
                method: 'DELETE'
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.error || 'Failed to delete screen')

            setSuccess('Screen deleted successfully')
            loadData()
        } catch (error) {
            setError(error.message)
        }
        handleMenuClose()
    }

    function handleMenuClick(event, screen) {
        setAnchorEl(event.currentTarget)
        setMenuScreen(screen)
    }

    function handleMenuClose() {
        setAnchorEl(null)
        setMenuScreen(null)
    }

    function clearMessages() {
        setError('')
        setSuccess('')
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
            <Box sx={{ bgcolor: 'white', boxShadow: 1, px: 3, py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={() => router.back()}>
                            <ArrowBack />
                        </IconButton>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                Screen Management
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Manage screens across all locations
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={openCreateDialog}
                    >
                        Add Screen
                    </Button>
                </Box>
            </Box>

            <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Movie sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">
                                            {screens.length}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Screens
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CheckCircle sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">
                                            {screens.filter(screen => screen.isActive).length}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Active Screens
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LocationOn sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">
                                            {locations.length}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Locations
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <People sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">
                                            {screens.reduce((sum, screen) => sum + (screen.capacity || 0), 0)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Capacity
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Messages */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={clearMessages}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }} onClose={clearMessages}>
                        {success}
                    </Alert>
                )}

                {/* Screens Table */}
                <Paper sx={{ overflow: 'hidden' }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h6" fontWeight="bold">
                            All Screens ({screens.length})
                        </Typography>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.50' }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Screen</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Price/Hour</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Amenities</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {screens.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No screens found. Create your first screen!
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    screens.map((screen) => (
                                        <TableRow key={screen.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    {/* Screen Image */}
                                                    {screen.images && screen.images.length > 0 ? (
                                                        <Avatar
                                                            src={screen.images.find(img => img.isPrimary)?.url || screen.images[0]?.url}
                                                            alt={screen.name}
                                                            sx={{ width: 60, height: 60, borderRadius: 2 }}
                                                            variant="rounded"
                                                        />
                                                    ) : (
                                                        <Avatar
                                                            sx={{ width: 60, height: 60, borderRadius: 2, bgcolor: 'grey.300' }}
                                                            variant="rounded"
                                                        >
                                                            <Movie />
                                                        </Avatar>
                                                    )}
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {screen.name}
                                                        </Typography>
                                                        {screen.description && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                {screen.description}
                                                            </Typography>
                                                        )}
                                                        {screen.images && screen.images.length > 0 && (
                                                            <Typography variant="caption" color="primary">
                                                                {screen.images.length} image(s)
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {screen.location?.name || 'Unknown Location'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {screen.capacity} people
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    ₹{screen.pricePerHour}/hr
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: 200 }}>
                                                    {screen.amenities?.slice(0, 3).map((amenity) => (
                                                        <Chip
                                                            key={amenity}
                                                            label={amenity}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                    {screen.amenities?.length > 3 && (
                                                        <Chip
                                                            label={`+${screen.amenities.length - 3} more`}
                                                            size="small"
                                                            color="primary"
                                                        />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={screen.isActive ? 'Active' : 'Inactive'}
                                                    color={screen.isActive ? 'success' : 'default'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    onClick={(e) => handleMenuClick(e, screen)}
                                                    size="small"
                                                >
                                                    <MoreVert />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>

            {/* Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuOption onClick={() => openEditDialog(menuScreen)}>
                    <Edit sx={{ mr: 2 }} />
                    Edit Screen
                </MenuOption>
                <MenuOption
                    onClick={handleDelete}
                    sx={{ color: 'error.main' }}
                >
                    <Delete sx={{ mr: 2 }} />
                    Delete Screen
                </MenuOption>
            </Menu>

            {/* Create/Edit Screen Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
                <DialogTitle>
                    {isEditing ? 'Edit Screen' : 'Create New Screen'}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    {/* Basic Information Section */}
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                        Basic Information
                    </Typography>

                    <TextField
                        fullWidth
                        label="Screen Name *"
                        value={form.name}
                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                        margin="normal"
                        required
                        error={!form.name?.trim()}
                        helperText={!form.name?.trim() ? 'Screen name is required' : 'Enter a unique screen name'}
                    />

                    <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={2}
                        value={form.description}
                        onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                        margin="normal"
                        helperText="Optional description for the screen"
                    />

                    <FormControl fullWidth margin="normal" required error={!form.location}>
                        <InputLabel>Location *</InputLabel>
                        <Select
                            value={form.location || ''}
                            onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                            label="Location *"
                            MenuProps={{
                                anchorOrigin: {
                                    vertical: "bottom",
                                    horizontal: "left"
                                },
                                transformOrigin: {
                                    vertical: "top",
                                    horizontal: "left"
                                }
                            }}
                        >
                            {locations.map((location) => (
                                <MenuItem key={location.id} value={location.id}>
                                    {location.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {!form.location && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                Location is required
                            </Typography>
                        )}
                    </FormControl>

                    {/* Images Section */}
                    <Typography variant="subtitle1" sx={{ mb: 2, mt: 3, fontWeight: 'bold' }}>
                        Screen Images
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<PhotoCamera />}
                            disabled={uploadingImage}
                            sx={{ mr: 2 }}
                        >
                            {uploadingImage ? 'Uploading...' : 'Add Images'}
                            <input
                                type="file"
                                hidden
                                multiple
                                accept="image/*"
                                onChange={handleImageSelect}
                            />
                        </Button>
                        <Typography variant="caption" color="text.secondary">
                            Upload multiple images. Click the star to set as primary image.
                        </Typography>
                    </Box>

                    {selectedImages.length > 0 && (
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            {selectedImages.map((image, index) => (
                                <Grid item xs={12} sm={6} md={4} key={image.id || index}>
                                    <Card sx={{ position: 'relative' }}>
                                        <CardMedia
                                            component="img"
                                            height="120"
                                            image={image.url}
                                            alt={image.alt}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            display: 'flex',
                                            gap: 1
                                        }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => setPrimaryImage(index)}
                                                sx={{
                                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                                                }}
                                            >
                                                {image.isPrimary ? (
                                                    <Star sx={{ color: 'gold' }} />
                                                ) : (
                                                    <StarBorder />
                                                )}
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => removeImage(index)}
                                                sx={{
                                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                                                }}
                                            >
                                                <Close sx={{ color: 'error.main' }} />
                                            </IconButton>
                                        </Box>
                                        {image.isPrimary && (
                                            <Chip
                                                label="Primary"
                                                size="small"
                                                color="primary"
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 8,
                                                    left: 8
                                                }}
                                            />
                                        )}
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {/* Capacity and Price Section */}
                    <Typography variant="subtitle1" sx={{ mb: 1, mt: 3, fontWeight: 'bold' }}>
                        Capacity & Pricing
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                type="number"
                                label="Capacity *"
                                fullWidth
                                value={form.capacity}
                                onChange={(e) => setForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                                inputProps={{ min: 1, max: 50 }}
                                helperText="Maximum number of people"
                                required
                                error={!form.capacity || form.capacity < 1}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                type="number"
                                label="Price per Hour (₹) *"
                                fullWidth
                                value={form.pricePerHour}
                                onChange={(e) => setForm(prev => ({ ...prev, pricePerHour: parseFloat(e.target.value) || 0 }))}
                                inputProps={{ min: 0, step: 50 }}
                                helperText="Hourly rental price"
                                required
                                error={form.pricePerHour === undefined || form.pricePerHour < 0}
                            />
                        </Grid>
                    </Grid>

                    {/* Amenities Section */}
                    <Typography variant="subtitle1" sx={{ mb: 1, mt: 3, fontWeight: 'bold' }}>
                        Amenities & Settings
                    </Typography>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Amenities</InputLabel>
                        <Select
                            multiple
                            value={form.amenities || []}
                            onChange={(e) => setForm(prev => ({ ...prev, amenities: e.target.value }))}
                            label="Amenities"
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value} size="small" />
                                    ))}
                                </Box>
                            )}
                            MenuProps={{
                                anchorOrigin: {
                                    vertical: "bottom",
                                    horizontal: "left"
                                },
                                transformOrigin: {
                                    vertical: "top",
                                    horizontal: "left"
                                },
                                PaperProps: {
                                    style: {
                                        maxHeight: 300,
                                    },
                                },
                            }}
                        >
                            {AMENITIES_LIST.map((amenity) => (
                                <MenuItem key={amenity} value={amenity}>
                                    {amenity}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={form.isActive}
                            onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.value }))}
                            label="Status"
                        >
                            <MenuItem value={true}>Active</MenuItem>
                            <MenuItem value={false}>Inactive</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={loading || uploadingImage}
                    >
                        {uploadingImage ? 'Uploading...' : (isEditing ? 'Update Screen' : 'Create Screen')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
