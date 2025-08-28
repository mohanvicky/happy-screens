'use client'
import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Fade,
  CircularProgress,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { ChevronLeft, ChevronRight, Movie } from '@mui/icons-material'
import { useRouter } from 'next/navigation'

export default function ScreensSection() {
  const [screens, setScreens] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)
  const router = useRouter()
  const theme = useTheme()
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  // Determine how many items to show and navigate by
  const getItemsPerView = () => {
    if (isMobile) return 1
    if (isTablet) return 2
    return 3
  }

  const itemsPerView = getItemsPerView()

  useEffect(() => {
    const fetchScreens = async () => {
      try {
        const res = await fetch('/api/public/screens')
        const data = await res.json()
        if (data.success) setScreens(data.screens)
      } catch (error) {
        console.error('Error fetching screens:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchScreens()
  }, [])

  const handleNavigation = (direction) => {
    if (!screens.length) return
    setFadeIn(false)
    setTimeout(() => {
      setCurrentIndex((prev) => {
        if (direction === 'next') {
          return (prev + itemsPerView) % screens.length
        } else {
          return (prev - itemsPerView + screens.length) % screens.length
        }
      })
      setFadeIn(true)
    }, 200)
  }

  // ✅ Booking handler
  function handleBookNow(screen) {
    console.log('Booking screen:', screen)

    if (!screen || !screen.id) {
      console.error('Invalid screen data:', screen)
      return
    }

    const params = new URLSearchParams()
    params.append('screen', screen.id)

    // Include location if available
    if (screen.location && screen.location._id) {
      params.append('location', screen.location._id)
    }

    const bookingUrl = `/book?${params.toString()}`
    console.log('Navigating to:', bookingUrl)

    router.push(bookingUrl)
  }

  // Get visible screens based on screen size
  const getVisibleScreens = () => {
    if (!screens.length) return []
    
    const visible = []
    for (let i = 0; i < itemsPerView; i++) {
      const index = (currentIndex + i) % screens.length
      visible.push(screens[index])
    }
    return visible.filter(Boolean)
  }

  // Calculate how many amenities to show in 2 lines
  const getAmenitiesDisplay = (amenities) => {
    if (!amenities) return { visible: [], count: 0 }
    
    // Estimate chips per line based on screen size
    const chipsPerLine = isMobile ? 2 : isTablet ? 3 : 4
    const maxVisible = chipsPerLine * 2 // 2 lines
    
    if (amenities.length <= maxVisible) {
      return { visible: amenities, count: 0 }
    }
    
    return {
      visible: amenities.slice(0, maxVisible - 1), // Leave space for "+X more" chip
      count: amenities.length - (maxVisible - 1)
    }
  }

  const visibleScreens = getVisibleScreens()
  const showNavigation = screens.length > itemsPerView

  return (
    <Box
      sx={{
        py: { xs: 6, sm: 8, md: 12 },
        background: 'linear-gradient(135deg, #ffffffff 0%, #eaebecff 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Cormorant", serif',
              fontStyle: 'italic',
              mb: 2,
              fontWeight: '400',
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem', lg: '3rem' },
              lineHeight: 1.2,
            }}
          >
            Our Private Screens
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
              px: { xs: 2, sm: 0 }
            }}
          >
            Choose the perfect setup for your celebration
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {showNavigation && (
              <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center"
                mb={{ xs: 2, md: 4 }}
                px={{ xs: 1, sm: 2 }}
              >
                <IconButton
                  onClick={() => handleNavigation('prev')}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: 2,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 1)',
                      boxShadow: 4,
                    },
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                  }}
                >
                  <ChevronLeft sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </IconButton>
                
                <Box 
                  display="flex" 
                  gap={1} 
                  alignItems="center"
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  {Array.from({ length: Math.ceil(screens.length / itemsPerView) }).map((_, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: Math.floor(currentIndex / itemsPerView) === index 
                          ? 'primary.main' 
                          : 'grey.300',
                        transition: 'background-color 0.3s ease',
                      }}
                    />
                  ))}
                </Box>
                
                <IconButton
                  onClick={() => handleNavigation('next')}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: 2,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 1)',
                      boxShadow: 4,
                    },
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                  }}
                >
                  <ChevronRight sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </IconButton>
              </Box>
            )}

            <Fade in={fadeIn} timeout={200}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                  },
                  gap: { xs: 2, sm: 2.5, md: 3 },
                  px: { xs: 1, sm: 0 },
                }}
              >
                {visibleScreens.map((screen, idx) => {
                  const amenitiesDisplay = getAmenitiesDisplay(screen.amenities)
                  
                  return (
                    <Card
                      key={`${currentIndex}-${idx}`}
                      onClick={() => handleBookNow(screen)}
                      sx={{
                        borderRadius: { xs: 1.5, sm: 2 },
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: { xs: 'translateY(-2px)', sm: 'translateY(-5px)' },
                          boxShadow: { xs: 3, sm: 6 },
                        },
                        // Fixed height for consistent card sizes
                        height: {
                          xs: 'auto',
                          sm: 500,
                          md: 450,
                        },
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {screen.images?.length > 0 && (
                        <CardMedia
                          component="img"
                          height={isMobile ? "160" : "180"}
                          image={screen.images[0].url}
                          alt={screen.images[0].alt || screen.name}
                          sx={{
                            objectFit: 'cover',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <CardContent 
                        sx={{ 
                          p: { xs: 2, sm: 2.5, md: 3 },
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          mb={1}
                        >
                          <Movie 
                            color="primary" 
                            sx={{ fontSize: { xs: 20, sm: 24 } }} 
                          />
                          <Typography 
                            variant="h6" 
                            fontWeight={600}
                            sx={{
                              fontSize: { xs: '1.1rem', sm: '1.25rem' },
                              lineHeight: 1.3,
                            }}
                          >
                            {screen.name}
                          </Typography>
                        </Box>
                        
                        <Typography 
                          color="text.secondary" 
                          mb={2}
                          sx={{
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: { xs: 2, sm: 3 },
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {screen.description}
                        </Typography>

                        <Box
                          display="flex"
                          flexDirection={{ xs: 'column', sm: 'row' }}
                          justifyContent={{ sm: 'space-between' }}
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          gap={{ xs: 1, sm: 2 }}
                          mb={1.5} // Reduced from mb={2}
                        >
                          <Typography 
                            variant="body2"
                            sx={{
                              fontSize: { xs: '0.875rem', sm: '0.925rem' },
                            }}
                          >
                            Capacity:{' '}
                            <Box
                              component="span"
                              sx={{ 
                                color: '#D50A17', 
                                fontWeight: 'bold',
                                fontSize: { xs: '0.925rem', sm: '1rem' },
                              }}
                            >
                              {screen.capacity}
                            </Box>
                          </Typography>

                          <Typography 
                            variant="body2"
                            sx={{
                              fontSize: { xs: '0.875rem', sm: '0.925rem' },
                            }}
                          >
                            Price:{' '}
                            <Box
                              component="span"
                              sx={{ 
                                fontWeight: 'bold', 
                                color: '#D50A17',
                                fontSize: { xs: '0.925rem', sm: '1rem' },
                              }}
                            >
                              ₹{screen.pricePerHour}/hour
                            </Box>
                          </Typography>
                        </Box>

                        {/* Amenities section - removed mt: 'auto' and reduced spacing */}
                        <Box 
                          display="flex" 
                          flexWrap="wrap" 
                          gap={{ xs: 0.5, sm: 1 }}
                          alignContent="flex-start"
                        >
                          {amenitiesDisplay.visible.map((amenity) => (
                            <Chip
                              key={amenity}
                              label={amenity}
                              size="small"
                              color="primary"
                              sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                height: { xs: 24, sm: 28 },
                              }}
                            />
                          ))}
                          {amenitiesDisplay.count > 0 && (
                            <Chip
                              label={`+${amenitiesDisplay.count} more`}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                height: { xs: 24, sm: 28 },
                                color: 'text.secondary',
                              }}
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  )
                })}
              </Box>
            </Fade>
          </>
        )}
      </Container>
    </Box>
  )
}
