import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
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
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import BackButton from '../../components/common/BackButton';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useConference } from '../../context/ConferenceContext';
import api from '../../services/api';

export default function InvitationPage() {
  const { conferences, selectedConference, setSelectedConference } = useConference();

  // Conference Selection State
  const [activeConfId, setActiveConfId] = useState('');
  const [activeRole, setActiveRole] = useState('author'); // 'author' | 'reviewer'
  const [inputTab, setInputTab] = useState(0); // 0: CSV Upload, 1: Direct Paste

  // Direct Input & CSV file State
  const [rawTextEmails, setRawTextEmails] = useState('');
  const [csvFileName, setCsvFileName] = useState('');
  const [parsedRecipients, setParsedRecipients] = useState([]);
  const [parseStats, setParseStats] = useState({ total: 0, valid: 0, duplicates: 0, invalid: 0 });

  // Customization
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  // Execution & Progress State
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ type: '', text: '' });

  // History State
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fileInputRef = useRef(null);

  // Sync selected conference
  useEffect(() => {
    if (selectedConference?.id) {
      setActiveConfId(selectedConference.id);
    } else if (conferences?.length > 0 && !activeConfId) {
      setActiveConfId(conferences[0].id);
    }
  }, [selectedConference, conferences]);

  // Update default subject when conference or role changes
  useEffect(() => {
    const currentConf = conferences?.find((c) => String(c.id) === String(activeConfId)) || selectedConference;
    const confName = currentConf?.short_name || currentConf?.name || 'Academic Conference';

    if (activeRole === 'author') {
      setCustomSubject(`[Call for Papers] Invitation to Submit to ${confName}`);
      setCustomMessage(`We cordially invite you and your research team to submit original, unpublished research papers to ${confName}. All accepted papers will undergo rigorous peer review.`);
    } else {
      setCustomSubject(`[${confName}] Invitation to Join Technical Program Committee`);
      setCustomMessage(`You have been recommended as a distinguished subject matter expert to serve as a Peer Reviewer and Technical Program Committee member for ${confName}.`);
    }
  }, [activeConfId, activeRole, conferences, selectedConference]);

  // Fetch invitation history
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get('/invitations/history', {
        params: { conferenceId: activeConfId || undefined, limit: 30 },
      });
      setHistoryLogs(res.data.invitations || []);
    } catch (err) {
      console.error('Failed to fetch invitation history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [activeConfId]);

  // Parse Raw Text Emails
  const handleParseText = (text) => {
    setRawTextEmails(text);
    if (!text.trim()) {
      setParsedRecipients([]);
      setParseStats({ total: 0, valid: 0, duplicates: 0, invalid: 0 });
      return;
    }

    const lines = text.split(/[\n,;]+/);
    processEmailList(lines.map((l) => l.trim()));
  };

  // Process and de-duplicate list of strings or objects
  const processEmailList = (items) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const seen = new Set();
    const validList = [];
    let dupCount = 0;
    let invCount = 0;

    items.forEach((item) => {
      let email = '';
      let name = '';
      let institution = '';

      if (typeof item === 'string') {
        // Match formats like "John Doe <john@example.com>" or just "john@example.com"
        const angleMatch = item.match(/^(.*?)\s*<([^\s@]+@[^\s@]+\.[^\s@]+)>$/);
        if (angleMatch) {
          name = angleMatch[1].replace(/["']/g, '').trim();
          email = angleMatch[2].toLowerCase().trim();
        } else {
          email = item.replace(/["']/g, '').toLowerCase().trim();
        }
      } else if (item && typeof item === 'object') {
        email = (item.email || '').toLowerCase().trim();
        name = (item.name || `${item.first_name || ''} ${item.last_name || ''}`).trim();
        institution = (item.institution || item.organization || '').trim();
      }

      if (!email) return;

      if (!emailRegex.test(email)) {
        invCount++;
        return;
      }

      if (seen.has(email)) {
        dupCount++;
        return;
      }

      seen.add(email);
      validList.push({
        email,
        name: name || '',
        institution: institution || '',
        status: 'ready',
      });
    });

    setParsedRecipients(validList);
    setParseStats({
      total: items.length,
      valid: validList.length,
      duplicates: dupCount,
      invalid: invCount,
    });
  };

  // Handle CSV File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== 'string') return;

      parseCsvContent(content);
    };
    reader.readAsText(file);
  };

  // Basic CSV Parser
  const parseCsvContent = (csvText) => {
    const lines = csvText.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return;

    // Check if header row exists
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('email') || firstLine.includes('mail');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    const items = [];

    // Identify column indices if header exists
    let emailIdx = 0;
    let nameIdx = 1;
    let instIdx = 2;

    if (hasHeader) {
      const headers = lines[0].split(',').map((h) => h.replace(/["']/g, '').trim().toLowerCase());
      emailIdx = headers.findIndex((h) => h.includes('email') || h.includes('mail'));
      if (emailIdx === -1) emailIdx = 0;
      nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('author') || h.includes('reviewer'));
      instIdx = headers.findIndex((h) => h.includes('institution') || h.includes('org') || h.includes('univ'));
    }

    dataLines.forEach((line) => {
      // Split by comma ignoring commas inside quotes
      const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      const cleanCols = cols.map((c) => c.replace(/^["']|["']$/g, '').trim());

      const email = cleanCols[emailIdx] || '';
      const name = nameIdx !== -1 ? cleanCols[nameIdx] || '' : '';
      const institution = instIdx !== -1 ? cleanCols[instIdx] || '' : '';

      if (email) {
        items.push({ email, name, institution });
      }
    });

    processEmailList(items);
  };

  // Remove recipient from list
  const handleRemoveRecipient = (index) => {
    const updated = [...parsedRecipients];
    updated.splice(index, 1);
    setParsedRecipients(updated);
    setParseStats((prev) => ({ ...prev, valid: updated.length }));
  };

  // Download Sample CSV template
  const handleDownloadSampleCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      encodeURIComponent(
        'email,name,institution\n' +
          'dr.alan.turing@cambridge.edu,"Dr. Alan Turing","University of Cambridge"\n' +
          'grace.hopper@yale.edu,"Prof. Grace Hopper","Yale University"\n' +
          'claude.shannon@mit.edu,"Dr. Claude Shannon","MIT Research Lab"\n'
      );
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `sample_invitation_${activeRole}s.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit Invitations
  const handleSendInvitations = async () => {
    setConfirmModalOpen(false);
    if (!activeConfId) {
      setAlertInfo({ type: 'error', text: 'Please select an active Conference or Journal.' });
      return;
    }
    if (parsedRecipients.length === 0) {
      setAlertInfo({ type: 'error', text: 'Please upload or paste at least one valid recipient email.' });
      return;
    }

    setSending(true);
    setSendProgress(20);
    setAlertInfo({ type: '', text: '' });

    try {
      setSendProgress(50);
      const res = await api.post('/invitations/bulk', {
        conferenceId: activeConfId,
        role: activeRole,
        recipients: parsedRecipients,
        customSubject: customSubject.trim(),
        customMessage: customMessage.trim(),
      });

      setSendProgress(100);
      setResultData(res.data);
      setResultModalOpen(true);
      setAlertInfo({
        type: 'success',
        text: `Invitations successfully dispatched! ${res.data.sentCount} emails sent.`,
      });

      // Reset form
      setParsedRecipients([]);
      setRawTextEmails('');
      setCsvFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setParseStats({ total: 0, valid: 0, duplicates: 0, invalid: 0 });

      // Refresh history
      fetchHistory();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to send bulk invitations';
      setAlertInfo({ type: 'error', text: msg });
    } finally {
      setSending(false);
      setSendProgress(0);
    }
  };

  const currentConferenceObj = conferences?.find((c) => String(c.id) === String(activeConfId));

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1300, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <BackButton />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mt: 1 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#123B32', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <i className="bi bi-envelope-paper-heart-fill" style={{ color: '#1B5E20' }} />
              CMT Invitation Desk
            </Typography>
            <Typography variant="body2" sx={{ color: '#334E43', mt: 0.5 }}>
              Invite researchers and scholars as <strong>Authors (Call for Papers)</strong> or <strong>Peer Reviewers (Program Committee)</strong> via CSV upload or bulk email list.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Alerts */}
      {alertInfo.text && (
        <Alert severity={alertInfo.type} sx={{ mb: 3 }} onClose={() => setAlertInfo({ type: '', text: '' })}>
          {alertInfo.text}
        </Alert>
      )}

      {/* Main Grid */}
      <Grid container spacing={3}>
        {/* Step 1: Configuration & Target Selection */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#123B32', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ backgroundColor: '#E8F5E9', color: '#1B5E20', borderRadius: '50%', width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>1</span>
                Publication & Role Setup
              </Typography>

              {/* Conference / Journal Selector */}
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="conf-select-label">Select Journal / Conference</InputLabel>
                  <Select
                    labelId="conf-select-label"
                    value={activeConfId}
                    label="Select Journal / Conference"
                    onChange={(e) => {
                      setActiveConfId(e.target.value);
                      const conf = conferences?.find((c) => c.id === e.target.value);
                      if (conf && setSelectedConference) setSelectedConference(conf);
                    }}
                  >
                    {conferences?.map((conf) => (
                      <MenuItem key={conf.id} value={conf.id}>
                        {conf.short_name} — {conf.name} ({conf.status || 'Active'})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {currentConferenceObj && (
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip size="small" label={`Status: ${currentConferenceObj.status || 'Active'}`} sx={{ backgroundColor: '#E8EFEB', color: '#123B32', fontWeight: 600 }} />
                    {currentConferenceObj.submission_deadline && (
                      <Chip size="small" label={`Deadline: ${new Date(currentConferenceObj.submission_deadline).toLocaleDateString()}`} sx={{ backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: 600 }} />
                    )}
                  </Box>
                )}
              </Box>

              {/* Role Toggle */}
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#334E43', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
                Select Invitation Role
              </Typography>
              <Grid container spacing={1.5} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Box
                    onClick={() => setActiveRole('author')}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: activeRole === 'author' ? '#1B5E20' : '#E2E8F0',
                      backgroundColor: activeRole === 'author' ? '#F1F8E9' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                      '&:hover': { borderColor: '#1B5E20', transform: 'translateY(-1px)' },
                    }}
                  >
                    <i className="bi bi-file-earmark-person" style={{ fontSize: '1.8rem', color: activeRole === 'author' ? '#1B5E20' : '#64748B' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: activeRole === 'author' ? '#1B5E20' : '#334E43', mt: 0.5 }}>
                      Author / Researcher
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>
                      Call for Papers & Submissions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    onClick={() => setActiveRole('reviewer')}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: activeRole === 'reviewer' ? '#1565C0' : '#E2E8F0',
                      backgroundColor: activeRole === 'reviewer' ? '#EFF6FF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                      '&:hover': { borderColor: '#1565C0', transform: 'translateY(-1px)' },
                    }}
                  >
                    <i className="bi bi-award" style={{ fontSize: '1.8rem', color: activeRole === 'reviewer' ? '#1565C0' : '#64748B' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: activeRole === 'reviewer' ? '#1565C0' : '#334E43', mt: 0.5 }}>
                      Peer Reviewer
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>
                      Program Committee (TPC)
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Step 3: Message Customization */}
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#123B32', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ backgroundColor: '#E8F5E9', color: '#1B5E20', borderRadius: '50%', width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>2</span>
                Email Message Customization
              </Typography>

              <TextField
                fullWidth
                size="small"
                label="Email Subject Line"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                label="Custom Invitation Note / Message"
                placeholder="Add special notes, track details, or instructions..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                helperText="Included inside the official notification email sent via Hostinger SMTP"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Step 2: Email & CSV Input Area */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#123B32', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ backgroundColor: '#E8F5E9', color: '#1B5E20', borderRadius: '50%', width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>3</span>
                  Provide Recipient Emails
                </Typography>

                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleDownloadSampleCsv}
                  startIcon={<i className="bi bi-file-earmark-arrow-down" />}
                  sx={{ borderColor: '#CBD5E1', color: '#334E43', textTransform: 'none', borderRadius: 2 }}
                >
                  Download Sample CSV
                </Button>
              </Box>

              {/* Tabs: Upload CSV vs Paste Text */}
              <Tabs
                value={inputTab}
                onChange={(_, val) => setInputTab(val)}
                sx={{
                  borderBottom: '1px solid #E2E8F0',
                  mb: 2,
                  '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, minHeight: 40 },
                }}
              >
                <Tab label="CSV File Upload" icon={<i className="bi bi-cloud-arrow-up me-1" />} iconPosition="start" />
                <Tab label="Paste Emails Directly" icon={<i className="bi bi-textarea-t me-1" />} iconPosition="start" />
              </Tabs>

              {/* Tab 0: CSV Upload Area */}
              {inputTab === 0 && (
                <Box
                  sx={{
                    border: '2px dashed #94A3B8',
                    borderRadius: 3,
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: '#1B5E20', backgroundColor: '#F1F8E9' },
                    mb: 2,
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv, text/csv, text/plain"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <i className="bi bi-file-earmark-spreadsheet" style={{ fontSize: '2.5rem', color: '#1B5E20' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#123B32', mt: 1 }}>
                    {csvFileName ? `Selected: ${csvFileName}` : 'Click or Drag & Drop CSV File'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    CSV columns supported: <code>email, name, institution</code>
                  </Typography>
                </Box>
              )}

              {/* Tab 1: Paste Text Area */}
              {inputTab === 1 && (
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Enter email addresses separated by commas, semicolons, or new lines...&#10;e.g.&#10;john.doe@university.edu&#10;Prof. Sarah Connor <sarah@institute.org>&#10;alex@research.lab"
                    value={rawTextEmails}
                    onChange={(e) => handleParseText(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#F8FAFC',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </Box>
              )}

              {/* Parse Statistics Badges */}
              {parseStats.total > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
                  <Chip
                    size="small"
                    label={`Valid Recipients: ${parseStats.valid}`}
                    sx={{ backgroundColor: '#DCFCE7', color: '#166534', fontWeight: 700 }}
                  />
                  {parseStats.duplicates > 0 && (
                    <Chip
                      size="small"
                      label={`Duplicates Removed: ${parseStats.duplicates}`}
                      sx={{ backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: 600 }}
                    />
                  )}
                  {parseStats.invalid > 0 && (
                    <Chip
                      size="small"
                      label={`Invalid Formats Skipped: ${parseStats.invalid}`}
                      sx={{ backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: 600 }}
                    />
                  )}
                </Box>
              )}

              {/* Recipient Preview Table */}
              <Box sx={{ flexGrow: 1, minHeight: 180, maxHeight: 240, overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ '& th': { backgroundColor: '#F8FAFC', fontWeight: 700, color: '#334E43' } }}>
                        <TableCell width={30}>#</TableCell>
                        <TableCell>Email Address</TableCell>
                        <TableCell>Recipient Name</TableCell>
                        <TableCell>Institution / Affiliation</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {parsedRecipients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#94A3B8' }}>
                            No recipient emails loaded yet. Upload a CSV or paste emails above.
                          </TableCell>
                        </TableRow>
                      ) : (
                        parsedRecipients.map((rec, idx) => (
                          <TableRow key={rec.email} hover>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#123B32' }}>{rec.email}</TableCell>
                            <TableCell>{rec.name || <span style={{ color: '#94A3B8' }}>Auto-inferred</span>}</TableCell>
                            <TableCell>{rec.institution || <span style={{ color: '#94A3B8' }}>Default</span>}</TableCell>
                            <TableCell align="right">
                              <IconButton size="small" color="error" onClick={() => handleRemoveRecipient(idx)}>
                                <i className="bi bi-trash" style={{ fontSize: '0.85rem' }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Dispatch Action */}
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Total to invite: <strong>{parsedRecipients.length}</strong> {activeRole === 'author' ? 'Authors' : 'Reviewers'}
                </Typography>

                <Button
                  variant="contained"
                  disabled={sending || parsedRecipients.length === 0 || !activeConfId}
                  onClick={() => setConfirmModalOpen(true)}
                  startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <i className="bi bi-send-check" />}
                  sx={{
                    backgroundColor: activeRole === 'author' ? '#1B5E20' : '#1565C0',
                    '&:hover': { backgroundColor: activeRole === 'author' ? '#144A18' : '#0D47A1' },
                    px: 3,
                    py: 1,
                    fontWeight: 700,
                    borderRadius: 2,
                    textTransform: 'none',
                  }}
                >
                  {sending ? 'Dispatching Invitations...' : `Send Invitations (${parsedRecipients.length})`}
                </Button>
              </Box>

              {sending && (
                <Box sx={{ width: '100%', mt: 2 }}>
                  <LinearProgress variant="determinate" value={sendProgress} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Section: Invitation History Logs */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#123B32', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className="bi bi-clock-history" style={{ color: '#1B5E20' }} />
                    Recent Invitation Dispatch History
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    Audit record of invitations sent via email
                  </Typography>
                </Box>
                <Button size="small" variant="outlined" onClick={fetchHistory} startIcon={<i className="bi bi-arrow-clockwise" />} sx={{ textTransform: 'none', borderRadius: 2 }}>
                  Refresh Logs
                </Button>
              </Box>

              {loadingHistory ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : historyLogs.length === 0 ? (
                <Alert severity="info" sx={{ my: 1 }}>
                  No invitations recorded yet for this selection.
                </Alert>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ '& th': { backgroundColor: '#F8FAFC', fontWeight: 700, color: '#334E43' } }}>
                        <TableCell>Recipient Email</TableCell>
                        <TableCell>Recipient Name</TableCell>
                        <TableCell>Invitation Type</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Sent Timestamp</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyLogs.map((log) => (
                        <TableRow key={log.id} hover>
                          <TableCell sx={{ fontWeight: 600, color: '#123B32' }}>{log.recipient_email}</TableCell>
                          <TableCell>{log.recipient_name || '—'}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={log.template_name === 'committee_invitation' ? 'Reviewer (TPC)' : 'Author (Call for Papers)'}
                              sx={{
                                backgroundColor: log.template_name === 'committee_invitation' ? '#EFF6FF' : '#F1F8E9',
                                color: log.template_name === 'committee_invitation' ? '#1D4ED8' : '#15803D',
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {log.subject}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={log.status || 'delivered'}
                              sx={{
                                backgroundColor: log.status === 'failed' ? '#FEE2E2' : '#DCFCE7',
                                color: log.status === 'failed' ? '#991B1B' : '#166534',
                                fontWeight: 700,
                                textTransform: 'capitalize',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#64748B', fontSize: '0.8rem' }}>
                            {new Date(log.sent_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={confirmModalOpen}
        title={`Confirm Bulk ${activeRole === 'author' ? 'Author' : 'Reviewer'} Invitation`}
        message={`Are you sure you want to dispatch invitations to ${parsedRecipients.length} recipients for ${currentConferenceObj?.short_name || 'the selected publication'}? Accounts will be automatically provisioned with secure temporary credentials if not already registered.`}
        confirmText="Confirm & Send"
        confirmColor={activeRole === 'author' ? 'success' : 'primary'}
        onConfirm={handleSendInvitations}
        onCancel={() => setConfirmModalOpen(false)}
      />

      {/* Result Modal */}
      <Dialog open={resultModalOpen} onClose={() => setResultModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#123B32', display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className="bi bi-check-circle-fill" style={{ color: '#166534', fontSize: '1.4rem' }} />
          Bulk Invitation Summary
        </DialogTitle>
        <DialogContent dividers>
          {resultData && (
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#123B32', mb: 2 }}>
                {resultData.message}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#166534' }}>
                      {resultData.sentCount}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#15803D' }}>
                      Successfully Sent
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: resultData.failedCount > 0 ? '#FEF2F2' : '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: resultData.failedCount > 0 ? '#991B1B' : '#64748B' }}>
                      {resultData.failedCount}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                      Failed / Skipped
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Typography variant="caption" color="text.secondary">
                All recipients will receive invitation links and credentials directly in their inboxes.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="contained" onClick={() => setResultModalOpen(false)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
