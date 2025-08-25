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
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material'
import {
  LocationOn,
  Event,
  Movie,
  Dashboard,
  AccessTime,
  Schedule,
  Assessment,
  Add,
  TrendingUp
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats')
        const data = await response.json()

        if (response.ok) {
          setStats(data.stats)
          setUser(data.user)
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

    fetchData()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
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
      title: 'Events',
      value: stats?.totalEvents || 0,
      icon: <Event />,
      color: '#fff3e0'
    }
  ]

  const managementActions = [
    {
      label: 'Manage Events',
      icon: <Event />,
      path: '/admin/events',
      description: 'Create and manage event types'
    },
    {
      label: 'Time Slots',
      icon: <AccessTime />,
      path: '/admin/slots',
      description: 'Define available time slots'
    },
    {
      label: 'Schedules',
      icon: <Schedule />,
      path: '/admin/schedules',
      description: 'Assign events to screens and dates'
    },
    {
      label: 'Manage Screens',
      icon: <Movie />,
      path: '/admin/screens',
      description: 'Manage screen configurations'
    },
    {
      label: 'View Reports',
      icon: <Assessment />,
      path: '/admin/reports',
      description: 'Analytics and booking reports'
    },
    {
      label: 'Dashboard Settings',
      icon: <Dashboard />,
      path: '/admin/settings',
      description: 'Configure dashboard preferences'
    }
  ]

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.100', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', boxShadow: 1, px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Admin Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back, {user?.username}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => router.push('/book')}
              startIcon={<Add />}
            >
              Test Booking
            </Button>
            <Button variant="text" color="error" onClick={handleLogout}>
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

        {/* Monthly Revenue */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
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
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {managementActions.map((action, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer', 
                        '&:hover': { boxShadow: 3 },
                        transition: 'box-shadow 0.2s'
                      }} 
                      onClick={() => router.push(action.path)}
                    >
                      <CardContent sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                        <Box sx={{ mr: 2, color: 'primary.main' }}>
                          {action.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {action.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {action.description}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Bookings (if any) */}
        {stats?.recentBookings && stats.recentBookings.length > 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Recent Bookings
              </Typography>
              <Button 
                variant="text" 
                onClick={() => router.push('/admin/bookings')}
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
                  {stats.recentBookings.slice(0, 5).map((booking, index) => (
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

        {/* Account Info */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Account Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Username:</strong> {user?.username}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Role:</strong> {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Assigned Locations:</strong> {user?.assignedLocations?.length || 'All'}
              </Typography>
            </Grid>
          </Grid>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> If you forget your password or lose access to your account, 
              please contact the Super Admin for password reset assistance.
            </Typography>
          </Alert>
        </Paper>
      </Container>
    </Box>
  )
}
