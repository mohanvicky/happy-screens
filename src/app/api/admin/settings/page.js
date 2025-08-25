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
import { ArrowBack, Settings } from '@mui/icons-material'

export default function SettingsPage() {
  const router = useRouter()

  return (
    <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: 'white', px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2, boxShadow: 1 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.back()}>
          Back
        </Button>
        <Typography variant="h5" fontWeight="bold">Settings</Typography>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Settings sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            System Settings
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Configuration and settings page coming soon.
          </Typography>
          
          <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
            <Typography variant="subtitle2" gutterBottom>
              Planned Settings:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>System preferences</li>
              <li>Notification settings</li>
              <li>Backup and restore</li>
              <li>User permissions</li>
            </Typography>
          </Alert>
        </Paper>
      </Container>
    </Box>
  )
}
