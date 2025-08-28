'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Fade,
  CircularProgress,
  Chip,
  Avatar,
} from '@mui/material'
import { ChevronLeft, ChevronRight, Place, Phone, Email, LocationOn } from '@mui/icons-material'

export default function LocationsSection() {
  const router = useRouter()
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch('/api/public/locations')
        const data = await res.json()
        if (data.success) setLocations(data.locations)
      } catch (error) {
        console.error('Error fetching locations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchLocations()
  }, [])

  const handleNavigation = (direction) => {
    if (!locations.length) return
    setFadeIn(false)
    setTimeout(() => {
      setCurrentIndex((prev) =>
        direction === 'next'
          ? (prev + 1) % locations.length
          : (prev - 1 + locations.length) % locations.length
      )
      setFadeIn(true)
    }, 200)
  }

  const handleLocationClick = (location) => {
    console.log('Location selected:', location)
    router.push(`/book?location=${location.id}`)
  }

  const visible = locations.length
    ? [
        locations[currentIndex],
        locations[(currentIndex + 1) % locations.length],
        locations[(currentIndex + 2) % locations.length],
      ]
    : []

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f4f4f4' }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" sx={{ 
            fontFamily: '"Cormorant", serif', 
            fontStyle: 'italic',
            mb: 2, 
            fontWeight: 400,
            fontSize: { xs: '2rem', md: '3rem', lg: '48px' }, 
          }}>
            Our Locations
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {"Available across Bangalore's favorite neighborhoods"}
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box display="flex" justifyContent="space-between" mb={4}>
              <IconButton 
                onClick={() => handleNavigation('prev')}
                sx={{
                  bgcolor: 'white',
                  boxShadow: 2,
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton 
                onClick={() => handleNavigation('next')}
                sx={{
                  bgcolor: 'white',
                  boxShadow: 2,
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
              >
                <ChevronRight />
              </IconButton>
            </Box>

            <Fade in={fadeIn} timeout={200}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                  gap: 3,
                }}
              >
                {visible.map((loc) => (
                  <Card 
                    key={loc.id} 
                    sx={{ 
                      borderRadius: 3,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                      }
                    }}
                    onClick={() => handleLocationClick(loc)}
                  >
                    {/* Enhanced image section */}
                    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                      {loc.images?.length > 0 ? (
                        <CardMedia
                          component="img"
                          height="220"
                          image={loc.images[0].url}
                          alt={loc.images[0].alt || loc.name}
                          sx={{ 
                            objectFit: 'cover',
                            transition: 'transform 0.4s ease',
                            '&:hover': {
                              transform: 'scale(1.1)'
                            }
                          }}
                        />
                      ) : (
                        // Fallback gradient background with location icon
                        <Box
                          sx={{
                            height: 220,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                          }}
                        >
                          <LocationOn sx={{ fontSize: 60, opacity: 0.8 }} />
                        </Box>
                      )}
                      
                      {/* Location status chip */}
                      {/* <Chip
                        label="Available"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          bgcolor: '#4caf50',
                          color: 'white',
                          fontWeight: 600,
                          '& .MuiChip-label': { px: 1.5 }
                        }}
                      /> */}
                      
                      {/* Gradient overlay for better text readability */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '50%',
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.1))',
                          pointerEvents: 'none'
                        }}
                      />
                    </Box>
                    
                    <CardContent sx={{ p: 3 }}>
                      {/* Location name with enhanced styling */}
                      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                        <Avatar sx={{ bgcolor: '#D50A17', width: 32, height: 32 }}>
                          <Place fontSize="small" />
                        </Avatar>
                        <Typography 
                          variant="h6" 
                          fontWeight={700}
                          sx={{
                            fontSize: '1.1rem',
                            color: '#1a1a1a',
                            letterSpacing: '-0.5px'
                          }}
                        >
                          {loc.name}
                        </Typography>
                      </Box>
                      
                      {/* Address with better spacing */}
                      <Typography 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2.5, 
                          lineHeight: 1.6,
                          fontSize: '0.95rem'
                        }}
                      >
                        {loc.address?.street}, {loc.address?.area}, {loc.address?.city}
                      </Typography>
                      
                      {/* Contact info with improved layout */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Phone 
                            fontSize="small" 
                            sx={{ 
                              color: '#D50A17',
                              bgcolor: '#fff0f0',
                              p: 0.5,
                              borderRadius: 1,
                              width: 24,
                              height: 24
                            }} 
                          />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              color: '#333'
                            }}
                          >
                            {loc.contactInfo?.phone}
                          </Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Email 
                            fontSize="small" 
                            sx={{ 
                              color: '#666',
                              bgcolor: '#f8f8f8',
                              p: 0.5,
                              borderRadius: 1,
                              width: 24,
                              height: 24
                            }}
                          />
                          <Typography 
                            variant="body2"
                            sx={{ 
                              color: '#666',
                              fontWeight: 400
                            }}
                          >
                            {loc.contactInfo?.email}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Subtle bottom accent */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 3,
                          background: 'linear-gradient(90deg, #D50A17 0%, #ff4569 100%)'
                        }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Fade>
          </>
        )}
      </Container>
    </Box>
  )
}
