'use client'
import { useState, useEffect } from 'react'
import {
  Box, Container, Typography, Button, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, MenuItem, Select, FormControl, InputLabel,
  Checkbox, ListItemText, Alert, CircularProgress
} from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { Add, ArrowBack } from '@mui/icons-material'
import { useRouter } from 'next/navigation'

export default function SchedulesPage() {
  const router = useRouter()
  const [schedules,setSchedules]=useState([])
  const [events,setEvents]=useState([]); const[slots,setSlots]=useState([])
  const [locations,setLocations]=useState([]); const[screens,setScreens]=useState([])
  const [loading,setLoading]=useState(true); const[error,setError]=useState(''); const[success,setSuccess]=useState('')

  /* dialog & form */
  const[open,setOpen]=useState(false)
  const[form,setForm]=useState({
    eventIds:[], locationIds:[], screenIds:[], slotIds:[], dates:[dayjs()]
  })

  useEffect(()=>{loadAll()},[])
  async function loadAll(){
    setLoading(true)
    try{
      const [sch,eve,sloc,locs,scr] = await Promise.all([
        fetch('/api/admin/schedules').then(r=>r.json()),
        fetch('/api/admin/events').then(r=>r.json()),
        fetch('/api/admin/slots').then(r=>r.json()),
        fetch('/api/admin/locations').then(r=>r.json()),
        fetch('/api/admin/screens').then(r=>r.json())
      ])
      setSchedules(sch.schedules); setEvents(eve.events); setSlots(sloc.slots)
      setLocations(locs.locations); setScreens(scr.screens)
    }catch(e){setError('Failed to load data')}finally{setLoading(false)}
  }

  async function createSchedules(){
    if(!form.eventIds.length||!form.locationIds.length||!form.screenIds.length||!form.slotIds.length){
      setError('Select event, location, screen & slot'); return }
    try{
      const payload={
        events:form.eventIds, locations:form.locationIds,
        screens:form.screenIds, timeSlots:form.slotIds,
        dates:form.dates.map(d=>d.format('YYYY-MM-DD'))
      }
      const r=await fetch('/api/admin/schedules',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      const d=await r.json(); if(!r.ok) throw new Error(d.error||'Failed')
      setSuccess(`Created ${d.created} schedules; conflicts:${d.conflicts}`)
      setOpen(false); loadAll()
    }catch(e){setError(e.message)}
  }

  if(loading) return <Box sx={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh'}}><CircularProgress/></Box>
  return(
    <Box sx={{bgcolor:'grey.100',minHeight:'100vh'}}>
      <Box sx={{bgcolor:'white',px:3,py:2,display:'flex',alignItems:'center',gap:2,boxShadow:1}}>
        <IconButton onClick={()=>router.back()}><ArrowBack/></IconButton>
        <Typography variant="h5" fontWeight="bold">Schedules</Typography>
        <Box sx={{flexGrow:1}}/>
        <Button variant="contained" startIcon={<Add/>} onClick={()=>setOpen(true)}>Add Schedules</Button>
      </Box>

      <Container maxWidth="xl" sx={{mt:4}}>
        {error&&<Alert severity="error" sx={{mb:3}} onClose={()=>setError('')}>{error}</Alert>}
        {success&&<Alert severity="success" sx={{mb:3}} onClose={()=>setSuccess('')}>{success}</Alert>}
        <Paper>
          <Table size="small">
            <TableHead><TableRow>
              <TableCell>Event</TableCell><TableCell>Date</TableCell>
              <TableCell>Slot</TableCell><TableCell>Location</TableCell><TableCell>Screen</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {schedules.map(s=>(
                <TableRow key={s.id}>
                  <TableCell>{s.event.name}</TableCell>
                  <TableCell>{dayjs(s.date).format('DD-MMM-YY')}</TableCell>
                  <TableCell>{s.timeSlot.name}</TableCell>
                  <TableCell>{s.location.name}</TableCell>
                  <TableCell>{s.screen.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Container>

      {/* create dialog */}
      <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Schedules (bulk)</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Events</InputLabel>
            <Select multiple value={form.eventIds}
              onChange={e=>setForm({...form,eventIds:e.target.value})} renderValue={sel=>sel.length+' selected'}>
              {events.map(ev=><MenuItem key={ev.id} value={ev.id}><Checkbox checked={form.eventIds.includes(ev.id)}/><ListItemText primary={ev.name}/></MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Locations</InputLabel>
            <Select multiple value={form.locationIds}
              onChange={e=>setForm({...form,locationIds:e.target.value})} renderValue={sel=>sel.length+' selected'}>
              {locations.map(l=><MenuItem key={l.id} value={l.id}><Checkbox checked={form.locationIds.includes(l.id)}/><ListItemText primary={l.name}/></MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Screens</InputLabel>
            <Select multiple value={form.screenIds}
              onChange={e=>setForm({...form,screenIds:e.target.value})} renderValue={sel=>sel.length+' selected'}>
              {screens.filter(sc=>form.locationIds.includes(sc.location)).map(sc=>
                <MenuItem key={sc.id} value={sc.id}><Checkbox checked={form.screenIds.includes(sc.id)}/><ListItemText primary={sc.name}/></MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Time Slots</InputLabel>
            <Select multiple value={form.slotIds}
              onChange={e=>setForm({...form,slotIds:e.target.value})} renderValue={sel=>sel.length+' selected'}>
              {slots.map(sl=><MenuItem key={sl.id} value={sl.id}><Checkbox checked={form.slotIds.includes(sl.id)}/><ListItemText primary={`${sl.name} (${sl.startTime}-${sl.endTime})`}/></MenuItem>)}
            </Select>
          </FormControl>

          {/* dates picker */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{display:'flex',gap:2,flexWrap:'wrap',mt:2}}>
              {form.dates.map((d,i)=>(
                <DatePicker key={i} label={`Date ${i+1}`} value={d}
                  onChange={val=>{
                    const arr=[...form.dates]; arr[i]=val; setForm({...form,dates:arr})
                  }}/>
              ))}
              <Button onClick={()=>setForm({...form,dates:[...form.dates,dayjs()]})}>+ Add Date</Button>
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createSchedules}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
