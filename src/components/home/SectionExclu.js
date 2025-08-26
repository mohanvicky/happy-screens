"use client";

import { Box, Typography, Button, Container } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import wine1 from "../../assets/se1.1.jpg";

export default function ExclusiveEvents() {
  const router = useRouter();

  const handleBookingClick = () => {
    router.push("/book");
  };

  return (
    <Box sx={{ 
      py: { xs: 8, sm: 10, md: 12, lg: 14 }, 
      px: { xs: 2, sm: 4, md: 8 }, 
      bgcolor: "#EFEDE8",
      overflow: "hidden" // Prevent overflow
    }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: { xs: 4, md: 6 },
          }}
        >
          {/* Left Side - Image with overlay */}
          <Box
            sx={{
              position: "relative",
              flex: 1,
              width: "100%",
              minHeight: { xs: "300px", sm: "400px", md: "500px", lg: "600px" },
              // Add margins to accommodate overlay text
              mt: { xs: 3, sm: 4, md: 5 },
              mb: { xs: 3, sm: 4, md: 5 },
              mx: { xs: 2, sm: 3, md: 4 }, // Side margins for overlay text
            }}
          >
            <Image
              src={wine1}
              alt="Wine Glasses"
              fill
              style={{ objectFit: "cover", borderRadius: "8px" }}
            />
            
            {/* Overlay Text - Exclusive */}
            <Typography
              variant="h2"
              sx={{
                position: "absolute",
                top: { xs: "-12%", sm: "-10%", md: "-8%", lg: "-10%" },
                right: { xs: "0%", sm: "5%", md: "10%", lg: "15%" },
                fontFamily: '"Cormorant", serif',
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem", lg: "4rem" },
                color: "#D50A17",
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                zIndex: 2,
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
            >
              Exclusive
            </Typography>
            
            {/* Overlay Text - Events */}
            <Typography
              variant="h2"
              sx={{
                position: "absolute",
                bottom: { xs: "-12%", sm: "-10%", md: "-8%", lg: "-10%" },
                left: { xs: "0%", sm: "0%", md: "-5%", lg: "-10%" },
                fontFamily: '"Cormorant", serif',
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem", lg: "4rem" },
                color: "#D50A17",
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                zIndex: 2,
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
            >
              Events
            </Typography>
          </Box>

          {/* Right Side - Text */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem", lg: "3rem" },
                fontFamily: '"Cormorant", serif',
                fontStyle: "italic",
                fontWeight: 400,
                mb: { xs: 2, sm: 2.5, md: 3 },
                color: "#0d1b07ff",
                lineHeight: 1.2,
              }}
            >
              We help <br /> you Succeed
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                mb: { xs: 3, sm: 4, md: 5 },
                lineHeight: 1.7,
                fontSize: { xs: "14px", sm: "15px", md: "16px" },
              }}
            >
              The Happy Screens is a Private Theatre with a unique way of
              celebrating any special occasions in Bengaluru.
              <br />
              <br />
              We provide the best-in-class Theatre experience for our Customers
              to watch their favorite movies and shows along with celebrating
              their special occasions to create priceless Memories.
              <br />
              <br />
              Whether it is a Birthday/ Anniversary / Proposal, surprise your
              loved ones on any special occasion / just a relaxing movie time...
              you name it.
              <br />
              <br />
              We have a perfect arrangement for all the events to make it feel
              special with full privacy including decorations, Cakes, Snacks,
              Beverages etc.
            </Typography>

            <Box sx={{ 
              display: "flex", 
              justifyContent: { xs: "center", sm: "flex-start" } 
            }}>
              <Button
                variant="contained"
                onClick={handleBookingClick}
                sx={{
                  bgcolor: "#D50A17",
                  "&:hover": { 
                    bgcolor: "#B8090F",
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1, sm: 1.5 },
                  borderRadius: "4px",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  transition: "all 0.3s ease",
                  textTransform: "uppercase",
                }}
              >
                BOOKING REQUEST
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}