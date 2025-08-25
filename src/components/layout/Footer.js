'use client'
import {
  Box,
  Container,
  Typography,
  Grid,
  IconButton,
  Divider,
  Link as MuiLink
} from '@mui/material'
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  WhatsApp as WhatsAppIcon,
  Twitter as TwitterIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material'
import Link from 'next/link'
import Image from 'next/image'
import logo1 from '../../assets/logo1.png'

const Footer = () => {
  return (
    <Box sx={{ bgcolor: '#000', color: 'white', mt: 8 }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>

        {/* <Grid container spacing={4}>
          <Grid item xs={12} md={4} lg={4}  >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'white'
                }}
              >
                <Image
                  src="/hpLogo.png" // from public folder
                  alt="Happy Screens Logo"
                  width={60}
                  height={60}
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                Era flix
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ mb: 3, opacity: 0.9, lineHeight: 1.6 }}>
              The Era flix - Best Mini Private Theatre in Bangalore
            </Typography>

         
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
              Social Links
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <IconButton
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                  width: 40,
                  height: 40
                }}
                href="https://facebook.com/happyscreens"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                  width: 40,
                  height: 40
                }}
                href="https://wa.me/919945102299"
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon fontSize="small" />
              </IconButton>
              <IconButton
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                  width: 40,
                  height: 40
                }}
                href="https://instagram.com/happyscreens"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                  width: 40,
                  height: 40
                }}
                href="https://twitter.com/happyscreens"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TwitterIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>

          
          <Grid item xs={12} md={4} lg={4} >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <MuiLink
                component={Link}
                href="/"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { color: 'secondary.light', }
                }}
              >
                Home
              </MuiLink>
              <MuiLink
                component={Link}
                href="/info/about"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { color: 'secondary.light', }
                }}
              >
                About Us
              </MuiLink>
              <MuiLink
                component={Link}
                href="/info/terms"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { color: 'secondary.light', }
                }}
              >
                Terms & Condition
              </MuiLink>
              <MuiLink
                component={Link}
                href="/info/refund"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { color: 'secondary.light', }
                }}
              >
                Refund Policy
              </MuiLink>
              <MuiLink
                component={Link}
                href="/info/reviews"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { color: 'secondary.light', }
                }}
              >
                Reviews
              </MuiLink>
              <MuiLink
                component={Link}
                href="/gallery"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { color: 'secondary.light', }
                }}
              >
                Gallery
              </MuiLink>
              <MuiLink
                component={Link}
                href="/info/contact"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { color: 'secondary.light', }
                }}
              >
                Contact Us
              </MuiLink>
            </Box>
          </Grid>

          
          <Grid item xs={12} md={4} lg={4} >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Reach Us
            </Typography>

          
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              flexWrap: 'nowrap' // Keep in one line
            }}>
              <EmailIcon sx={{ mr: 2, fontSize: '1.3rem', color: 'secondary.light', flexShrink: 0 }} />
              <MuiLink
                href="mailto:thehappyscreens@gmail.com"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { color: 'secondary.light' },
                  whiteSpace: 'nowrap', // Prevent text wrapping
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                thehappyscreens@gmail.com
              </MuiLink>
            </Box>

           
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              flexWrap: 'nowrap'
            }}>
              <PhoneIcon sx={{ mr: 2, fontSize: '1.3rem', color: 'secondary.light', flexShrink: 0 }} />
              <MuiLink
                href="tel:+919945102299"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { color: 'secondary.light' },
                  whiteSpace: 'nowrap'
                }}
              >
                +91 9945102299
              </MuiLink>
            </Box>

           
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              flexWrap: 'nowrap'
            }}>
              <TimeIcon sx={{ mr: 2, fontSize: '1.3rem', color: 'secondary.light', flexShrink: 0 }} />
              <Typography variant="body2" sx={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.95rem',
                whiteSpace: 'nowrap'
              }}>
                Monday to Sunday 9:00 am - 12:00am
              </Typography>
            </Box>

         
            <Box sx={{
              display: 'flex',
              alignItems: 'flex-start',
              mb: 2
            }}>
              <LocationIcon sx={{ mr: 2, fontSize: '1.3rem', mt: 0.2, color: 'secondary.light', flexShrink: 0 }} />
              <Typography variant="body2" sx={{
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.6,
                fontSize: '0.95rem'
              }}>
                475, 3, 1st Cross Rd, KHB Colony, <br /> 5th Block, Koramangala, Bengaluru, Karnataka 560095
              </Typography>
            </Box>
          </Grid>
        </Grid> */}


        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' }, // Stack on mobile, row on desktop
            gap: 4, // Space between columns
            justifyContent: 'space-between'
          }}
        >

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  // overflow: 'hidden',
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'white'
                }}
              >
                <Image
                  src={logo1}
                  alt="Happy Screens Logo"
                  width={150}
                  height={150}
                  // style={{ objectFit: 'contain' }}
                  priority
                />
              </Box>

            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
              Era flix
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.9, lineHeight: 1.6 }}>
              The Era flix - Best Mini Private Theatre in Bangalore
            </Typography>

          </Box>


          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <MuiLink
                component={Link}
                href="/"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { color: 'secondary.light', }
                }}
              >
                Home
              </MuiLink>
              <MuiLink
                component={Link}
                href="/info/about"
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { color: 'secondary.light', }
                }}
              >
                About Us
              </MuiLink>
              <MuiLink
                component={Link}
                href="/info/terms"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { color: 'secondary.light', }
                }}
              >
                Terms & Condition
              </MuiLink>
              <MuiLink
                component={Link}
                href="/info/refund"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { color: 'secondary.light', }
                }}
              >
                Refund Policy
              </MuiLink>
              <MuiLink
                component={Link}
                href="/info/reviews"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { color: 'secondary.light', }
                }}
              >
                Reviews
              </MuiLink>
              <MuiLink
                component={Link}
                href="/gallery"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { color: 'secondary.light', }
                }}
              >
                Gallery
              </MuiLink>
              <MuiLink
                component={Link}
                href="/info/contact"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { color: 'secondary.light', }
                }}
              >
                Contact Us
              </MuiLink>
            </Box>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3, }}>
              Reach Us
            </Typography>

            {/* Email - Single line */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              flexWrap: 'nowrap' // Keep in one line
            }}>
              <EmailIcon sx={{ mr: 2, fontSize: '1.3rem', color: 'secondary.light', flexShrink: 0 }} />
              <MuiLink
                href="mailto:thehappyscreens@gmail.com"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { color: 'secondary.light' },
                  whiteSpace: 'nowrap', // Prevent text wrapping
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                thehappyscreens@gmail.com
              </MuiLink>
            </Box>

            {/* Phone - Single line */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              flexWrap: 'nowrap'
            }}>
              <PhoneIcon sx={{ mr: 2, fontSize: '1.3rem', color: 'secondary.light', flexShrink: 0 }} />
              <MuiLink
                href="tel:+919945102299"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { color: 'secondary.light' },
                  whiteSpace: 'nowrap'
                }}
              >
                +91 9945102299
              </MuiLink>
            </Box>

            {/* Operating Hours - Single line */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              flexWrap: 'nowrap'
            }}>
              <TimeIcon sx={{ mr: 2, fontSize: '1.3rem', color: 'secondary.light', flexShrink: 0 }} />
              <Typography variant="body2" sx={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.95rem',
                whiteSpace: 'nowrap'
              }}>
                Monday to Sunday 9:00 am - 12:00am
              </Typography>
            </Box>

            {/* Address - Allow wrapping for address only */}
            <Box sx={{
              display: 'flex',
              alignItems: 'flex-start',
              mb: 2
            }}>
              <LocationIcon sx={{ mr: 2, fontSize: '1.3rem', mt: 0.2, color: 'secondary.light', flexShrink: 0 }} />
              <Typography variant="body2" sx={{
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.6,
                fontSize: '0.95rem'
              }}>
                475, 3, 1st Cross Rd, KHB Colony, 5th Block, Koramangala, Bengaluru, Karnataka 560095
              </Typography>
            </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <IconButton
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: '#E3E3E3', color:'#D50A17' },
                  width: 40,
                  height: 40
                }}
                href="https://facebook.com/happyscreens"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: '#E3E3E3', color:'#D50A17' },
                  width: 40,
                  height: 40
                }}
                href="https://wa.me/919945102299"
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon fontSize="small" />
              </IconButton>
              <IconButton
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: '#E3E3E3', color:'#D50A17' },
                  width: 40,
                  height: 40
                }}
                href="https://instagram.com/happyscreens"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: '#E3E3E3', color:'#D50A17' },
                  width: 40,
                  height: 40
                }}
                href="https://twitter.com/happyscreens"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TwitterIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>


        </Box>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.2)' }} />

        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '10px' ,textAlign: { xs: 'center', md: 'left' } }}>
            Copyright © <span style={{ fontWeight: 'bold' }}>Era Flix</span>. All Rights Reserved.
          </Typography>

          {/* <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            <MuiLink 
              component={Link} 
              href="/privacy" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)', 
                textDecoration: 'none',
                fontSize: '0.85rem',
                '&:hover': { color: 'secondary.light' }
              }}
            >
              Privacy Policy
            </MuiLink>
            <MuiLink 
              component={Link} 
              href="/info/terms" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)', 
                textDecoration: 'none',
                fontSize: '0.85rem',
                '&:hover': { color: 'secondary.light' }
              }}
            >
              Term Of Use
            </MuiLink>
            <MuiLink 
              component={Link} 
              href="/contact" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)', 
                textDecoration: 'none',
                fontSize: '0.85rem',
                '&:hover': { color: 'secondary.light' }
              }}
            >
              Contact Us
            </MuiLink>
          </Box> */}

          <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '10px' ,textAlign: { xs: 'center', md: 'left' } }}>
            Developed by <span style={{ fontWeight: 'bold' }}>IT Alliance</span>.
          </Typography>

        </Box>
      </Container>
    </Box>
  )
}

export default Footer
