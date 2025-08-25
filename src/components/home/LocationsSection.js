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
} from '@mui/material'
import { ChevronLeft, ChevronRight, Place, Phone, Email } from '@mui/icons-material'

export default function LocationsSection() {
  const router = useRouter() // ✅ Add router for navigation
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

  // ✅ Handle location card click - navigate to booking page
  const handleLocationClick = (location) => {
    console.log('Location selected:', location)
    
    // Navigate to booking page with location pre-selected
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
              <IconButton onClick={() => handleNavigation('prev')}>
                <ChevronLeft />
              </IconButton>
              <IconButton onClick={() => handleNavigation('next')}>
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
                      borderTop: '4px solid #000', 
                      borderRadius: 2, 
                      overflow: 'hidden',
                      cursor: 'pointer', // ✅ Add cursor pointer
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => handleLocationClick(loc)} // ✅ Add click handler
                  >
                    {/* ✅ Show location images if available */}
                    {loc.images?.length > 0 && (
                      <CardMedia
                        component="img"
                        height="180"
                        image={loc.images[0].url}
                        alt={loc.images[0].alt || loc.name}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}
                    
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Place color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                          {loc.name}
                        </Typography>
                      </Box>
                      <Typography color="text.secondary" mb={2}>
                        {loc.address?.street}, {loc.address?.area}, {loc.address?.city}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Phone fontSize="small" sx={{ color: '#D50A17' }} />
                        <Typography variant="body2">{loc.contactInfo?.phone}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Email fontSize="small" color="action" />
                        <Typography variant="body2">{loc.contactInfo?.email}</Typography>
                      </Box>
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
