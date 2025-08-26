// 'use client'

// import { Box, Container, Typography, Button, TextField, FormControlLabel, Checkbox, Paper } from '@mui/material'

// const ReservationSection = () => {
//   return (
//     <Box sx={{ bgcolor: '#e0e0e0', py: { xs: 6, md: 8, lg: 8 } }}>
//       <Container maxWidth="lg">
//         <Box
//           sx={{
//             display: 'flex',
//             flexDirection: { xs: 'column', md: 'row' },
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             gap: { xs: 6, md: 4 },
//           }}
//         >
//           {/* Left Column */}
//           <Box sx={{ flex: 1 }}>
//             <Typography
//               variant="h3"
//               sx={{
//                 fontWeight: 400,
//                 color: '#0a0c0bff',
//                 mb: 2,
//                 fontFamily: '"Cormorant", serif',
//                 fontSize: { xs: '2rem', md: '3rem', lg:'4rem' },
//                 fontStyle: 'italic',
//                 lineHeight: 1.3,
//               }}
//             >
//               India’s #1 Premier <br />
//               Private Theater <br />
//               Celebration Destination
//             </Typography>
//             <Typography
//               variant="body1"
//               sx={{ mb: 4, color: '#203225', opacity: 0.8 }}
//             >
//               {"Choose your occasion, provide your preferences, and let us make it exceptional."}
//             </Typography>
//             <Button
//               variant="contained"
//               sx={{
//                 backgroundColor: '#D50A17',
//                 '&:hover': { backgroundColor: '#a00c14' },
//                 px: 4,
//                 py: 1.5,
//               }}
//             >
//               BOOKING REQUEST
//             </Button>
//           </Box>

//           {/* Right Column - Form */}
//           <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
//             <Paper
//               sx={{
//                 p: 4,
//                 maxWidth: 450,
//                 width: '100%',
//                 bgcolor: '#d6d6d6',
//               }}
//             >
//               <Typography
//                 variant="h6"
//                 sx={{
//                   mb: 3,
//                   fontStyle: 'italic',
//                   textAlign: 'center',
//                   fontFamily: '"Cormorant", serif',
//                   fontSize: { xs: '2rem', md: '2.8rem' },
//                 }}
//               >
//                 Make a Reservation
//               </Typography>
//               <TextField fullWidth label="Your Name" variant="standard" sx={{ mb: 2 }} />
//               <TextField fullWidth label="Phone" variant="standard" sx={{ mb: 4 }} />
//               <TextField
//                 fullWidth
//                 label=""
//                 variant="standard"
//                 sx={{ mb: 4 }}
//                 select
//                 SelectProps={{ native: true }}
//               >
//                 <option value="">Select date & time</option>
//                 <option value="1">1 Aug 2025 - 6:00 PM</option>
//                 <option value="2">2 Aug 2025 - 7:00 PM</option>
//               </TextField>
//               <FormControlLabel
//                 control={<Checkbox />}
//                 label="I agree that my submitted data is being collected and stored."
//                 sx={{ mb: 3, fontSize: '0.8rem' }}
//               />
//               <Button
//                 variant="contained"
//                 fullWidth
//                 sx={{
//                   backgroundColor: '#203225',
//                   '&:hover': { backgroundColor: '#152017' },
//                   py: 1.5,
//                 }}
//               >
//                 BOOKING REQUEST
//               </Button>
//             </Paper>
//           </Box>
//         </Box>
//       </Container>
//     </Box>
//   )
// }

// export default ReservationSection
