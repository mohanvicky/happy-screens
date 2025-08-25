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
  Tab,
  Tabs,
  Badge,
  Checkbox,
  FormControlLabel
} from '@mui/material'
import {
  Add,
  MoreVert,
  Edit,
  Cancel,
  ArrowBack,
  Event,
  People,
  AttachMoney,
  CheckCircle,
  Pending,
  FilterList,
  Save
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'

const EVENT_TYPES = [
  'Birthday Party', 'Anniversary', 'Date Night', 'Friends Hangout',
  'Corporate Event', 'Family Celebration', 'Movie Night', 'Other'
]

const BOOKING_STATUSES = ['confirmed', 'cancelled', 'completed', 'no_show']

export default function BookingsManagementPage() {
  const router = useRouter()

  const [bookings, setBookings] = useState([])
  const [locations, setLocations] = useState([])
  const [screens, setScreens] = useState([])
  const [timeSlots, setTimeSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Filters
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedScreen, setSelectedScreen] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  // Tabs
  const [tabValue, setTabValue] = useState(0)

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [editBooking, setEditBooking] = useState(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null)
  const [menuBooking, setMenuBooking] = useState(null)

  useEffect(() => {
    loadData()
    loadLocations()
  }, [selectedLocation, selectedScreen, selectedStatus, dateRange])

  async function loadData() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedLocation) params.append('location', selectedLocation)
      if (selectedScreen) params.append('screen', selectedScreen)
      if (selectedStatus) params.append('status', selectedStatus)
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)

      const response = await fetch(`/api/admin/bookings?${params.toString()}`)
      
      if (!response.ok) throw new Error('Failed to load bookings')

      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadLocations() {
    try {
      const response = await fetch('/api/admin/locations')
      if (response.ok) {
        const data = await response.json()
        setLocations(data.locations || [])
      }
    } catch (error) {
      console.error('Failed to load locations:', error)
    }
  }

  async function loadTimeSlots(screenId, date) {
    try {
      const response = await fetch(`/api/public/timeslots?screen=${screenId}&date=${date}`)
      if (response.ok) {
        const data = await response.json()
        setTimeSlots(data.timeSlots || [])
      }
    } catch (error) {
      console.error('Failed to load time slots:', error)
    }
  }

  useEffect(() => {
    if (selectedLocation) {
      loadScreens()
    } else {
      setScreens([])
      setSelectedScreen('')
    }
  }, [selectedLocation])

  async function loadScreens() {
    try {
      const response = await fetch(`/api/admin/screens?location=${selectedLocation}`)
      if (response.ok) {
        const data = await response.json()
        setScreens(data.screens || [])
      }
    } catch (error) {
      console.error('Failed to load screens:', error)
    }
  }

  // Open edit dialog
  function openEditDialog(booking) {
    setEditBooking({
      ...booking,
      bookingDate: new Date(booking.bookingDate).toISOString().split('T')[0]
    })
    setEditDialogOpen(true)
    handleMenuClose()
    
    // Load time slots for the selected screen and date
    if (booking.screen?.id && booking.bookingDate) {
      loadTimeSlots(booking.screen.id, new Date(booking.bookingDate).toISOString().split('T')[0])
    }
  }

  // Handle edit booking save
  async function handleSaveEdit() {
    if (!editBooking) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/bookings/${editBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: editBooking.eventType,
          numberOfGuests: editBooking.numberOfGuests,
          bookingDate: editBooking.bookingDate,
          timeSlot: editBooking.timeSlot,
          specialRequests: editBooking.specialRequests,
          bookingStatus: editBooking.bookingStatus
        })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to update booking')

      setSuccess('Booking updated successfully and customer has been notified via email')
      setEditDialogOpen(false)
      setEditBooking(null)
      loadData()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  function openBookingDialog(booking) {
    setSelectedBooking(booking)
    setDialogOpen(true)
    handleMenuClose()
  }

  function openCancelDialog(booking) {
    setSelectedBooking(booking)
    setCancellationReason('')
    setCancelDialogOpen(true)
    handleMenuClose()
  }

  async function handleCancelBooking() {
    if (!cancellationReason.trim()) {
      setError('Cancellation reason is required')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: cancellationReason,
          refundAmount: 0
        })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to cancel booking')

      setSuccess(`Booking cancelled successfully. ${selectedBooking.customerInfo.name} has been notified via email.`)
      setCancelDialogOpen(false)
      setSelectedBooking(null)
      setCancellationReason('')
      loadData()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  function handleMenuClick(event, booking) {
    setAnchorEl(event.currentTarget)
    setMenuBooking(booking)
  }

  function handleMenuClose() {
    setAnchorEl(null)
    setMenuBooking(null)
  }

  function clearMessages() {
    setError('')
    setSuccess('')
  }

  function getStatusColor(status) {
    switch (status) {
      case 'confirmed': return 'success'
      case 'cancelled': return 'error'
      case 'completed': return 'info'
      case 'no_show': return 'warning'
      default: return 'default'
    }
  }

  function getPaymentStatusColor(status) {
    switch (status) {
      case 'completed': return 'success'
      case 'pending': return 'warning'
      case 'partial': return 'info'
      case 'refunded': return 'error'
      default: return 'default'
    }
  }

  const filteredBookings = bookings.filter(booking => {
    switch (tabValue) {
      case 0: return true // All
      case 1: return booking.bookingStatus === 'confirmed'
      case 2: return booking.bookingStatus === 'cancelled'
      case 3: return booking.bookingStatus === 'completed'
      default: return true
    }
  })

  if (loading && bookings.length === 0) {
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
                Booking Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage all customer bookings
              </Typography>
            </Box>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => router.push('/admin/bookings/create')}
          >
            New Booking
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
                  <Event sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {bookings.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Bookings
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
                      {bookings.filter(b => b.bookingStatus === 'confirmed').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Confirmed
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
                  <AttachMoney sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      ₹{bookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue
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
                  <People sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {bookings.reduce((sum, b) => sum + (b.numberOfGuests || 0), 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Guests
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <FilterList sx={{ mr: 1 }} />
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  label="Location"
                >
                  <MenuItem value="">All Locations</MenuItem>
                  {locations.map(location => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Screen</InputLabel>
                <Select
                  value={selectedScreen}
                  onChange={(e) => setSelectedScreen(e.target.value)}
                  label="Screen"
                  disabled={!selectedLocation}
                >
                  <MenuItem value="">All Screens</MenuItem>
                  {screens.map(screen => (
                    <MenuItem key={screen.id} value={screen.id}>
                      {screen.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  {BOOKING_STATUSES.map(status => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Paper>

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

        {/* Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab 
              label={
                <Badge badgeContent={bookings.length} color="primary">
                  All Bookings
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={bookings.filter(b => b.bookingStatus === 'confirmed').length} color="success">
                  Confirmed
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={bookings.filter(b => b.bookingStatus === 'cancelled').length} color="error">
                  Cancelled
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={bookings.filter(b => b.bookingStatus === 'completed').length} color="info">
                  Completed
                </Badge>
              } 
            />
          </Tabs>
        </Paper>

        {/* Bookings Table */}
        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Booking ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell> 
                  <TableCell sx={{ fontWeight: 'bold' }}>Event</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Screen</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow key="no-bookings">
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No bookings found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {booking.bookingId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {booking.customerInfo.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          📞 {booking.customerInfo.phone}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          ✉️ {booking.customerInfo.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {booking.eventType}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          👥 {booking.numberOfGuests} guests
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          🕐 {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {booking.screen?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          📍 {booking.location?.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          ₹{booking.pricing?.totalAmount?.toLocaleString()}
                        </Typography>
                        <Chip 
                          label={booking.paymentInfo?.paymentStatus}
                          color={getPaymentStatusColor(booking.paymentInfo?.paymentStatus)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={booking.bookingStatus.replace('_', ' ')}
                          color={getStatusColor(booking.bookingStatus)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          onClick={(e) => handleMenuClick(e, booking)}
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

      {/* ✅ Actions Menu - Delete option completely removed */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuOption key="view" onClick={() => openBookingDialog(menuBooking)}>
          <Event sx={{ mr: 2 }} />
          View Details
        </MenuOption>
        {menuBooking?.bookingStatus === 'confirmed' && (
          <>
            <MenuOption key="edit" onClick={() => openEditDialog(menuBooking)}>
              <Edit sx={{ mr: 2 }} />
              Edit Booking
            </MenuOption>
            <MenuOption 
              key="cancel"
              onClick={() => openCancelDialog(menuBooking)}
              sx={{ color: 'warning.main' }}
            >
              <Cancel sx={{ mr: 2 }} />
              Cancel Booking
            </MenuOption>
          </>
        )}
      </Menu>

      {/* Booking Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Booking Details - {selectedBooking?.bookingId}
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Customer Name</Typography>
                <Typography variant="body1">{selectedBooking.customerInfo.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                <Typography variant="body1">{selectedBooking.customerInfo.phone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{selectedBooking.customerInfo.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Event Type</Typography>
                <Typography variant="body1">{selectedBooking.eventType}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                <Typography variant="body1">{new Date(selectedBooking.bookingDate).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Time Slot</Typography>
                <Typography variant="body1">{selectedBooking.timeSlot.startTime} - {selectedBooking.timeSlot.endTime}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Number of Guests</Typography>
                <Typography variant="body1">{selectedBooking.numberOfGuests}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Total Amount</Typography>
                <Typography variant="body1">₹{selectedBooking.pricing?.totalAmount?.toLocaleString()}</Typography>
              </Grid>
              
              {/* ✅ Enhanced Special Requests Display */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Special Requests
                </Typography>
                {selectedBooking?.specialRequests ? (
                  <Box>
                    {/* Display boolean flags as chips */}
                    {selectedBooking.specialRequests.decorations && (
                      <Chip 
                        label="🎈 Decorations" 
                        size="small" 
                        color="primary" 
                        sx={{ mr: 1, mb: 1 }} 
                      />
                    )}
                    {selectedBooking.specialRequests.cake && (
                      <Chip 
                        label="🎂 Cake Arrangement" 
                        size="small" 
                        color="primary" 
                        sx={{ mr: 1, mb: 1 }} 
                      />
                    )}
                    {selectedBooking.specialRequests.photography && (
                      <Chip 
                        label="📸 Photography Service" 
                        size="small" 
                        color="primary" 
                        sx={{ mr: 1, mb: 1 }} 
                      />
                    )}
                    
                    {/* Display custom message */}
                    {selectedBooking.specialRequests.customMessage && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                          Special Instructions:
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontStyle: 'italic', 
                            p: 2, 
                            bgcolor: 'grey.50', 
                            border: '1px solid',
                            borderColor: 'grey.200',
                            borderRadius: 1 
                          }}
                        >
                          {selectedBooking.specialRequests.customMessage}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Show "None" if no requests */}
                    {!selectedBooking.specialRequests.decorations && 
                     !selectedBooking.specialRequests.cake && 
                     !selectedBooking.specialRequests.photography && 
                     !selectedBooking.specialRequests.customMessage && (
                      <Typography variant="body2" color="text.secondary">
                        No special requests
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No special requests
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Booking - {editBooking?.bookingId}</DialogTitle>
        <DialogContent>
          {editBooking && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Event Type</InputLabel>
                  <Select
                    value={editBooking.eventType}
                    onChange={(e) => setEditBooking(prev => ({ ...prev, eventType: e.target.value }))}
                    label="Event Type"
                  >
                    {EVENT_TYPES.map(eventType => (
                      <MenuItem key={eventType} value={eventType}>
                        {eventType}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  type="number"
                  label="Number of Guests"
                  value={editBooking.numberOfGuests}
                  onChange={(e) => setEditBooking(prev => ({ 
                    ...prev, 
                    numberOfGuests: parseInt(e.target.value) || 1 
                  }))}
                  inputProps={{ min: 1, max: 50 }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  label="Booking Date"
                  value={editBooking.bookingDate}
                  onChange={(e) => {
                    setEditBooking(prev => ({ ...prev, bookingDate: e.target.value }))
                    if (editBooking.screen?.id) {
                      loadTimeSlots(editBooking.screen.id, e.target.value)
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Booking Status</InputLabel>
                  <Select
                    value={editBooking.bookingStatus}
                    onChange={(e) => setEditBooking(prev => ({ ...prev, bookingStatus: e.target.value }))}
                    label="Booking Status"
                  >
                    {BOOKING_STATUSES.map(status => (
                      <MenuItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {timeSlots.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Available Time Slots
                  </Typography>
                  <Grid container spacing={1}>
                    {timeSlots.map((slot) => (
                      <Grid item xs={12} sm={6} md={4} key={slot.id}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            border: editBooking.timeSlot?.startTime === slot.startTime ? 2 : 1,
                            borderColor: editBooking.timeSlot?.startTime === slot.startTime ? 'primary.main' : 'grey.300',
                            '&:hover': { boxShadow: 3 }
                          }}
                          onClick={() => setEditBooking(prev => ({ ...prev, timeSlot: slot }))}
                        >
                          <CardContent sx={{ py: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {slot.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {slot.startTime} - {slot.endTime}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Special Requests
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editBooking.specialRequests?.decorations || false}
                      onChange={(e) => setEditBooking(prev => ({
                        ...prev,
                        specialRequests: {
                          ...prev.specialRequests,
                          decorations: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Decorations"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editBooking.specialRequests?.cake || false}
                      onChange={(e) => setEditBooking(prev => ({
                        ...prev,
                        specialRequests: {
                          ...prev.specialRequests,
                          cake: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Cake"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editBooking.specialRequests?.photography || false}
                      onChange={(e) => setEditBooking(prev => ({
                        ...prev,
                        specialRequests: {
                          ...prev.specialRequests,
                          photography: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Photography"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Custom Message"
                  value={editBooking.specialRequests?.customMessage || ''}
                  onChange={(e) => setEditBooking(prev => ({
                    ...prev,
                    specialRequests: {
                      ...prev.specialRequests,
                      customMessage: e.target.value
                    }
                  }))}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveEdit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to cancel booking <strong>{selectedBooking?.bookingId}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Customer <strong>{selectedBooking?.customerInfo.name}</strong> will be automatically notified via email at <strong>{selectedBooking?.customerInfo.email}</strong>
          </Typography>
          <TextField
            fullWidth
            label="Cancellation Reason *"
            multiline
            rows={3}
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder="Please provide a reason for cancellation..."
            required
            disabled={loading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleCancelBooking}
            color="error"
            variant="contained"
            disabled={loading || !cancellationReason.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <Cancel />}
          >
            {loading ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
