import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useConference } from '../../context/ConferenceContext';
import BackButton from '../../components/common/BackButton';
import ConfirmModal from '../../components/common/ConfirmModal';
import api from '../../services/api';

const EMAIL_TEMPLATES = [
  {
    name: 'Paper Submission Deadline Extension',
    subject: 'Paper Submission Deadline Extended for [Conference]',
    content: 'Dear Authors,\n\nDue to multiple requests, the Program Committee has decided to extend the paper submission deadline by one week. Please ensure all PDF manuscripts and supplementary files are finalized before the new deadline.\n\nBest regards,\nProgram Committee',
  },
  {
    name: 'Reviewer Evaluation Reminder',
    subject: 'Friendly Reminder: Peer Review Due Soon',
    content: 'Dear Reviewer,\n\nThis is a gentle reminder that the peer review deadline is approaching. Please log in to your Reviewer Workspace on the CJMS portal to review your assigned manuscripts and submit your evaluations.\n\nThank you for your valuable contribution to the peer review process.\n\nBest regards,\nProgram Chairs',
  },
  {
    name: 'Camera-Ready Preparation Instructions',
    subject: 'Instructions for Final Camera-Ready Paper Submission',
    content: 'Dear Authors,\n\nCongratulations again on the acceptance of your paper! Please follow the camera-ready guidelines and upload the final version along with presentation slides through your author dashboard.\n\nBest regards,\nConference Secretariat',
  },
];

