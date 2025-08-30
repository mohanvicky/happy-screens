'use client'
import { useState, useEffect } from 'react'
import {
  Box, Container, Typography, Button, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Menu, MenuItem as MenuOption, Alert, CircularProgress
} from '@mui/material'
import { Add, MoreVert, Edit, Delete, ArrowBack } from '@mui/icons-material'
import { useRouter } from 'next/navigation'

export default function SlotsPage() {
  const router = useRouter()
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [form, setForm] = useState({ name: '', start: '10:00', end: '12:00' })

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/slots')
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setSlots(d.slots)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function openNew() {
    setIsEdit(false)
    setForm({ name: '', start: '10:00', end: '12:00' })
    setDialogOpen(true)
    setSelectedSlot(null)
  }

  function openEdit(slot) {
    setIsEdit(true)
    setSelectedSlot(slot)
    setForm({
      name: slot.name,
      start: slot.startTime,
      end: slot.endTime,
    })
    setDialogOpen(true)
    closeMenu()
  }

  async function save() {
    if (!form.name) {
      setError('Name required')
      return
    }
    const body = { name: form.name, startTime: form.start, endTime: form.end }
    try {
      let url = '/api/admin/slots'
      let method = 'POST'
      if (isEdit) {
        if (!selectedSlot || !selectedSlot.id) {
          setError('No slot selected for editing')
          return
        }
        url = `/api/admin/slots/${selectedSlot.id}`
        method = 'PUT'
      }
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setSuccess(isEdit ? 'Updated' : 'Created')
      setDialogOpen(false)
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  async function del(slot) {
    if (!slot || !slot.id) {
      setError('No slot selected for deletion')
      return
    }
    if (!confirm('Delete slot?')) return
    try {
      const r = await fetch(`/api/admin/slots/${slot.id}`, { method: 'DELETE' })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setSuccess('Deleted')
      load()
    } catch (e) {
      setError(e.message)
    }
    closeMenu()
  }

  const closeMenu = () => { setAnchorEl(null) }

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  )

  return (
    <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: 'white', px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2, boxShadow: 1 }}>
        <IconButton onClick={() => router.back()}><ArrowBack /></IconButton>
        <Typography variant="h5" fontWeight="bold">Time Slots</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" startIcon={<Add />} onClick={openNew}>Add Slot</Button>
      </Box>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {slots.map(slot => (
                <TableRow key={slot.id} hover>
                  <TableCell>{slot.name}</TableCell>
                  <TableCell>{slot.startTime}</TableCell>
                  <TableCell>{slot.endTime}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={e => {
                        setAnchorEl(e.currentTarget)
                        setSelectedSlot(slot)
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedSlot?.id === slot.id}
                      onClose={closeMenu}
                    >
                      <MenuOption onClick={() => openEdit(slot)}>
                        <Edit sx={{ mr: 2 }} />Edit
                      </MenuOption>
                      <MenuOption onClick={() => del(slot)} sx={{ color: 'error.main' }}>
                        <Delete sx={{ mr: 2 }} />Delete
                      </MenuOption>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Container>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{isEdit ? 'Edit' : 'New'} Slot</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Start (HH:MM)"
            fullWidth
            margin="normal"
            value={form.start}
            onChange={e => setForm({ ...form, start: e.target.value })}
          />
          <TextField
            label="End (HH:MM)"
            fullWidth
            margin="normal"
            value={form.end}
            onChange={e => setForm({ ...form, end: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>{isEdit ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
