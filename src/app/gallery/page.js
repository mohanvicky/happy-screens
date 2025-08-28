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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip,
  Zoom
} from '@mui/material'
import {
  Close,
  LocationOn,
  Movie,
  PhotoLibrary,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material'
import Image from 'next/image'

export default function PublicGalleryPage() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  useEffect(() => {
    loadImages()
  }, [])

  async function loadImages() {
    setLoading(true)
    try {
      const response = await fetch('/api/public/gallery')
      
      if (response.ok) {
        const data = await response.json()
        setImages(data.images || [])
      } else {
        console.error('Failed to load images')
      }
    } catch (error) {
      console.error('Error loading gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  function viewImage(image, index) {
    setSelectedImage(image)
    setSelectedImageIndex(index)
    setViewDialogOpen(true)
  }

  function closeDialog() {
    setViewDialogOpen(false)
    setSelectedImage(null)
    setSelectedImageIndex(0)
  }

  function navigateImage(direction) {
    const newIndex = direction === 'next' 
      ? (selectedImageIndex + 1) % images.length
      : (selectedImageIndex - 1 + images.length) % images.length
    
    setSelectedImageIndex(newIndex)
    setSelectedImage(images[newIndex])
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
          Loading Gallery...
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
        background: 'linear-gradient(135deg, #000 0%, #D50A17 100%)',
        color: 'white',
        py: { xs: 6, md: 10 },
        mb: 8
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ 
              fontSize: { xs: '2rem', md: '3rem', lg:'48px' }, 
              fontStyle :'italic', 
              fontFamily: '"Cormorant", serif', 
              fontWeight:400,
            }}>
               Gallery
            </Typography>
            <Typography variant="h6" sx={{ 
              opacity: 0.9, 
              maxWidth: 600, 
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.25rem' },
              px: { xs: 2, sm: 0 }
            }}>
              Explore our premium private theatre experiences through beautiful moments 
              captured at our locations across Bangalore
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{marginTop:'80px', marginBottom:'100px'}} >
        {/* Gallery Grid */}
        {images.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '50vh',
            textAlign: 'center',
            p: 4
          }}>
            <PhotoLibrary sx={{ fontSize: 80, color: 'grey.400', mb: 3 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Gallery Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
              {"We're adding beautiful photos of our premium theatre experiences. Check back soon to see amazing moments from Happy Screens!"}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%' }}>
            <Grid 
              container 
              spacing={{ xs: 2, sm: 3, md: 4 }}
              sx={{ 
                justifyContent: 'center',
                px: { xs: 1, sm: 2 }
              }}
            >
              {images.map((image, index) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4} 
                  lg={3}
                  key={image.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <Zoom in timeout={300 + index * 50}>
                    <Card sx={{
                      height: '100%',
                      width: '100%',
                      maxWidth: { xs: 320, sm: 350, md: 320, lg: 280 },
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      borderRadius: 3,
                      overflow: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                      }
                    }} onClick={() => viewImage(image, index)}>
                      <Box sx={{ 
                        position: 'relative', 
                        overflow: 'hidden',
                        aspectRatio: '16/10' // Consistent aspect ratio
                      }}>
                        <CardMedia
                          component="img"
                          height="100%"
                          image={image.url}
                          alt={image.alt || image.title || 'Gallery Image'}
                          sx={{ 
                            objectFit: 'cover',
                            transition: 'transform 0.4s ease',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%'
                          }}
                        />
                        
                        {/* Overlay gradient for better text readability */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '40%',
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.1))',
                            pointerEvents: 'none'
                          }}
                        />
                      </Box>
                      
                      <CardContent sx={{ 
                        flexGrow: 1, 
                        p: 2.5,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <Box>
                          {/* <Typography variant="h6" gutterBottom noWrap sx={{ 
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            color: '#1a1a1a'
                          }}>
                            {'Happy Screens Experience'}
                          </Typography>
                          
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 2,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              minHeight: '2.5em',
                              lineHeight: 1.4
                            }}
                          >
                            {'Beautiful moments captured at our premium private theatre'}
                          </Typography> */}

                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                            {image.location && (
                              <Chip
                                icon={<LocationOn />}
                                label={image.location.name}
                                size="small"
                                sx={{
                                  bgcolor: '#D50A17',
                                  color: 'white',
                                  '& .MuiChip-icon': { color: 'white' }
                                }}
                              />
                            )}
                            {image.screen && (
                              <Chip
                                icon={<Movie />}
                                label={image.screen.name}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>

                        <Typography variant="caption" color="text.secondary">
                          {new Date(image.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>

      {/* Enhanced Image Viewer Dialog with Navigation */}
      <Dialog
        open={viewDialogOpen}
        onClose={closeDialog}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            maxWidth: '95vw',
            maxHeight: '95vh',
            m: 1
          }
        }}
      >
        <Box sx={{ 
          position: 'relative', 
          bgcolor: 'white', 
          borderRadius: 2, 
          overflow: 'hidden',
          height: 'fit-content'
        }}>
          {/* Close Button */}
          <IconButton 
            onClick={closeDialog} 
            sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16, 
              zIndex: 10,
              bgcolor: 'rgba(0,0,0,0.6)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.8)'
              }
            }}
          >
            <Close />
          </IconButton>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <IconButton 
                onClick={() => navigateImage('prev')}
                sx={{ 
                  position: 'absolute', 
                  top: '50%',
                  left: 16, 
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.8)'
                  }
                }}
              >
                <ChevronLeft sx={{ fontSize: 32 }} />
              </IconButton>

              <IconButton 
                onClick={() => navigateImage('next')}
                sx={{ 
                  position: 'absolute', 
                  top: '50%',
                  right: 16, 
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.8)'
                  }
                }}
              >
                <ChevronRight sx={{ fontSize: 32 }} />
              </IconButton>
            </>
          )}

          {selectedImage && (
            <Box>
              <Box sx={{ 
                position: 'relative', 
                width: '100%',
                height: { xs: 350, sm: 450, md: 550, lg: 650 },
                bgcolor: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.alt || selectedImage.title}
                  fill
                  style={{ 
                    objectFit: 'contain'
                  }}
                  priority
                />
                
                {/* Image counter */}
                {images.length > 1 && (
                  <Box sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    fontSize: '0.875rem'
                  }}>
                    {selectedImageIndex + 1} / {images.length}
                  </Box>
                )}
              </Box>
              
              <Box sx={{ p: 3 }}>
                {/* <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 600, 
                  color: "#D50A17",
                  fontSize: { xs: '1.25rem', sm: '1.5rem' }
                }}>
                  {selectedImage.title || 'Happy Screens Experience'}
                </Typography> */}
                
                {/* {selectedImage.alt && (
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {selectedImage.alt}
                  </Typography>
                )} */}

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                  {selectedImage.location && (
                    <Chip
                      icon={<LocationOn />}
                      label={selectedImage.location.name}
                      sx={{ 
                        bgcolor: '#D50A17',
                        color: 'white',
                        fontWeight: 500,
                        '& .MuiChip-icon': { color: 'white' }
                      }}
                    />
                  )}
                  {selectedImage.screen && (
                    <Chip
                      icon={<Movie />}
                      label={selectedImage.screen.name}
                      color="secondary"
                      sx={{ fontWeight: 500 }}
                    />
                  )}
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Captured on {new Date(selectedImage.createdAt).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Dialog>
    </Box>
  )
}
