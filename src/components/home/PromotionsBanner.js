'use client'
import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid, // Updated Grid import
  Chip,
  Button,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  LocalOffer as OfferIcon,
  ArrowForward as ArrowIcon,
  Close as CloseIcon,
  Timer as TimerIcon
} from '@mui/icons-material'
import Link from 'next/link'

const PromotionsBanner = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [visibleOffers, setVisibleOffers] = useState([])

  // Sample offers data (will come from admin later)
 const offers = [
    {
      id: 1,
      title: "Birthday Special",
      description: "Get 25% off on birthday celebrations",
      discount: "25% OFF",
      validUntil: "31st Dec 2025",
      code: "BIRTHDAY25",
      bgColor: "linear-gradient(135deg, #e50e0eff 0%, #D50A17 100%)",
      applicable: "All screens"
    },
    {
      id: 2,
      title: "Weekend Bonanza", 
      description: "Special weekend pricing for groups",
      discount: "₹500 OFF",
      validUntil: "Every Weekend",
      code: "WEEKEND500",
      bgColor: "linear-gradient(145deg, #6f6969ff 0%, #faf9faff 100%)",
      applicable: "Groups of 8+"
    },
    {
      id: 3,
      title: "New User Offer",
      description: "First-time booking discount",
      discount: "30% OFF",
      validUntil: "Limited time",
      code: "WELCOME30",
      bgColor: "linear-gradient(135deg, #e50e0eff 0%, #D50A17 100%)",
      applicable: "First booking only"
    }
  ]

  useEffect(() => {
    setVisibleOffers(offers)
  }, [])

  const handleCloseOffer = (offerId) => {
    setVisibleOffers(prev => prev.filter(offer => offer.id !== offerId))
  }

  if (visibleOffers.length === 0) return null

  return (
    <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: '#f8f7f4' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontFamily: '"Cormorant", serif', 
               fontStyle: 'italic',  
              fontSize: { xs: '2rem', md: '3rem', lg:'48px' },
           
              mb: 4,
              color: '#000'
            }}
          >
            🎉 Special Offers
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Limited time deals just for you!
          </Typography>
        </Box>

        {/* Offers Grid - Updated to Grid v2 */}
        <Grid container spacing={3}>
          {visibleOffers.map((offer) => (
            <Grid size={{ xs: 12, md: 4 }} key={offer.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  position: 'relative',
                  overflow: 'visible',
                  background: offer.bgColor,
                  color: 'white',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Close Button */}
                <IconButton
                  onClick={() => handleCloseOffer(offer.id)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: 'white',
                    bgcolor: 'rgba(0,0,0,0.2)',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.4)' },
                    zIndex: 2
                  }}
                  size="small"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>

                {/* Discount Badge */}
                <Box sx={{
                  position: 'absolute',
                  top: -10,
                  left: 20,
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  zIndex: 2
                }}>
                  {offer.discount}
                </Box>

                <CardContent sx={{ pt: 4, pb: 3 }}>
                  {/* Offer Title */}
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {offer.title}
                  </Typography>

                  {/* Description */}
                  <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                    {offer.description}
                  </Typography>

                  {/* Applicable */}
                  <Chip
                    label={offer.applicable}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      mb: 2
                    }}
                  />

                  {/* Validity */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TimerIcon sx={{ fontSize: '1rem', mr: 1 }} />
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Valid until: {offer.validUntil}
                    </Typography>
                  </Box>

                  {/* Promo Code */}
                  <Box sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    borderRadius: 1,
                    p: 1.5,
                    mb: 2,
                    border: '1px dashed rgba(255,255,255,0.3)'
                  }}>
                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                      Promo Code:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {offer.code}
                    </Typography>
                  </Box>

                  {/* Action Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    component={Link}
                    href="/book"
                    endIcon={<ArrowIcon />}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)',
                        transform: 'scale(1.05)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* View All Offers */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            component={Link}
            href="/offers"
            endIcon={<OfferIcon />}
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              px: 4,
              '&:hover': {
                borderColor: 'primary.dark',
                bgcolor: 'primary.light',
                color: '#fff'
              }
            }}
          >
            View All Offers
          </Button>
        </Box>
      </Container>
    </Box>
  )
}

export default PromotionsBanner
