"use client";

import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Chip,
  Stack,
  Card,
  CardContent
} from '@mui/material';

import {  Calendar, Users } from 'lucide-react';
import CountUp from "react-countup";
import PeopleIcon from "@mui/icons-material/People";
import StarIcon from "@mui/icons-material/Star";
import CelebrationIcon from "@mui/icons-material/Celebration";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import sec1 from '@/assets/sec1.jpg'
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Eye } from 'lucide-react';



// export const metadata = { title: 'About – Happy Screens' };

export default function AboutPage() {


  const features = [
    {
      icon: <Star size={40} />,
      title: "Premium Private Theaters",
      description: "State-of-the-art projection and sound systems for the ultimate movie experience"
    },
    {
      icon: <Calendar size={40} />,
      title: "Special Occasion Celebrations",
      description: "Birthdays, anniversaries, proposals, and more with custom decorations"
    },
    {
      icon: <Users size={40} />,
      title: "Group & Corporate Events",
      description: "Perfect venue for team outings, family gatherings, and social events"
    }
  ];

  // const stats = [
  //   { number: "42,070+", label: "Happy Customers" },
  //   { number: "500+", label: "5-Star Reviews" },
  //   { number: "50+", label: "Celebrations Monthly" },
  //   { number: "99%", label: "Customer Satisfaction" }
  // ];

const stats = [
  { number: 42070, suffix: "+", label: "Happy Customers", icon: <PeopleIcon sx={{ fontSize: 40 }} /> },
  { number: 4.8, suffix: "", label: "5-Star Reviews", decimals: 1, icon: <StarIcon sx={{ fontSize: 40 }} /> },
  { number: 50, suffix: "+", label: "Celebrations Monthly", icon: <CelebrationIcon sx={{ fontSize: 40 }} /> },
  { number: 99, suffix: "%", label: "Customer Satisfaction", icon: <ThumbUpIcon sx={{ fontSize: 40 }} /> },
];


  return (
    <Box
      sx={{
        // background: 'linear-gradient(135deg, #f5f5f5 0%, #e3f2fd 100%)',
        // bgColor: '#eb1717ff',
        minHeight: '100vh',
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        
        
        <Box textAlign="center" mb={6}>
       
               <Box>
        <Typography 
            variant="h1" 
            sx={{
              mb: 2,
              background: 'linear-gradient(45deg, #ff4d00ff 30%, #D50A17 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
               fontSize: { xs: '2rem', md: '3rem', lg:'48px' }, fontStyle :'italic', 
              fontFamily: '"Cormorant", serif', fontWeight:400,

            }}
          >
            About Happy Screens
          </Typography>

          <Typography 
            variant="h5" 
            color="text.secondary" 
            sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
          >
            Creating unforgettable memories through premium private theater experiences
          </Typography>
          </Box>  
        </Box>
 

       <Box>
        <Paper
      elevation={3}
      sx={{
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        borderRadius: 3,
        p: { xs: 4, md: 6, lg:8 },
        mb: 6,
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: { xs: "column", md: "row" }, // row on desktop, column on mobile
        alignItems: "center",
        gap: 4,
      }}
    >
      {/* Left Side Image */}
      <Box sx={{ flex: 1, textAlign: "center", }}>
        <Image
        src={sec1}
        alt="home"
        width={400} // default width
        height={400}
        style={{
          borderRadius: "20px",
          width: "100%", 
          maxWidth: 400, // max width on desktop
        }}
        sizes="(max-width: 600px) 300px, 400px"
      />
           {/* <Image src={sec1} alt="home" width={400} height={400}  sx={{borderRadius:'20px'}} /> */}
      </Box>

      {/* Right Side Content */}
      <Box sx={{ flex: 2 }}>
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h3"
            color="primary"
            fontWeight="bold"
            gutterBottom
            sx={{  fontSize: { xs: '2rem', md: '3rem', lg:'48px' }, fontStyle :'italic', 
              fontFamily: '"Cormorant", serif', fontWeight:400,
 }}
          >
           {"India's #1 Premier Private Theater Destination"}
          </Typography>
          <Box
            sx={{
              width: 80,
              height: 4,
              bgcolor: "primary.main",
              mx: "auto",
              borderRadius: 2,
            }}
          />
        </Box>

        <Stack spacing={3} maxWidth="800px" mx="auto">
          <Typography
            variant="h6"
            color="text.primary"
            textAlign="left"
            sx={{ lineHeight: 1.6, fontWeight: 400 , fontSize: '16px'}}
          >
           {"The Happy Screens is Bengaluru's most celebrated private theater destination, offering a unique way to celebrate life's special moments with best-in-class experiences where customers can watch their favorite movies and shows while enjoying birthdays, anniversaries, proposals, or just relaxing movie time, complete with decorations, cakes, snacks, beverages, and full privacy to make every event extraordinary."}
          </Typography>
        </Stack>
      </Box>
    </Paper>
     </Box>

        {/* Features Section */}
        <Box mb={6}>
          <Box textAlign="center" mb={4}>
            <Typography 
              variant="h3" 
              color="primary" 
              fontWeight="bold" 
              gutterBottom
              sx={{  fontSize: { xs: '2rem', md: '3rem', lg:'48px' }, fontStyle :'italic', 
              fontFamily: '"Cormorant", serif', fontWeight:400,
}}
            >
              Why Choose Happy Screens?
            </Typography>
            <Box
              sx={{
                width: 80,
                height: 4,
                bgcolor: 'primary.main',
                mx: 'auto',
                borderRadius: 2,
              }}
            />
          </Box>

<Box
  sx={{
    display: "flex",
    flexWrap: "wrap",
    gap: 4, // spacing between cards
    width: "100%",
    m: 0,
  }}
>
  {features.map((feature, index) => (
    <Box
      key={index}
      sx={{
        flex: { xs: "1 1 100%", md: "1 1 calc(33.333% - 32px)" }, 
        display: "flex",
        width: "100%",
      }}
    >
      <Card
        elevation={2}
        sx={{
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          borderRadius: 2,
          transition: "all 0.3s ease",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          flex: 1,
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          },
        }}
      >
        <CardContent
          sx={{
            textAlign: "center",
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              bgcolor: "primary.main",
              color: "white",
              borderRadius: 2,
              mb: 2,
              mx: "auto",
            }}
          >
            {feature.icon}
          </Box>

          <Typography
            variant="h5"
            fontWeight="bold"
            color="text.primary"
            gutterBottom
            sx={{ mb: 2 }}
          >
            {feature.title}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              lineHeight: 1.6,
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            {feature.description}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  ))}
</Box>


        </Box>

        {/* Stats Section */}

 <Box
      component="section"
      sx={{
        width: "100%",
        background: "linear-gradient(45deg, #fe5117 30%, #ff1818 90%)",
        color: "white",
        // py: { xs: 6, md: 8 , lg:10},
        pb: {xs:4, md:6,lg:8},
          pt: {xs:4, md:6,lg:8},
          mb:{xs:4, md:6, lg:8},
        px: 2,
        textAlign: "center",
        borderRadius:'30px',
      }}
    >
      <Typography
        variant="h3"
        fontWeight="bold"
        gutterBottom
        sx={{  fontSize: { xs: '2rem', md: '3rem', lg:'48px' }, fontStyle :'italic', 
              fontFamily: '"Cormorant", serif', fontWeight:400,
 mb: 4 }}
      >
        Our Journey in Numbers
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "center",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
          maxWidth: "1200px",
          mx: "auto",
        }}
      >
        {stats.map((stat, index) => (
          <Box
            key={index}
            sx={{
              flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 20%" },
              minWidth: 200,
            }}
          >
            {/* Icon */}
            <Box sx={{ mb: 1 }}>{stat.icon}</Box>

            {/* Number */}
            <Typography
              variant="h3"
              fontWeight="bold"
              gutterBottom
              sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}
            >
              <CountUp
                start={0}
                end={stat.number}
                duration={3}
                decimals={stat.decimals || 0}
              />
              {stat.suffix}
            </Typography>

            {/* Label */}
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255, 255, 255, 0.9)",
                fontWeight: 500,
              }}
            >
              {stat.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
      
    

        {/* Mission Statement */}
       
         <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" }, // stack on mobile
        gap: 4,
        justifyContent: "center",
        alignItems: "stretch",
        width: "100%",
        px: { xs: 2, md: 6,lg:4 },
        py: { xs: 6, md: 8, lg:2 },
      }}
    >
      {/* Mission */}
      <Box sx={{ flex: 1 }}>
        <Paper
          elevation={3}
          sx={{
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            borderRadius: 3,
            p: { xs: 4, md: 6 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            height: "100%",
          }}
        >
          <Star size={48} color="#D50A17" style={{ marginBottom: 16 }} />
          <Typography variant="h4"  gutterBottom    sx={{  fontSize: { xs: '2rem', md: '3rem', lg:'48px' }, fontStyle :'italic', 
              fontFamily: '"Cormorant", serif', fontWeight:400,
            }}
>
            Our Mission
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            To transform ordinary movie nights into extraordinary celebrations, creating personalized experiences that bring people together and make every moment memorable.
          </Typography>
        </Paper>
      </Box>

      {/* Vision */}
      <Box sx={{ flex: 1 }}>
        <Paper
          elevation={3}
          sx={{
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            borderRadius: 3,
            p: { xs: 4, md: 6 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            height: "100%",
          }}
        >
          <Eye size={48} color="#D50A17" style={{ marginBottom: 16 }} />
          <Typography variant="h4"  gutterBottom    sx={{  fontSize: { xs: '2rem', md: '3rem', lg:'48px' }, fontStyle :'italic', 
              fontFamily: '"Cormorant", serif', fontWeight:400,
            }}
>
            Our Vision
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            To become the leading private theater destination in Bengaluru, delivering unforgettable experiences while continuously innovating to exceed customer expectations.
          </Typography>
        </Paper>
      </Box>
    </Box>

      </Container>
    </Box>
  );
}