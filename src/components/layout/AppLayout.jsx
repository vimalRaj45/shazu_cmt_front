import React, { useState } from 'react';
import { Box, Container, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F7FB' }}>
      <Navbar onMobileToggle={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2.5, md: 3.5 },
          width: { xs: '100%', md: `calc(100% - 260px)` },
          minHeight: '100vh',
          backgroundColor: '#F4F7FB',
          overflowX: 'hidden',
        }}
      >
        <Toolbar /> {/* 64px spacer for fixed Navbar */}
        <Container maxWidth="xl" sx={{ p: { xs: 0, sm: 1 }, maxWidth: '100%' }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
