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
  Stack,
  Fade,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
  IconButton,
  Fab
} from '@mui/material'
import {
  LocationOn,
  AccessTime,
  People,
  AttachMoney,
  CheckCircle,
  Movie,
  Star,
  Wifi,
  AcUnit,
  VolumeUp,
  Smartphone,
  LocalParking,
  Restaurant,
  EventSeat,
  Tv,
  ArrowBackIos,
  ArrowForwardIos,
  KeyboardArrowUp
} from '@mui/icons-material'

const getSteps = (hasPreSelectedScreen, hasPreSelectedEvent) => {
  if (hasPreSelectedScreen) {
    return ['Select Date & Time', 'Customer Details', 'Confirmation']
  } else if (hasPreSelectedEvent) {
    return ['Select Location & Screen', 'Select Date & Time', 'Customer Details', 'Confirmation']
  } else {
    return ['Select Location & Screen', 'Select Date & Time', 'Customer Details', 'Confirmation']
  }
}

// Helper function to get amenity icon
const getAmenityIcon = (amenity) => {
  const amenityLower = amenity.toLowerCase()
  if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return <Wifi fontSize="small" />
  if (amenityLower.includes('ac') || amenityLower.includes('air') || amenityLower.includes('cooling')) return <AcUnit fontSize="small" />
  if (amenityLower.includes('sound') || amenityLower.includes('audio')) return <VolumeUp fontSize="small" />
  if (amenityLower.includes('phone') || amenityLower.includes('mobile')) return <Smartphone fontSize="small" />
  if (amenityLower.includes('parking')) return <LocalParking fontSize="small" />
  if (amenityLower.includes('food') || amenityLower.includes('snack')) return <Restaurant fontSize="small" />
  if (amenityLower.includes('seat') || amenityLower.includes('chair')) return <EventSeat fontSize="small" />
  if (amenityLower.includes('screen') || amenityLower.includes('display') || amenityLower.includes('tv')) return <Tv fontSize="small" />
  return <Star fontSize="small" />
}

