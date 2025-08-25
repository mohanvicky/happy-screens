'use client'
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Rating,
  Chip,
  IconButton,
  Fade,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  FormatQuote as QuoteIcon,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Koramangala, Bangalore",
    rating: 5,
    review: "Amazing experience for my daughter's 16th birthday! The private screen was perfect, and the staff arranged everything beautifully.",
    occasion: "Birthday Party",
    color: "#D50A17"
  },
  {
    id: 2,
    name: "Rahul Gupta",
    location: "Whitefield, Bangalore", 
    rating: 5,
    review: "Booked for our anniversary celebration. The ambiance was romantic, sound quality was excellent, and the service was top-notch.",
    occasion: "Anniversary",
    color: "#D50A17"
  },
  {
    id: 3,
    name: "Anjali Reddy",
    location: "HSR Layout, Bangalore",
    rating: 4,
    review: "Great place for friends' gatherings! We watched 3 movies back-to-back. Comfortable seating and good food options.",
    occasion: "Friends Hangout",
    color: "#D50A17"
  },
  {
    id: 4,
    name: "Vikram Singh",
    location: "Indiranagar, Bangalore",
    rating: 5,
    review: "Perfect venue for our team outing! All 12 of us enjoyed thoroughly. The screen quality and sound system are world-class.",
    occasion: "Corporate Event",
    color: "#D50A17"
  },
  {
    id: 5,
    name: "Meera Iyer",
    location: "Jayanagar, Bangalore",
    rating: 5,
    review: "Celebrated my husband's birthday here. The surprise arrangements were fantastic! Kids loved it too. Affordable pricing.",
    occasion: "Family Celebration",
    color: "#D50A17"
  },
  {
    id: 6,
    name: "Arjun Nair",
    location: "Electronic City, Bangalore",
    rating: 4,
    review: "Booked for date night and it was magical! Private, cozy, and the movie experience was better than any multiplex.",
    occasion: "Date Night",
    color: "#D50A17"
  }
];

export default function TestimonialsSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [fadeIn, setFadeIn] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setFadeIn(true);
      }, 200);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleNavigation = (direction) => {
    setIsAutoPlaying(false);
    setFadeIn(false);
    setTimeout(() => {
      if (direction === 'next') {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      }
      setFadeIn(true);
    }, 200);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const goToSlide = (index) => {
    setIsAutoPlaying(false);
    setFadeIn(false);
    setTimeout(() => {
      setCurrentIndex(index);
      setFadeIn(true);
    }, 200);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  // Get visible testimonials
  const visibleTestimonials = React.useMemo(() => {
    const count = isMobile ? 1 : 3;
    return Array.from({ length: count }, (_, i) => 
      testimonials[(currentIndex + i) % testimonials.length]
    );
  }, [currentIndex, isMobile]);

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: '#EFEDE8',
        minHeight: '600px'
      }}
    >
      <Container maxWidth="lg">
        
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography 
            variant="h3" 
            component="h2"
            fontWeight={700} 
            color="#000" 
            mb={2}
            sx={{  fontSize: { xs: '2rem', md: '3rem', lg:'48px' }, fontStyle :'italic', 
              fontFamily: '"Cormorant", serif', fontWeight:400,
            }}
          >
            What Our Happy Customers Say
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            mb={4}
            sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}
          >
            Real experiences from Bangalore families
          </Typography>
          
          {/* Overall Rating */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              bgcolor: 'white',
              px: 3,
              py: 1.5,
              borderRadius: '50px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <Rating value={4.8} precision={0.1} readOnly size="small" />
            <Typography variant="h6" fontWeight={700} color="primary.main">
              4.8
            </Typography>
            <Typography variant="body2" color="text.secondary">
              •
            </Typography>
            <Typography variant="body2" color="text.secondary">
              500+ reviews
            </Typography>
          </Box>
        </Box>

        {/* Navigation Controls */}
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between" 
          mb={4}
        >
          <IconButton
            onClick={() => handleNavigation('prev')}
            sx={{
              bgcolor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                bgcolor: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s'
            }}
          >
            <ChevronLeft />
          </IconButton>
          
          <Box
            sx={{
              bgcolor: 'white',
              px: 2,
              py: 1,
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {currentIndex + 1} of {testimonials.length}
            </Typography>
          </Box>
          
          <IconButton
            onClick={() => handleNavigation('next')}
            sx={{
              bgcolor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                bgcolor: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s'
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>

        {/* Testimonials Grid */}
        <Fade in={fadeIn} timeout={200}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3, 1fr)'
              },
              gap: 3,
              mb: 4
            }}
          >
            {visibleTestimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                sx={{
                  position: 'relative',
                  borderLeft: `4px solid ${testimonial.color}`,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  }
                }}
              >
                {/* Quote Icon */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 16,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: testimonial.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <QuoteIcon sx={{ fontSize: 16, color: 'white' }} />
                </Box>

                <CardContent sx={{ p: 3 }}>
                  {/* Rating */}
                  <Rating 
                    value={testimonial.rating} 
                    readOnly 
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  {/* Review Text */}
                  <Typography
                    variant="body2"
                    fontStyle="italic"
                    color="text.secondary"
                    lineHeight={1.6}
                    mb={3}
                    sx={{ fontSize: '0.9rem' }}
                  >
                    {testimonial.review}
                  </Typography>

                  {/* Customer Info */}
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar
                      sx={{
                        bgcolor: testimonial.color,
                        width: 40,
                        height: 40,
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}
                    >
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {testimonial.location}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Occasion Tag */}
                  <Chip
                    label={testimonial.occasion}
                    size="small"
                    sx={{
                      bgcolor: `${testimonial.color}15`,
                      color: testimonial.color,
                      border: `1px solid ${testimonial.color}30`,
                      fontWeight: 500,
                      fontSize: '0.75rem'
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </Box>
        </Fade>

        {/* Dots Indicator */}
        <Box display="flex" justifyContent="center" gap={1} mb={6}>
          {testimonials.map((testimonial, index) => (
            <Box
              key={testimonial.id}
              onClick={() => goToSlide(index)}
              sx={{
                width: index === currentIndex ? 32 : 8,
                height: 8,
                borderRadius: 4,
                bgcolor: index === currentIndex ? testimonial.color : 'grey.300',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'scale(1.2)',
                  bgcolor: index === currentIndex ? testimonial.color : 'grey.400'
                }
              }}
            />
          ))}
        </Box>

        {/* Call to Action */}
        <Box textAlign="center">
          <Typography variant="h6" color="text.secondary" mb={3}>
            Ready to create your own memorable experience?
          </Typography>
          <Button
            variant="contained"
            size="large"
            href="/book"
            sx={{
              background: '#D50A17',
              borderRadius: '50px',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(235, 19, 19, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(235, 19, 19, 0.4)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Book Your Screen Now
          </Button>
        </Box>

      </Container>
    </Box>
  );
}