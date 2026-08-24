import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { TableSkeleton, EmptyState } from '../../components/common/LoadingState';
import BackButton from '../../components/common/BackButton';
import api from '../../services/api';

const ROLE_CONFIG = {
  admin: { label: 'Administrator', bg: '#EFF6FF', color: '#1565C0', border: '#93C5FD' },
  reviewer: { label: 'Reviewer', bg: '#F0F7FF', color: '#0288D1', border: '#B3E5FC' },
  author: { label: 'Author', bg: '#E1F5FE', color: '#0277BD', border: '#81D4FA' },
};

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [savingRole, setSavingRole] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Edit user role modal
  const [editModal, setEditModal] = useState({
    open: false,
    user: null,
    role: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users', {
        params: {
          role: roleFilter || undefined,
          search: search || undefined,
        },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleOpenEdit = (user) => {
    setEditModal({
      open: true,
      user,
      role: user.role,
    });
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    setSavingRole(true);
    try {
      await api.put(`/users/${editModal.user.id}`, {
        role: editModal.role,
      });
      setSnackbar({ open: true, message: `Role updated for ${editModal.user.email}!`, severity: 'success' });
      setEditModal({ open: false, user: null, role: '' });
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to update user role', severity: 'error' });
    } finally {
      setSavingRole(false);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <BackButton fallbackUrl="/dashboard" />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F2942' }}>
            User Directory & Access Control
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage system users, assign institutional roles, and update permissions
          </Typography>
        </Box>
      </Box>

      {/* Filter Bar */}
      <Card sx={{ mb: 3, p: 1, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search user by name, email, or institution..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                InputProps={{
                  startAdornment: <i className="bi bi-search text-muted" style={{ marginRight: 8, color: '#1565C0' }}></i>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                size="small"
                label="Role Filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
                <MenuItem value="reviewer">Reviewer</MenuItem>
                <MenuItem value="author">Author</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button fullWidth variant="contained" onClick={fetchUsers}>
                Search
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card sx={{ p: 1, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        {loading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : users.length === 0 ? (
          <EmptyState
            icon="bi-people"
            title="No Users Found"
            description="No users matched your search criteria."
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Institution & Dept</TableCell>
                  <TableCell>System Role</TableCell>
                  <TableCell>Expertise Keywords</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => {
                  const roleStyle = ROLE_CONFIG[u.role] || ROLE_CONFIG.author;
                  return (
                    <TableRow key={u.id} hover>
                      <TableCell sx={{ fontWeight: 700, color: '#0F2942' }}>
                        {u.first_name} {u.last_name}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.institution || 'Independent'}</Typography>
                        <Typography variant="caption" color="text.secondary">{u.department || 'General'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={roleStyle.label}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            backgroundColor: roleStyle.bg,
                            color: roleStyle.color,
                            border: `1px solid ${roleStyle.border}`,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>
                        {u.expertise && Array.isArray(u.expertise) && u.expertise.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {u.expertise.map((k, idx) => (
                              <Chip key={idx} label={k} size="small" sx={{ fontSize: '0.675rem', backgroundColor: '#F0F6FC' }} />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">None listed</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenEdit(u)}
                          startIcon={<i className="bi bi-pencil"></i>}
                        >
                          Change Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={editModal.open} onClose={() => setEditModal({ open: false, user: null, role: '' })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E2E8F0', color: '#0F2942' }}>
          Update User Role
        </DialogTitle>
        <Box component="form" onSubmit={handleSaveRole}>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Update permissions for <strong>{editModal.user?.first_name} {editModal.user?.last_name}</strong> ({editModal.user?.email}):
            </Typography>

            <TextField
              fullWidth
              select
              label="Assigned System Role"
              value={editModal.role}
              onChange={(e) => setEditModal({ ...editModal, role: e.target.value })}
              required
            >
              <MenuItem value="admin">Administrator (Full Conference & Portal Access)</MenuItem>
              <MenuItem value="reviewer">Reviewer (Peer Reviewer)</MenuItem>
              <MenuItem value="author">Author (Submit & Track Papers)</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E2E8F0' }}>
            <Button onClick={() => setEditModal({ open: false, user: null, role: '' })}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={savingRole}>
              {savingRole ? <CircularProgress size={20} color="inherit" /> : 'Save Role'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Toast Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
