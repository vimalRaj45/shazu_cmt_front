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
  IconButton,
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
  Tooltip,
  InputAdornment,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { TableSkeleton, EmptyState } from '../../components/common/LoadingState';
import BackButton from '../../components/common/BackButton';
import ConfirmModal from '../../components/common/ConfirmModal';
import api from '../../services/api';

const ROLE_CONFIG = {
  admin: { label: 'Administrator', bg: '#EFF6FF', color: '#1565C0', border: '#93C5FD' },
  reviewer: { label: 'Reviewer', bg: '#F0FDF4', color: '#15803D', border: '#86EFAC' },
  author: { label: 'Author', bg: '#F8FAFC', color: '#475569', border: '#CBD5E1' },
};

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Create User Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'author',
    institution: '',
    department: '',
    country: 'India',
    qualification: '',
    designation: '',
    domain: '',
    expertiseKeywords: '',
    maxReviewLimit: 3,
  });

  // Edit User Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [editUserData, setEditUserData] = useState(null);

  // Reset Password Modal
  const [resetPwdModal, setResetPwdModal] = useState({ open: false, user: null, newPassword: '', saving: false });

  // Delete User Confirm Modal
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null, deleting: false });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users', {
        params: {
          role: roleFilter || undefined,
          search: search || undefined,
          status: statusFilter || undefined,
        },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setSnackbar({ open: true, message: 'Failed to fetch users', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  // Handle Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      const payload = {
        ...newUserData,
        expertiseKeywords: newUserData.expertiseKeywords
          ? newUserData.expertiseKeywords.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        maxReviewLimit: parseInt(newUserData.maxReviewLimit, 10) || 3,
      };

      await api.post('/users', payload);
      setSnackbar({ open: true, message: `User ${newUserData.email} created successfully!`, severity: 'success' });
      setCreateModalOpen(false);
      setNewUserData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'author',
        institution: '',
        department: '',
        country: 'India',
        qualification: '',
        designation: '',
        domain: '',
        expertiseKeywords: '',
        maxReviewLimit: 3,
      });
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to create user', severity: 'error' });
    } finally {
      setCreatingUser(false);
    }
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (user) => {
    setEditUserData({
      ...user,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      expertiseKeywords: Array.isArray(user.expertise_keywords) ? user.expertise_keywords.join(', ') : '',
      maxReviewLimit: user.max_review_limit || 3,
      isActive: user.is_active !== undefined ? user.is_active : true,
    });
    setEditModalOpen(true);
  };

  // Handle Save User Edit
  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editUserData) return;
    setSavingUser(true);
    try {
      const payload = {
        firstName: editUserData.firstName,
        lastName: editUserData.lastName,
        email: editUserData.email,
        role: editUserData.role,
        institution: editUserData.institution,
        department: editUserData.department,
        country: editUserData.country,
        qualification: editUserData.qualification,
        designation: editUserData.designation,
        domain: editUserData.domain,
        maxReviewLimit: parseInt(editUserData.maxReviewLimit, 10) || 3,
        expertiseKeywords: editUserData.expertiseKeywords
          ? editUserData.expertiseKeywords.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        isActive: editUserData.isActive,
      };

      await api.put(`/users/${editUserData.id}`, payload);
      setSnackbar({ open: true, message: `User ${editUserData.email} updated successfully!`, severity: 'success' });
      setEditModalOpen(false);
      setEditUserData(null);
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to update user', severity: 'error' });
    } finally {
      setSavingUser(false);
    }
  };

  // Toggle Active/Inactive Status
  const handleToggleStatus = async (user) => {
    const nextStatus = !user.is_active;
    try {
      await api.patch(`/users/${user.id}/status`, { isActive: nextStatus });
      setSnackbar({
        open: true,
        message: `User ${user.email} is now ${nextStatus ? 'Active' : 'Deactivated'}`,
        severity: 'success',
      });
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to change status', severity: 'error' });
    }
  };

  // Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPwdModal.user || !resetPwdModal.newPassword) return;
    setResetPwdModal((prev) => ({ ...prev, saving: true }));
    try {
      await api.patch(`/users/${resetPwdModal.user.id}/reset-password`, {
        newPassword: resetPwdModal.newPassword,
      });
      setSnackbar({ open: true, message: `Password reset successfully for ${resetPwdModal.user.email}!`, severity: 'success' });
      setResetPwdModal({ open: false, user: null, newPassword: '', saving: false });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to reset password', severity: 'error' });
      setResetPwdModal((prev) => ({ ...prev, saving: false }));
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!deleteModal.user) return;
    setDeleteModal((prev) => ({ ...prev, deleting: true }));
    try {
      await api.delete(`/users/${deleteModal.user.id}`);
      setSnackbar({ open: true, message: `User ${deleteModal.user.email} deleted successfully!`, severity: 'success' });
      setDeleteModal({ open: false, user: null, deleting: false });
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to delete user', severity: 'error' });
      setDeleteModal((prev) => ({ ...prev, deleting: false }));
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BackButton fallbackUrl="/dashboard" />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F2942' }}>
              User Directory & Access Control
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage system users, assign institutional roles, update profiles, and handle account status
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          onClick={() => setCreateModalOpen(true)}
          startIcon={<i className="bi bi-person-plus-fill"></i>}
          sx={{ fontWeight: 700, borderRadius: 2 }}
        >
          Add New User
        </Button>
      </Box>

      {/* Filter Bar */}
      <Card sx={{ mb: 3, p: 1, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name, email, institution, or domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="bi bi-search" style={{ color: '#1565C0' }}></i>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
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
              <TextField
                fullWidth
                select
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active Only</MenuItem>
                <MenuItem value="false">Inactive Only</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button fullWidth variant="contained" onClick={fetchUsers} sx={{ height: 40, fontWeight: 700 }}>
                Filter
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
            description="No users matched your search criteria. You can create a new user or adjust filters."
            action={
              <Button variant="contained" onClick={() => setCreateModalOpen(true)}>
                Add User Now
              </Button>
            }
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name & Email</TableCell>
                  <TableCell>Institution & Dept</TableCell>
                  <TableCell>System Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Expertise / Domains</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => {
                  const roleStyle = ROLE_CONFIG[u.role] || ROLE_CONFIG.author;
                  const isActive = u.is_active !== false;
                  return (
                    <TableRow key={u.id} hover sx={{ opacity: isActive ? 1 : 0.65 }}>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F2942' }}>
                          {u.first_name} {u.last_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <i className="bi bi-envelope"></i> {u.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.institution || 'Independent'}</Typography>
                        <Typography variant="caption" color="text.secondary">{u.department || 'General'} &bull; {u.country || 'India'}</Typography>
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
                      <TableCell>
                        <Chip
                          label={isActive ? 'Active' : 'Deactivated'}
                          size="small"
                          color={isActive ? 'success' : 'default'}
                          variant="outlined"
                          sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        {u.expertise_keywords && Array.isArray(u.expertise_keywords) && u.expertise_keywords.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {u.expertise_keywords.slice(0, 3).map((k, idx) => (
                              <Chip key={idx} label={k} size="small" sx={{ fontSize: '0.675rem', backgroundColor: '#F0F6FC' }} />
                            ))}
                            {u.expertise_keywords.length > 3 && (
                              <Typography variant="caption" color="text.secondary">+{u.expertise_keywords.length - 3} more</Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">{u.domain || 'None listed'}</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="Edit User Profile & Role">
                            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(u)}>
                              <i className="bi bi-pencil-square"></i>
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={isActive ? 'Deactivate User' : 'Activate User'}>
                            <IconButton
                              size="small"
                              color={isActive ? 'warning' : 'success'}
                              onClick={() => handleToggleStatus(u)}
                            >
                              <i className={`bi ${isActive ? 'bi-person-slash' : 'bi-person-check'}`}></i>
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Reset Password">
                            <IconButton
                              size="small"
                              sx={{ color: '#D97706' }}
                              onClick={() => setResetPwdModal({ open: true, user: u, newPassword: '', saving: false })}
                            >
                              <i className="bi bi-key"></i>
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete User">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteModal({ open: true, user: u, deleting: false })}
                            >
                              <i className="bi bi-trash"></i>
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E2E8F0', color: '#0F2942' }}>
          Create New System User
        </DialogTitle>
        <Box component="form" onSubmit={handleCreateUser}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  required
                  size="small"
                  value={newUserData.firstName}
                  onChange={(e) => setNewUserData({ ...newUserData, firstName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  required
                  size="small"
                  value={newUserData.lastName}
                  onChange={(e) => setNewUserData({ ...newUserData, lastName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  required
                  size="small"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Temporary Password"
                  type="password"
                  required
                  size="small"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  helperText="At least 6 characters"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Assigned System Role"
                  required
                  size="small"
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                >
                  <MenuItem value="author">Author (Submit & Track Papers)</MenuItem>
                  <MenuItem value="reviewer">Reviewer (Peer Reviewer)</MenuItem>
                  <MenuItem value="admin">Administrator (Full Portal & Conference Access)</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  size="small"
                  value={newUserData.country}
                  onChange={(e) => setNewUserData({ ...newUserData, country: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Institution / University"
                  size="small"
                  value={newUserData.institution}
                  onChange={(e) => setNewUserData({ ...newUserData, institution: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  size="small"
                  value={newUserData.department}
                  onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Designation (e.g. Professor, Postdoc)"
                  size="small"
                  value={newUserData.designation}
                  onChange={(e) => setNewUserData({ ...newUserData, designation: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Max Review Assignments Limit"
                  type="number"
                  size="small"
                  value={newUserData.maxReviewLimit}
                  onChange={(e) => setNewUserData({ ...newUserData, maxReviewLimit: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Expertise Keywords (comma-separated)"
                  placeholder="e.g. Machine Learning, Cloud Security, IoT"
                  size="small"
                  value={newUserData.expertiseKeywords}
                  onChange={(e) => setNewUserData({ ...newUserData, expertiseKeywords: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E2E8F0' }}>
            <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={creatingUser}
              startIcon={creatingUser ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <i className="bi bi-check-lg" />}
              sx={{ fontWeight: 700 }}
            >
              {creatingUser ? 'Creating User...' : 'Create User'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E2E8F0', color: '#0F2942' }}>
          Edit User Profile & Permissions
        </DialogTitle>
        {editUserData && (
          <Box component="form" onSubmit={handleSaveUser}>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    required
                    size="small"
                    value={editUserData.firstName}
                    onChange={(e) => setEditUserData({ ...editUserData, firstName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    required
                    size="small"
                    value={editUserData.lastName}
                    onChange={(e) => setEditUserData({ ...editUserData, lastName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    required
                    size="small"
                    value={editUserData.email}
                    onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Assigned System Role"
                    required
                    size="small"
                    value={editUserData.role}
                    onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                  >
                    <MenuItem value="author">Author (Submit & Track Papers)</MenuItem>
                    <MenuItem value="reviewer">Reviewer (Peer Reviewer)</MenuItem>
                    <MenuItem value="admin">Administrator (Full Portal & Conference Access)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Institution / University"
                    size="small"
                    value={editUserData.institution || ''}
                    onChange={(e) => setEditUserData({ ...editUserData, institution: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    size="small"
                    value={editUserData.department || ''}
                    onChange={(e) => setEditUserData({ ...editUserData, department: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    size="small"
                    value={editUserData.country || ''}
                    onChange={(e) => setEditUserData({ ...editUserData, country: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Designation"
                    size="small"
                    value={editUserData.designation || ''}
                    onChange={(e) => setEditUserData({ ...editUserData, designation: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Domain / Primary Field"
                    size="small"
                    value={editUserData.domain || ''}
                    onChange={(e) => setEditUserData({ ...editUserData, domain: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max Review Limit"
                    type="number"
                    size="small"
                    value={editUserData.maxReviewLimit}
                    onChange={(e) => setEditUserData({ ...editUserData, maxReviewLimit: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Expertise Keywords (comma-separated)"
                    size="small"
                    value={editUserData.expertiseKeywords}
                    onChange={(e) => setEditUserData({ ...editUserData, expertiseKeywords: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editUserData.isActive}
                        onChange={(e) => setEditUserData({ ...editUserData, isActive: e.target.checked })}
                        color="success"
                      />
                    }
                    label={editUserData.isActive ? 'Account Active (User can log in)' : 'Account Deactivated (Access suspended)'}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E2E8F0' }}>
              <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={savingUser}
                startIcon={savingUser ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <i className="bi bi-save" />}
                sx={{ fontWeight: 700 }}
              >
                {savingUser ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPwdModal.open} onClose={() => setResetPwdModal({ open: false, user: null, newPassword: '', saving: false })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E2E8F0', color: '#0F2942' }}>
          Reset User Password
        </DialogTitle>
        <Box component="form" onSubmit={handleResetPassword}>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Enter a new temporary password for <strong>{resetPwdModal.user?.first_name} {resetPwdModal.user?.last_name}</strong> ({resetPwdModal.user?.email}):
            </Typography>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              required
              size="small"
              value={resetPwdModal.newPassword}
              onChange={(e) => setResetPwdModal({ ...resetPwdModal, newPassword: e.target.value })}
              helperText="Minimum 6 characters"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E2E8F0' }}>
            <Button onClick={() => setResetPwdModal({ open: false, user: null, newPassword: '', saving: false })}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="warning"
              disabled={resetPwdModal.saving || !resetPwdModal.newPassword}
              startIcon={resetPwdModal.saving ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <i className="bi bi-key" />}
              sx={{ fontWeight: 700 }}
            >
              {resetPwdModal.saving ? 'Resetting...' : 'Reset Password'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete User Confirmation Modal */}
      <ConfirmModal
        open={deleteModal.open}
        title="Delete User Permanently"
        message={`Are you sure you want to delete "${deleteModal.user?.first_name} ${deleteModal.user?.last_name}" (${deleteModal.user?.email})? All associated records will be permanently removed.`}
        confirmText={deleteModal.deleting ? 'Deleting...' : 'Delete User'}
        confirmColor="error"
        onConfirm={handleDeleteUser}
        onClose={() => setDeleteModal({ open: false, user: null, deleting: false })}
      />

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
