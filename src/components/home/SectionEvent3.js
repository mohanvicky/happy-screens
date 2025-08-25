"use client";

import { Box, Typography, Card, CardMedia, CardContent } from "@mui/material";
import sec1 from "@/assets/sec1.jpg";
import sec2 from "@/assets/sec2.jpg";
import sec3 from "@/assets/sec3.jpg";
import Image from "next/image";

export default function EventSection() {
  return (
    <Box
      sx={{
        backgroundColor: "#f4f4f4",
        py: 6,
        textAlign: "center",
      }}
    >
      {/* Header Section */}
      <Typography variant="body2" sx={{ mb: 1 }}>
        Let&apos;s Plan your
      </Typography>
      <Typography
        variant="h3"
        sx={{  fontSize: { xs: '2rem', md: '3rem', lg:'48px' }, 
          fontFamily: "serif",
          fontStyle: "italic",
          fontWeight: 400,
          mb: 2,
        }}
      >
        Event Together
      </Typography>
      <Typography
        variant="body2"
        sx={{
          maxWidth: "600px",
          mx: "auto",
          mb: 6,
          color: "text.secondary", fontSize:'18px'
        }}
      >
        We understand that every detail is important, and we are here to ensure
        that your event is a success from start to finish.
      </Typography>

      {/* Cards Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 4,
          flexWrap: "wrap",
        }}
      >
        {[
          { img: sec1, title: "Cakes" },
          { img: sec2, title: "Food & Beverages" },
          { img: sec3, title: "Bouquets" },
        ].map((item, index) => (
          <Card
            key={index}
            sx={{
              width: 280, // fixed card width for consistency
              border: "1px solid #b71c1c",
              boxShadow: "none",
              borderRadius: 2,
              p: 1,
            }}
          >
            <CardMedia sx={{ height: 280, position: "relative" }}>
              <Image
                src={item.img}
                alt={item.title}
                fill
                style={{ objectFit: "cover", borderRadius: "4px" }}
              />
            </CardMedia>
            <CardContent>
              <Typography
                variant="subtitle1"
                sx={{
                  fontFamily: "serif",
                  fontStyle: "italic",
                  fontSize: "20px",
                  textAlign: "center",
                }}
              >
                {item.title}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