export default function EmailBroadcastPage() {
  const { selectedConference } = useConference();

  const [targetGroup, setTargetGroup] = useState('authors');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [customEmails, setCustomEmails] = useState('');
  const [sending, setSending] = useState(false);
  const [confirmBroadcastOpen, setConfirmBroadcastOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ type: '', text: '' });

  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const fetchEmailLogs = async () => {
    if (!selectedConference?.id) return;
    try {
      setLoadingLogs(true);
      const res = await api.get(`/emails/logs/${selectedConference.id}`);
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to load email logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchEmailLogs();
  }, [selectedConference]);

  const handleApplyTemplate = (tmpl) => {
    const sub = tmpl.subject.replace('[Conference]', selectedConference?.short_name || 'Conference');
    setSubject(sub);
    setContent(tmpl.content);
  };

  const handleOpenBroadcastConfirmation = (e) => {
    e.preventDefault();
    if (!selectedConference?.id) return;
    setConfirmBroadcastOpen(true);
  };

  const handleExecuteBroadcast = async () => {
    setConfirmBroadcastOpen(false);
    setSending(true);
    setAlertInfo({ type: '', text: '' });

    try {
      const emailList = customEmails.split(',').map((e) => e.trim()).filter(Boolean);
      const res = await api.post('/emails/broadcast', {
        conferenceId: selectedConference.id,
        targetGroup,
        subject,
        content,
        customEmails: emailList,
      });

      setAlertInfo({
        type: 'success',
        text: res.data.message || 'Emails successfully broadcasted via Brevo API!',
      });

      setSubject('');
      setContent('');
      fetchEmailLogs();
    } catch (err) {
      setAlertInfo({
        type: 'error',
        text: err.response?.data?.error || 'Failed to dispatch broadcast emails',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <BackButton fallbackUrl="/dashboard" />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Brevo Email Communication & Broadcast Desk
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Dispatch announcements, reminders, and notifications via Brevo Email API with audit delivery logs
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Email Composer */}
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="bi bi-send text-primary"></i> Compose Email Broadcast
              </Typography>

              {alertInfo.text && <Alert severity={alertInfo.type} sx={{ mb: 2.5 }}>{alertInfo.text}</Alert>}

              {/* Template Presets */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
                  QUICK EMAIL TEMPLATES:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {EMAIL_TEMPLATES.map((tmpl, idx) => (
                    <Chip
                      key={idx}
                      label={tmpl.name}
                      onClick={() => handleApplyTemplate(tmpl)}
                      clickable
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>

              <Box component="form" onSubmit={handleOpenBroadcastConfirmation}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      label="Recipient Target Group"
                      value={targetGroup}
                      onChange={(e) => setTargetGroup(e.target.value)}
                    >
                      <MenuItem value="authors">All Paper Authors</MenuItem>
                      <MenuItem value="reviewers">All Program Committee Reviewers</MenuItem>
                      <MenuItem value="all">All Conference Users</MenuItem>
                      <MenuItem value="custom">Custom Email Addresses</MenuItem>
                    </TextField>
                  </Grid>

                  {targetGroup === 'custom' && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Custom Recipient Emails (comma separated)"
                        value={customEmails}
                        onChange={(e) => setCustomEmails(e.target.value)}
                        placeholder="author1@example.com, author2@example.com"
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject Line"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. [SS-ACIS 2026] Important Update Regarding Review Deadlines"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={7}
                      label="Email Body Content"
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your email announcement message here..."
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className="bi bi-shield-check text-success"></i>
                    <Typography variant="caption" color="text.secondary">
                      Powered by <strong>Brevo Transactional SMTP API</strong>
                    </Typography>
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={sending}
                    startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <i className="bi bi-send-fill"></i>}
                    sx={{ px: 3, py: 1.2, fontWeight: 700, background: 'linear-gradient(135deg, #123B32 0%, #2F5B4E 100%)', '&:hover': { background: '#0B241E' } }}
                  >
                    {sending ? 'Dispatching via Brevo...' : 'Broadcast Email'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Live HTML Preview */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%', p: 1, border: '1px solid #D3DDD7' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#123B32' }}>
                <i className="bi bi-eye" style={{ color: '#123B32' }}></i> Live Email Template Preview
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  border: '1px solid #D3DDD7',
                  borderRadius: 2,
                  overflow: 'hidden',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <Box sx={{ background: 'linear-gradient(135deg, #123B32 0%, #2F5B4E 100%)', p: 2.5, color: '#fff', textAlign: 'center' }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 0.75,
                      borderRadius: 2,
                      backgroundColor: '#FFFFFF',
                      mb: 1,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    <Box
                      component="img"
                      src="/logo.png"
                      alt="Shazu Soft Logo"
                      sx={{
                        height: 38,
                        width: 38,
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Shazu Soft Technologies CJMS
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                    {selectedConference?.name || 'Conference & Journal Management System'}
                  </Typography>
                </Box>

                <Box sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#123B32' }}>
                    {subject || 'Subject Preview...'}
                  </Typography>
                  <Divider sx={{ mb: 2, borderColor: '#D3DDD7' }} />
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#334E43', minHeight: 120 }}>
                    {content || 'Email content preview will appear here in real-time as you type...'}
                  </Typography>
                </Box>

                <Box sx={{ backgroundColor: '#F8FAFC', p: 1.5, textAlign: 'center', borderTop: '1px solid #E2E8F0' }}>
                  <Typography variant="caption" color="text.secondary">
                    © {new Date().getFullYear()} Shazu Soft Technologies. All rights reserved.
                  </Typography>
                </Box>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Delivery Logs Table */}
        <Grid item xs={12}>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="bi bi-clock-history text-primary"></i> Brevo Email Dispatch History Logs
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Recipient</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Template</TableCell>
                      <TableCell>Delivery Status</TableCell>
                      <TableCell>Brevo Message ID</TableCell>
                      <TableCell align="right">Dispatched At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">No emails recorded in delivery log yet.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log) => (
                        <TableRow key={log.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {log.recipient_name || log.recipient_email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {log.recipient_email}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 280 }}>
                            <Typography variant="body2" noWrap>
                              {log.subject}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={log.template_name} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={log.status?.toUpperCase()}
                              size="small"
                              color={log.status === 'sent' ? 'success' : 'error'}
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                              {log.brevo_message_id ? log.brevo_message_id.slice(0, 20) + '...' : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" color="text.secondary">
                              {new Date(log.sent_at).toLocaleString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Broadcast Email Confirmation Modal */}
      <ConfirmModal
        open={confirmBroadcastOpen}
        title="Confirm Mass Email Broadcast"
        message={`Are you sure you want to dispatch this email broadcast to "${targetGroup === 'authors' ? 'All Paper Authors' : targetGroup === 'reviewers' ? 'All Program Committee Reviewers' : targetGroup === 'all' ? 'All Conference Users' : 'Specified Custom Recipients'}" with subject "${subject}"? This action will immediately send live emails via Brevo SMTP.`}
        confirmText="Yes, Dispatch Broadcast"
        cancelText="Review Email"
        severity="warning"
        loading={sending}
        onConfirm={handleExecuteBroadcast}
        onCancel={() => setConfirmBroadcastOpen(false)}
      />
    </Box>
  );
}
