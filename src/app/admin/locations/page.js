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
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  ArrowBack,
  LocationOn,
  Phone,
  Email,
  AccessTime
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'

const FACILITIES_LIST = [
  'Parking',
  'Restrooms', 
  'Food Court',
  'Elevator',
  'Wheelchair Accessible',
  'Security',
  'CCTV'
]

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export default function LocationsManagementPage() {
  const router = useRouter()

  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null)
  const [menuLocation, setMenuLocation] = useState(null)

  // Form state
  const [form, setForm] = useState({
    name: '',
    address: {
      street: '',
      area: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: ''
    },
    coordinates: {
      latitude: '',
      longitude: ''
    },
    contactInfo: {
      phone: '',
      email: '',
      whatsapp: ''
    },
    operatingHours: {
      monday: { open: '09:00', close: '22:00', isClosed: false },
      tuesday: { open: '09:00', close: '22:00', isClosed: false },
      wednesday: { open: '09:00', close: '22:00', isClosed: false },
      thursday: { open: '09:00', close: '22:00', isClosed: false },
      friday: { open: '09:00', close: '22:00', isClosed: false },
      saturday: { open: '09:00', close: '22:00', isClosed: false },
      sunday: { open: '09:00', close: '22:00', isClosed: false }
    },
    facilities: [],
    googleMapsUrl: '',
    isActive: true
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/locations')
      
      if (!response.ok) throw new Error('Failed to load locations')

      const data = await response.json()
      setLocations(data.locations || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  function openCreateDialog() {
    setIsEditing(false)
    setSelectedLocation(null)
    setForm({
      name: '',
      address: {
        street: '',
        area: '',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: ''
      },
      coordinates: {
        latitude: '',
        longitude: ''
      },
      contactInfo: {
        phone: '',
        email: '',
        whatsapp: ''
      },
      operatingHours: {
        monday: { open: '09:00', close: '22:00', isClosed: false },
        tuesday: { open: '09:00', close: '22:00', isClosed: false },
        wednesday: { open: '09:00', close: '22:00', isClosed: false },
        thursday: { open: '09:00', close: '22:00', isClosed: false },
        friday: { open: '09:00', close: '22:00', isClosed: false },
        saturday: { open: '09:00', close: '22:00', isClosed: false },
        sunday: { open: '09:00', close: '22:00', isClosed: false }
      },
      facilities: [],
      googleMapsUrl: '',
      isActive: true
    })
    setDialogOpen(true)
    clearMessages()
  }

  function openEditDialog(location) {
    setIsEditing(true)
    setSelectedLocation(location)
    setForm({
      name: location.name || '',
      address: location.address || {
        street: '',
        area: '',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: ''
      },
      coordinates: location.coordinates || {
        latitude: '',
        longitude: ''
      },
      contactInfo: location.contactInfo || {
        phone: '',
        email: '',
        whatsapp: ''
      },
      operatingHours: location.operatingHours || {
        monday: { open: '09:00', close: '22:00', isClosed: false },
        tuesday: { open: '09:00', close: '22:00', isClosed: false },
        wednesday: { open: '09:00', close: '22:00', isClosed: false },
        thursday: { open: '09:00', close: '22:00', isClosed: false },
        friday: { open: '09:00', close: '22:00', isClosed: false },
        saturday: { open: '09:00', close: '22:00', isClosed: false },
        sunday: { open: '09:00', close: '22:00', isClosed: false }
      },
      facilities: location.facilities || [],
      googleMapsUrl: location.googleMapsUrl || '',
      isActive: location.isActive !== undefined ? location.isActive : true
    })
    setDialogOpen(true)
    handleMenuClose()
    clearMessages()
  }

  async function handleSubmit() {
    // Validation
    if (!form.name?.trim()) {
      setError('Location name is required')
      return
    }
    if (!form.address.street?.trim()) {
      setError('Street address is required')
      return
    }
    if (!form.address.area?.trim()) {
      setError('Area is required')
      return
    }
    if (!form.address.pincode?.match(/^[1-9][0-9]{5}$/)) {
      setError('Valid pincode is required')
      return
    }
    if (!form.contactInfo.phone?.match(/^[6-9]\d{9}$/)) {
      setError('Valid phone number is required')
      return
    }
    if (!form.contactInfo.email?.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      setError('Valid email is required')
      return
    }

    try {
      const url = isEditing ? `/api/admin/locations/${selectedLocation.id}` : '/api/admin/locations'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          coordinates: {
            latitude: parseFloat(form.coordinates.latitude) || 0,
            longitude: parseFloat(form.coordinates.longitude) || 0
          }
        })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to save location')

      setSuccess(isEditing ? 'Location updated successfully' : 'Location created successfully')
      setDialogOpen(false)
      loadData()
    } catch (error) {
      setError(error.message)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this location? This will also affect all screens at this location.')) return

    try {
      const response = await fetch(`/api/admin/locations/${menuLocation.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to delete location')

      setSuccess('Location deleted successfully')
      loadData()
    } catch (error) {
      setError(error.message)
    }
    handleMenuClose()
  }

  function handleMenuClick(event, location) {
    setAnchorEl(event.currentTarget)
    setMenuLocation(location)
  }

  function handleMenuClose() {
    setAnchorEl(null)
    setMenuLocation(null)
  }

  function clearMessages() {
    setError('')
    setSuccess('')
  }

  // Helper function to update nested form state
  function updateFormField(path, value) {
    setForm(prev => {
      const newForm = { ...prev }
      const keys = path.split('.')
      let current = newForm
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newForm
    })
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
                Location Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage all business locations
              </Typography>
            </Box>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={openCreateDialog}
          >
            Add Location
          </Button>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {locations.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Locations
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTime sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {locations.filter(loc => loc.isActive).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Locations
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Phone sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {locations.filter(loc => loc.address?.city === 'Bengaluru').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bengaluru Locations
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

        {/* Locations Table */}
        <Paper sx={{ overflow: 'hidden' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight="bold">
              All Locations ({locations.length})
            </Typography>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Facilities</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locations.length === 0 ? (
                  <TableRow key="no-locations">
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No locations found. Create your first location!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  locations.map((location) => (
                    <TableRow key={location.id || location._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {location.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {location.address?.area}, {location.address?.city}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {location.fullAddress || `${location.address?.street}, ${location.address?.area}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          PIN: {location.address?.pincode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          📞 {location.contactInfo?.phone}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ✉️ {location.contactInfo?.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: 200 }}>
                          {location.facilities?.slice(0, 3).map((facility) => (
                            <Chip 
                              key={facility} 
                              label={facility} 
                              size="small" 
                              variant="outlined"
                            />
                          ))}
                          {location.facilities?.length > 3 && (
                            <Chip 
                              key="more-facilities"
                              label={`+${location.facilities.length - 3} more`} 
                              size="small" 
                              color="primary"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={location.isActive ? 'Active' : 'Inactive'}
                          color={location.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          onClick={(e) => handleMenuClick(e, location)}
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
      >
        <MenuOption key="edit" onClick={() => openEditDialog(menuLocation)}>
          <Edit sx={{ mr: 2 }} />
          Edit Location
        </MenuOption>
        <MenuOption 
          key="delete"
          onClick={handleDelete}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 2 }} />
          Delete Location
        </MenuOption>
      </Menu>

      {/* Create/Edit Location Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Location' : 'Create New Location'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {/* Basic Information */}
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Basic Information
          </Typography>
          
          <TextField
            fullWidth
            label="Location Name *"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            margin="normal"
            required
          />

          {/* Address Section */}
          <Typography variant="subtitle1" sx={{ mb: 1, mt: 3, fontWeight: 'bold' }}>
            Address Details
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Street Address *"
                value={form.address.street}
                onChange={(e) => updateFormField('address.street', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Area/Locality *"
                value={form.address.area}
                onChange={(e) => updateFormField('address.area', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={form.address.city}
                onChange={(e) => updateFormField('address.city', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={form.address.state}
                onChange={(e) => updateFormField('address.state', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Pincode *"
                value={form.address.pincode}
                onChange={(e) => updateFormField('address.pincode', e.target.value)}
                inputProps={{ maxLength: 6 }}
                required
              />
            </Grid>
          </Grid>

          {/* Contact Information */}
          <Typography variant="subtitle1" sx={{ mb: 1, mt: 3, fontWeight: 'bold' }}>
            Contact Information
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Phone Number *"
                value={form.contactInfo.phone}
                onChange={(e) => updateFormField('contactInfo.phone', e.target.value.replace(/\D/g, ''))}
                inputProps={{ maxLength: 10 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={form.contactInfo.email}
                onChange={(e) => updateFormField('contactInfo.email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="WhatsApp Number"
                value={form.contactInfo.whatsapp}
                onChange={(e) => updateFormField('contactInfo.whatsapp', e.target.value.replace(/\D/g, ''))}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
          </Grid>

          {/* Coordinates */}
          <Typography variant="subtitle1" sx={{ mb: 1, mt: 3, fontWeight: 'bold' }}>
            Location Coordinates
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                value={form.coordinates.latitude}
                onChange={(e) => updateFormField('coordinates.latitude', e.target.value)}
                inputProps={{ step: 'any' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                value={form.coordinates.longitude}
                onChange={(e) => updateFormField('coordinates.longitude', e.target.value)}
                inputProps={{ step: 'any' }}
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Google Maps URL"
            value={form.googleMapsUrl}
            onChange={(e) => setForm(prev => ({ ...prev, googleMapsUrl: e.target.value }))}
            margin="normal"
            helperText="Optional: Link to Google Maps location"
          />

          {/* Facilities */}
          <Typography variant="subtitle1" sx={{ mb: 1, mt: 3, fontWeight: 'bold' }}>
            Facilities & Settings
          </Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel>Facilities</InputLabel>
            <Select
              multiple
              value={form.facilities || []}
              onChange={(e) => setForm(prev => ({ ...prev, facilities: e.target.value }))}
              label="Facilities"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {FACILITIES_LIST.map((facility) => (
                <MenuItem key={facility} value={facility}>
                  {facility}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
              />
            }
            label="Active Location"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading}
          >
            {isEditing ? 'Update Location' : 'Create Location'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
