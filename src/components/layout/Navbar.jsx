import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Select,
  FormControl,
  Avatar,
  Divider,
  Tooltip,
  ListItemIcon,
  ListItemText,
  Autocomplete,
  TextField,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useConference } from '../../context/ConferenceContext';
import { useNavigate } from 'react-router-dom';

const ROLE_CONFIG = {
  admin: { bg: '#EFF6FF', text: '#1565C0', border: '#BFDBFE', label: 'Administrator', icon: 'bi-shield-lock' },
  reviewer: { bg: '#F0F9FF', text: '#0284C7', border: '#BAE6FD', label: 'Peer Reviewer', icon: 'bi-journal-check' },
  author: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', label: 'Author', icon: 'bi-file-earmark-text' },
};

export default function Navbar({ onMobileToggle }) {
  const { user, activeRole, logout } = useAuth();
  const { conferences, selectedConference, selectConference } = useConference();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);

  const currentRoleStyle = ROLE_CONFIG[activeRole || user?.role] || ROLE_CONFIG.author;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: '#FFFFFF',
        color: '#0F2942',
        borderBottom: '1px solid #E2E8F0',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: '100%',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64, px: { xs: 1.5, sm: 2, md: 3 } }}>
        {/* Mobile Hamburger & Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMobileToggle}
            sx={{ display: { md: 'none' }, color: '#1565C0', p: 1 }}
          >
            <i className="bi bi-list" style={{ fontSize: '1.6rem' }}></i>
          </IconButton>

          <Box
            onClick={() => navigate('/dashboard')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              cursor: 'pointer',
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #1565C0 0%, #0288D1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '1.15rem',
                boxShadow: '0 2px 8px rgba(21, 101, 192, 0.25)',
              }}
            >
              <i className="bi bi-mortarboard-fill"></i>
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1, color: '#1565C0', letterSpacing: '-0.01em' }}>
                SHAZU SOFT
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.08em', color: '#0288D1' }}>
                CMT PORTAL
              </Typography>
            </Box>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ height: 28, my: 'auto', mx: { xs: 0.5, sm: 1 }, borderColor: '#E2E8F0', display: { xs: 'none', sm: 'block' } }} />

          {/* Searchable Active Conference Selector */}
          <Autocomplete
            size="small"
            options={conferences}
            getOptionLabel={(option) => `${option.short_name || ''} - ${option.name || ''}`}
            value={selectedConference || null}
            onChange={(_, newValue) => {
              if (newValue) selectConference(newValue);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disableClearable
            sx={{
              minWidth: { xs: 150, sm: 220, md: 320 },
              maxWidth: 360,
              backgroundColor: '#F8FAFC',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                fontSize: '0.825rem',
                fontWeight: 600,
                color: '#0F2942',
                py: '2px',
                '& fieldset': { borderColor: '#CBD5E1' },
                '&:hover fieldset': { borderColor: '#1565C0' },
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search Conference..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <i className="bi bi-calendar-check" style={{ color: '#1565C0', marginRight: 6, fontSize: '0.9rem' }}></i>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id} sx={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="bi bi-calendar-check" style={{ color: '#1565C0' }}></i>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F2942' }}>
                    {option.short_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.75rem' }}>
                    {option.name}
                  </Typography>
                </Box>
              </Box>
            )}
          />
        </Box>

        {/* User Role Badge (Read-Only) & Profile Details */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          {/* Static Professional Role Badge */}
          <Chip
            label={currentRoleStyle.label}
            size="small"
            sx={{
              backgroundColor: currentRoleStyle.bg,
              color: currentRoleStyle.text,
              border: `1px solid ${currentRoleStyle.border}`,
              fontWeight: 800,
              fontSize: { xs: '0.725rem', sm: '0.8rem' },
              height: 30,
              px: 0.5,
              borderRadius: 1,
              userSelect: 'none',
            }}
            icon={<i className={`bi ${currentRoleStyle.icon}`} style={{ marginLeft: 6, color: currentRoleStyle.text, fontSize: '0.85rem' }}></i>}
          />

          {/* User Profile Avatar & Menu */}
          <Box
            onClick={handleProfileMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              p: '3px 6px',
              borderRadius: 2,
              '&:hover': { backgroundColor: '#F0F7FF' },
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #1565C0 0%, #0288D1 100%)',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              {user?.first_name?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', lg: 'block' }, textAlign: 'left' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.1, color: '#0F2942' }}>
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {user?.institution || user?.email}
              </Typography>
            </Box>
            <i className="bi bi-chevron-down" style={{ fontSize: '0.7rem', color: '#64748B' }}></i>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{ sx: { minWidth: 190, p: 1, border: '1px solid #E2E8F0' } }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F2942' }}>
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/conferences'); }}>
              <ListItemIcon><i className="bi bi-globe" style={{ color: '#1565C0' }}></i></ListItemIcon>
              All Conferences
            </MenuItem>
            <MenuItem onClick={() => { handleProfileMenuClose(); logout(); }} sx={{ color: '#DC2626' }}>
              <ListItemIcon><i className="bi bi-box-arrow-right" style={{ color: '#DC2626' }}></i></ListItemIcon>
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