export default function PublicBookingPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  const searchParams = useSearchParams()
  const preSelectedLocation = searchParams.get('location')
  const preSelectedScreen = searchParams.get('screen')
  const preSelectedEvent = searchParams.get('event')
  const hasPreSelectedScreen = !!(preSelectedLocation && preSelectedScreen)
  const hasPreSelectedEvent = !!preSelectedEvent
  const steps = getSteps(hasPreSelectedScreen, hasPreSelectedEvent)
  const [activeStep, setActiveStep] = useState(0)

  const [locations, setLocations] = useState([])
  const [screens, setScreens] = useState([])
  const [events, setEvents] = useState([])
  const [availableScreens, setAvailableScreens] = useState([])

  // Screen pagination state
  const [currentScreenPage, setCurrentScreenPage] = useState(0)
  const screensPerPage = 3

  const [timeSlots, setTimeSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [selectedLocationInfo, setSelectedLocationInfo] = useState(null)
  const [selectedScreenInfo, setSelectedScreenInfo] = useState(null)
  const [confirmationDialog, setConfirmationDialog] = useState(false)
  const [bookingResult, setBookingResult] = useState(null)

  // Mobile navigation state
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Booking form state with pre-selected values
  const [bookingForm, setBookingForm] = useState({
    location: preSelectedLocation || '',
    screen: preSelectedScreen || '',
    date: '',
    timeSlot: null,
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

  // Add this useEffect to handle auto-scroll on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStep]);

  // Simplified handleNext function
  function handleNext() {
    if (activeStep === steps.length - 1) {
      createBooking()
    } else {
      setActiveStep(prev => prev + 1)
    }
  }

  // Simplified handleBack function
  function handleBack() {
    setActiveStep(prev => prev - 1)
  }

  // ---- Auto-select defaults when options change ----
  useEffect(() => {
    if (locations.length > 0 && !bookingForm.location) {
      setBookingForm(prev => ({ ...prev, location: locations[0].id }))
      setSelectedLocationInfo(locations[0])
    }
  }, [locations])

  useEffect(() => {
    if (availableScreens.length > 0 && !bookingForm.screen) {
      setBookingForm(prev => ({ ...prev, screen: availableScreens[0].id }))
      setSelectedScreenInfo(availableScreens[0])
    }
  }, [availableScreens])

  useEffect(() => {
    if (events.length > 0 && !bookingForm.selectedEvent) {
      setBookingForm(prev => ({
        ...prev,
        selectedEvent: events[0]
      }))
    }
  }, [events])

  // Re-load available screens when location changes
  useEffect(() => {
    if (bookingForm.location && !(preSelectedLocation && preSelectedScreen)) {
      loadScreensForLocation(bookingForm.location)
      setCurrentScreenPage(0) // Reset pagination
    }
  }, [bookingForm.location, preSelectedLocation, preSelectedScreen])

  // Re-load timeslots whenever date or screen changes
  useEffect(() => {
    if (bookingForm.date && bookingForm.screen) {
      loadTimeSlots()
    }
  }, [bookingForm.date, bookingForm.screen])

  // LOCATION, SCREEN, EVENT DATA LOADING
  useEffect(() => {
    loadInitialData()
  }, [])

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

      // Handle pre-selections
      let loc = null
      let scr = null
      if (preSelectedLocation) {
        loc = locationsData.locations?.find(l => l.id === preSelectedLocation)
        setSelectedLocationInfo(loc)
      }
      if (preSelectedScreen) {
        scr = screensData.screens?.find(s => s.id === preSelectedScreen)
        setSelectedScreenInfo(scr)
      }

      if (preSelectedLocation && preSelectedScreen && loc && scr) {
        setSuccess(`Pre-selected: ${scr.name} at ${loc.name} - Please select your date and time`)
      } else if (preSelectedEvent) {
        const ev = eventsData.events?.find(e => e.id === preSelectedEvent)
        if (ev) {
          setBookingForm(prev => ({
            ...prev,
            selectedEvent: ev
          }))
          setSuccess(`Pre-selected event: ${ev.name} - Please select your location, screen, and time`)
        }
      }
    } catch (error) {
      setError('Failed to load booking information. Please refresh and try again.')
    }
  }

  async function loadScreensForLocation(locationId) {
    try {
      const response = await fetch(`/api/public/screens?location=${locationId}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableScreens(data.screens || [])
      }
    } catch { }
  }

  async function loadTimeSlots() {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/public/timeslots?screen=${bookingForm.screen}&date=${bookingForm.date}`
      )
      if (response.ok) {
        const data = await response.json()
        setTimeSlots(data.timeSlots || [])
        // Deselect timeslot if unavailable now
        if (bookingForm.timeSlot) {
          const isStill = data.timeSlots.some(slot =>
            slot.id === bookingForm.timeSlot.id
          )
          if (!isStill) setBookingForm(prev => ({ ...prev, timeSlot: null }))
        }
      } else {
        setTimeSlots([])
        setError('No time slots available for the selected date')
      }
    } catch {
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
          eventType: bookingForm.selectedEvent?.name,
          eventId: bookingForm.selectedEvent?.id,
          numberOfGuests: bookingForm.numberOfGuests,
          specialRequests: bookingForm.specialRequests
        })
      })
      const data = await response.json()
      if (!response.ok) {
        if (response.status === 409) {
          setError(data.error || 'Selected time slot is no longer available. Please choose a different time.')
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

  // function handleNext() {
  //   if (activeStep === steps.length - 1) {
  //     createBooking()
  //   } else {
  //     setActiveStep(prev => prev + 1)
  //     scrollToTop() // Scroll to top when moving to next step
  //   }
  // }

  function handleBack() {
    setActiveStep(prev => prev - 1)
    scrollToTop() // Scroll to top when moving to previous step
  }

  // VALIDATOR
  function isStepValid() {
    const currentStepName = steps[activeStep]
    switch (currentStepName) {
      case 'Select Location & Screen':
        return bookingForm.location && bookingForm.screen
      case 'Select Date & Time':
        return bookingForm.date && bookingForm.timeSlot && bookingForm.selectedEvent
      case 'Customer Details': {
        const phoneRegex = /^[6-9]\d{9}$/
        return bookingForm.customerInfo.name &&
          bookingForm.customerInfo.email &&
          phoneRegex.test(bookingForm.customerInfo.phone) &&
          bookingForm.numberOfGuests > 0 &&
          bookingForm.numberOfGuests <= Math.min(selectedScreenInfo?.capacity || 50, bookingForm.selectedEvent?.maxCapacity || 50)
      }
      case 'Confirmation': return true
      default: return false
    }
  }

  // Screen pagination functions
  const totalPages = Math.ceil(availableScreens.length / screensPerPage)
  const currentScreens = availableScreens.slice(
    currentScreenPage * screensPerPage,
    (currentScreenPage + 1) * screensPerPage
  )

  const goToPrevScreenPage = () => {
    setCurrentScreenPage(prev => Math.max(0, prev - 1))
  }

  const goToNextScreenPage = () => {
    setCurrentScreenPage(prev => Math.min(totalPages - 1, prev + 1))
  }

  // MAIN STEPS
  // MAIN STEPS
  function renderStepContent() {
    const currentStepName = steps[activeStep]
    switch (currentStepName) {
      case 'Select Location & Screen':
  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Select Location</InputLabel>
            <Select
              value={bookingForm.location}
              onChange={(e) => {
                setBookingForm(prev => ({
                  ...prev,
                  location: e.target.value,
                  screen: ''
                }))
                const selLoc = locations.find(l => l.id === e.target.value)
                setSelectedLocationInfo(selLoc)
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
      </Grid>

      {bookingForm.location && availableScreens.length > 0 && (
        <Box>
          {/* Screen Selection Header with Pagination Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">
              Available Screens ({availableScreens.length})
            </Typography>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  onClick={goToPrevScreenPage}
                  disabled={currentScreenPage === 0}
                  size="small"
                >
                  <ArrowBackIos />
                </IconButton>

                <Typography variant="body2" color="text.secondary">
                  {currentScreenPage + 1} of {totalPages}
                </Typography>

                <IconButton
                  onClick={goToNextScreenPage}
                  disabled={currentScreenPage === totalPages - 1}
                  size="small"
                >
                  <ArrowForwardIos />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Screen Cards */}
          <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 2 }} alignItems="stretch">
            {currentScreens.map((screen) => (
              <Grid item xs={12} sm={6} lg={4} key={screen.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: bookingForm.screen === screen.id ? 2 : 1,
                    borderColor: bookingForm.screen === screen.id ? 'primary.main' : 'grey.300',
                    bgcolor: bookingForm.screen === screen.id ? 'primary.50' : 'inherit',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    height: isMobile ? 480 : 520, // ✅ fixed height
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    boxShadow: bookingForm.screen === screen.id ? 4 : 1,
                    '&:hover': {
                      transform: bookingForm.screen !== screen.id ? 'translateY(-8px)' : 'translateY(-4px)',
                      boxShadow: bookingForm.screen !== screen.id ? 8 : 12,
                      borderColor: bookingForm.screen !== screen.id ? 'primary.light' : 'primary.main',
                    }
                  }}
                  onClick={() => {
                    setBookingForm(prev => ({ ...prev, screen: screen.id }))
                    setSelectedScreenInfo(screen)
                  }}
                >
                  {/* Screen Image */}
                  <Box sx={{ 
                    position: 'relative', 
                    overflow: 'hidden',
                    height: isMobile ? 180 : 200,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}>
                    {screen.images && screen.images[0] ? (
                      <CardMedia
                        component="img"
                        height="100%"
                        image={screen.images[0].url}
                        alt={screen.name}
                        sx={{
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.08)'
                          }
                        }}
                      />
                    ) : (
                      <Box sx={{
                        height: '100%',
                        bgcolor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                      }}>
                        <Movie sx={{ fontSize: isMobile ? 48 : 56, color: 'grey.400', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Screen Preview
                        </Typography>
                      </Box>
                    )}

                    {/* Badges */}
                    <Box sx={{ 
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      right: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}>
                      {bookingForm.screen === screen.id && (
                        <Chip
                          icon={<CheckCircle sx={{ fontSize: 16 }} />}
                          label="Selected"
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 'bold', fontSize: '0.75rem', boxShadow: 2 }}
                        />
                      )}
                      <Chip
                        icon={<Star sx={{ fontSize: 16 }} />}
                        label="Premium"
                        size="small"
                        sx={{
                          bgcolor: '#FFD700',
                          color: 'black',
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          boxShadow: 2,
                          ml: 'auto'
                        }}
                      />
                    </Box>
                  </Box>

                  <CardContent sx={{ 
                    p: isMobile ? 2 : 2.5, 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 1.5
                  }}>
                    {/* Title */}
                    <Typography 
                      variant={isMobile ? "h6" : "h5"} 
                      noWrap // ✅ prevent multi-line
                      sx={{
                        fontWeight: 700,
                        color: bookingForm.screen === screen.id ? 'primary.main' : 'text.primary',
                        lineHeight: 1.2,
                        fontSize: isMobile ? '1.1rem' : '1.25rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {screen.name}
                    </Typography>

                    {/* Description */}
                    {screen.description && (
                      <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.4,
                        overflow: 'hidden',        // ✅ keeps inside card
                        whiteSpace: 'normal',      // ✅ allows wrapping
                        wordBreak: 'break-word',   // ✅ break long words if needed
                        fontSize: '0.9rem',
                        flexGrow: 0
                      }}
                    >
                      {screen.description}
                    </Typography>
                    
                    )}

                    {/* Stats */}
                    <Box>
                      <Grid container spacing={1.5}>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            textAlign: 'center', 
                            p: 1.5, 
                            bgcolor: 'grey.50', 
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: 'grey.200',
                            '&:hover': { bgcolor: 'primary.50', borderColor: 'primary.200' }
                          }}>
                            <People fontSize="small" color="primary" sx={{ mb: 0.5 }} />
                            <Typography variant="body2" fontWeight="bold" color="text.primary">
                              {screen.capacity}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">People</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            textAlign: 'center', 
                            p: 1.5, 
                            bgcolor: 'success.50', 
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: 'success.200',
                            '&:hover': { bgcolor: 'success.100', borderColor: 'success.300' }
                          }}>
                            <AttachMoney fontSize="small" color="success" sx={{ mb: 0.5 }} />
                            <Typography variant="body2" fontWeight="bold" color="success.dark">
                              ₹{screen.pricePerHour?.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="success.main">per hour</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Amenities */}
                    {screen.amenities && screen.amenities.length > 0 && (
                      <Box sx={{ mt: 'auto', pt: 1 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontWeight: 'bold', 
                            mb: 1, 
                            display: 'block',
                            color: 'text.primary',
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                          }}
                        >
                          Amenities
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={0.8}>
                          {screen.amenities.slice(0, isMobile ? 2 : 3).map((amenity, i) => (
                            <Chip
                              key={i}
                              label={amenity}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 24, borderRadius: 1 }}
                            />
                          ))}
                          {screen.amenities.length > (isMobile ? 2 : 3) && (
                            <Chip
                              label={`+${screen.amenities.length - (isMobile ? 2 : 3)} more`}
                              size="small"
                              color="primary"
                              sx={{ fontSize: '0.7rem', height: 24, borderRadius: 1, fontWeight: 'bold' }}
                            />
                          )}
                        </Stack>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Stack>
  )
  
      case 'Select Date & Time': {
        return (
          <Stack spacing={3}>
            {/* Enhanced Screen Info Display */}
            {selectedScreenInfo && (
              <Card
                sx={{
                  bgcolor: 'primary.50',
                  border: '2px solid',
                  borderColor: 'primary.200',
                  overflow: 'hidden',
                  mb: 3
                }}
              >
                <Grid container>
                  {/* Screen Image - Fixed sizing and white space issue */}
                  <Grid item xs={12} md={5}>
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: {
                          xs: 250,  // Mobile: smaller height
                          sm: 280,  // Tablet: medium height
                          md: 300   // Desktop: larger height
                        },
                        overflow: 'hidden',
                        display: 'flex', // Add flex display
                        alignItems: 'center', // Center content vertically
                        justifyContent: 'center', // Center content horizontally
                        bgcolor: 'grey.100' // Add background color for better visual
                      }}
                    >
                      {selectedScreenInfo.images && selectedScreenInfo.images.length > 0 ? (
                        <Box
                          component="img"
                          src={selectedScreenInfo.images[0].url}
                          alt={selectedScreenInfo.name}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover', // This ensures the image fills the container properly
                            objectPosition: 'center' // Center the image
                          }}
                        />
                      ) : (
                        <Box sx={{
                          width: '100%',
                          height: '100%',
                          bgcolor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column'
                        }}>
                          <Movie sx={{ fontSize: 60, color: 'grey.400', mb: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            Screen Preview
                          </Typography>
                        </Box>
                      )}

                      {/* Premium Badge */}
                      <Chip
                        icon={<Star />}
                        label="Premium"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: '#FFD700',
                          color: 'black',
                          fontWeight: 'bold',
                          zIndex: 2 // Ensure it appears above the image
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Screen Details - Better organized */}
                  <Grid item xs={12} md={7}>
                    <CardContent sx={{ p: { xs: 2, md: 3 }, height: '100%' }}>
                      <Stack spacing={3} sx={{ height: '100%' }}>
                        {/* Title and Description */}
                        <Box>
                          <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="bold" color="primary.main" gutterBottom>
                            {selectedScreenInfo.name}
                          </Typography>
                          {selectedScreenInfo.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {selectedScreenInfo.description}
                            </Typography>
                          )}
                        </Box>

                        {/* Location Info - Enhanced Design */}
                        <Box sx={{
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'primary.100',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                          <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                              <LocationOn fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {selectedLocationInfo?.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {selectedLocationInfo?.address?.area}, {selectedLocationInfo?.address?.city}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>

                        {/* Quick Stats Grid */}
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{
                              p: 1.5,
                              bgcolor: 'white',
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'primary.100',
                              textAlign: 'center'
                            }}>
                              <People color="primary" sx={{ mb: 0.5 }} />
                              <Typography variant="body2" fontWeight="bold">
                                {selectedScreenInfo.capacity} People
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Capacity
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid item xs={6}>
                            <Box sx={{
                              p: 1.5,
                              bgcolor: 'success.50',
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'success.200',
                              textAlign: 'center'
                            }}>
                              <AttachMoney color="success" sx={{ mb: 0.5 }} />
                              <Typography variant="body2" fontWeight="bold" color="success.main">
                                ₹{selectedScreenInfo.pricePerHour?.toLocaleString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Per Hour
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* Amenities - Enhanced Design */}
                        {selectedScreenInfo.amenities && selectedScreenInfo.amenities.length > 0 && (
                          <Box sx={{
                            p: 2,
                            bgcolor: 'grey.50',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'grey.200'
                          }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 1.5
                            }}>
                              <Star color="primary" fontSize="small" />
                              Premium Amenities
                            </Typography>
                            <Grid container spacing={1}>
                              {selectedScreenInfo.amenities.map((amenity, i) => (
                                <Grid item xs={6} sm={4} key={i}>
                                  <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    p: 1,
                                    bgcolor: 'white',
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'grey.300'
                                  }}>
                                    {getAmenityIcon(amenity)}
                                    <Typography variant="caption" fontWeight="500">
                                      {amenity}
                                    </Typography>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Grid>
                </Grid>
              </Card>
            )}

            {/* DATE */}
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

            {/* IMPROVED TIME SLOTS */}
            {/* IMPROVED TIME SLOTS */}
            {bookingForm.date && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Available Time Slots
                </Typography>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress size={40} />
                  </Box>
                ) : timeSlots.length > 0 ? (
                  <Grid container spacing={2} sx={{ justifyContent: 'flex-start' }}>
                    {timeSlots.map((slot, idx) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={slot.id}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            border: bookingForm.timeSlot?.id === slot.id ? 2 : 1,
                            borderColor: bookingForm.timeSlot?.id === slot.id ? 'primary.main' : 'grey.300',
                            bgcolor: bookingForm.timeSlot?.id === slot.id ? 'primary.50' : 'white',
                            transition: 'all 0.3s ease',
                            height: 120, // Reduced and fixed height for consistency
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            '&:hover': {
                              transform: bookingForm.timeSlot?.id !== slot.id ? 'translateY(-4px)' : 'none',
                              boxShadow: bookingForm.timeSlot?.id !== slot.id ? 4 : 6,
                              borderColor: bookingForm.timeSlot?.id !== slot.id ? 'primary.light' : 'primary.main'
                            }
                          }}
                          onClick={() => setBookingForm(prev => ({ ...prev, timeSlot: slot }))}
                        >
                          {/* Selection Indicator */}
                          {bookingForm.timeSlot?.id === slot.id && (
                            <Box sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              zIndex: 1
                            }}>
                              <CheckCircle color="primary" fontSize="small" />
                            </Box>
                          )}

                          <CardContent sx={{
                            textAlign: 'center',
                            py: 2,
                            px: 1.5,
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center', // Center content vertically
                            alignItems: 'center' // Center content horizontally
                          }}>
                            {/* Slot Name */}
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              color={bookingForm.timeSlot?.id === slot.id ? 'primary.main' : 'text.primary'}
                              sx={{ mb: 1.5, lineHeight: 1.2 }}
                            >
                              {slot.name}
                            </Typography>

                            {/* Time Display - Simplified */}
                            <Typography variant="h6" fontWeight="600" color="text.secondary">
                              {slot.startTime} - {slot.endTime}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="info" sx={{ py: 3 }}>
                    <Typography variant="body1" fontWeight="500">
                      No time slots available for the selected date
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Please choose a different date to see available slots
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}


            {/* EVENTS DROPDOWN */}
            {/* EVENTS DROPDOWN - Mobile Optimized with Text Truncation */}
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>Event Package</InputLabel>
              <Select
                value={bookingForm.selectedEvent?.id || ""}
                label="Event Package"
                onChange={e => {
                  const event = events.find(ev => ev.id === e.target.value)
                  setBookingForm(prev => ({
                    ...prev,
                    selectedEvent: event
                  }))
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: isMobile ? 250 : 300,
                      '& .MuiMenuItem-root': {
                        py: isMobile ? 1.5 : 1,
                        px: 2,
                        whiteSpace: 'normal', // Allow text wrapping
                        wordBreak: 'break-word' // Break long words
                      }
                    }
                  }
                }}
              >
                {events.map(ev => (
                  <MenuItem value={ev.id} key={ev.id}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                        width: '100%',
                        // Multi-line text truncation for very long names
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: isMobile ? 2 : 1, // 2 lines on mobile, 1 on desktop
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.4
                      }}
                      title={ev.name} // Show full text on hover
                    >
                      {ev.name}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>


            {/* Selected Event Display - Simplified */}
            {bookingForm.selectedEvent && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star color="success" fontSize="small" />
                  <Typography variant="body1" fontWeight="bold">
                    Selected: {bookingForm.selectedEvent.name}
                  </Typography>
                </Box>
              </Alert>
            )}


            {/* Selected Event Display - Enhanced */}
            {bookingForm.selectedEvent && (
              <Card
                variant="outlined"
                sx={{
                  mt: 2,
                  bgcolor: 'success.50',
                  borderColor: 'success.200',
                  border: '2px solid'
                }}
              >
                <CardContent sx={{ p: isMobile ? 2 : 2.5 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Star color="success" fontSize="small" />
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          {bookingForm.selectedEvent.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {bookingForm.selectedEvent.description}
                      </Typography>

                      {/* Selected event details - mobile optimized */}
                      <Box sx={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? 0.5 : 1,
                        flexWrap: 'wrap'
                      }}>
                        {isMobile ? (
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Chip
                                label={bookingForm.selectedEvent.category}
                                size="small"
                                color="success"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Chip
                                label={`${bookingForm.selectedEvent.duration} min`}
                                size="small"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Chip
                                label={`Max ${bookingForm.selectedEvent.maxCapacity}`}
                                size="small"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" fontWeight="bold" color="success.main">
                                ₹{bookingForm.selectedEvent.basePrice.toLocaleString()}
                              </Typography>
                            </Grid>
                          </Grid>
                        ) : (
                          <>
                            <Chip label={bookingForm.selectedEvent.category} size="small" color="success" />
                            <Chip label={`${bookingForm.selectedEvent.duration} min`} size="small" />
                            <Chip label={`Max ${bookingForm.selectedEvent.maxCapacity}`} size="small" />
                          </>
                        )}
                      </Box>
                    </Grid>

                    {/* Price highlight - desktop only */}
                    {!isMobile && (
                      <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
                        <Typography variant="h5" fontWeight="bold" color="success.main">
                          ₹{bookingForm.selectedEvent.basePrice.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Package Price
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}


            {bookingForm.selectedEvent && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight="bold">{bookingForm.selectedEvent.name}</Typography>
                <Typography variant="body2">{bookingForm.selectedEvent.description}</Typography>
              </Alert>
            )}
          </Stack>
        )
      }

      case 'Customer Details': {
        const maxGuests = Math.min(selectedScreenInfo?.capacity || 50, bookingForm.selectedEvent?.maxCapacity || 50)

        return (
          <Stack spacing={4}>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h5" gutterBottom color="primary">
                👤 Customer Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please provide your details to complete the booking
              </Typography>
            </Box>

            {/* Progress Indicator */}
            <Card sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
              <CardContent sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Movie color="primary" />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {selectedScreenInfo?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedLocationInfo?.name}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AccessTime color="primary" />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {bookingForm.timeSlot?.startTime} - {bookingForm.timeSlot?.endTime}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(bookingForm.date).toLocaleDateString('en-IN')}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Star color="primary" />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {bookingForm.selectedEvent?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Event Package
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Personal Information Section */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <People color="primary" />
                  Personal Information
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Fields marked with * are required
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={bookingForm.customerInfo.name}
                      onChange={(e) => setBookingForm(prev => ({
                        ...prev,
                        customerInfo: { ...prev.customerInfo, name: e.target.value }
                      }))}
                      required
                      error={!bookingForm.customerInfo.name && activeStep > 1}
                      helperText={!bookingForm.customerInfo.name && activeStep > 1 ? 'Please enter your full name' : 'As per government ID'}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="email"
                      label="Email Address"
                      value={bookingForm.customerInfo.email}
                      onChange={(e) => setBookingForm(prev => ({
                        ...prev,
                        customerInfo: { ...prev.customerInfo, email: e.target.value }
                      }))}
                      required
                      error={!bookingForm.customerInfo.email && activeStep > 1}
                      helperText={!bookingForm.customerInfo.email && activeStep > 1 ? 'Please enter a valid email' : 'For booking confirmation'}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Primary Phone Number"
                      value={bookingForm.customerInfo.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        setBookingForm(prev => ({
                          ...prev,
                          customerInfo: { ...prev.customerInfo, phone: value }
                        }))
                      }}
                      inputProps={{ maxLength: 10 }}
                      required
                      error={!/^[6-9]\d{9}$/.test(bookingForm.customerInfo.phone) && activeStep > 1}
                      helperText={
                        !/^[6-9]\d{9}$/.test(bookingForm.customerInfo.phone) && activeStep > 1
                          ? 'Please enter a valid 10-digit mobile number'
                          : 'Indian mobile number starting with 6-9'
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Alternate Phone (Optional)"
                      value={bookingForm.customerInfo.alternatePhone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        setBookingForm(prev => ({
                          ...prev,
                          customerInfo: { ...prev.customerInfo, alternatePhone: value }
                        }))
                      }}
                      inputProps={{ maxLength: 10 }}
                      helperText="Emergency contact number"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Booking Details Section */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <People color="primary" />
                  Booking Details
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Number of Guests"
                      value={bookingForm.numberOfGuests}
                      onChange={(e) => {
                        const value = Math.max(1, Math.min(maxGuests, parseInt(e.target.value) || 1))
                        setBookingForm(prev => ({ ...prev, numberOfGuests: value }))
                      }}
                      inputProps={{ min: 1, max: maxGuests }}
                      required
                      error={bookingForm.numberOfGuests < 1 && activeStep > 1}
                      helperText={`Maximum ${maxGuests} guests allowed`}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Alert severity="info" sx={{ height: 'fit-content' }}>
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        Capacity Details
                      </Typography>
                      <Typography variant="caption">
                        Screen: {selectedScreenInfo?.capacity} people<br/>
                        Event: {bookingForm.selectedEvent?.maxCapacity} people<br/>
                        <strong>Maximum: {maxGuests} guests</strong>
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Special Requests Section */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star color="primary" />
                  Special Requests
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Enhance your experience with our additional services
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        bgcolor: bookingForm.specialRequests.decorations ? 'primary.50' : 'transparent',
                        border: bookingForm.specialRequests.decorations ? '2px solid' : '1px solid',
                        borderColor: bookingForm.specialRequests.decorations ? 'primary.main' : 'grey.300'
                      }}
                      onClick={() => setBookingForm(prev => ({
                        ...prev,
                        specialRequests: {
                          ...prev.specialRequests,
                          decorations: !prev.specialRequests.decorations
                        }
                      }))}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Checkbox
                          checked={bookingForm.specialRequests.decorations}
                          color="primary"
                        />
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            🎈 Decorations
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Balloons, banners & theme setup
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        bgcolor: bookingForm.specialRequests.cake ? 'primary.50' : 'transparent',
                        border: bookingForm.specialRequests.cake ? '2px solid' : '1px solid',
                        borderColor: bookingForm.specialRequests.cake ? 'primary.main' : 'grey.300'
                      }}
                      onClick={() => setBookingForm(prev => ({
                        ...prev,
                        specialRequests: {
                          ...prev.specialRequests,
                          cake: !prev.specialRequests.cake
                        }
                      }))}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Checkbox
                          checked={bookingForm.specialRequests.cake}
                          color="primary"
                        />
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            🎂 Cake Arrangement
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Custom cake with celebration setup
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        bgcolor: bookingForm.specialRequests.photography ? 'primary.50' : 'transparent',
                        border: bookingForm.specialRequests.photography ? '2px solid' : '1px solid',
                        borderColor: bookingForm.specialRequests.photography ? 'primary.main' : 'grey.300'
                      }}
                      onClick={() => setBookingForm(prev => ({
                        ...prev,
                        specialRequests: {
                          ...prev.specialRequests,
                          photography: !prev.specialRequests.photography
                        }
                      }))}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Checkbox
                          checked={bookingForm.specialRequests.photography}
                          color="primary"
                        />
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            📸 Photography
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Professional photos of your event
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Special Instructions"
                    value={bookingForm.specialRequests.customMessage}
                    onChange={(e) => setBookingForm(prev => ({
                      ...prev,
                      specialRequests: { ...prev.specialRequests, customMessage: e.target.value }
                    }))}
                    placeholder="Any special requests, dietary requirements, accessibility needs, or celebration details..."
                    helperText="Let us know how we can make your experience special"
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Important Information */}
            <Alert severity="info" icon={<CheckCircle />}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                📋 Important Information
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <Typography component="li" variant="body2">
                  Please bring a valid government ID for verification
                </Typography>
                <Typography component="li" variant="body2">
                  Arrive 15 minutes before your scheduled time slot
                </Typography>
                <Typography component="li" variant="body2">
                  Food and beverages can be brought or ordered during your session
                </Typography>
                <Typography component="li" variant="body2">
                  Cancellation allowed up to 2 hours before booking time
                </Typography>
              </Box>
            </Alert>

            {/* Contact Support */}
            <Card sx={{ bgcolor: 'grey.50' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Need help with your booking?
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  href="tel:+919945102299"
                  startIcon={<Typography>📞</Typography>}
                >
                  Call +91 99451 02299
                </Button>
              </CardContent>
            </Card>
          </Stack>
        )
      }

      case 'Confirmation': {
        const screenAmount = selectedScreenInfo && bookingForm.timeSlot
          ? selectedScreenInfo.pricePerHour * bookingForm.timeSlot.duration : 0
        const eventAmount = bookingForm.selectedEvent ? bookingForm.selectedEvent.basePrice : 0
        const totalAmount = screenAmount + eventAmount

        // Calculate additional service charges (if any special requests)
        const decorationCharge = bookingForm.specialRequests.decorations ? 500 : 0
        const cakeCharge = bookingForm.specialRequests.cake ? 800 : 0
        const photographyCharge = bookingForm.specialRequests.photography ? 1500 : 0
        const servicesAmount = decorationCharge + cakeCharge + photographyCharge
        const finalTotal = totalAmount + servicesAmount

        return (
          <Stack spacing={4}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
                🎬 Booking Summary
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Please review your booking details before confirming
              </Typography>
            </Box>

            {/* Customer Information */}
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <People sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Customer Information
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                        Primary Contact
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.5 }}>
                        {bookingForm.customerInfo.name}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                        <Typography variant="body2">📧</Typography>
                        <Typography variant="body2">{bookingForm.customerInfo.email}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2">📱</Typography>
                        <Typography variant="body2">+91 {bookingForm.customerInfo.phone}</Typography>
                      </Stack>
                      {bookingForm.customerInfo.alternatePhone && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2">☎️</Typography>
                          <Typography variant="body2">+91 {bookingForm.customerInfo.alternatePhone}</Typography>
                        </Stack>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
                      <Typography variant="caption" color="primary.main" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                        Party Size
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="h3" fontWeight="bold" color="primary.main">
                          {bookingForm.numberOfGuests}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                          {bookingForm.numberOfGuests === 1 ? 'Guest' : 'Guests'}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Maximum capacity: {Math.min(selectedScreenInfo?.capacity || 50, bookingForm.selectedEvent?.maxCapacity || 50)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Movie sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Booking Details
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* Screen & Location */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                          <LocationOn color="primary" />
                          <Typography variant="subtitle1" fontWeight="bold">
                            Venue Information
                          </Typography>
                        </Stack>

                        <Typography variant="h6" color="primary.main" gutterBottom>
                          {selectedScreenInfo?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          📍 {selectedLocationInfo?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {selectedLocationInfo?.address?.area}, {selectedLocationInfo?.address?.city}
                        </Typography>

                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                            Screen Capacity
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {selectedScreenInfo?.capacity} People
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Date & Time */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                          <AccessTime color="primary" />
                          <Typography variant="subtitle1" fontWeight="bold">
                            Schedule
                          </Typography>
                        </Stack>

                        <Typography variant="h6" color="primary.main" gutterBottom>
                          {new Date(bookingForm.date).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" gutterBottom>
                          {bookingForm.timeSlot?.startTime} - {bookingForm.timeSlot?.endTime}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Duration: {bookingForm.timeSlot?.duration} hours
                        </Typography>

                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                            Session Type
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {bookingForm.timeSlot?.name}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Event Package */}
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ bgcolor: 'success.50', borderColor: 'success.200' }}>
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                          <Star sx={{ color: 'success.main' }} />
                          <Typography variant="subtitle1" fontWeight="bold">
                            Event Package
                          </Typography>
                        </Stack>

                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={8}>
                            <Typography variant="h6" color="success.main" gutterBottom>
                              {bookingForm.selectedEvent?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {bookingForm.selectedEvent?.description}
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                              <Chip label={bookingForm.selectedEvent?.category} size="small" color="success" />
                              <Chip label={`${bookingForm.selectedEvent?.duration} minutes`} size="small" variant="outlined" />
                              <Chip label={`Max ${bookingForm.selectedEvent?.maxCapacity} people`} size="small" variant="outlined" />
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' } }}>
                            <Typography variant="h5" fontWeight="bold" color="success.main">
                              ₹{bookingForm.selectedEvent?.basePrice.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Package Price
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Special Services */}
            {(bookingForm.specialRequests.decorations ||
              bookingForm.specialRequests.cake ||
              bookingForm.specialRequests.photography ||
              bookingForm.specialRequests.customMessage) && (
                <Card elevation={3}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Star sx={{ fontSize: 28, color: 'warning.main', mr: 2 }} />
                      <Typography variant="h6" fontWeight="bold">
                        Special Services
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      {bookingForm.specialRequests.decorations && (
                        <Grid item xs={12} sm={4}>
                          <Card variant="outlined" sx={{ bgcolor: 'warning.50' }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                              <Typography variant="h4" sx={{ mb: 1 }}>🎈</Typography>
                              <Typography variant="body1" fontWeight="bold">Decorations</Typography>
                              <Typography variant="body2" color="text.secondary">₹{decorationCharge}</Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      )}

                      {bookingForm.specialRequests.cake && (
                        <Grid item xs={12} sm={4}>
                          <Card variant="outlined" sx={{ bgcolor: 'warning.50' }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                              <Typography variant="h4" sx={{ mb: 1 }}>🎂</Typography>
                              <Typography variant="body1" fontWeight="bold">Cake Arrangement</Typography>
                              <Typography variant="body2" color="text.secondary">₹{cakeCharge}</Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      )}

                      {bookingForm.specialRequests.photography && (
                        <Grid item xs={12} sm={4}>
                          <Card variant="outlined" sx={{ bgcolor: 'warning.50' }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                              <Typography variant="h4" sx={{ mb: 1 }}>📸</Typography>
                              <Typography variant="body1" fontWeight="bold">Photography</Typography>
                              <Typography variant="body2" color="text.secondary">₹{photographyCharge}</Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      )}
                    </Grid>

                    {bookingForm.specialRequests.customMessage && (
                      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2, borderLeft: '4px solid', borderColor: 'primary.main' }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          💬 Special Instructions:
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          {bookingForm.specialRequests.customMessage}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}

            {/* Pricing Breakdown */}
            <Card elevation={4} sx={{ border: '2px solid', borderColor: 'primary.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <AttachMoney sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Pricing Breakdown
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  {/* Screen Rental */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                    <Box>
                      <Typography variant="body1" fontWeight="500">Screen Rental</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {bookingForm.timeSlot?.duration} hours × ₹{selectedScreenInfo?.pricePerHour.toLocaleString()}/hour
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      ₹{screenAmount.toLocaleString()}
                    </Typography>
                  </Box>

                  {/* Event Package */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                    <Box>
                      <Typography variant="body1" fontWeight="500">Event Package</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {bookingForm.selectedEvent?.name}
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      ₹{eventAmount.toLocaleString()}
                    </Typography>
                  </Box>

                  {/* Additional Services */}
                  {servicesAmount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                      <Box>
                        <Typography variant="body1" fontWeight="500">Additional Services</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {bookingForm.specialRequests.decorations && 'Decorations '}
                          {bookingForm.specialRequests.cake && 'Cake '}
                          {bookingForm.specialRequests.photography && 'Photography'}
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold">
                        ₹{servicesAmount.toLocaleString()}
                      </Typography>
                    </Box>
                  )}

                  <Divider />

                  {/* Total */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, bgcolor: 'primary.50', px: 2, borderRadius: 2 }}>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      Total Amount
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      ₹{finalTotal.toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Alert severity="info" icon={<AttachMoney />}>
              <Typography variant="body1" fontWeight="bold" gutterBottom>
                💳 Payment Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">• No advance payment required</Typography>
                  <Typography variant="body2">• Pay at venue before your session</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">• Cash, UPI, Cards accepted</Typography>
                  <Typography variant="body2">• GST included in all prices</Typography>
                </Grid>
              </Grid>
            </Alert>

            {/* Important Guidelines */}
            <Card sx={{ bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ color: 'error.main' }} />
                  Important Guidelines
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" gutterBottom>
                      🕐 <strong>Arrival:</strong> 15 minutes before slot time
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      🆔 <strong>ID Required:</strong> Valid government ID for verification
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      🍿 <strong>Food:</strong> Outside food allowed or order during session
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" gutterBottom>
                      ❌ <strong>Cancellation:</strong> Up to 2 hours before booking
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      📱 <strong>Support:</strong> +91 99451 02299 for assistance
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      🎬 <strong>Setup:</strong> Screen ready 5 minutes before slot
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Booking ID Placeholder */}
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
              <Typography variant="body1" color="text.secondary">
                Your booking ID will be generated after confirmation
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {"You'll receive it via email and SMS"}
              </Typography>
            </Box>
          </Stack>
        )
      }
      default: return null
    }
  }


  return (
    <Container maxWidth="lg" sx={{ py: 2, px: isMobile ? 1 : 3 }}>
      <Typography variant={isMobile ? "h5" : "h4"} align="center" gutterBottom>
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
      <Paper sx={{ p: isMobile ? 2 : 3, mb: 4 }}>
        <Stepper activeStep={activeStep}
          alternativeLabel={!isMobile}
          orientation={isMobile ? 'vertical' : 'horizontal'}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>
                <Typography variant={isMobile ? "body2" : "body1"}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>
      <Paper sx={{ p: isMobile ? 2 : 3, mb: 4 }}>
        <Fade in timeout={500} key={activeStep}>
          <Box>{renderStepContent()}</Box>
        </Fade>
      </Paper>

      {/* Fixed Bottom Navigation for Mobile */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            p: 2,
            borderRadius: 0,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
          }}
        >
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              size="large"
              fullWidth
              variant="outlined"
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepValid() || loading}
              size="large"
              fullWidth
            >
              {loading
                ? <CircularProgress size={24} color="inherit" />
                : activeStep === steps.length - 1
                  ? 'Book Now'
                  : 'Next'}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Desktop Navigation */}
      {!isMobile && (
        <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mb: 4 }}>
          <Button disabled={activeStep === 0 || loading}
            onClick={handleBack}
            size="large">
            Back
          </Button>
          <Button variant="contained"
            onClick={handleNext}
            disabled={!isStepValid() || loading}
            size="large"
            sx={{ minWidth: 120 }}>
            {loading
              ? <CircularProgress size={24} color="inherit" />
              : activeStep === steps.length - 1
                ? 'Book Now'
                : 'Next'}
          </Button>
        </Stack>
      )}

      {/* Scroll to Top FAB */}
      {showScrollTop && (
        <Fab
          color="primary"
          size="small"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: isMobile ? 80 : 20,
            right: 20,
            zIndex: 1000
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      )}

      <Dialog open={confirmationDialog}
        onClose={() => setConfirmationDialog(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}>
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
            fullWidth={isMobile}
          >
            Back to Home
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add bottom padding for mobile to account for fixed navigation */}
      {isMobile && <Box sx={{ height: 100 }} />}
    </Container>
  )
}
