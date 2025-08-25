'use client'
import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  People,
  LocationOn,
  Event,
  Movie,
  TrendingUp,
  Add,
  AccessTime,
  Schedule,
  Settings,
  Assessment,
  PhotoLibrary,
  Logout
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats')
        const data = await response.json()

        if (response.ok) {
          setStats(data.stats)
        } else {
          if (response.status === 401) {
            router.push('/admin/login')
          } else {
            setError(data.error || 'Failed to load dashboard')
          }
        }
      } catch (error) {
        setError('Network error. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Enhanced navigation handler with more debugging
  const handleNavigation = (path) => {
    console.log('=== NAVIGATION DEBUG ===')
    console.log('Function called with path:', path)
    console.log('Router object:', router)
    console.log('========================')

    try {
      router.push(path)
      console.log('Router.push called successfully')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  // Test function to verify JavaScript is working
  const testFunction = () => {
    console.log('TEST: Button click detected!')
    alert('Button click working!')
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: <Event />,
      color: '#e3f2fd'
    },
    {
      title: 'Active Screens',
      value: stats?.totalScreens || 0,
      icon: <Movie />,
      color: '#f3e5f5'
    },
    {
      title: 'Locations',
      value: stats?.totalLocations || 0,
      icon: <LocationOn />,
      color: '#e8f5e8'
    },
    {
      title: 'Admin Users',
      value: stats?.totalAdmins || 0,
      icon: <People />,
      color: '#fff3e0'
    }
  ]

  const managementButtons = [
    {
      label: 'Manage Events',
      icon: <Event />,
      path: '/admin/events',
      color: 'secondary'
    },
    {
      label: 'Time Slots',
      icon: <AccessTime />,
      path: '/admin/slots',
      color: 'info'
    },
    {
      label: 'Locations',
      icon: <LocationOn />,
      path: '/admin/locations',
      color: 'primary'
    },
    {
      label: 'Manage Screens',
      icon: <Movie />,
      path: '/admin/screens',
      color: 'success'
    },
    {
      label: 'Bookings',
      icon: <Event />,
      path: '/admin/bookings',
      color: 'success',
      description: 'Manage customer bookings'
    },
    {
      label: 'Gallery',
      icon: <PhotoLibrary />, // Add this import
      path: '/admin/gallery',
      color: 'secondary'
    }
  ]

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.100', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', boxShadow: 1, px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            Super Admin Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => handleNavigation('/admin/users')}
              startIcon={<People />}
            >
              Manage Users
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleLogout}
              startIcon={<Logout />}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      p: 1,
                      borderRadius: '50%',
                      bgcolor: stat.color,
                      color: 'primary.main',
                      mr: 2
                    }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Monthly Revenue & Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: 'fit-content' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Monthly Revenue
                </Typography>
              </Box>
              <Typography variant="h3" color="success.main" fontWeight="bold">
                ₹{stats?.monthlyRevenue?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current month total
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Management Actions
              </Typography>
              <Grid container spacing={2}>
                {managementButtons.map((btn, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Button
                      variant="outlined"
                      color={btn.color}
                      startIcon={btn.icon}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log(`Button clicked: ${btn.label}`)
                        handleNavigation(btn.path)
                      }}
                      fullWidth
                      sx={{
                        py: 1.5,
                        minHeight: 48,
                        textTransform: 'none',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      {btn.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Bookings */}
        {stats?.recentBookings && stats.recentBookings.length > 0 && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Recent Bookings
              </Typography>
              <Button
                variant="text"
                onClick={() => handleNavigation('/admin/bookings')}
                startIcon={<Assessment />}
              >
                View All
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Event</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentBookings.map((booking, index) => (
                    <TableRow key={index}>
                      <TableCell>{booking.customerInfo?.name || 'N/A'}</TableCell>
                      <TableCell>{booking.event?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(booking.date || booking.bookingDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>₹{booking.totalAmount || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={booking.bookingStatus || 'confirmed'}
                          color={
                            booking.bookingStatus === 'confirmed' ? 'success' :
                              booking.bookingStatus === 'cancelled' ? 'error' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>
    </Box>
  )
}