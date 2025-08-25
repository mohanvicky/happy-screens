'use client'
import { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  PhotoLibrary as GalleryIcon,
  LocationOn as LocationIcon,
  Phone as ContactIcon,
  Theaters as TheatersIcon // Changed from Theater to Theaters
} from '@mui/icons-material'
import Link from 'next/link'
import Image from 'next/image'
import logo1 from  '../../assets/logo1.png'

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const menuItems = [
    { text: 'Home', href: '/', icon: <HomeIcon /> },
    { text: 'Screens', href: '/screens', icon: <TheatersIcon /> }, // Updated icon
    { text: 'Gallery', href: '/gallery', icon: <GalleryIcon /> },
    { text: 'Contact', href: '/info/contact', icon: <ContactIcon /> }
  ]

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  // Rest of your component code remains the same...
  const drawer = (
    <Box sx={{ 
      width: 300, 
      height: '100%',
      bgcolor: 'background.paper',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Drawer Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center', 
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        
      }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Happy Screens
        </Typography>
        <IconButton onClick={handleDrawerToggle} sx={{ p: 1 }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      {/* Tagline */}
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary">
          {"Bangalore's Premier Private Theatres"}
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, py: 0 }}>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text} 
            component={Link} 
            href={item.href} 
            onClick={handleDrawerToggle}
            sx={{color:'#000',
              py: 2,
              px: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'primary.light',
                '& .MuiTypography-root': {
                  color: 'primary.main'
                }
              }
            }}
          >
            <Box sx={{ 
              mr: 2, 
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              minWidth: 24
            }}>
              {item.icon}
            </Box>
            <ListItemText 
              primary={item.text}
              sx={{ 
                '& .MuiTypography-root': { 
                  fontWeight: 500,
                  fontSize: '1rem'
                } 
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Book Now Button */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          variant="contained"
          fullWidth
          size="large"
          component={Link}
          href="/book"
          onClick={handleDrawerToggle}
          sx={{ 
            borderRadius: 2,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 600,
            background: '#D50A17',
            '&:hover': {
              background: '#D50A17',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(245, 29, 0, 0.4)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Book Now
        </Button>
      </Box>
    </Box>
  )

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: '#000',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderBottom: '1px solid',
          borderColor: 'divider'
         
        }}
      >
        <Toolbar sx={{ 
          minHeight: { xs: 64, sm: 70 },
          px: { xs: 2, sm: 3 },
          py: 1
        }}>
          {/* Logo Section */}
          <Box 
            component={Link} 
            href="/"
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1,
              textDecoration: 'none',
              '&:hover': {
                transform: 'scale(1.02)'
              },
              transition: 'transform 0.2s ease'
            }}
          >
            {/* Logo placeholder */}
            {/* <Box sx={{
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #FFD700, #FFA500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: { xs: 1.5, sm: 2 },
              flexShrink: 0
            }}>
            <Typography 
                variant="h6" 
                sx={{ 
                  color: 'black', 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.9rem', sm: '1.1rem' }
                }}
              >
                HS
              </Typography> 
              
            </Box>  */}

             <Box sx={{width:'100px', height:'85px'}}>
            <Image src={logo1} width={100} height={85} alt="logo" />
             </Box> 
            {/* <Typography
              variant="h6"
              sx={{
                color: 'primary.main',
                fontWeight: 'bold',
                fontSize: { xs: '1.2rem', sm: '1.4rem' }
              }}
            >
              Happy Screens
            </Typography> */}
          </Box>

          {/* Desktop Menu */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  href={item.href}
                  sx={{
                    color: '#fff',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 500,
                    '&:hover': {
                     
                      color: 'primary.main',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item.text}
                </Button>
              ))}
              <Button
                variant="contained"
                component={Link}
                href="/book"
                sx={{
                  ml: 2,
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  background: '#D50A17',
                  '&:hover': {
                    color:'#000',
                    background: '#fff',
                    // transform: 'translateY(-1px)',
                    // boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Book Now
              </Button>
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="primary"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ 
                p: 1.5,
                '&:hover': {
                  bgcolor: 'primary.light',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <MenuIcon fontSize="large" />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ 
          keepMounted: true
        }}
        PaperProps={{
          sx: {
            width: 300,
            maxWidth: '80vw'
          }
        }}
      >
        {drawer}
      </Drawer>
    </>
  )
}

export default Navbar
