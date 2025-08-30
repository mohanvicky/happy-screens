"use client";

import { Box, Typography, Button } from "@mui/material";
import Image from "next/image";
import rose from "@/assets/rose.png"; // replace with your rose image
import Link from 'next/link'


export default function PlanEventSection() {
  return (
    <Box
      sx={{

        backgroundColor: "#111", // dark background
        color: "white",
        px: { xs: 3, md: 10, lg: 23 },
        pb: { xs: 6, md: 6, lg: 6 },
        pt: { xs: 4, md: 4, lg: 4 },

      }}
    >
      <Box sx={{
        maxWidth: '1200px', display: "flex",
        alignItems: "flex-end", // rose image aligned down
        justifyContent: "space-between", margin: '0 auto', flexWrap: "wrap", // responsive
        position: "relative",
      }}>
        {/* Left Content */}
        <Box sx={{ flex: 1, minWidth: "300px", maxWidth: "600px" }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Our Services
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '2rem', md: '3rem', lg: '48px' },
              fontFamily: '"Cormorant", serif',
              fontStyle: "italic",
              fontWeight: 400,
              mb: 2,
            }}
          >
            Let us Plan Your Event
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 3, fontWeight: 300, color: "rgba(255,255,255,0.85)", fontSize: { xs: '12px', sm: "14px", md: '16px', lg: '17px' } }}
          >
            We understand that every detail is important, and we are here to ensure
            that your event is a success from start to finish.
          </Typography>

          {/* Bullet points */}
          <Box component="ul" sx={{ pl: 2, mb: 4, }} >
            {[
              "Planning and goal setting for the event.",
              "Project management and coordination with external suppliers.",
              "Creation of a drink menu that fits the evening’s theme.",
              "Assembly and disassembly of all equipment.",
              "Provision of professional staff and necessary materials.",
            ].map((item, i) => (
              <Typography
                component="li"
                key={i}
                variant="body2"
                sx={{ mb: 1.2, color: "rgba(255,255,255,0.75)", fontSize: { xs: "12px", sm: "14px", md: '16px', lg: '17px' } }}
              >
                {item}
              </Typography>
            ))}
          </Box>

          <Button
            variant="contained"
            component={Link}
            href="/book"
            sx={{
              backgroundColor: "red",
              color: "white",
              px: 3,
              py: 1,
              borderRadius: 0,
              textTransform: "uppercase",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#b71c1c",
              },
            }}
          >
            Booking Request
          </Button>
        </Box>

        {/* Right Rose Image */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-end",
            minWidth: "280px",
            mt: { xs: 4, md: 0 },
          }}
        >
          <Box
            sx={{
              position: "relative",
              //   width: 600,
              //   height: 450,
              width: { xs: 280, sm: 350, md: 450, lg: 600 },
              height: { xs: 280, sm: 350, md: 450, lg: 450 },
            }}
          >
            <Image
              src={rose}
              alt="Rose Bouquet"
              fill
              style={{
                objectFit: "contain",
                // position: "absolute",
                top: "30%",          // moves rose down
                transform: "rotate(-20deg)", // tilt
              }}
            />
          </Box>

        </Box>
      </Box>
    </Box>
  );
}
