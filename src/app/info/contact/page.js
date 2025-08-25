'use client'
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, TextField,Grid, Paper, Button, IconButton, Fade, useTheme, useMediaQuery,
  Card, CardContent, CardMedia, Chip, Divider
} from '@mui/material';
import { MapPin, ChevronLeft, ChevronRight, Phone, Mail } from 'lucide-react';

export default function LocationsCarousel() {
  /* --- DATA ------------------------------------------------------------ */
  const locations = [
    { id:1, name:'Banashankari', color:'#F472B6',
      addr:'No.3804, 13th Cross, Banashankari 2nd Stage, Bengaluru 560070',
      phone:'9945102299', email:'thehappyscreens@gmail.com',
      map:'https://maps.app.goo.gl/ZoS9DUsVR2eMmQQb7',
      img:'https://picsum.photos/400/250?random=1',
      city: 'Bengaluru' },
    { id:2, name:'Basaveshwara Nagara', color:'#60A5FA',
      addr:'33 / 60 Ft Rd, 4th Block, Basaveshwara Nagar, Bengaluru 560079',
      phone:'9945102299', email:'thehappyscreens@gmail.com',
      map:'https://maps.app.goo.gl/1zuCm23xKkCw5inV6',
      img:'https://picsum.photos/400/250?random=2',
      city: 'Bengaluru' },
    { id:3, name:'Goregaon West', color:'#A855F7',
      addr:'Harmony Mall, Shop 14, New Link Rd, Mumbai 400104',
      phone:'9945102299', email:'thehappyscreens@gmail.com',
      map:'https://maps.app.goo.gl/e8YKiR4VJ41ECCPD7',
      img:'https://picsum.photos/400/250?random=3',
      city: 'Mumbai' },
    { id:4, name:'Kalyan Nagar', color:'#10B981',
      addr:'49-50, 3rd Cross Rd, Kalyan Nagar, Bengaluru 560043',
      phone:'9606622499', email:'thehappyscreens@gmail.com',
      map:'https://maps.app.goo.gl/e8YKiR4VJ41ECCPD7',
      img:'https://picsum.photos/400/250?random=4',
      city: 'Bengaluru' },
    { id:5, name:'Koramangala', color:'#F59E0B',
      addr:'475, 1st Cross Rd, 5th Block, Koramangala, Bengaluru 560095',
      phone:'9035722199', email:'thehappyscreens@gmail.com',
      map:'https://maps.app.goo.gl/1zuCm23xKkCw5inV6',
      img:'https://picsum.photos/400/250?random=5',
      city: 'Bengaluru' }
  ];

  /* --- BREAKPOINT-DRIVEN "perPage" ------------------------------------ */
  const theme  = useTheme();
  const lgUp   = useMediaQuery(theme.breakpoints.up('lg'));   // ≥1200 px
  const mdUp   = useMediaQuery(theme.breakpoints.up('md'));   // ≥900 px
  const perPage = lgUp ? 3 : mdUp ? 2 : 1;                    // 3 / 2 / 1

  /* --- CAROUSEL STATE -------------------------------------------------- */
  const pageCount = Math.ceil(locations.length / perPage);    // dynamic
  const [page, setPage] = useState(0);                        // 0-based
  const [fade, setFade] = useState(true);
  const [auto, setAuto] = useState(true);

  /* --- AUTOPLAY (5 s) -------------------------------------------------- */
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPage(p => (p + 1) % pageCount);
        setFade(true);
      }, 200);
    }, 5000);
    return () => clearInterval(t);
  }, [auto, pageCount]);

  /* --- SLICE THE DATA FOR CURRENT PAGE -------------------------------- */
  const visible = useMemo(() => {
    const start = page * perPage;
    return locations.slice(start, start + perPage);
  }, [page, perPage]);

  const step = dir => {
    setAuto(false);
    setFade(false);
    setTimeout(() => {
      setPage(p => (p + (dir === 'next' ? 1 : -1) + pageCount) % pageCount);
      setFade(true);
    }, 150);
    setTimeout(() => setAuto(true), 8000);
  };

  /* --- GRID COL SIZE FOR EACH BREAKPOINT ------------------------------ */
  const colMd = perPage === 3 ? 4 : perPage === 2 ? 6 : 12;   // 12-grid system

  /* -------------------------------------------------------------------- */
  return (

    


    <Box sx={{ 
      py: { xs: 4, md: 8 }, 
      px: { xs: 1, sm: 2, md: 4 },
      // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex', 
    flexDirection: 'column', // stack children vertically
    alignItems: 'center',    // center horizontally
    justifyContent: 'center', // optional: center vertically
    }}>


  <Box
      component="section"
      sx={{
        width: "100%",
        minHeight: "500px",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
       
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: 3,
        marginBottom: '30px'
      }}
    >
      {/* Left side: form */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: "#000",
          p: { xs: 4, md: 6 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold" mb={2}  sx={{  fontSize: { xs: '2rem', md: '3rem', lg:'48px' }, fontStyle :'italic', 
              fontFamily: '"Cormorant", serif', fontWeight:400, color:'#fff'
            }}
>
          Get in <Box component="span" color="red">Touch</Box>
        </Typography>
        <Typography variant="body1" mb={4}  sx={{color:'#fff'}}>
          {"We'd love to hear from you! Reach out to us with your questions, ideas, or feedback — we're just a message away."}
        </Typography>

        <TextField label="Name" variant="outlined" fullWidth sx={{ mb: 2, color:'#fff' }} />
        <TextField label="Email" variant="outlined" fullWidth sx={{ mb: 2 , color:'#fff'}} />
        <TextField label="Phone Number" variant="outlined" fullWidth sx={{ mb: 2, color:'#fff' }} />
        <TextField
          label=""
          variant="outlined"
          select
          fullWidth
          sx={{ mb: 2, color:'#fff' }}
          SelectProps={{ native: true }}
        >
          <option value="">Select</option>
          <option value="google">Google</option>
          <option value="social">Social Media</option>
          <option value="friend">Friend</option>
        </TextField>

        <Button variant="contained" color="error" sx={{ mt: 1 }}>
          SEND
        </Button>

        {/* Contact info */}
        <Box sx={{ display: "flex", gap: 3, mt: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box component="span">📞</Box>
            <Typography variant="body2" sx={{color:'#fff'}}>+91 7702505644</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box component="span">✉️</Box>
            <Typography variant="body2" sx={{color:'#fff'}}>east@bsplar.com</Typography>
          </Box>
        </Box>
      </Box>

      {/* Right side: map */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: "red",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.1010811164917!2d77.58843777526106!3d12.978375990865033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670b0f0a0e9%3A0x6e3e5f3c26c128b4!2sBengaluru!5e0!3m2!1sen!2sin!4v1692874700000!5m2!1sen!2sin"
          width="80%"
          height="80%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </Box>
    </Box>

      <Paper sx={{ 
        p: { xs: 2, sm: 3, md: 6 }, 
        borderRadius: { xs: 2, md: 4 }, 
        background: 'rgba(255,255,255,0.98)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        width: '100%',
        maxWidth: '1400px',
        mx: 'auto'
      }}>
        {/* Enhanced Heading */}
        <Box textAlign="center" mb={{ xs: 3, md: 5 }}>
          <Typography 
            variant="h3" 
            fontWeight={800} 
            mb={2}
            sx={{ 
              background: 'linear-gradient(45deg, #f92302ff, #D50A17)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2rem', md: '3rem', lg:'48px' }, fontStyle :'italic', 
              fontFamily: '"Cormorant", serif', fontWeight:400,
            }}
          >
            Our Locations
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            fontWeight={400}
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}
          >
            Find us at these convenient locations across the city
          </Typography>
        </Box>

        {/* Enhanced Controls */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <IconButton 
            onClick={() => step('prev')}
            size={mdUp ? 'medium' : 'small'}
            sx={{ 
              bgcolor: 'primary.main',
              color: 'white',
              width: { xs: 36, md: 48 },
              height: { xs: 36, md: 48 },
              '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.1)' },
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <ChevronLeft size={mdUp ? 24 : 18} />
          </IconButton>

          <Box display="flex" gap={{ xs: 1, md: 1.5 }} alignItems="center">
            {Array.from({length: pageCount}).map((_, i) => (
              <Box key={i}
                onClick={() => {setPage(i); setAuto(false);}}
                sx={{
                  width: i === page ? { xs: 24, md: 32 } : { xs: 8, md: 12 }, 
                  height: { xs: 8, md: 12 }, 
                  borderRadius: { xs: 4, md: 6 },
                  bgcolor: i === page ? 'primary.main' : 'grey.300',
                  cursor: 'pointer', 
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    bgcolor: i === page ? 'primary.main' : 'grey.400',
                    transform: 'scale(1.1)'
                  }
                }}
              />
            ))}
          </Box>

          <IconButton 
            onClick={() => step('next')}
            size={mdUp ? 'medium' : 'small'}
            sx={{ 
              bgcolor: 'primary.main',
              color: 'white',
              width: { xs: 36, md: 48 },
              height: { xs: 36, md: 48 },
              '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.1)' },
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <ChevronRight size={mdUp ? 24 : 18} />
          </IconButton>
        </Box>

        {/* Enhanced Cards */}
        <Fade in={fade} timeout={300}>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
            {visible.map(loc => (
              <Grid item key={loc.id} xs={12} md={colMd} sx={{ display: 'flex' }}>
                <Card sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: { xs: 2, md: 3 },
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.2)'
                  }
                }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      image={loc.img}
                      alt={loc.name}
                      sx={{ 
                        height: { xs: 160, sm: 180, md: 180 },
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'scale(1.05)' }
                      }}
                    />
                    <Chip
                      label={loc.city}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: { xs: 8, md: 12 },
                        right: { xs: 8, md: 12 },
                        bgcolor: 'rgba(255,255,255,0.9)',
                        color: 'text.primary',
                        fontWeight: 600,
                        fontSize: { xs: '0.7rem', md: '0.75rem' }
                      }}
                    />
                  </Box>

                  <CardContent sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Typography 
                      variant="h5" 
                      fontWeight={700}
                      mb={2}
                      color="primary.main"
                      sx={{ fontSize: { xs: '1.1rem', md: '1.5rem' } }}
                    >
                      {loc.name}
                    </Typography>

                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{
                        mb: 3,
                        lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: { xs: '0.8rem', md: '0.875rem' }
                      }}
                    >
                      {loc.addr}
                    </Typography>

                    <Divider sx={{ my: { xs: 1, md: 2 } }} />

                    <Box sx={{ mb: { xs: 1, md: 2 } }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Phone size={mdUp ? 16 : 14} style={{ marginRight: 8, color: '#D50A17' }} />
                        <Typography 
                          variant="body2" 
                          color="text.primary"
                          sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                        >
                          {loc.phone}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center">
                        <Mail size={mdUp ? 16 : 14} style={{ marginRight: 8, color: '#D50A17' }} />
                        <Typography 
                          variant="body2" 
                          color="text.primary"
                          sx={{ 
                            wordBreak: 'break-word',
                            fontSize: { xs: '0.8rem', md: '0.875rem' }
                          }}
                        >
                          {loc.email}
                        </Typography>
                      </Box>
                    </Box>

                    <Box flexGrow={1} />
                    
                    <Button
                      variant="contained"
                      href={loc.map}
                      target="_blank"
                      startIcon={<MapPin size={mdUp ? 18 : 16} />}
                      sx={{
                        mt: 2,
                        py: { xs: 1, md: 1.5 },
                        fontSize: { xs: '0.8rem', md: '0.875rem' },
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: 'none',
                        background: 'linear-gradient(45deg, #e60a0aff, #ff0101ff)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #FF5252, #f30101ff)',
                          transform: 'scale(1.02)',
                          boxShadow: '0 6px 20px #D50A17'
                        },
                        transition: 'all 0.2s ease'
                      }}
                      fullWidth
                    >
                      View on Google Maps
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Fade>
      </Paper>
    </Box>
  );
}