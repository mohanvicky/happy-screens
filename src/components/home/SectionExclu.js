"use client";

import { Box, Typography, Button, Container } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation"; // ✅ Import router
import wine1 from "../../assets/se1.1.jpg"; // replace with your image path

export default function ExclusiveEvents() {
  const router = useRouter();

  const handleBookingClick = () => {
    router.push("/book"); // ✅ Navigate on click
  };

  return (
    <Box sx={{ py: 14, px: { xs: 2, md: 8 }, bgcolor: "#EFEDE8" }}>
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
              minHeight: { xs: "300px", md: "500px", lg: "600px" },
            }}
          >
            <Image
              src={wine1}
              alt="Wine Glasses"
              fill
              style={{ objectFit: "cover", borderRadius: "8px" }}
            />
            <Typography
              variant="h2"
              sx={{
                position: "absolute",
                top: { xs: "-8%", md: "-8%", lg: "-12%" },
                left: { xs: "70%", md: "60%", lg: "45%" },
                fontFamily: '"Cormorant", serif',
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: { xs: "2rem", md: "3rem", lg: "6rem" },
                color: "#D50A17",
              }}
            >
              Exclusive
            </Typography>
            <Typography
              variant="h2"
              sx={{
                position: "absolute",
                bottom: { xs: "-6%", md: "-5%", lg: "-10%" },
                left: { xs: "-6%", md: "-12%", lg: "-12%" },
                fontFamily: '"Cormorant", serif',
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: { xs: "2rem", md: "3rem", lg: "6rem" },
                color: "#D50A17",
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
                fontSize: { xs: "2rem", md: "3rem", lg: "48px" },
                fontFamily: '"Cormorant", serif',
                fontStyle: "italic",
                fontWeight: 400,
                mb: 2,
                color: "#0d1b07ff",
              }}
            >
              We help <br /> you Succeed
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                mb: 5,
                lineHeight: 1.7,
                fontSize: "16px",
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

            <Button
              variant="contained"
              onClick={handleBookingClick} // ✅ Use handler
              sx={{
                bgcolor: "red",
                "&:hover": { bgcolor: "darkred" },
                px: 3,
                py: 1,
                borderRadius: "4px",
              }}
            >
              BOOKING REQUEST
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
