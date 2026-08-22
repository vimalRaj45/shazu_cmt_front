import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Paper,
  Divider,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function GuidePage() {
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const { switchActiveRole } = useAuth();

  const handleSwitchRoleAndNavigate = (role, path) => {
    switchActiveRole(role);
    navigate(path);
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          mb: 3.5,
          background: 'linear-gradient(135deg, #0F2942 0%, #1565C0 100%)',
          color: '#FFFFFF',
          borderRadius: 3,
          p: { xs: 2.5, md: 3.5 },
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Chip
            label="OFFICIAL USER GUIDE"
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              color: '#FFFFFF',
              fontWeight: 700,
              letterSpacing: '0.06em',
            }}
          />
          <Typography variant="caption" sx={{ color: '#E3F2FD', fontWeight: 600 }}>
            Shazu Soft Conference Management Tool (CMT)
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
          End-to-End System & Workflow Guide
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.95, maxWidth: 740, color: '#E3F2FD', lineHeight: 1.6 }}>
          Learn how to manage the full lifecycle of academic conferences—from conference setup and manuscript submission to double-blind peer review, conflict-free assignments, decisions, camera-ready approvals, and session agendas.
        </Typography>
      </Paper>

      {/* Navigation Tabs */}
      <Card sx={{ mb: 3, border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newVal) => setTabValue(newVal)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            borderBottom: '1px solid #E2E8F0',
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '0.875rem',
              py: 2,
              color: '#64748B',
              '&.Mui-selected': { color: '#1565C0' },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#1565C0',
              height: 3,
            },
          }}
        >
          <Tab label="1. Overview & Roles" icon={<i className="bi bi-grid"></i>} iconPosition="start" />
          <Tab label="2. Chair Playbook" icon={<i className="bi bi-briefcase"></i>} iconPosition="start" />
          <Tab label="3. Author Submission Guide" icon={<i className="bi bi-file-earmark-text"></i>} iconPosition="start" />
          <Tab label="4. Reviewer Evaluation Guide" icon={<i className="bi bi-journal-check"></i>} iconPosition="start" />
          <Tab label="5. Camera-Ready & Proceedings" icon={<i className="bi bi-award"></i>} iconPosition="start" />
          <Tab label="6. API & Testing" icon={<i className="bi bi-code-slash"></i>} iconPosition="start" />
        </Tabs>
      </Card>

      {/* Tab 0: Overview & Roles */}
      {tabValue === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Roles Grid */}
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F2942' }}>
            System Roles & Core Responsibilities
          </Typography>

          <Grid container spacing={2.5}>
            {[
              {
                role: 'Administrator',
                roleKey: 'admin',
                desc: 'Manages complete conference governance: creates conferences & tracks, assigns reviewers with automated Conflict of Interest checks, makes paper decisions, schedules presentation sessions, broadcasts Brevo emails, manages user roles, and monitors audit logs.',
                actions: ['Conference & Track Setup', 'Reviewer Assignment & COI Matrix', 'Paper Decisions Desk', 'Sessions & Agendas', 'Brevo Broadcasts', 'User Directory & Audit Logs'],
                link: '/chair/submissions',
                btnText: 'Open Admin Workspace',
                icon: 'bi-shield-lock',
                accentColor: '#1565C0',
                gridSize: 4,
              },
              {
                role: 'Peer Reviewer',
                roleKey: 'reviewer',
                desc: 'Evaluates assigned manuscripts under a double-blind process across 5 structured technical criteria, provides constructive feedback, and submits scorecards.',
                actions: ['Download Double-Blind PDF', '5-Point Structured Evaluation', 'Confidential Chair Notes', 'Save Drafts & Submit Final'],
                link: '/reviewer/workspace',
                btnText: 'Open Reviewer Workspace',
                icon: 'bi-journal-check',
                accentColor: '#0284C7',
                gridSize: 4,
              },
              {
                role: 'Paper Author',
                roleKey: 'author',
                desc: 'Submits research manuscripts with co-authors, uploads PDF files directly to Cloudflare R2, tracks peer evaluation outcomes, uploads revisions, and submits camera-ready papers.',
                actions: ['Submit New Paper', 'Manage Co-Authors & Affiliations', 'Track Review Status', 'Upload Revisions & Camera-Ready'],
                link: '/submit-paper',
                btnText: 'Submit Paper',
                icon: 'bi-file-earmark-text',
                accentColor: '#15803D',
                gridSize: 4,
              },
            ].map((item, idx) => (
              <Grid item xs={12} md={item.gridSize} key={idx}>
                <Card sx={{ height: '100%', border: '1px solid #E2E8F0', borderRadius: 2.5, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ height: 3, backgroundColor: item.accentColor, width: '100%' }} />
                  <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <i className={`bi ${item.icon}`} style={{ color: item.accentColor, fontSize: '1.1rem' }}></i>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F2942' }}>
                        {item.role}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem', lineHeight: 1.5, flexGrow: 1 }}>
                      {item.desc}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#1565C0', display: 'block', mb: 0.5 }}>
                        KEY CAPABILITIES:
                      </Typography>
                      {item.actions.map((act, i) => (
                        <Typography key={i} variant="caption" sx={{ display: 'block', color: '#475569', fontSize: '0.75rem', mb: 0.25 }}>
                          • {act}
                        </Typography>
                      ))}
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={() => handleSwitchRoleAndNavigate(item.roleKey, item.link)}
                    >
                      {item.btnText} →
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Workflow Pipeline */}
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 2.5, backgroundColor: '#FFFFFF', mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F2942', mb: 2 }}>
              Conference Workflow Lifecycle Pipeline
            </Typography>

            <Grid container spacing={2}>
              {[
                { step: '1', title: 'Conference Setup', desc: 'Create tracks, event dates, and submission deadlines.' },
                { step: '2', title: 'Paper Submissions', desc: 'Authors submit papers and upload manuscripts to Cloudflare R2.' },
                { step: '3', title: 'Reviewer Assignment', desc: 'Chair checks automated COI matrix and assigns reviewers.' },
                { step: '4', title: 'Peer Review', desc: 'Reviewers evaluate manuscripts across 5-point scorecards.' },
                { step: '5', title: 'Paper Decisions', desc: 'Chair calibrates scores and publishes Accept/Reject decisions.' },
                { step: '6', title: 'Camera-Ready & Proceedings', desc: 'Authors upload final PDF; Chair approves and organizes sessions.' },
              ].map((pipe, i) => (
                <Grid item xs={12} sm={6} md={2} key={i}>
                  <Box sx={{ p: 2, backgroundColor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', height: '100%' }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: '#1565C0',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        mb: 1,
                      }}
                    >
                      {pipe.step}
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F2942', mb: 0.5 }}>
                      {pipe.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                      {pipe.desc}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      )}

      {/* Tab 1: Chair Playbook */}
      {tabValue === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F2942' }}>
            Program Chair Playbook
          </Typography>

          <Accordion defaultExpanded elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<i className="bi bi-chevron-down"></i>}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1565C0' }}>
                Step 1: Conference Configuration & Track Setup
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ color: '#334155', mb: 1.5 }}>
                1. Go to <strong>Conferences</strong> (`/conferences`) and click <strong>Create Conference</strong>.
                <br />2. Fill in Conference Name, Short Name (e.g. `ICAI-2026`), Venue, and Start/End Dates.
                <br />3. Configure Deadlines: <em>Submission Deadline</em>, <em>Peer Review Due Date</em>, <em>Decisions Notification</em>, and <em>Camera-Ready Due Date</em>.
                <br />4. Define Technical Tracks (e.g., <em>Track 1: Deep Learning</em>, <em>Track 2: Cloud & Distributed Systems</em>).
              </Typography>
              <Button size="small" variant="outlined" onClick={() => handleSwitchRoleAndNavigate('chair', '/conferences')}>
                Go to Conferences Management →
              </Button>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<i className="bi bi-chevron-down"></i>}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1565C0' }}>
                Step 2: Reviewer Pool & Conflict of Interest (COI) Assignment
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ color: '#334155', mb: 1.5 }}>
                1. Navigate to <strong>Assign Reviewers</strong> (`/chair/reviewers`).
                <br />2. Select a submitted paper from the dropdown list.
                <br />3. The system executes the <strong>Automated Conflict of Interest Analyzer</strong>:
                <br />&nbsp;&nbsp;• Flags reviewers from the same institution or email domain as any paper author.
                <br />&nbsp;&nbsp;• Automatically disables the assignment button if a conflict exists.
                <br />4. Click <strong>Assign Paper</strong> next to conflict-free reviewers (2+ reviewers recommended per paper).
              </Typography>
              <Button size="small" variant="outlined" onClick={() => handleSwitchRoleAndNavigate('chair', '/chair/reviewers')}>
                Open Reviewer Assignment Matrix →
              </Button>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<i className="bi bi-chevron-down"></i>}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1565C0' }}>
                Step 3: Score Calibration & Publishing Decisions
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ color: '#334155', mb: 1.5 }}>
                1. Navigate to <strong>Paper Decisions</strong> (`/chair/decisions`).
                <br />2. Inspect average scores, scorecards, author comments, and private confidential chair notes.
                <br />3. Click <strong>Make Decision</strong> and select:
                <br />&nbsp;&nbsp;• <strong>Accept Paper</strong>: Moves submission to camera-ready workflow.
                <br />&nbsp;&nbsp;• <strong>Revision Required</strong>: Requests author to upload a revised PDF.
                <br />&nbsp;&nbsp;• <strong>Reject Paper</strong>: Concludes evaluation.
                <br />4. Toggle <em>Send Automated Brevo Email to Authors</em> to dispatch official notification.
              </Typography>
              <Button size="small" variant="outlined" onClick={() => handleSwitchRoleAndNavigate('chair', '/chair/decisions')}>
                Open Decisions Desk →
              </Button>
            </AccordionDetails>
          </Accordion>

          <Accordion elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<i className="bi bi-chevron-down"></i>}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1565C0' }}>
                Step 4: Sessions, Room Scheduling & Brevo Broadcasts
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ color: '#334155', mb: 1.5 }}>
                1. <strong>Sessions & Timetable</strong> (`/chair/sessions`): Create conference sessions, assign venue rooms, and sequence accepted papers into speaking slots.
                <br />2. <strong>Brevo Broadcast Desk</strong> (`/chair/emails`): Send mass notifications to Authors, Reviewers, or Accepted Authors with live HTML template preview.
                <br />3. <strong>Reports & Export</strong> (`/chair/reports`): Export the conference master paper directory as a CSV file.
              </Typography>
              <Button size="small" variant="outlined" onClick={() => handleSwitchRoleAndNavigate('chair', '/chair/emails')}>
                Open Brevo Broadcast Desk →
              </Button>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {/* Tab 2: Author Submission Guide */}
      {tabValue === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F2942' }}>
            Author Paper Submission & Revision Guide
          </Typography>

          <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 2.5, backgroundColor: '#FFFFFF' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1565C0', mb: 1.5 }}>
                  Submitting a New Manuscript
                </Typography>
                <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6, mb: 2 }}>
                  1. Go to <strong>Submit New Paper</strong> (`/submit-paper`).
                  <br />2. Choose the active conference and technical track.
                  <br />3. Input Paper Title, Abstract (up to 300 words), and Subject Keywords.
                  <br />4. Manage Authors:
                  <br />&nbsp;&nbsp;• Primary corresponding author is filled from your profile.
                  <br />&nbsp;&nbsp;• Click <em>Add Another Author</em> to specify co-authors.
                  <br />5. Select your Manuscript PDF file (stored securely in Cloudflare R2).
                  <br />6. Submit and receive your unique Submission Number (e.g. `CMT-2026-00101`).
                </Typography>
                <Button variant="contained" onClick={() => handleSwitchRoleAndNavigate('author', '/submit-paper')}>
                  Submit a Paper Now →
                </Button>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1565C0', mb: 1.5 }}>
                  Tracking & Uploading Revisions
                </Typography>
                <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6, mb: 2 }}>
                  1. Visit <strong>My Submissions</strong> (`/my-submissions`) to monitor status in real-time.
                  <br />2. If the status changes to <strong>Revision Required</strong>:
                  <br />&nbsp;&nbsp;• Click <em>Reviews</em> to read constructive reviewer feedback.
                  <br />&nbsp;&nbsp;• Click <em>Upload Revision</em> to submit the updated manuscript.
                  <br />3. If the paper is <strong>Accepted</strong>:
                  <br />&nbsp;&nbsp;• Click <em>Camera-Ready</em> to upload the final publication-ready version.
                </Typography>
                <Button variant="outlined" onClick={() => handleSwitchRoleAndNavigate('author', '/my-submissions')}>
                  View My Submissions →
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {/* Tab 3: Reviewer Evaluation Guide */}
      {tabValue === 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F2942' }}>
            Peer Reviewer Evaluation Guide
          </Typography>

          <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 2.5, backgroundColor: '#FFFFFF' }}>
            <Typography variant="body1" sx={{ color: '#334155', mb: 3 }}>
              As a member of the Program Committee, you are entrusted with conducting unbiased, double-blind peer evaluations to maintain high academic rigor.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1565C0', mb: 1 }}>
                  5 Structured Evaluation Criteria (Score 1 to 5)
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    { label: 'Technical Quality & Rigor', desc: 'Correctness of methodology, proofs, or experimental setups.' },
                    { label: 'Originality & Novelty', desc: 'Distinct contribution beyond prior state of the art.' },
                    { label: 'Relevance to Conference', desc: 'Relevance to chosen conference track and themes.' },
                    { label: 'Presentation & Clarity', desc: 'Organization, language quality, and visual readability.' },
                    { label: 'Overall Evaluation Score', desc: 'Final overall recommendation for acceptance.' },
                  ].map((crit, idx) => (
                    <Box key={idx} sx={{ p: 1.5, backgroundColor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F2942' }}>
                        {idx + 1}. {crit.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {crit.desc}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1565C0', mb: 1 }}>
                  Conducting Your Review
                </Typography>
                <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6, mb: 2 }}>
                  1. Open <strong>Assigned Papers</strong> (`/reviewer/workspace`).
                  <br />2. Click <strong>Download PDF</strong> to inspect the double-blind manuscript.
                  <br />3. Rate each of the 5 criteria from 1 to 5 stars.
                  <br />4. Select your Recommendation (<em>Accept</em>, <em>Minor Revision</em>, <em>Major Revision</em>, <em>Reject</em>).
                  <br />5. Fill in <strong>Comments for Authors</strong> with actionable suggestions.
                  <br />6. Optionally add <strong>Confidential Comments for Program Chairs</strong> (hidden from authors).
                  <br />7. Click <strong>Save as Draft</strong> or <strong>Submit Final Review</strong>.
                </Typography>

                <Button variant="contained" onClick={() => handleSwitchRoleAndNavigate('reviewer', '/reviewer/workspace')}>
                  Open Reviewer Workspace →
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {/* Tab 4: Camera-Ready & Proceedings */}
      {tabValue === 4 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F2942' }}>
            Camera-Ready Submission & Proceedings Desk
          </Typography>

          <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 2.5, backgroundColor: '#FFFFFF' }}>
            <Typography variant="body1" sx={{ color: '#334155', mb: 3 }}>
              Once a paper receives an <strong>Accept</strong> decision from the Program Chair, the camera-ready workflow is automatically unlocked.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2.5, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1565C0', mb: 1 }}>
                    For Authors
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                    • Address all reviewer feedback in your final manuscript.
                    <br />• Ensure all author names, affiliations, and acknowledgments are de-anonymized.
                    <br />• Upload the final PDF file under <strong>My Submissions</strong> (`/my-submissions`).
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2.5, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D47A1', mb: 1 }}>
                    For Program Chairs
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                    • Navigate to <strong>Camera-Ready Desk</strong> (`/chair/camera-ready`).
                    <br />• Download and inspect final PDFs for formatting compliance.
                    <br />• Click <strong>Approve</strong> to lock the manuscript for conference proceedings.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {/* Tab 5: API & Testing */}
      {tabValue === 5 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F2942' }}>
            Automated API Testing & Endpoints Suite
          </Typography>

          <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 2.5, backgroundColor: '#FFFFFF' }}>
            <Typography variant="body2" sx={{ color: '#334155', mb: 2 }}>
              The system includes an automated integration test script in `backend/test/test_all_endpoints.js` covering all 40+ endpoints.
            </Typography>

            <Box sx={{ p: 2, backgroundColor: '#0F2942', color: '#E2E8F0', borderRadius: 2, fontFamily: 'monospace', mb: 2.5 }}>
              cd backend<br />
              npm test
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F2942', mb: 1 }}>
              Key Subsystems Verified:
            </Typography>
            <Grid container spacing={1.5}>
              {[
                'Health & JWT Auth (/api/auth)',
                'User Directory & Access Control (/api/users)',
                'Conferences & Tracks (/api/conferences, /api/tracks)',
                'Submissions & Cloudflare R2 (/api/submissions)',
                'Conflict Analyzer & Assignments (/api/reviewers)',
                'Peer Evaluations & Scorecards (/api/reviews)',
                'Decisions Desk & Brevo Emails (/api/decisions)',
                'Camera-Ready Approvals (/api/camera-ready)',
                'Sessions & Timetable (/api/sessions)',
                'Email Broadcast Logs (/api/emails)',
                'Analytics Dashboard (/api/dashboard)',
                'Audit Trail Log (/api/audit-logs)',
              ].map((apiName, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, backgroundColor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                    <i className="bi bi-check2-circle" style={{ color: '#1565C0', fontWeight: 'bold' }}></i>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#0F2942' }}>
                      {apiName}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
