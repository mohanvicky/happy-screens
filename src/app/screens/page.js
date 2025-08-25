'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  CircularProgress,
  Chip,
  Paper,
  Button,
  Zoom
} from '@mui/material'
import {
  LocationOn,
  People,
  AttachMoney,
  Movie,
  Star,
  AccessTime
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function PublicScreensPage() {
  const router = useRouter()
  const [screens, setScreens] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadScreens()
  }, [])

  async function loadScreens() {
    setLoading(true)
    try {
      const response = await fetch('/api/public/screens')
      
      if (response.ok) {
        const data = await response.json()
        setScreens(data.screens || [])
      } else {
        console.error('Failed to load screens')
      }
    } catch (error) {
      console.error('Error loading screens:', error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Handle Book Now button click
// ✅ FIXED: Handle the correct property names from your data structure
function handleBookNow(screen) {
    console.log('Booking screen:', screen)
    
    // Validate required data
    if (!screen || !screen.id) {
      console.error('Invalid screen data:', screen)
      return
    }
    
    // Build query parameters
    const params = new URLSearchParams()
    params.append('screen', screen.id)
    
    // ✅ FIXED: Use _id instead of id for location
    if (screen.location && screen.location._id) {
      params.append('location', screen.location._id)
    }
    
    const bookingUrl = `/book?${params.toString()}`
    console.log('Navigating to:', bookingUrl)
    
    // Navigate to booking page
    router.push(bookingUrl)
  }
  
  
  

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '70vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading Our Screens...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ 
      bgcolor: 'grey.50', 
      minHeight: '100vh',
      pb: 4
    }}>
      {/* Hero Section */}
      <Box sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: { xs: 6, md: 10 },
        mb: 4
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Movie sx={{ fontSize: { xs: 48, md: 60 }, mb: 2 }} />
            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}>
              Our Premium Screens
            </Typography>
            <Typography variant="h6" sx={{ 
              opacity: 0.9, 
              maxWidth: 600, 
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.25rem' },
              px: { xs: 2, sm: 0 }
            }}>
              Experience movies like never before in our state-of-the-art private theatres. 
              Each screen is designed for ultimate comfort and entertainment.
            </Typography>
            <Typography variant="body1" sx={{ 
              mt: 2, 
              opacity: 0.8,
              px: { xs: 2, sm: 0 }
            }}>
              {screens.length} Premium Screens Available
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* Screens Grid */}
        {screens.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '50vh',
            textAlign: 'center',
            p: 4
          }}>
            <Movie sx={{ fontSize: 80, color: 'grey.400', mb: 3 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Screens Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
              {"We're setting up amazing new screens for your entertainment. Check back soon for our premium theatre experiences!"}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {screens.map((screen, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={screen.id}>
                <Zoom in timeout={300 + index * 50}>
                  <Card sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8
                    }
                  }}>
                    {/* Screen Image */}
                    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                      {screen.images && screen.images.length > 0 ? (
                        <CardMedia
                          component="img"
                          height="200"
                          image={screen.images[0].url}
                          alt={screen.name}
                          sx={{ 
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
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
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography variant="h5" gutterBottom sx={{ 
                        fontWeight: 600,
                        color: 'primary.main'
                      }}>
                        {screen.name}
                      </Typography>
                      
                      {screen.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {screen.description}
                        </Typography>
                      )}

                      {/* Screen Details */}
                      <Box sx={{ mb: 2 }}>
                        {screen.location && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LocationOn fontSize="small" color="primary" />
                            <Typography variant="body2" fontWeight="500">
                              {screen.location.name}
                            </Typography>
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <People fontSize="small" color="primary" />
                          <Typography variant="body2" fontWeight="500">
                            Capacity: {screen.capacity} people
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoney fontSize="small" color="success" />
                          <Typography variant="body2" fontWeight="500" color="success.main">
                            ₹{screen.pricePerHour.toLocaleString()}/hour
                          </Typography>
                        </Box>
                      </Box>

                      {/* Amenities */}
                      {screen.amenities && screen.amenities.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                            Amenities:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {screen.amenities.slice(0, 3).map((amenity, i) => (
                              <Chip
                                key={i}
                                label={amenity}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            ))}
                            {screen.amenities.length > 3 && (
                              <Chip
                                label={`+${screen.amenities.length - 3} more`}
                                size="small"
                                color="primary"
                              />
                            )}
                          </Box>
                        </Box>
                      )}
                    </CardContent>

                    {/* ✅ Book Now Button */}
                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        onClick={() => handleBookNow(screen)}
                        sx={{
                          py: 1.5,
                          fontWeight: 'bold',
                          borderRadius: 2,
                          background: 'linear-gradient(45deg, #FF6B6B, #FF8E8E)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #FF5252, #FF7979)',
                            transform: 'translateY(-2px)',
                            boxShadow: 4
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Book Now
                      </Button>
                    </CardActions>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Call-to-Action Section */}
        {screens.length > 0 && (
          <Paper sx={{ 
            mt: 6, 
            p: 4, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)'
          }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Ready for an Amazing Experience?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
              {"Click `Book Now` on any screen above to start your booking process. We'll pre-select the screen and location for you!"}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Chip
                icon={<AccessTime />}
                label="Quick Booking"
                color="primary"
                sx={{ fontWeight: 'bold' }}
              />
              <Chip
                icon={<Star />}
                label="Premium Quality"
                color="success"
                sx={{ fontWeight: 'bold' }}
              />
              <Chip
                icon={<People />}
                label="Group Friendly"
                color="secondary"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  )
}
