'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Zoom,
  Fade
} from '@mui/material'
import {
  LocationOn,
  AccessTime,
  People,
  AttachMoney,
  CheckCircle,
  Movie,
  Star,
  Event,
  Cancel
} from '@mui/icons-material'
import Image from 'next/image'

// ✅ Dynamic steps based on what's pre-selected
const getSteps = (hasPreSelectedScreen, hasPreSelectedEvent) => {
  if (hasPreSelectedScreen) {
    return ['Select Date & Time', 'Choose Event Type', 'Customer Details', 'Confirmation']
  } else if (hasPreSelectedEvent) {
    return ['Select Location & Screen', 'Select Date & Time', 'Customer Details', 'Confirmation']
  } else {
    return ['Select Location & Screen', 'Select Date & Time', 'Choose Event Type', 'Customer Details', 'Confirmation']
  }
}

export default function PublicBookingPage() {
  const searchParams = useSearchParams()

  // ✅ Get URL parameters for pre-selection
  const preSelectedLocation = searchParams.get('location')
  const preSelectedScreen = searchParams.get('screen')
  const preSelectedEvent = searchParams.get('event')

  const hasPreSelectedScreen = !!(preSelectedLocation && preSelectedScreen)
  const hasPreSelectedEvent = !!preSelectedEvent

  const steps = getSteps(hasPreSelectedScreen, hasPreSelectedEvent)
  const [activeStep, setActiveStep] = useState(0)

  const [locations, setLocations] = useState([])
  const [screens, setScreens] = useState([])
  const [timeSlots, setTimeSlots] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ✅ Pre-selected info states
  const [selectedLocationInfo, setSelectedLocationInfo] = useState(null)
  const [selectedScreenInfo, setSelectedScreenInfo] = useState(null)
  const [selectedEventInfo, setSelectedEventInfo] = useState(null)
  const [availableScreens, setAvailableScreens] = useState([])

  // ✅ Booking form state with pre-selected values
  const [bookingForm, setBookingForm] = useState({
    location: preSelectedLocation || '',
    screen: preSelectedScreen || '',
    date: '',
    timeSlot: null,
    eventType: '',
    selectedEvent: null,
    numberOfGuests: 2,
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      alternatePhone: ''
    },
    specialRequests: {
      decorations: false,
      cake: false,
      photography: false,
      customMessage: ''
    }
  })

  const [confirmationDialog, setConfirmationDialog] = useState(false)
  const [bookingResult, setBookingResult] = useState(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  // ✅ Load screens when location changes (for direct navigation)
  useEffect(() => {
    if (bookingForm.location && !hasPreSelectedScreen) {
      loadScreensForLocation(bookingForm.location)
    }
  }, [bookingForm.location, hasPreSelectedScreen])

  // ✅ Load available time slots when date is selected
  useEffect(() => {
    if (bookingForm.date && bookingForm.screen) {
      loadTimeSlots()
    }
  }, [bookingForm.date, bookingForm.screen])

  async function loadInitialData() {
    try {
      const [locationsRes, screensRes, eventsRes] = await Promise.all([
        fetch('/api/public/locations'),
        fetch('/api/public/screens'),
        fetch('/api/public/events')
      ])

      const [locationsData, screensData, eventsData] = await Promise.all([
        locationsRes.ok ? locationsRes.json() : { locations: [] },
        screensRes.ok ? screensRes.json() : { screens: [] },
        eventsRes.ok ? eventsRes.json() : { events: [] }
      ])

      setLocations(locationsData.locations || [])
      setScreens(screensData.screens || [])
      setEvents(eventsData.events || [])

      let locationInfo = null
      let screenInfo = null
      let eventInfo = null

      // ✅ Set pre-selected location and screen info
      if (preSelectedLocation) {
        locationInfo = locationsData.locations?.find(l => l.id === preSelectedLocation)
        setSelectedLocationInfo(locationInfo)
      }

      if (preSelectedScreen) {
        screenInfo = screensData.screens?.find(s => s.id === preSelectedScreen)
        setSelectedScreenInfo(screenInfo)
      }

      // ✅ Set pre-selected event info
      if (preSelectedEvent) {
        eventInfo = eventsData.events?.find(e => e.id === preSelectedEvent)
        if (eventInfo) {
          setSelectedEventInfo(eventInfo)
          setBookingForm(prev => ({
            ...prev,
            selectedEvent: eventInfo,
            eventType: eventInfo.name
          }))
        }
      }

      // ✅ Show success message for pre-selection
      if (preSelectedLocation && preSelectedScreen && locationInfo && screenInfo) {
        setSuccess(`Pre-selected: ${screenInfo.name} at ${locationInfo.name} - Please select your date and time`)
      } else if (preSelectedEvent && eventInfo) {
        setSuccess(`Pre-selected event: ${eventInfo.name} - Please select your location, screen, and time`)
      }

    } catch (error) {
      console.error('Failed to load initial data:', error)
      setError('Failed to load booking information. Please refresh and try again.')
    }
  }

  // ✅ Load screens for selected location (direct navigation)
  async function loadScreensForLocation(locationId) {
    try {
      const response = await fetch(`/api/public/screens?location=${locationId}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableScreens(data.screens || [])
      }
    } catch (error) {
      console.error('Failed to load screens for location:', error)
    }
  }

  // ✅ Load time slots with double booking prevention
  async function loadTimeSlots() {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/public/timeslots?screen=${bookingForm.screen}&date=${bookingForm.date}`
      )

      if (response.ok) {
        const data = await response.json()
        setTimeSlots(data.timeSlots || [])

        // ✅ Clear selected time slot if it's no longer available
        if (bookingForm.timeSlot) {
          const isStillAvailable = data.timeSlots.some(slot =>
            slot.startTime === bookingForm.timeSlot.startTime &&
            slot.endTime === bookingForm.timeSlot.endTime
          )

          if (!isStillAvailable) {
            setBookingForm(prev => ({ ...prev, timeSlot: null }))
            setError('Your selected time slot is no longer available. Please choose another time.')
          }
        }
      } else {
        setTimeSlots([])
        setError('No time slots available for the selected date')
      }
    } catch (error) {
      console.error('Failed to load time slots:', error)
      setError('Failed to check availability')
    } finally {
      setLoading(false)
    }
  }

  async function createBooking() {
    setLoading(true)
    try {
      const response = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerInfo: bookingForm.customerInfo,
          screen: bookingForm.screen,
          location: bookingForm.location,
          bookingDate: bookingForm.date,
          timeSlot: bookingForm.timeSlot,
          eventType: bookingForm.selectedEvent?.name || bookingForm.eventType,
          eventId: bookingForm.selectedEvent?.id,
          numberOfGuests: bookingForm.numberOfGuests,
          specialRequests: bookingForm.specialRequests
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // ✅ Handle slot unavailability error specifically
        if (response.status === 409) {
          setError(data.error || 'Selected time slot is no longer available. Please choose a different time.')
          // Refresh time slots to show current availability
          loadTimeSlots()
          return
        }
        throw new Error(data.error || 'Failed to create booking')
      }

      setBookingResult(data.booking)
      setSuccess('Booking created successfully!')
      setConfirmationDialog(true)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  function handleNext() {
    if (activeStep === steps.length - 1) {
      createBooking()
    } else {
      setActiveStep((prev) => prev + 1)
    }
  }

  function handleBack() {
    setActiveStep((prev) => prev - 1)
  }

  // ✅ Dynamic step validation based on current flow
  function isStepValid() {
    const currentStepIndex = activeStep
    const currentStepName = steps[currentStepIndex]

    switch (currentStepName) {
      case 'Select Location & Screen':
        return bookingForm.location && bookingForm.screen
      case 'Select Date & Time':
        return bookingForm.date && bookingForm.timeSlot
      case 'Choose Event Type':
        return bookingForm.eventType || bookingForm.selectedEvent
      case 'Customer Details':
        const phoneRegex = /^[6-9]\d{9}$/
        return bookingForm.customerInfo.name &&
          bookingForm.customerInfo.email &&
          phoneRegex.test(bookingForm.customerInfo.phone) &&
          bookingForm.numberOfGuests > 0 &&
          bookingForm.numberOfGuests <= Math.min(selectedScreenInfo?.capacity || 50, bookingForm.selectedEvent?.maxCapacity || 50)
      case 'Confirmation':
        return true
      default:
        return false
    }
  }

  function renderStepContent() {
    const currentStepName = steps[activeStep]

    switch (currentStepName) {
      case 'Select Location & Screen': // Only for direct navigation or event pre-selection
        return (
          <Grid container spacing={3}>
            {/* ✅ Show pre-selected event info if available */}
            {selectedEventInfo && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Event Pre-selected:</strong> {selectedEventInfo.name} - {selectedEventInfo.description}
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Location Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Location</InputLabel>
                <Select
                  value={bookingForm.location}
                  onChange={(e) => {
                    setBookingForm(prev => ({
                      ...prev,
                      location: e.target.value,
                      screen: '' // Reset screen when location changes
                    }))
                    const selectedLoc = locations.find(l => l.id === e.target.value)
                    setSelectedLocationInfo(selectedLoc)
                  }}
                  label="Select Location"
                  disabled={!!preSelectedLocation}
                >
                  {locations.map(location => (
                    <MenuItem key={location.id} value={location.id}>
                      <Box>
                        <Typography variant="body1">{location.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {location.address?.area}, {location.address?.city}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Screen Selection */}
            {bookingForm.location && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Available Screens
                </Typography>
                <Grid container spacing={2}>
                  {availableScreens.map((screen, index) => (
                    <Grid item xs={12} sm={6} md={4} key={screen.id}>
                      <Zoom in timeout={300 + index * 100}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            border: bookingForm.screen === screen.id ? 2 : 1,
                            borderColor: bookingForm.screen === screen.id ? 'primary.main' : 'grey.300',
                            '&:hover': {
                              boxShadow: 6,
                              transform: 'translateY(-4px)'
                            },
                            bgcolor: bookingForm.screen === screen.id ? 'primary.50' : 'inherit',
                            transition: 'all 0.3s ease'
                          }}
                          onClick={() => {
                            setBookingForm(prev => ({ ...prev, screen: screen.id }))
                            setSelectedScreenInfo(screen)
                          }}
                        >
                          <CardContent>
                            {/* Screen Image */}
                            {screen.images && screen.images.length > 0 ? (
                              <CardMedia
                                component="img"
                                height="120"
                                image={screen.images[0].url}
                                alt={screen.name}
                                sx={{ objectFit: 'cover', borderRadius: 1, mb: 2 }}
                              />
                            ) : (
                              <Box sx={{
                                height: 120,
                                bgcolor: 'grey.200',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2
                              }}>
                                <Movie sx={{ fontSize: 40, color: 'grey.400' }} />
                              </Box>
                            )}

                            <Typography variant="h6" gutterBottom>
                              {screen.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Capacity: {screen.capacity} people
                            </Typography>
                            <Typography variant="body2" color="success.main" fontWeight="bold" gutterBottom>
                              ₹{screen.pricePerHour.toLocaleString()}/hour
                            </Typography>

                            {screen.amenities && screen.amenities.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                {screen.amenities.slice(0, 3).map((amenity, i) => (
                                  <Chip key={i} label={amenity} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                                ))}
                                {screen.amenities.length > 3 && (
                                  <Typography variant="caption" color="text.secondary">
                                    +{screen.amenities.length - 3} more
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Zoom>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}
          </Grid>
        )

      case 'Select Date & Time':
        return (
          <Grid container spacing={3}>
            {/* ✅ Show selected screen info */}
            <Grid item xs={12}>
              <Card sx={{
                bgcolor: 'primary.50',
                border: '2px solid',
                borderColor: 'primary.200',
                overflow: 'hidden'
              }}>
                <CardContent sx={{ p: 0 }}>
                  <Grid container>
                    {/* Screen Image */}
                    <Grid item xs={12} md={4}>
                      {selectedScreenInfo?.images && selectedScreenInfo.images.length > 0 ? (
                        <CardMedia
                          component="img"
                          height="200"
                          image={selectedScreenInfo.images[0].url}
                          alt={selectedScreenInfo.name}
                          sx={{ objectFit: 'cover', width: '100%' }}
                        />
                      ) : (
                        <Box sx={{
                          height: 200,
                          bgcolor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          gap: 1
                        }}>
                          <Movie sx={{ fontSize: 60, color: 'grey.400' }} />
                          <Typography variant="caption" color="text.secondary">
                            Screen Preview
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    {/* Screen Details */}
                    <Grid item xs={12} md={8}>
                      <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Movie color="primary" />
                          <Typography variant="h5" fontWeight="bold" color="primary.main">
                            {selectedScreenInfo?.name || 'Selected Screen'}
                          </Typography>
                          <Chip
                            icon={<Star />}
                            label="Premium"
                            size="small"
                            sx={{ bgcolor: '#FFD700', color: 'black', fontWeight: 'bold' }}
                          />
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <LocationOn fontSize="small" color="primary" />
                              <Typography variant="body1" fontWeight="500">
                                {selectedLocationInfo?.name || 'Location'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <People fontSize="small" color="primary" />
                              <Typography variant="body1" fontWeight="500">
                                Capacity: {selectedScreenInfo?.capacity || 0} people
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <AttachMoney fontSize="small" color="success" />
                              <Typography variant="body1" fontWeight="500" color="success.main">
                                ₹{selectedScreenInfo?.pricePerHour?.toLocaleString() || 0}/hour
                              </Typography>
                            </Box>
                          </Grid>

                          {/* Amenities */}
                          {selectedScreenInfo?.amenities && selectedScreenInfo.amenities.length > 0 && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                                Amenities:
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {selectedScreenInfo.amenities.map((amenity, i) => (
                                  <Chip key={i} label={amenity} size="small" variant="outlined" color="primary" />
                                ))}
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Date Selection */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Select Date"
                value={bookingForm.date}
                onChange={(e) => {
                  setBookingForm(prev => ({ ...prev, date: e.target.value, timeSlot: null }))
                  setTimeSlots([])
                }}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: new Date().toISOString().split('T')[0]
                }}
                required
              />
            </Grid>

            {/* Time Slot Selection with Double Booking Prevention */}
            {bookingForm.date && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Available Time Slots
                </Typography>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : timeSlots.length > 0 ? (
                  <Grid container spacing={2}>
                    {timeSlots.map((slot, index) => (
                      <Grid item xs={12} sm={6} md={4} key={slot.id}>
                        <Zoom in timeout={300 + index * 100}>
                          <Card
                            sx={{
                              cursor: 'pointer',
                              border: bookingForm.timeSlot?.id === slot.id ? 2 : 1,
                              borderColor: bookingForm.timeSlot?.id === slot.id ? 'primary.main' : 'grey.300',
                              '&:hover': {
                                boxShadow: 3,
                                transform: 'translateY(-2px)'
                              },
                              bgcolor: bookingForm.timeSlot?.id === slot.id ? 'primary.50' : 'inherit',
                              transition: 'all 0.3s ease'
                            }}
                            onClick={() => setBookingForm(prev => ({ ...prev, timeSlot: slot }))}
                          >
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                              <Typography variant="h6" gutterBottom>
                                {slot.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {slot.startTime} - {slot.endTime}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                                {slot.duration} hours
                              </Typography>
                              <Chip
                                label={`₹${((selectedScreenInfo?.pricePerHour || 0) * slot.duration).toLocaleString()}`}
                                color="primary"
                                size="small"
                              />
                            </CardContent>
                          </Card>
                        </Zoom>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="info">
                    No time slots available for the selected date. Please choose a different date.
                  </Alert>
                )}
              </Grid>
            )}
          </Grid>
        )

      case 'Choose Event Type':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Select Event Type
              </Typography>
            </Grid>
            {events.length > 0 ? (
              events.map((event, index) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <Zoom in timeout={300 + index * 100}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: bookingForm.selectedEvent?.id === event.id ? 2 : 1,
                        borderColor: bookingForm.selectedEvent?.id === event.id ? 'primary.main' : 'grey.300',
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-2px)'
                        },
                        bgcolor: bookingForm.selectedEvent?.id === event.id ? 'primary.50' : 'inherit',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => {
                        setBookingForm(prev => ({
                          ...prev,
                          selectedEvent: event,
                          eventType: event.name
                        }))
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {event.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {event.description}
                        </Typography>
                        <Chip label={event.category} size="small" color="primary" sx={{ mb: 1 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <AccessTime fontSize="small" />
                          <Typography variant="body2">
                            {event.duration} minutes
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <People fontSize="small" />
                          <Typography variant="body2">
                            Max {event.maxCapacity} people
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoney fontSize="small" />
                          <Typography variant="body2" fontWeight="bold">
                            ₹{event.basePrice.toLocaleString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Alert severity="info">
                  No event packages available. You can still proceed with a basic movie screening.
                </Alert>
                <Button
                  variant="outlined"
                  onClick={() => setBookingForm(prev => ({ ...prev, eventType: 'Movie Night' }))}
                  sx={{ mt: 2 }}
                >
                  Continue with Basic Movie Night
                </Button>
              </Grid>
            )}
          </Grid>
        )

      case 'Customer Details':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name *"
                value={bookingForm.customerInfo.name}
                onChange={(e) => setBookingForm(prev => ({
                  ...prev,
                  customerInfo: { ...prev.customerInfo, name: e.target.value }
                }))}
                required
                error={!bookingForm.customerInfo.name && activeStep > 2}
                helperText={!bookingForm.customerInfo.name && activeStep > 2 ? 'Name is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="email"
                label="Email Address *"
                value={bookingForm.customerInfo.email}
                onChange={(e) => setBookingForm(prev => ({
                  ...prev,
                  customerInfo: { ...prev.customerInfo, email: e.target.value }
                }))}
                required
                error={!bookingForm.customerInfo.email && activeStep > 2}
                helperText={!bookingForm.customerInfo.email && activeStep > 2 ? 'Email is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number *"
                value={bookingForm.customerInfo.phone}
                onChange={(e) => setBookingForm(prev => ({
                  ...prev,
                  customerInfo: { ...prev.customerInfo, phone: e.target.value.replace(/\D/g, '') }
                }))}
                inputProps={{ maxLength: 10 }}
                helperText="10-digit Indian mobile number (6-9 starting)"
                required
                error={!/^[6-9]\d{9}$/.test(bookingForm.customerInfo.phone) && activeStep > 2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Alternate Phone"
                value={bookingForm.customerInfo.alternatePhone}
                onChange={(e) => setBookingForm(prev => ({
                  ...prev,
                  customerInfo: { ...prev.customerInfo, alternatePhone: e.target.value.replace(/\D/g, '') }
                }))}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                label="Number of Guests *"
                value={bookingForm.numberOfGuests}
                onChange={(e) => setBookingForm(prev => ({ ...prev, numberOfGuests: parseInt(e.target.value) || 0 }))}
                inputProps={{
                  min: 1,
                  max: Math.min(selectedScreenInfo?.capacity || 50, bookingForm.selectedEvent?.maxCapacity || 50)
                }}
                helperText={`Maximum ${Math.min(selectedScreenInfo?.capacity || 50, bookingForm.selectedEvent?.maxCapacity || 50)} guests`}
                required
                error={bookingForm.numberOfGuests < 1 && activeStep > 2}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Special Requests (Optional)
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={bookingForm.specialRequests.decorations}
                    onChange={(e) => setBookingForm(prev => ({
                      ...prev,
                      specialRequests: { ...prev.specialRequests, decorations: e.target.checked }
                    }))}
                  />
                }
                label="Decorations Required"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={bookingForm.specialRequests.cake}
                    onChange={(e) => setBookingForm(prev => ({
                      ...prev,
                      specialRequests: { ...prev.specialRequests, cake: e.target.checked }
                    }))}
                  />
                }
                label="Cake Arrangement"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={bookingForm.specialRequests.photography}
                    onChange={(e) => setBookingForm(prev => ({
                      ...prev,
                      specialRequests: { ...prev.specialRequests, photography: e.target.checked }
                    }))}
                  />
                }
                label="Photography Service"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Special Message/Instructions"
                value={bookingForm.specialRequests.customMessage}
                onChange={(e) => setBookingForm(prev => ({
                  ...prev,
                  specialRequests: { ...prev.specialRequests, customMessage: e.target.value }
                }))}
                placeholder="Any special instructions or message for your event..."
              />
            </Grid>
          </Grid>
        )

      case 'Confirmation':
        const screenAmount = selectedScreenInfo && bookingForm.timeSlot ?
          selectedScreenInfo.pricePerHour * bookingForm.timeSlot.duration : 0
        const eventAmount = bookingForm.selectedEvent ? bookingForm.selectedEvent.basePrice : 0
        const totalAmount = screenAmount + eventAmount

        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Booking Summary
            </Typography>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Customer Name</Typography>
                    <Typography variant="body1" fontWeight="bold">{bookingForm.customerInfo.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{bookingForm.customerInfo.phone}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{bookingForm.customerInfo.email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Number of Guests</Typography>
                    <Typography variant="body1">{bookingForm.numberOfGuests}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Screen</Typography>
                    <Typography variant="body1">{selectedScreenInfo?.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Location</Typography>
                    <Typography variant="body1">{selectedLocationInfo?.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Date</Typography>
                    <Typography variant="body1">{new Date(bookingForm.date).toLocaleDateString('en-IN')}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Time</Typography>
                    <Typography variant="body1">
                      {bookingForm.timeSlot?.startTime} - {bookingForm.timeSlot?.endTime}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Event Type</Typography>
                    <Typography variant="body1">{bookingForm.selectedEvent?.name || bookingForm.eventType}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Pricing Breakdown</Typography>
                    <Typography variant="body2">
                      Screen Rental: ₹{screenAmount.toLocaleString()} ({bookingForm.timeSlot?.duration}h × ₹{selectedScreenInfo?.pricePerHour.toLocaleString()})
                    </Typography>
                    {bookingForm.selectedEvent && (
                      <Typography variant="body2">
                        Event Package: ₹{eventAmount.toLocaleString()}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      Total Amount: ₹{totalAmount.toLocaleString()}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        💳 Payment Information
                      </Typography>
                      <Typography variant="body2">
                        • No advance payment required
                      </Typography>
                      <Typography variant="body2">
                        • Full payment to be made at the venue
                      </Typography>
                      <Typography variant="body2">
                        • We accept: Cash, UPI, and Card payments
                      </Typography>
                      <Typography variant="body2">
                        • Please arrive 15 minutes before your slot
                      </Typography>
                    </Alert>
                  </Grid>

                  {/* Special Requests Summary */}
                  {(bookingForm.specialRequests.decorations ||
                    bookingForm.specialRequests.cake ||
                    bookingForm.specialRequests.photography ||
                    bookingForm.specialRequests.customMessage) && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Special Requests:
                        </Typography>
                        {bookingForm.specialRequests.decorations && (
                          <Chip label="Decorations" size="small" sx={{ mr: 1, mb: 1 }} />
                        )}
                        {bookingForm.specialRequests.cake && (
                          <Chip label="Cake Arrangement" size="small" sx={{ mr: 1, mb: 1 }} />
                        )}
                        {bookingForm.specialRequests.photography && (
                          <Chip label="Photography" size="small" sx={{ mr: 1, mb: 1 }} />
                        )}
                        {bookingForm.specialRequests.customMessage && (
                          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                            {bookingForm.specialRequests.customMessage}
                          </Typography>
                        )}
                      </Grid>
                    )}
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Book Your Private Screen
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        {hasPreSelectedScreen ?
          'Complete your booking in just a few simple steps' :
          hasPreSelectedEvent ?
            'Your event is pre-selected - choose your location and screen' :
            'Select your preferred location, screen, and time slot'
        }
      </Typography>

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Fade in timeout={500} key={activeStep}>
          <Box>
            {renderStepContent()}
          </Box>
        </Fade>
      </Paper>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
          size="large"
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!isStepValid() || loading}
          size="large"
          sx={{ minWidth: 120 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : activeStep === steps.length - 1 ? (
            'Book Now'
          ) : (
            'Next'
          )}
        </Button>
      </Box>

      {/* Success Dialog */}
      {/* Enhanced Success Dialog with Email Confirmation */}
      <Dialog open={confirmationDialog} onClose={() => setConfirmationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" fontWeight="bold">
            🎉 Booking Confirmed!
          </Typography>
        </DialogTitle>
        <DialogContent>
          {bookingResult && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Booking ID: {bookingResult.bookingId}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Thank you <strong>{bookingResult.customerInfo.name}</strong>! Your booking has been confirmed.
              </Typography>

              {/* ✅ Email Confirmation Notice */}
              <Alert severity="info" sx={{ my: 2, textAlign: 'left' }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  📧 Confirmation Email Sent
                </Typography>
                <Typography variant="body2">
                  A detailed confirmation email has been sent to <strong>{bookingResult.customerInfo.email}</strong> with all your booking details.
                </Typography>
              </Alert>

              <Alert severity="success" sx={{ my: 3, textAlign: 'left' }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  {"📋 What's Next?"}
                </Typography>
                <Typography variant="body2">
                  • Check your email for detailed booking information
                </Typography>
                <Typography variant="body2">
                  • Please arrive 15 minutes before your slot
                </Typography>
                <Typography variant="body2">
                  • Payment to be made at venue (₹{bookingResult.pricing?.totalAmount?.toLocaleString()})
                </Typography>
                <Typography variant="body2">
                  • We accept Cash, UPI, and Card payments
                </Typography>
                <Typography variant="body2">
                  • Bring a valid ID for verification
                </Typography>
              </Alert>

              <Typography variant="body2" color="text.secondary">
                For any queries, contact us at <strong>+91 99451 02299</strong>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={() => window.location.href = '/'}
            variant="contained"
            size="large"
            sx={{ minWidth: 150 }}
          >
            Back to Home
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  )
}
