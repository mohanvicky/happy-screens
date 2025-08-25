import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Chip
} from '@mui/material';

export const metadata = { title: 'Refund Policy – Happy Screens' };

export default function RefundPage() {
  return (
    <Box
      sx={{
        // background: 'linear-gradient(135deg, #f5f5f5 0%, #e3f2fd 100%)',
        minHeight: '100vh',
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        
        {/* Hero Section */}
        <Box textAlign="center" mb={6}>
          <Typography 
            variant="h1" 
            sx={{ 
               fontSize: { xs: '2rem', md: '3rem', lg:'48px' }, fontStyle :'italic', 
              fontFamily: '"Cormorant", serif', fontWeight:400,

                     mb: 2,
              fontWeight: 'bold',
             background: 'linear-gradient(45deg, #ff4d00ff 30%, #D50A17 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Refund Policy
          </Typography>

          <Typography 
            variant="h5" 
            color="text.secondary" 
            sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
          >
            Clear and transparent refund guidelines for your bookings
          </Typography>
        </Box>

        {/* Main Content Card */}
        <Paper
          elevation={3}
          sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            p: { xs: 4, md: 6 },
            mb: 6,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          }}
        >
          <Box textAlign="center" mb={4}>
            <Typography 
              variant="h3" 
              color="primary" 
              fontWeight="bold" 
              gutterBottom
              sx={{  fontSize: { xs: '2rem', md: '3rem', lg:'48px' }, fontStyle :'italic', 
              fontFamily: '"Cormorant", serif', fontWeight:400,}}
            >
              Simple & Fair Refund Process
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

          <Box maxWidth="800px" mx="auto">
            <Typography 
              variant="h6" 
              color="text.primary" 
              textAlign="center"
              sx={{ lineHeight: 1.8, fontWeight: 400 }}
            >
             {"We collect 50% of the total amount as advance for reserving a slot. This advance is fully refundable (minus any payment-gateway convenience fee) if we're informed at least 72 hours before the booking time via WhatsApp."}
              <Box 
                component="span" 
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 'bold',
                  fontSize: '1.1em'
                }}
              >
                994510 2299
              </Box>. 
              Refunds are initiated within 24 hours and typically complete in 5-7 days.
            </Typography>
          </Box>
        </Paper>

        {/* Additional Info Cards */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            mb: 6,
          }}
        >
          {/* Refund Timeline Card */}
          <Paper
            elevation={2}
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              p: 3,
              flex: 1,
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 15px 30px rgba(0,0,0,0.12)',
              },
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                bgcolor: 'success.main',
                color: 'white',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                fontSize: '1.5rem',
                fontWeight: 'bold',
              }}
            >
              72h
            </Box>
            <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
              Cancellation Window
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cancel at least 72 hours before your booking for a full refund
            </Typography>
          </Paper>

          {/* Processing Time Card */}
          <Paper
            elevation={2}
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              p: 3,
              flex: 1,
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 15px 30px rgba(0,0,0,0.12)',
              },
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                bgcolor: 'info.main',
                color: 'white',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                fontSize: '1rem',
                fontWeight: 'bold',
              }}
            >
              5-7
            </Box>
            <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
              Processing Time
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Refunds typically complete within 5-7 business days
            </Typography>
          </Paper>

          {/* Contact Card */}
          <Paper
            elevation={2}
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              p: 3,
              flex: 1,
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 15px 30px rgba(0,0,0,0.12)',
              },
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                fontSize: '1.25rem',
              }}
            >
              📱
            </Box>
            <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
              WhatsApp Contact
            </Typography>
            <Typography 
              variant="h6" 
              color="primary.main" 
              fontWeight="bold"
              sx={{ fontSize: '1.1rem' }}
            >
              994510 2299
            </Typography>
          </Paper>
        </Box>

        {/* Important Note */}
        <Paper
          elevation={2}
          sx={{
            background: '#000',
            borderRadius: 3,
            p: 4,
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom  sx={{  fontSize: { xs: '2rem', md: '3rem', lg:'48px' }, fontStyle :'italic', 
              fontFamily: '"Cormorant", serif', fontWeight:400, color:'#D50A17'
            }}
>
            Important Note
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.95 }}>
            Payment gateway convenience fees are non-refundable and will be deducted from your refund amount.
            All refund requests must be made via WhatsApp for faster processing.
          </Typography>
        </Paper>

      </Container>
    </Box>
  );
}