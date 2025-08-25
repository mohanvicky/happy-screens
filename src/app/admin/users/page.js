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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem as MenuOption
} from '@mui/material'
import {
  Add,
  MoreVert,
  Delete,
  ArrowBack,
  Email,
  Phone,
  AdminPanelSettings,
  CheckCircle,
  VpnKey
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'

export default function UsersManagement() {
  const [admins, setAdmins]   = useState([])
  const [locations, setLocs]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  /* — dialog/menu state — */
  const [createOpen, setCreateOpen] = useState(false)
  const [resetOpen,  setResetOpen]  = useState(false)
  const [selAdmin,   setSelAdmin]   = useState(null)
  const [anchorEl,   setAnchorEl]   = useState(null)

  /* — forms — */
  const [createForm, setCreateForm] = useState({
    username: '', email: '', phone: '', assignedLocations: []
  })
  const [resetForm, setResetForm]   = useState({
    newPassword: '', confirmPassword: ''
  })
  const [busy, setBusy] = useState(false)

  const router = useRouter()

  /* — initial load — */
  useEffect(() => { loadData() }, [])

  async function loadData () {
    setLoading(true)
    try {
      const [uRes, lRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/locations')
      ])

      if (!uRes.ok) throw new Error((await uRes.json()).error || 'Users API error')

      const { admins }    = await uRes.json()
      const { locations } = lRes.ok ? await lRes.json() : { locations: [] }

      setAdmins(admins)
      setLocs(locations)
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  /* — helpers — */
  const clearMsg = () => { setError(''); setSuccess('') }
  const locNames = (arr) =>
    arr.length === 0 ? 'All locations' : arr.map(l => l.name).join(', ')

  /* — create admin — */
  async function createAdmin () {
    if (!createForm.username || !createForm.email || !createForm.phone) {
      setError('Username, e-mail & phone are required'); return
    }
    const emailOK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)
    const phoneOK = /^[6-9]\d{9}$/.test(createForm.phone)
    if (!emailOK) { setError('Invalid e-mail'); return }
    if (!phoneOK) { setError('Invalid phone'); return }

    setBusy(true)
    try {
      const r = await fetch('/api/admin/users', {
        method : 'POST',
        headers: { 'Content-Type':'application/json' },
        body   : JSON.stringify(createForm)
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Create failed')

      setSuccess(`Admin created. Temp password: ${d.tempPassword}`)
      setCreateOpen(false)
      setCreateForm({ username:'', email:'', phone:'', assignedLocations:[] })
      loadData()
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }

  /* — password reset — */
  async function updatePassword () {
    if (!resetForm.newPassword || !resetForm.confirmPassword) {
      setError('Both fields are required'); return
    }
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setError('Passwords do not match'); return
    }
    if (resetForm.newPassword.length < 6) {
      setError('Password ≥ 6 chars'); return
    }

    setBusy(true)
    try {
      const r = await fetch(`/api/admin/users/${selAdmin.id}/password`, {
        method : 'PUT',
        headers: { 'Content-Type':'application/json' },
        body   : JSON.stringify({ newPassword: resetForm.newPassword })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Update failed')

      setSuccess('Password updated')
      setResetOpen(false)
      setSelAdmin(null)
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }

  /* — deactivate — */
  async function deactivate (id) {
    if (!confirm('Deactivate this admin?')) return
    try {
      const r = await fetch(`/api/admin/users/${id}`, { method:'DELETE' })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed')
      setSuccess('Admin deactivated')
      loadData()
    } catch (e) { setError(e.message) }
  }

  /* — render — */
  if (loading)
    return (
      <Box sx={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh'}}>
        <CircularProgress size={64}/>
      </Box>
    )

  return (
    <Box sx={{ bgcolor:'grey.100', minHeight:'100vh' }}>
      {/* toolbar */}
      <Box sx={{ bgcolor:'white', boxShadow:1, px:3, py:2, display:'flex', justifyContent:'space-between' }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
          <IconButton onClick={() => router.push('/admin/dashboard/super')}>
            <ArrowBack/>
          </IconButton>
          <Typography variant="h5" fontWeight="bold">User Management</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add/>}
          onClick={() => { setCreateOpen(true); clearMsg() }}>
          Add Admin
        </Button>
      </Box>

      <Container maxWidth="lg" sx={{ mt:4, pb:4 }}>
        {/* summary cards */}
        <Grid container spacing={3} sx={{ mb:4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent sx={{display:'flex',alignItems:'center'}}>
              <AdminPanelSettings sx={{fontSize:40, mr:2, color:'primary.main'}}/>
              <Box>
                <Typography variant="h4">{admins.length}</Typography>
                <Typography variant="body2">Total Admins</Typography>
              </Box>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent sx={{display:'flex',alignItems:'center'}}>
              <CheckCircle sx={{fontSize:40, mr:2, color:'success.main'}}/>
              <Box>
                <Typography variant="h4">{admins.filter(a => a.isActive).length}</Typography>
                <Typography variant="body2">Active</Typography>
              </Box>
            </CardContent></Card>
          </Grid>
        </Grid>

        {error   && <Alert severity="error"   sx={{mb:3}} onClose={clearMsg}>{error}</Alert>}
        {success && <Alert severity="success" sx={{mb:3}} onClose={clearMsg}>{success}</Alert>}

        {/* Admins table */}
        <Paper>
          <Box sx={{ p:3, borderBottom:'1px solid', borderColor:'divider' }}>
            <Typography variant="h6" fontWeight="bold">Admin Users ({admins.length})</Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{bgcolor:'grey.50'}}>
                  <TableCell>User</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Locations</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell/>
                </TableRow>
              </TableHead>
              <TableBody>
                {admins.map(a => (
                  <TableRow key={a.id} hover>
                    <TableCell>
                      <Typography fontWeight="bold">{a.username}</Typography>
                      <Typography variant="caption" color="text.secondary">ID: {a.id.slice(-8)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{display:'flex',alignItems:'center'}}><Email sx={{mr:1,fontSize:16}}/>{a.email}</Typography>
                      <Typography sx={{display:'flex',alignItems:'center'}}><Phone sx={{mr:1,fontSize:16}}/>{a.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={a.role==='super_admin'?'Super':'Admin'}
                            color={a.role==='super_admin'?'error':'primary'} size="small"/>
                    </TableCell>
                    <TableCell>
                      <Chip label={a.isActive?'Active':'Inactive'}
                            color={a.isActive?'success':'default'} size="small"/>
                    </TableCell>
                    <TableCell>{locNames(a.assignedLocations)}</TableCell>
                    <TableCell>
                      {a.lastLogin ? new Date(a.lastLogin).toLocaleDateString('en-IN',{year:'numeric',month:'short',day:'numeric'}) : 'Never'}
                    </TableCell>
                    <TableCell>
                      {a.role!=='super_admin' && (
                        <IconButton size="small" onClick={(e)=>{setAnchorEl(e.currentTarget); setSelAdmin(a)}}>
                          <MoreVert/>
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={()=>setAnchorEl(null)}>
        <MenuOption onClick={()=>{ setResetOpen(true); setResetForm({newPassword:'',confirmPassword:''}); setAnchorEl(null) }}>
          <VpnKey sx={{mr:2}}/> Reset Password
        </MenuOption>
        <MenuOption onClick={()=>{ deactivate(selAdmin.id); setAnchorEl(null) }} sx={{color:'error.main'}}>
          <Delete sx={{mr:2}}/> Deactivate
        </MenuOption>
      </Menu>

      {/* create dialog */}
      <Dialog open={createOpen} onClose={()=>setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Admin</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Username" margin="normal" required
            value={createForm.username}
            onChange={e=>setCreateForm({...createForm, username:e.target.value.toLowerCase()})}/>
          <TextField fullWidth label="Email" type="email" margin="normal" required
            value={createForm.email}
            onChange={e=>setCreateForm({...createForm, email:e.target.value})}/>
          <TextField fullWidth label="Phone" margin="normal" required
            value={createForm.phone}
            onChange={e=>setCreateForm({...createForm, phone:e.target.value.replace(/\D/g,'')})}
            inputProps={{maxLength:10}}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createAdmin} disabled={busy}>
            {busy?<CircularProgress size={20}/>:'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* password dialog */}
      <Dialog open={resetOpen} onClose={()=>setResetOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Set New Password – {selAdmin?.username}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="New Password" type="password" margin="normal" required
            value={resetForm.newPassword}
            onChange={e=>setResetForm({...resetForm,newPassword:e.target.value})}/>
          <TextField fullWidth label="Confirm Password" type="password" margin="normal" required
            value={resetForm.confirmPassword}
            onChange={e=>setResetForm({...resetForm,confirmPassword:e.target.value})}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setResetOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={updatePassword} disabled={busy}>
            {busy?<CircularProgress size={20}/>:'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
