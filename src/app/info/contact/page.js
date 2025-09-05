'use client'
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, TextField, Button, MenuItem,
  useTheme, useMediaQuery, Fade, Card, CardContent, CardMedia, Divider
} from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const lgUp   = useMediaQuery(theme.breakpoints.up('lg'));
  const mdUp   = useMediaQuery(theme.breakpoints.up('md'));
  const perPage = lgUp ? 3 : mdUp ? 2 : 1;

  /* --- CAROUSEL STATE -------------------------------------------------- */
  const pageCount = Math.ceil(locations.length / perPage);
  const [page, setPage] = useState(0);
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

  /* --- FORM STATES ---------------------------------------------------- */
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [source, setSource] = useState("");

  // ✅ Validations
  const validateName = (value) => {
    const regex = /^[A-Za-z ]+$/;
    if (!regex.test(value)) {
      setNameError("Name should contain only letters and spaces");
    } else {
      setNameError("");
    }
  };

  const validatePhone = (value) => {
  // ✅ only digits allowed
  if (!/^\d*$/.test(value)) {
    setPhoneError("Only numbers are allowed");
    return;
  }

  // ✅ exactly 10 digits required
  if (value.length !== 10) {
    setPhoneError("Phone number must be exactly 10 digits");
    return;
  }

  // ✅ must start with 6,7,8,9
  if (!/^[6-9]/.test(value)) {
    setPhoneError("Invalid number");
    return;
  }

  // ❌ block specific invalid pattern (example: 9876xxxxxx)
 if (!/^[6-9]/.test(value)) {
    setPhoneError("Invalid number pattern");
    return;
  }

  // ✅ if all good
  setPhoneError("");
};

  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) {
      setEmailError("Enter valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nameError || phoneError || emailError || !name || !phone || !email) {
      alert("Please fix errors before submitting");
      return;
    }
    alert(`
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Source: ${source}
    `);
    setName("");
    setPhone("");
    setEmail("");
    setSource("");
    setPhoneError("");
    setNameError("");
    setEmailError("");
  };

  // ✅ Reusable input style
  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#000",
      "& fieldset": { borderColor: "#fff" },
      "&:hover fieldset": { borderColor: "#fff" },
      "&.Mui-focused fieldset": { borderColor: "#fff" },
    },
    "& .MuiInputBase-input": { color: "#fff" },
    "& .MuiFormLabel-root": { color: "#fff" }
  };

  return (
    <Box sx={{ 
      py: { xs: 4, md: 8 }, 
      px: { xs: 1, sm: 2, md: 4 },
      minHeight: '100vh',
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    
    {/* Contact Section with Form + Map */}
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
        component="form"
        onSubmit={handleSubmit}
        sx={{
          flex: 1,
          backgroundColor: "#000",
          p: { xs: 4, md: 6 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h4"
          mb={2}
          sx={{
            fontSize: { xs: "2rem", md: "3rem", lg: "48px" },
            fontStyle: "italic",
            fontFamily: '"Cormorant", serif',
            fontWeight: 400,
            color: "#fff",
          }}
        >
          Get in <Box component="span" color="red">Touch</Box>
        </Typography>

        <Typography variant="body1" mb={4} sx={{ color: "#fff" }}>
          {"We'd love to hear from you! Reach out to us with your questions, ideas, or feedback — we're just a message away."}
        </Typography>

        {/* Name */}
        <TextField
          label="Name"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            validateName(e.target.value);
          }}
          error={!!nameError}
          helperText={nameError}
          sx={{ mb: 2, ...inputStyle }}
          FormHelperTextProps={{ style: { color: "red" } }}
        />

        {/* Email */}
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            validateEmail(e.target.value);
          }}
          error={!!emailError}
          helperText={emailError}
          sx={{ mb: 2, ...inputStyle }}
          FormHelperTextProps={{ style: { color: "red" } }}
        />

        {/* Phone */}
        <TextField
  label="Phone Number"
  variant="outlined"
  fullWidth
  value={phone}
  onChange={(e) => {
    setPhone(e.target.value);
    validatePhone(e.target.value);
  }}
  error={!!phoneError}
  helperText={phoneError}
  sx={{ mb: 2, ...inputStyle }}
  FormHelperTextProps={{ style: { color: "red" } }}
  inputProps={{ maxLength: 10 }}   // ✅ limit input to 10 digits
/>


        {/* Dropdown */}
        <TextField
          label="How did you hear about us?"
          variant="outlined"
          select
          fullWidth
          value={source}
          onChange={(e) => setSource(e.target.value)}
          sx={{ mb: 2, ...inputStyle }}
        >
          <MenuItem value="google" sx={{ color: "black" }}>Google</MenuItem>
          <MenuItem value="social" sx={{ color: "black" }}>Social Media</MenuItem>
          <MenuItem value="friend" sx={{ color: "black" }}>Friend</MenuItem>
        </TextField>

        <Button type="submit" variant="contained" color="error" sx={{ mt: 1 }}>
          SEND
        </Button>

        {/* Contact info */}
        <Box sx={{ display: "flex", gap: 3, mt: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box component="span">📞</Box>
            <Typography variant="body2" sx={{ color: "#fff" }}>+91 9945102299</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box component="span">✉️</Box>
            <Typography variant="body2" sx={{ color: "#fff" }}>thehappyscreens@gmail.com</Typography>
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

    {/* Carousel */}
    <Box sx={{ width: "100%", position: "relative" }}>
      <Fade in={fade} timeout={400}>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          {visible.map(loc => (
            <Card key={loc.id} sx={{ maxWidth: 345, flex: 1 }}>
              <CardMedia component="img" height="140" image={loc.img} alt={loc.name} />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {loc.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {loc.addr}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">📞 {loc.phone}</Typography>
                <Typography variant="body2">✉️ {loc.email}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Fade>

      {/* Navigation buttons */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: 0,
          transform: "translateY(-50%)",
        }}
      >
        <Button onClick={() => step('prev')}>
          <ChevronLeft />
        </Button>
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          right: 0,
          transform: "translateY(-50%)",
        }}
      >
        <Button onClick={() => step('next')}>
          <ChevronRight />
        </Button>
      </Box>
    </Box>
  </Box>
  );
}
