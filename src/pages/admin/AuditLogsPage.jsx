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
} from '@mui/material';
import api from '../../services/api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/audit-logs');
        setLogs(res.data.logs || []);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          System Activity & Audit Logs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Chronological record of key conference events, submissions, assignments, reviews, and decisions
        </Typography>
      </Box>

      <Card sx={{ p: 1 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Action Event</TableCell>
                <TableCell>Actor / User</TableCell>
                <TableCell>Entity Type</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip label={log.action} size="small" sx={{ fontWeight: 700, backgroundColor: '#EFF6FF', color: '#1E40AF' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {log.first_name ? `${log.first_name} ${log.last_name}` : 'System'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {log.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={log.entity_type || 'system'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 360 }}>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#334155' }}>
                      {JSON.stringify(log.details)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
