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
} from '@mui/material'
import { ChevronLeft, ChevronRight, Movie } from '@mui/icons-material'
import { useRouter } from 'next/navigation'

export default function ScreensSection() {
  const [screens, setScreens] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)
  const router = useRouter()

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
          return (prev + 3) % screens.length
        } else {
          return (prev - 3 + screens.length) % screens.length
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

  // Always show exactly 3 cards
  const visible = screens.length
    ? [
        screens[currentIndex],
        screens[(currentIndex + 1) % screens.length],
        screens[(currentIndex + 2) % screens.length],
      ].filter(Boolean)
    : []

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(135deg, #ffffffff 0%, #eaebecff 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Cormorant", serif',
              fontStyle: 'italic',
              mb: 2,
              fontWeight: '400',
              fontSize: { xs: '2rem', md: '3rem', lg: '48px' },
            }}
          >
            Our Private Screens
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Choose the perfect setup for your celebration
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
                disabled={screens.length <= 3}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                onClick={() => handleNavigation('next')}
                disabled={screens.length <= 3}
              >
                <ChevronRight />
              </IconButton>
            </Box>

            <Fade in={fadeIn} timeout={200}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 3,
                }}
              >
                {visible.map((screen, idx) => (
                  <Card
                    key={`${currentIndex}-${idx}`}
                    onClick={() => handleBookNow(screen)}
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition:
                        'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    {screen.images?.length > 0 && (
                      <CardMedia
                        component="img"
                        height="180"
                        image={screen.images[0].url}
                        alt={screen.images[0].alt || screen.name}
                      />
                    )}
                    <CardContent>
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        mb={1}
                      >
                        <Movie color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                          {screen.name}
                        </Typography>
                      </Box>
                      <Typography color="text.secondary" mb={1}>
                        {screen.description}
                      </Typography>

                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <Typography variant="body2">
                          Capacity:{' '}
                          <Box
                            component="span"
                            sx={{ color: '#D50A17', fontWeight: 'bold' }}
                          >
                            {screen.capacity}
                          </Box>
                        </Typography>

                        <Typography variant="body2">
                          Price:{' '}
                          <Box
                            component="span"
                            sx={{ fontWeight: 'bold', color: '#D50A17' }}
                          >
                            ₹{screen.pricePerHour}/hour
                          </Box>
                        </Typography>
                      </Box>

                      <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                        {screen.amenities?.map((amenity) => (
                          <Chip
                            key={amenity}
                            label={amenity}
                            size="small"
                            color="primary"
                          />
                        ))}
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
