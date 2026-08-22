import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Paper,
  Divider,
} from '@mui/material';
import { useConference } from '../../context/ConferenceContext';
import api from '../../services/api';

export default function ReportsPage() {
  const { selectedConference } = useConference();

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedConference?.id) return;
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/reports/conference/${selectedConference.id}/summary`);
        setReportData(res.data);
      } catch (err) {
        console.error('Failed to load conference reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [selectedConference]);

  const handleExportCSV = () => {
    if (!reportData?.papersExport) return;
    const headers = ['Submission ID', 'Title', 'Track', 'Author', 'Email', 'Institution', 'Status', 'Decision', 'Avg Score', 'Review Count'];
    const rows = reportData.papersExport.map((p) => [
      `"${p.submission_number}"`,
      `"${(p.title || '').replace(/"/g, '""')}"`,
      `"${p.track_name || 'General'}"`,
      `"${p.primary_author || ''}"`,
      `"${p.author_email || ''}"`,
      `"${p.author_institution || ''}"`,
      `"${p.status}"`,
      `"${p.decision || 'Pending'}"`,
      `"${p.avg_score || 'N/A'}"`,
      `"${p.review_count || 0}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedConference?.short_name || 'Conference'}_Submissions_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Conference Analytics & Export Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive track distribution, review completion metrics, and paper export data
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleExportCSV}
          startIcon={<i className="bi bi-file-earmark-spreadsheet-fill"></i>}
        >
          Export CSV Report
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Track Submissions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 1 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="bi bi-pie-chart text-primary"></i> Submissions by Track
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Track Name</TableCell>
                      <TableCell align="right">Papers Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData?.trackSubmissions?.map((t) => (
                      <TableRow key={t.track_id}>
                        <TableCell sx={{ fontWeight: 600 }}>{t.track_name}</TableCell>
                        <TableCell align="right">
                          <Chip label={t.submission_count} size="small" color="primary" sx={{ fontWeight: 700 }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Reviewer Progress */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 1 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="bi bi-person-check text-primary"></i> Reviewer Progress & Workload
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Reviewer</TableCell>
                      <TableCell>Institution</TableCell>
                      <TableCell align="right">Progress</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData?.reviewerProgress?.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {r.first_name} {r.last_name}
                        </TableCell>
                        <TableCell>{r.institution || '-'}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${r.completed_count} / ${r.assigned_count} Completed`}
                            size="small"
                            color={parseInt(r.completed_count, 10) === parseInt(r.assigned_count, 10) && parseInt(r.assigned_count, 10) > 0 ? 'success' : 'default'}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Papers Master Export Table */}
        <Grid item xs={12}>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="bi bi-table text-primary"></i> Master Paper Data Table
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Submission ID</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Track</TableCell>
                      <TableCell>Primary Author</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Decision</TableCell>
                      <TableCell align="right">Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData?.papersExport?.map((p, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#1E3A8A' }}>
                          {p.submission_number}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 280 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                            {p.title}
                          </Typography>
                        </TableCell>
                        <TableCell>{p.track_name || 'General'}</TableCell>
                        <TableCell>{p.primary_author}</TableCell>
                        <TableCell>
                          <Chip label={p.status} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={p.decision?.toUpperCase() || 'PENDING'}
                            size="small"
                            color={p.decision === 'accept' ? 'success' : p.decision === 'reject' ? 'error' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {p.avg_score ? `${p.avg_score} / 5` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
