'use client'
import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Chip,
  Avatar,
  Stack,
  Fade,
  Slide,
  Skeleton
} from '@mui/material'
import {
  People as PeopleIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  Movie as MovieIcon,
  ArrowForward as ArrowForwardIcon,
  Phone as PhoneIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import banner from '../../assets/banner.png'

const HeroSection = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const router = useRouter()

  const [locations, setLocations] = useState([])
  const [screens, setScreens] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Enhanced stats
  const stats = [
    {
      icon: <PeopleIcon />,
      number: '2000+',
      label: 'Happy Customers',
      color: '#FF6B6B'
    },
    {
      icon: <StarIcon />,
      number: '4.9',
      label: 'Google Rating',
      color: '#FFD93D'
    },
    {
      icon: <LocationIcon />,
      number: locations.length.toString(),
      label: 'Prime Locations',
      color: '#6BCF7F'
    },
    {
      icon: <MovieIcon />,
      number: screens.length.toString(),
      label: 'Premium Screens',
      color: '#4D96FF'
    }
  ]

  // Data load
  useEffect(() => {
    loadAllData()

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.max(locations.length + screens.length + events.length, 1))
    }, 4000)

    return () => clearInterval(interval)
  }, [locations.length, screens.length, events.length])

  async function loadAllData() {
    try {
      const [locationsRes, screensRes, eventsRes] = await Promise.all([
        fetch('/api/public/locations'),
        fetch('/api/admin/screens'),
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
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLocationClick = (location) => {
    console.log('Location selected:', location)
    router.push(`/book?location=${location.id}`)
  }

  const handleEventClick = (event) => {
    console.log('Event selected:', event)
    router.push(`/book?event=${event.id}`)
  }

  const handleScreenClick = (screen) => {
    console.log('Screen selected:', screen)
    router.push(`/book?location=${screen.location?.id || ''}&screen=${screen.id}`)
  }

  const renderContentCarousel = () => {
    const allContent = [
      ...locations.map(location => ({
        type: 'location',
        data: location,
        icon: <LocationIcon />,
        title: location.name,
        subtitle: `${location.address?.area}, ${location.address?.city}`,
        description: `Contact: ${location.contactInfo?.phone}`,
        color: '#D50A17',
        onClick: () => handleLocationClick(location)
      })),
      ...screens.map(screen => ({
        type: 'screen',
        data: screen,
        icon: <MovieIcon />,
        title: screen.name,
        subtitle: `Capacity: ${screen.capacity} people`,
        description: `₹${screen.pricePerHour}/hour`,
        color: '#4D96FF',
        onClick: () => handleScreenClick(screen)
      })),
      ...events.map(event => ({
        type: 'event',
        data: event,
        icon: <CelebrationIcon />,
        title: event.name,
        subtitle: `Duration: ${event.duration} minutes`,
        description: `Max ${event.maxCapacity} guests`,
        color: '#FF6B6B',
        onClick: () => handleEventClick(event)
      }))
    ]

    if (allContent.length === 0) return null

    const currentContent = allContent[currentSlide % allContent.length]

    return (
      <Fade in timeout={500} key={currentSlide}>
        <Card
          sx={{
            bgcolor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(255,255,255,0.2)',
            height: {
              xs: 280,
              sm: 300,
              md: 320,
              lg: 340
            },
            display: 'flex',
            flexDirection: 'column',
            '&:hover': {
              transform: 'translateY(-8px)',
              bgcolor: 'rgba(255,255,255,0.15)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }
          }}
          onClick={currentContent.onClick}
        >
          <CardContent 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              height: '100%',
              p: {
                xs: 2,
                sm: 2.5,
                md: 3,
                lg: 3.5
              }
            }}
          >
            <Avatar 
              sx={{ 
                bgcolor: currentContent.color, 
                mb: {
                  xs: 1.5,
                  sm: 2,
                  md: 2.5
                },
                width: {
                  xs: 50,
                  sm: 55,
                  md: 60,
                  lg: 65
                },
                height: {
                  xs: 50,
                  sm: 55,
                  md: 60,
                  lg: 65
                }
              }}
            >
              {currentContent.icon}
            </Avatar>
            
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold', 
                mb: {
                  xs: 1,
                  sm: 1.5,
                  md: 2
                },
                color: '#fff',
                fontSize: {
                  xs: '1rem',
                  sm: '1.1rem',
                  md: '1.25rem',
                  lg: '1.3rem'
                },
                lineHeight: 1.2,
                minHeight: {
                  xs: '1.2rem',
                  sm: '1.32rem',
                  md: '1.5rem',
                  lg: '1.56rem'
                }
              }}
            >
              {currentContent.title}
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                mb: {
                  xs: 1,
                  sm: 1.5,
                  md: 2
                },
                color: 'rgba(255,255,255,0.9)',
                fontSize: {
                  xs: '0.8rem',
                  sm: '0.85rem',
                  md: '0.9rem',
                  lg: '0.95rem'
                },
                lineHeight: 1.3,
                minHeight: {
                  xs: '1.04rem',
                  sm: '1.105rem',
                  md: '1.17rem',
                  lg: '1.235rem'
                }
              }}
            >
              {currentContent.subtitle}
            </Typography>
            
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 'bold', 
                color: 'rgba(255,255,255,0.8)',
                mb: {
                  xs: 2,
                  sm: 2.5,
                  md: 3
                },
                fontSize: {
                  xs: '0.7rem',
                  sm: '0.75rem',
                  md: '0.8rem'
                },
                minHeight: {
                  xs: '0.84rem',
                  sm: '0.9rem',
                  md: '0.96rem'
                }
              }}
            >
              {currentContent.description}
            </Typography>
            
            <Chip
              label={currentContent.type.toUpperCase()}
              size="small"
              sx={{ 
                bgcolor: currentContent.color, 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: {
                  xs: '0.65rem',
                  sm: '0.7rem',
                  md: '0.75rem'
                },
                height: {
                  xs: 24,
                  sm: 26,
                  md: 28
                },
                px: {
                  xs: 1,
                  sm: 1.5,
                  md: 2
                },
                borderRadius: 2,
                '&:hover': {
                  bgcolor: currentContent.color,
                  opacity: 0.9
                }
              }}
            />
          </CardContent>
        </Card>
      </Fade>
    )
  }

  return (
    <Box
      sx={{
        backgroundImage: `url(${banner.src})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        pt: { xs: 4, sm: 6, md: 8 },
        pb: { xs: 6, sm: 8, md: 10 },
        overflow: 'hidden',
        minHeight: { xs: '100vh', sm: '90vh', md: '85vh' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Container sx={{ maxWidth: '1200px' }}>
        {/* Title */}
        <Typography
          variant="h1"
          sx={{
            fontFamily: "'Cormorant', serif",
            fontStyle: 'italic',
            fontWeight: 400,
            textAlign: 'center',
            mb: { xs: 2, sm: 3, lg: 9 },
            fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem', lg: '3.8rem', xl: '4.2rem' },
            lineHeight: { xs: 1.2, sm: 1.1 },
            color: 'white'
          }}
        >
          Create Magical{' '}
          <Box component="span" sx={{ background: 'linear-gradient(45deg, #ff0505ff, #ff0000ff)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Memories
          </Box>
        </Typography>

        <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', maxWidth: '1200px' }}>
          <Grid container spacing={{ xs: 3, sm: 4, md: 6, lg: 9 }} alignItems="center" sx={{ width: '100%' }}>
            {/* Left */}
            <Grid item xs={12} lg={6}>
              <Box sx={{ textAlign: { xs: 'center', lg: 'left' }, px: { xs: 2, sm: 0 } }}>
                <Typography
                  variant="h6"
                  sx={{ mb: { xs: 3, sm: 4, lg: 7 }, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, fontWeight: 300, fontSize: { xs: '1rem', sm: '1.25rem' }, maxWidth: { xs: '100%', lg: '600px' }, mx: { xs: 'auto', lg: 0 } }}
                >
                  Premium private theatres across Bangalore for birthdays, anniversaries,
                  date nights & celebrations. Experience cinema like never before with your loved ones.
                </Typography>

                {/* CTA */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 4, sm: 5, lg: 7 }, alignItems: 'center', justifyContent: { xs: 'center', lg: 'flex-start' } }}>
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    href="/book"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ borderRadius: 50, py: { xs: 1.5, sm: 2 }, px: { xs: 3, sm: 4 }, fontSize: { xs: '1rem', sm: '1.1rem' }, fontWeight: 'bold', background: 'linear-gradient(45deg, #e60a0aff, #ff0101ff)', boxShadow: '0 8px 32px rgba(255,107,107,0.4)', minWidth: { xs: 200, sm: 'auto' }, '&:hover': { background: 'linear-gradient(45deg, #FF5252, #f30101ff)', transform: 'translateY(-3px)', boxShadow: '0 12px 40px rgba(255,107,107,0.6)' }, transition: 'all 0.3s ease' }}
                  >
                    Book Now
                  </Button>
                  <Button variant="outlined" size="large" startIcon={<PhoneIcon />} href="tel:+919945102299" sx={{ borderRadius: 50, py: { xs: 1.5, sm: 2 }, px: { xs: 3, sm: 4 }, fontSize: { xs: '1rem', sm: '1.1rem' }, fontWeight: 'bold', borderColor: 'white', color: 'white', borderWidth: 2, minWidth: { xs: 200, sm: 'auto' }, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)', transform: 'translateY(-3px)', borderWidth: 2 }, transition: 'all 0.3s ease' }}>
                    Call +91 99451 02299
                  </Button>
                </Stack>

                {/* Stats */}
                <Grid container spacing={{ xs: 1, sm: 2 }}>
                  {stats.map((stat, index) => (
                    <Grid item xs={6} sm={6} md={3} key={index}>
                      <Slide direction="up" in timeout={1000 + index * 200}>
                        <Card 
                          sx={{ 
                            textAlign: 'center',
                            bgcolor: 'rgba(255,255,255,0.1)', 
                            backdropFilter: 'blur(20px)', 
                            border: '1px solid rgba(255,255,255,0.2)', 
                            borderRadius: { xs: 2, sm: 3 },
                            transition: 'all 0.3s ease',
                            height: {
                              xs: 100,
                              sm: 120,
                              md: 130
                            },
                            display: 'flex',
                            flexDirection: 'column',
                            '&:hover': { 
                              transform: 'translateY(-5px)', 
                              bgcolor: 'rgba(255,255,255,0.15)' 
                            }
                          }}
                        >
                          <CardContent 
                            sx={{ 
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%',
                              py: { xs: '8px !important', sm: '12px !important', md: '16px !important' },
                              px: { xs: '8px !important', sm: '12px !important', md: '16px !important' }
                            }}
                          >
                            <Avatar 
                              sx={{ 
                                bgcolor: stat.color, 
                                mb: {
                                  xs: 0.5,
                                  sm: 1,
                                  md: 1.5
                                },
                                width: { xs: 28, sm: 32, md: 36 }, 
                                height: { xs: 28, sm: 32, md: 36 } 
                              }}
                            >
                              {stat.icon}
                            </Avatar>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 'bold', 
                                mb: {
                                  xs: 0.2,
                                  sm: 0.3,
                                  md: 0.5
                                },
                                color: 'white', 
                                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                                lineHeight: 1
                              }}
                            >
                              {stat.number}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'rgba(255,255,255,0.8)', 
                                fontWeight: 500, 
                                fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                                lineHeight: 1,
                                textAlign: 'center'
                              }}
                            >
                              {stat.label}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Slide>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>

            {/* Right - desktop */}
            <Grid item xs={12} lg={6} sx={{ display: { xs: 'none', lg: 'block' } }}>
              <Fade in timeout={1200}>
                <Box sx={{ position: 'relative' }}>
                  <Box sx={{ mb: 3 }}>
                    {loading ? (
                      <Skeleton 
                        variant="rectangular" 
                        width="100%" 
                        height={340}
                        sx={{ borderRadius: 3 }} 
                      />
                    ) : (
                      renderContentCarousel()
                    )}
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Card 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.1)', 
                          backdropFilter: 'blur(10px)', 
                          textAlign: 'center', 
                          borderRadius: 2,
                          height: 80,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.15)'
                          }
                        }}
                      >
                        <CardContent sx={{ py: '12px !important' }}>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem', mb: 0.5 }}>
                            {locations.length}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>
                            Locations
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.1)', 
                          backdropFilter: 'blur(10px)', 
                          textAlign: 'center', 
                          borderRadius: 2,
                          height: 80,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.15)'
                          }
                        }}
                      >
                        <CardContent sx={{ py: '12px !important' }}>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem', mb: 0.5 }}>
                            {screens.length}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>
                            Screens
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.1)', 
                          backdropFilter: 'blur(10px)', 
                          textAlign: 'center', 
                          borderRadius: 2,
                          height: 80,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.15)'
                          }
                        }}
                      >
                        <CardContent sx={{ py: '12px !important' }}>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem', mb: 0.5 }}>
                            {events.length}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>
                            Events
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Fade>
            </Grid>

            {/* Mobile content */}
            <Grid item xs={12} sx={{ display: { xs: 'block', lg: 'none' } }}>
              <Box sx={{ mt: 2 }}>
                {loading ? (
                  <Skeleton 
                    variant="rectangular" 
                    width="100%" 
                    height={280} 
                    sx={{ borderRadius: 3 }} 
                  />
                ) : (
                  <Box sx={{ px: 2, width: "280px" }}>
                    {renderContentCarousel()}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Container>
    </Box>
  )
}

export default HeroSection
