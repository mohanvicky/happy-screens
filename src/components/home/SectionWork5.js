"use client";

import { Box, Typography } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import FavoriteIcon from "@mui/icons-material/Favorite";

export default function HowItWorks() {
  const steps = [
    {
      icon: <LocationOnIcon sx={{ fontSize: 60 }} />,
      title: "Location / Theatre",
      desc: "Select Location & Theatre Type",
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: 60 }} />,
      title: "Time Slot",
      desc: "Book your time slot & Decoration",
    },
    {
      icon: <CreditCardIcon sx={{ fontSize: 60 }} />,
      title: "50% Payment",
      desc: "Make just 50% Payment first",
    },
    {
      icon: <FavoriteIcon sx={{ fontSize: 60 }} />,
      title: "Enjoy",
      desc: "Celebrate with your loved ones",
    },
  ];

  return (
    <Box
      sx={{
        textAlign: "center",
        py: 10,
        backgroundColor: "#f8f7f4",
      }}
    >
      {/* Heading */}
      <Typography
        variant="h4"
        sx={{
          mb: 6,
          fontFamily: '"Cormorant", serif',
          fontStyle: "italic",
          color: "#123123",
          fontSize: { xs: "2rem", md: "3rem", lg: "48px" },
        }}
      >
        How It Works
      </Typography>

      {/* Steps */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 3,
          flexWrap: "wrap",
        }}
      >
        {steps.map((step, index) => (
          <Box
            key={index}
            sx={{
              width: 220,
              height: 200,
              border: "1px solid #ddd",
              borderRadius: 2,
              backgroundColor: "white",
              color: "black",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
              transition: "all 0.3s ease",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "red",
                color: "white",
              },
            }}
          >
            {step.icon}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", mt: 2, mb: 1, fontSize: "20px" }}
            >
              {step.title}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "16px" }}>
              {step.desc}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
