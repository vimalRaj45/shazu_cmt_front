import React, { useState, useEffect } from 'react';
import { Box, Container, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar, { DRAWER_WIDTH, DRAWER_COLLAPSED_WIDTH } from './Sidebar';

export default function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(() => {
    const saved = localStorage.getItem('cmt_sidebar_open');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('cmt_sidebar_open', String(desktopOpen));
  }, [desktopOpen]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setDesktopOpen((prev) => !prev);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--brand-bg, #F5F3EC)' }}>
      <Navbar
        onToggleSidebar={handleDrawerToggle}
        onMobileToggle={handleDrawerToggle}
        sidebarOpen={isMobile ? mobileOpen : desktopOpen}
      />
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        desktopOpen={desktopOpen}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2.5, md: 3.5 },
          width: {
            xs: '100%',
            md: desktopOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : `calc(100% - ${DRAWER_COLLAPSED_WIDTH}px)`,
          },
          minHeight: '100vh',
          backgroundColor: 'var(--brand-bg, #F5F3EC)',
          overflowX: 'hidden',
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.easeInOut,
              duration: 250,
            }),
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
