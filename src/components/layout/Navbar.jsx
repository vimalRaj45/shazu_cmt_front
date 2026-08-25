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
  Popper,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useConference } from '../../context/ConferenceContext';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../common/ConfirmModal';

const ROLE_CONFIG = {
  admin: { bg: '#E8EFEB', text: '#123B32', border: '#527A68', label: 'Administrator', icon: 'bi-shield-lock' },
  reviewer: { bg: '#E8EFEB', text: '#2F5B4E', border: '#527A68', label: 'Peer Reviewer', icon: 'bi-journal-check' },
  author: { bg: '#FBEFE7', text: '#C47D4C', border: '#C47D4C', label: 'Author', icon: 'bi-file-earmark-text' },
};

export default function Navbar({ onMobileToggle }) {
  const { user, activeRole, logout } = useAuth();
  const { conferences, selectedConference, selectConference } = useConference();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);

  const handleRequestLogout = () => {
    handleProfileMenuClose();
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login');
  };

  const currentRoleStyle = ROLE_CONFIG[activeRole] || ROLE_CONFIG.author;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: '#FFFFFF',
        color: '#26322E',
        borderBottom: '1px solid #D3DDD7',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: '100%',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Mobile Hamburger & Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1.5 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMobileToggle}
            sx={{ display: { md: 'none' }, color: '#123B32', p: 0.75 }}
          >
            <i className="bi bi-list" style={{ fontSize: '1.45rem' }}></i>
          </IconButton>

          <Box
            onClick={() => navigate('/dashboard')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="Shazu Soft Logo"
              sx={{
                height: 32,
                width: 'auto',
                maxHeight: 32,
                objectFit: 'contain',
              }}
            />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1, color: '#123B32', letterSpacing: '-0.01em', fontSize: '0.925rem' }}>
                SHAZU SOFT
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.08em', color: '#527A68', fontSize: '0.7rem', display: 'block' }}>
                CMT PORTAL
              </Typography>
            </Box>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto', mx: { xs: 0.25, sm: 0.75 }, borderColor: '#D3DDD7', display: { xs: 'none', sm: 'block' } }} />

          {/* Searchable Active Conference Selector */}
          <Autocomplete
            size="small"
            options={conferences}
            getOptionLabel={(option) => option.short_name || option.name || ''}
            value={selectedConference || null}
            onChange={(_, newValue) => {
              if (newValue) selectConference(newValue);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disableClearable
            PopperComponent={(props) => (
              <Popper
                {...props}
                sx={{
                  width: { xs: '290px !important', sm: '360px !important' },
                  boxShadow: '0 8px 24px rgba(18, 59, 50, 0.15)',
                  borderRadius: 2,
                  zIndex: (theme) => theme.zIndex.modal + 1,
                  '& .MuiPaper-root': {
                    border: '1px solid #D3DDD7',
                    borderRadius: 2,
                    mt: 0.5,
                  },
                }}
                placement="bottom-start"
              />
            )}
            sx={{
              minWidth: { xs: 120, sm: 190, md: 280 },
              maxWidth: { xs: 160, sm: 260, md: 360 },
              backgroundColor: '#FFFFFF',
              borderRadius: 1.5,
              '& .MuiOutlinedInput-root': {
                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                fontWeight: 700,
                color: '#123B32',
                py: '2px',
                px: { xs: '4px', sm: '8px' },
                '& fieldset': { borderColor: '#D3DDD7' },
                '&:hover fieldset': { borderColor: '#123B32' },
                '&.Mui-focused fieldset': { borderColor: '#123B32' },
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Conference"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <i className="bi bi-calendar-check" style={{ color: '#123B32', marginRight: 4, fontSize: '0.85rem' }}></i>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id} sx={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 1.25, py: 1.25, px: 1.5, borderBottom: '1px solid #F5F3EC' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    backgroundColor: '#E8EFEB',
                    color: '#123B32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <i className="bi bi-calendar2-check" style={{ fontSize: '0.95rem' }}></i>
                </Box>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#123B32', lineHeight: 1.2, whiteSpace: 'normal' }}>
                    {option.short_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#334E43', display: 'block', fontSize: '0.75rem', mt: 0.25, whiteSpace: 'normal', lineHeight: 1.4 }}>
                    {option.name}
                  </Typography>
                </Box>
              </Box>
            )}
          />
        </Box>

        {/* User Role Badge & Profile Details */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.25 } }}>
          {/* Static Professional Role Badge (Compact on Mobile) */}
          <Chip
            label={currentRoleStyle.label}
            size="small"
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              backgroundColor: currentRoleStyle.bg,
              color: currentRoleStyle.text,
              border: `1px solid ${currentRoleStyle.border}`,
              fontWeight: 800,
              fontSize: { xs: '0.725rem', sm: '0.8rem' },
              height: 28,
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
              gap: 0.75,
              cursor: 'pointer',
              p: '2px 4px',
              borderRadius: 1.5,
              '&:hover': { backgroundColor: '#E8EFEB' },
            }}
          >
            <Avatar
              sx={{
                width: 30,
                height: 30,
                background: 'linear-gradient(135deg, #123B32 0%, #2F5B4E 100%)',
                fontSize: '0.825rem',
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              {user?.first_name?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', lg: 'block' }, textAlign: 'left' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.1, color: '#26322E' }}>
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {user?.institution || user?.email}
              </Typography>
            </Box>
            <i className="bi bi-chevron-down" style={{ fontSize: '0.7rem', color: '#527A68' }}></i>
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
            <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
              <ListItemIcon><i className="bi bi-person-circle" style={{ color: '#123B32' }}></i></ListItemIcon>
              My Profile
            </MenuItem>
            <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/conferences'); }}>
              <ListItemIcon><i className="bi bi-globe" style={{ color: '#123B32' }}></i></ListItemIcon>
              All Conferences
            </MenuItem>
            <MenuItem onClick={handleRequestLogout} sx={{ color: '#DC2626' }}>
              <ListItemIcon><i className="bi bi-box-arrow-right" style={{ color: '#DC2626' }}></i></ListItemIcon>
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        open={showLogoutConfirm}
        title="Sign Out Confirmation"
        message="Are you sure you want to sign out of Shazu Soft CMT? You will need to log in again to access your submissions and review workspaces."
        confirmText="Yes, Sign Out"
        cancelText="Stay Logged In"
        severity="logout"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </AppBar>
  );
}
