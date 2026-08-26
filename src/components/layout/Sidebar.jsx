import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Toolbar,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 260;

export default function Sidebar({ mobileOpen = false, onMobileClose = () => {} }) {
  const { activeRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation configurations for 3 roles: Admin, Reviewer, Author
  const getNavSections = () => {
    const sections = [];

    // General / Overview
    sections.push({
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: 'bi-grid-1x2-fill' },
        { label: 'My Profile', path: '/profile', icon: 'bi-person-circle' },
        { label: 'Conference Info', path: '/conference/details', icon: 'bi-info-circle' },
        { label: 'Announcements', path: '/announcements', icon: 'bi-megaphone' },
        { label: 'User Guide', path: '/guide', icon: 'bi-book' },
      ],
    });

    // Author Section (Author & Admin)
    if (activeRole === 'author' || activeRole === 'admin') {
      sections.push({
        title: 'AUTHOR PORTAL',
        items: [
          { label: 'My Submissions', path: '/my-submissions', icon: 'bi-file-earmark-text' },
          { label: 'Submit New Paper', path: '/submit-paper', icon: 'bi-file-earmark-plus' },
        ],
      });
    }

    // Reviewer Section (Reviewer & Admin)
    if (activeRole === 'reviewer' || activeRole === 'admin') {
      sections.push({
        title: 'REVIEWER PORTAL',
        items: [
          { label: 'Assigned Papers', path: '/reviewer/workspace', icon: 'bi-journal-check' },
        ],
      });
    }

    // Admin & Publication Management Section (Admin)
    if (activeRole === 'admin') {
      sections.push({
        title: 'ADMIN & PUBLICATION MANAGEMENT',
        items: [
          { label: 'All Submissions', path: '/chair/submissions', icon: 'bi-folder2-open' },
          { label: 'Assign Reviewers', path: '/chair/reviewers', icon: 'bi-person-check' },
          { label: 'Paper Decisions', path: '/chair/decisions', icon: 'bi-check2-circle' },
          { label: 'Camera-Ready Desk', path: '/chair/camera-ready', icon: 'bi-award' },
          { label: 'Brevo Broadcast', path: '/chair/emails', icon: 'bi-send' },
          { label: 'Reports & Export', path: '/chair/reports', icon: 'bi-bar-chart-line' },
          { label: 'User Directory', path: '/admin/users', icon: 'bi-people' },
          { label: 'System Audit Logs', path: '/admin/audit-logs', icon: 'bi-shield-check' },
        ],
      });
    }

    return sections;
  };

  const navSections = getNavSections();

  const handleNavClick = (path) => {
    navigate(path);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const drawerContent = (
    <Box sx={{ overflowY: 'auto', py: 2, px: 1.5 }}>
      {navSections.map((section, idx) => (
        <Box key={section.title} sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              px: 1.5,
              py: 0.5,
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: '#123B32',
              display: 'block',
              fontSize: '0.675rem',
            }}
          >
            {section.title}
          </Typography>
          <List dense disablePadding>
            {section.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem key={item.path} disablePadding sx={{ my: 0.25 }}>
                  <ListItemButton
                    onClick={() => handleNavClick(item.path)}
                    selected={isActive}
                    sx={{
                      borderRadius: 1.5,
                      py: 0.9,
                      px: 1.5,
                      backgroundColor: isActive ? '#E8EFEB' : 'transparent',
                      color: isActive ? '#123B32' : '#334E43',
                      '&:hover': {
                        backgroundColor: isActive ? '#E8EFEB' : '#F5F3EC',
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#E8EFEB',
                        color: '#123B32',
                        fontWeight: 700,
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 32,
                        color: isActive ? '#123B32' : '#527A68',
                        fontSize: '1.1rem',
                      }}
                    >
                      <i className={`bi ${item.icon}`}></i>
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.85rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#123B32' : 'inherit',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
          {idx < navSections.length - 1 && <Divider sx={{ my: 1.5, borderColor: '#D3DDD7' }} />}
        </Box>
      ))}

      {/* COI Integrity Status Pill */}
      <Box sx={{ mt: 3, p: 1.5, mx: 1.5, borderRadius: 2, backgroundColor: '#E8EFEB', border: '1px solid #D3DDD7', textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: '#123B32', mb: 0.5 }}>
          <i className="bi bi-shield-check" style={{ fontSize: '1rem', color: '#123B32' }}></i>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#123B32' }}>
            COI Protection Active
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: '#334E43', fontSize: '0.68rem', display: 'block', lineHeight: 1.3 }}>
          Authors & Reviewers can co-exist. Self-review & institutional conflicts are blocked.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      {/* Mobile Temporary Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            backgroundColor: '#FFFFFF',
            borderRight: '1px solid #D3DDD7',
          },
        }}
      >
        <Toolbar />
        {drawerContent}
      </Drawer>

      {/* Desktop Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: '1px solid #D3DDD7',
            backgroundColor: '#FFFFFF',
          },
        }}
        open
      >
        <Toolbar />
        {drawerContent}
      </Drawer>
    </Box>
  );
}
