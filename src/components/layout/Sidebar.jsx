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
  Tooltip,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const DRAWER_WIDTH = 260;
export const DRAWER_COLLAPSED_WIDTH = 72;

export default function Sidebar({ mobileOpen = false, onMobileClose = () => {}, desktopOpen = true }) {
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
        { label: 'Conferences & Journals', path: '/conferences', icon: 'bi-journal-bookmark-fill' },
        { label: 'Conference / Journal Info', path: '/conference/details', icon: 'bi-info-circle' },
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
          { label: 'Bulk Invitations', path: '/admin/invitations', icon: 'bi-envelope-paper-heart' },
          { label: 'Paper Decisions', path: '/chair/decisions', icon: 'bi-check2-circle' },
          { label: 'Camera-Ready Desk', path: '/chair/camera-ready', icon: 'bi-award' },
          { label: 'Email Broadcast', path: '/chair/emails', icon: 'bi-send' },
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

  const renderContent = (isExpanded) => (
    <Box
      sx={{
        overflowY: 'auto',
        overflowX: 'hidden',
        py: 2,
        px: isExpanded ? 1.5 : 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: isExpanded ? 'stretch' : 'center',
        height: '100%',
      }}
    >
      {navSections.map((section, idx) => (
        <Box key={section.title} sx={{ mb: isExpanded ? 2 : 1, width: '100%' }}>
          {isExpanded ? (
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
          ) : (
            idx > 0 && <Divider sx={{ my: 1, borderColor: '#D3DDD7', width: '60%', mx: 'auto' }} />
          )}

          <List dense disablePadding sx={{ width: '100%' }}>
            {section.items.map((item) => {
              const isActive = location.pathname === item.path;
              const buttonNode = (
                <ListItemButton
                  onClick={() => handleNavClick(item.path)}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: isExpanded ? 1.5 : 0,
                    justifyContent: isExpanded ? 'flex-start' : 'center',
                    minHeight: 44,
                    width: isExpanded ? '100%' : 44,
                    mx: isExpanded ? 0 : 'auto',
                    backgroundColor: isActive ? '#E8EFEB' : 'transparent',
                    color: isActive ? '#123B32' : '#334E43',
                    transition: 'all 0.15s ease-in-out',
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
                      minWidth: isExpanded ? 32 : 'auto',
                      justifyContent: 'center',
                      color: isActive ? '#123B32' : '#527A68',
                      fontSize: '1.25rem',
                    }}
                  >
                    <i className={`bi ${item.icon}`}></i>
                  </ListItemIcon>
                  {isExpanded && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.85rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#123B32' : 'inherit',
                        whiteSpace: 'nowrap',
                      }}
                    />
                  )}
                </ListItemButton>
              );

              return (
                <ListItem key={item.path} disablePadding sx={{ my: 0.35, display: 'block' }}>
                  {!isExpanded ? (
                    <Tooltip title={item.label} placement="right" arrow>
                      {buttonNode}
                    </Tooltip>
                  ) : (
                    buttonNode
                  )}
                </ListItem>
              );
            })}
          </List>

          {isExpanded && idx < navSections.length - 1 && (
            <Divider sx={{ my: 1.5, borderColor: '#D3DDD7' }} />
          )}
        </Box>
      ))}

      {/* COI Integrity Status Pill */}
      {isExpanded ? (
        <Box sx={{ mt: 'auto', pt: 2, p: 1.5, mx: 0.5, borderRadius: 2, backgroundColor: '#E8EFEB', border: '1px solid #D3DDD7', textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: '#123B32', mb: 0.5 }}>
            <i className="bi bi-shield-check" style={{ fontSize: '1rem', color: '#123B32' }}></i>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#123B32' }}>
              COI Protection Active
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#334E43', fontSize: '0.68rem', display: 'block', lineHeight: 1.3 }}>
            Authors & Reviewers can co-exist. Self-review & conflicts are blocked.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ mt: 'auto', pt: 2, textAlign: 'center', pb: 1 }}>
          <Tooltip title="COI Protection Active: Self-review & conflicts are blocked" placement="right" arrow>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: '#E8EFEB',
                border: '1px solid #D3DDD7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                color: '#123B32',
                cursor: 'pointer',
              }}
            >
              <i className="bi bi-shield-check" style={{ fontSize: '1.15rem' }}></i>
            </Box>
          </Tooltip>
        </Box>
      )}
    </Box>
  );

  const currentWidth = desktopOpen ? DRAWER_WIDTH : DRAWER_COLLAPSED_WIDTH;

  return (
    <Box
      component="nav"
      sx={{
        width: { md: currentWidth },
        flexShrink: { md: 0 },
        transition: (theme) =>
          theme.transitions.create('width', {
            easing: theme.transitions.easing.easeInOut,
            duration: 250,
          }),
      }}
    >
      {/* Mobile Temporary Drawer (Full labels) */}
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
        {renderContent(true)}
      </Drawer>

      {/* Desktop Persistent Drawer (Expanded or Icon-Only when collapsed) */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: currentWidth,
            borderRight: '1px solid #D3DDD7',
            backgroundColor: '#FFFFFF',
            overflowX: 'hidden',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.easeInOut,
                duration: 250,
              }),
          },
        }}
      >
        <Toolbar />
        {renderContent(desktopOpen)}
      </Drawer>
    </Box>
  );
}
