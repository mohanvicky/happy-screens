import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { CheckCircle2 } from 'lucide-react';

// export const metadata = { title: 'Terms & Conditions – Happy Screens' };

const rules = [
  'Guests must show valid ID proofs during the visit (minimum ID proof for 2 people).',
  'We do NOT provide any movie/OTT accounts. We will set up using your own accounts/phone casting.',
  'Smoking/Drinking is NOT allowed inside the theater.',
  'Any damage to the theater—including balloons, lights, décor—must be reimbursed.',
  'Please maintain cleanliness inside the theater.',
  'Party poppers, snow sprays, cold fire and similar items are prohibited.',
  'Couples under 18 cannot book unless it is a group.',
  'Advance is refundable (-10% convenience fee) only if cancelled ≥72 hours before slot.'
];

export default function TermsPage() {
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
              background: 'linear-gradient(45deg, #ff4d00ff 30%, #D50A17 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Terms & Conditions
          </Typography>

          <Typography 
            variant="h5" 
            color="text.secondary" 
            sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
          >
            Important guidelines to ensure everyone has an amazing experience
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
              fontFamily: '"Cormorant", serif', fontWeight:400,
 }}
              
            >
              Rules & Guidelines
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

          <Box maxWidth="900px" mx="auto">
            <List sx={{ p: 0 }}>
              {rules.map((rule, index) => (
                <ListItem
                  key={index}
                  sx={{
                    alignItems: 'flex-start',
                    p: 2,
                    mb: 1,
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ mt: 0.5, minWidth: 40 }}>
                    <CheckCircle2 
                      size={24} 
                      color="#D50A17"
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={rule}
                    primaryTypographyProps={{
                      variant: 'body1',
                      sx: {
                        lineHeight: 1.7,
                        fontSize: '1.1rem',
                        color: 'text.primary',
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>

        {/* Important Highlights */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            mb: 6,
          }}
        >
          {/* ID Requirement */}
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
                bgcolor: 'warning.main',
                color: 'white',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                fontSize: '1.5rem',
              }}
            >
              🆔
            </Box>
            <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
              ID Required
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Valid ID proofs must be shown during your visit
            </Typography>
          </Paper>

          {/* No Smoking/Drinking */}
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
                bgcolor: 'error.main',
                color: 'white',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                fontSize: '1.5rem',
              }}
            >
              🚫
            </Box>
            <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
              No Smoking/Drinking
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Maintain a family-friendly environment for everyone
            </Typography>
          </Paper>

          {/* Age Restriction */}
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
                fontSize: '1.25rem',
                fontWeight: 'bold',
              }}
            >
              18+
            </Box>
            <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
              Age Guidelines
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Couples under 18 need to be part of a group booking
            </Typography>
          </Paper>
        </Box>

        <Box sx={{display:'flex', flexDirection:'row', alignContent:'center', justifyContent:'center', gap:'30px',
           flexWrap: 'wrap', // allows responsive wrapping on smaller screens
    px: { xs: 2, md: 4 },
    py: { xs: 4, md: 6 },
        }}>

        {/* Damage Policy */}
        <Paper
          elevation={2}
          sx={{
            // background: 'linear-gradient(45deg, #d32f2f 30%, #f57c00 90%)',
            background:'#000',
            borderRadius: 3,
            p: 4,
            color: 'white',
            textAlign: 'center',
            mb: 4,
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom  sx={{  fontSize: { xs: '2rem', md: '3rem', lg:'48px' }, fontStyle :'italic', 
              fontFamily: '"Cormorant", serif', fontWeight:400, color:'#D50A17'
            }}
 >
            Damage & Cleanliness Policy
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.95 }}>
            Any damage to theater equipment, decorations, or facilities must be reimbursed. 
            Please help us maintain cleanliness for the next guests. Party poppers, snow sprays, 
            and similar items are strictly prohibited.
          </Typography>
        </Paper>

        {/* Your Accounts Note */}
        <Paper
          elevation={2}
          sx={{
             background: 'linear-gradient(45deg, #d32f2f 30%, #D50A17 90%)',
            borderRadius: 3,
            p: 4,
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom  sx={{  fontSize: { xs: '2rem', md: '3rem', lg:'48px' }, fontStyle :'italic', 
              fontFamily: '"Cormorant", serif', fontWeight:400, color:'#000'
            }}
>
            Streaming Accounts
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.95 }}>
            We do not provide movie or OTT accounts. Please bring your own login credentials 
            or use phone casting to enjoy your favorite content during your visit.
          </Typography>
        </Paper>

        </Box>

      </Container>
    </Box>
  );
}