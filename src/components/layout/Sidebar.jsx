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

    // Admin & Conference Management Section (Admin)
    if (activeRole === 'admin') {
      sections.push({
        title: 'ADMIN & CONFERENCE MANAGEMENT',
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
              color: '#1565C0',
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
                      borderRadius: 2,
                      py: 1,
                      px: 1.5,
                      backgroundColor: isActive ? '#E3F2FD' : 'transparent',
                      color: isActive ? '#1565C0' : '#4A657E',
                      '&:hover': {
                        backgroundColor: isActive ? '#E3F2FD' : '#F0F7FF',
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#E3F2FD',
                        color: '#1565C0',
                        fontWeight: 700,
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 32,
                        color: isActive ? '#1565C0' : '#64748B',
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
                        color: isActive ? '#1565C0' : 'inherit',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
          {idx < navSections.length - 1 && <Divider sx={{ my: 1.5, borderColor: '#F0F4F8' }} />}
        </Box>
      ))}
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
            borderRight: '1px solid #E2E8F0',
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
            borderRight: '1px solid #E2E8F0',
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
