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
  PhotoLibrary
} from '@mui/icons-material'
import Image from 'next/image'

export default function PublicGalleryPage() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
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

  function viewImage(image) {
    setSelectedImage(image)
    setViewDialogOpen(true)
  }

  function closeDialog() {
    setViewDialogOpen(false)
    setSelectedImage(null)
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: { xs: 6, md: 10 },
        mb: 4
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <PhotoLibrary sx={{ fontSize: { xs: 48, md: 60 }, mb: 2 }} />
            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}>
              Happy Screens Gallery
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
            <Typography variant="body1" sx={{ 
              mt: 2, 
              opacity: 0.8,
              px: { xs: 2, sm: 0 }
            }}>
              {images.length} Beautiful Moments Captured
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl">
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
          <Grid container spacing={3}>
            {images.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                <Zoom in timeout={300 + index * 50}>
                  <Card sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }} onClick={() => viewImage(image)}>
                    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                      <CardMedia
                        component="img"
                        height="240"
                        image={image.url}
                        alt={image.alt || image.title || 'Gallery Image'}
                        sx={{ 
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography variant="h6" gutterBottom noWrap sx={{ fontWeight: 600 }}>
                        {image.title || 'Happy Screens Experience'}
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
                          minHeight: '2.5em'
                        }}
                      >
                        {image.alt || 'Beautiful moments captured at our premium private theatre'}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {image.location && (
                          <Chip
                            icon={<LocationOn />}
                            label={image.location.name}
                            size="small"
                            color="primary"
                            variant="outlined"
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
        )}
      </Container>

      {/* Image Viewer Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={closeDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            maxWidth: { xs: '95vw', sm: '90vw', md: '80vw' },
            maxHeight: '90vh'
          }
        }}
      >
        <Box sx={{ position: 'relative', bgcolor: 'white', borderRadius: 2, overflow: 'hidden' }}>
          <IconButton 
            onClick={closeDialog} 
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              zIndex: 10,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <Close />
          </IconButton>

          {selectedImage && (
            <Box>
              <Box sx={{ 
                position: 'relative', 
                width: '100%',
                height: { xs: 300, sm: 400, md: 500, lg: 600 },
                bgcolor: 'black'
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
              </Box>
              
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  {selectedImage.title || 'Happy Screens Experience'}
                </Typography>
                
                {selectedImage.alt && (
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {selectedImage.alt}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                  {selectedImage.location && (
                    <Chip
                      icon={<LocationOn />}
                      label={selectedImage.location.name}
                      color="primary"
                      sx={{ fontWeight: 500 }}
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
