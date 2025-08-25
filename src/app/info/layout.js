import { Box, Container } from '@mui/material'

export default function InfoLayout({ children }) {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(135deg,#f8fafc 0%,#e0f2fe 100%)'
      }}
    >
      <Container maxWidth='lg'>{children}</Container>
    </Box>
  )
}
