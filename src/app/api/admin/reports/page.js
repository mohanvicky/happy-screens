'use client'
import { useRouter } from 'next/navigation'
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  Alert 
} from '@mui/material'
import { ArrowBack, Assessment } from '@mui/icons-material'

export default function ReportsPage() {
  const router = useRouter()

  return (
    <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: 'white', px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2, boxShadow: 1 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.back()}>
          Back
        </Button>
        <Typography variant="h5" fontWeight="bold">Reports & Analytics</Typography>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Assessment sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Reports & Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Comprehensive reporting dashboard coming soon.
          </Typography>
          
          <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
            <Typography variant="subtitle2" gutterBottom>
              Planned Reports:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>Revenue analytics</li>
              <li>Booking trends</li>
              <li>Screen utilization</li>
              <li>Customer insights</li>
              <li>Performance metrics</li>
            </Typography>
          </Alert>
        </Paper>
      </Container>
    </Box>
  )
}
