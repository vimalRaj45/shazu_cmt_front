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
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import BackButton from '../../components/common/BackButton';

export default function GuidePage() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box sx={{ pb: 6, maxWidth: 1200, mx: 'auto', p: { xs: 1.5, sm: 2.5, md: 3 } }}>
      <Box sx={{ mb: 2 }}>
        <BackButton fallbackUrl="/dashboard" />
      </Box>

      {/* Header Banner with Brand Palette */}
      <Paper
        elevation={0}
        sx={{
          mb: 3.5,
          background: 'linear-gradient(135deg, #123B32 0%, #2F5B4E 60%, #527A68 100%)',
          color: '#FFFFFF',
          borderRadius: 2.5,
          p: { xs: 2.5, md: 4 },
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 24px rgba(18, 59, 50, 0.12)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Chip
            label="SYSTEM USER GUIDE"
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              color: '#FFFFFF',
              fontWeight: 800,
              letterSpacing: '0.06em',
              fontSize: '0.75rem',
              borderRadius: 1,
            }}
          />
          <Typography variant="caption" sx={{ color: '#E8EFEB', fontWeight: 700, letterSpacing: '0.04em' }}>
            Shazu Soft Conference & Journal Management System (CJMS)
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em', color: '#FFFFFF', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          End-to-End System & Workflow Guide
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.95, maxWidth: 780, color: '#E8EFEB', lineHeight: 1.65, fontSize: '0.925rem' }}>
          Comprehensive documentation and operational standard operating procedures for managing the full lifecycle of academic publications—from online conference and journal setup and double-blind manuscript submission to peer evaluation rubrics, conflict-free assignments, decisions, and camera-ready publishing.
        </Typography>
      </Paper>

      {/* Navigation Tabs */}
      <Card sx={{ mb: 3, border: '1px solid var(--brand-border, #D3DDD7)', borderRadius: 2.5, backgroundColor: '#FFFFFF' }}>
        <Tabs
          value={tabValue}
          onChange={(_, newVal) => setTabValue(newVal)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            borderBottom: '1px solid #D3DDD7',
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '0.875rem',
              py: 2,
              color: '#334E43',
              '&.Mui-selected': { color: '#123B32', fontWeight: 800 },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#123B32',
              height: 3,
            },
          }}
        >
          <Tab label="1. Overview & Roles" icon={<i className="bi bi-grid" />} iconPosition="start" />
          <Tab label="2. Chair Playbook" icon={<i className="bi bi-briefcase" />} iconPosition="start" />
          <Tab label="3. Author Submission Guide" icon={<i className="bi bi-file-earmark-text" />} iconPosition="start" />
          <Tab label="4. Reviewer Evaluation Guide" icon={<i className="bi bi-journal-check" />} iconPosition="start" />
          <Tab label="5. Camera-Ready & Proceedings" icon={<i className="bi bi-award" />} iconPosition="start" />
          <Tab label="6. Frequently Asked Questions" icon={<i className="bi bi-question-circle" />} iconPosition="start" />
        </Tabs>
      </Card>

      {/* Tab 0: Overview & Roles */}
      {tabValue === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#123B32' }}>
            System Roles & Core Responsibilities
          </Typography>

          <Grid container spacing={2.5}>
            {[
              {
                role: 'Administrator & Conference Chair',
                desc: 'Oversees complete conference governance: configures conference metadata & tracks, assigns reviewers with automated Conflict of Interest (COI) matrix detection, makes final paper decisions, schedules presentation sessions, broadcasts Brevo emails, and monitors audit logs.',
                actions: [
                  'Conference & Subject Track Setup',
                  'Reviewer Assignment & COI Auto-Detection',
                  'Paper Decisions & Acceptance Calibrations',
                  'Session & Presentation Agendas',
                  'Brevo Email Broadcasts',
                  'User Directory Management & Audit Logs',
                ],
                icon: 'bi-shield-lock',
                accentColor: '#123B32',
                badgeBg: '#E8EFEB',
              },
              {
                role: 'Peer Reviewer',
                desc: 'Evaluates assigned manuscripts under a strict double-blind process across 5 structured technical criteria, provides detailed constructive feedback, and submits scorecards with confidential chair recommendations.',
                actions: [
                  'Download Anonymized Manuscript PDFs',
                  '5-Point Structured Technical Evaluation Rubric',
                  'Confidential Remarks to Program Chairs',
                  'Save Evaluation Drafts & Submit Final Scores',
                ],
                icon: 'bi-journal-check',
                accentColor: '#2F5B4E',
                badgeBg: '#E8EFEB',
              },
              {
                role: 'Paper Author',
                desc: 'Submits academic manuscripts with verified co-authors, uploads research PDFs directly to Cloudflare R2 object storage, tracks double-blind review outcomes, uploads revised manuscripts, and submits camera-ready final files.',
                actions: [
                  'Submit New Research Manuscript',
                  'Manage Co-Authors & Affiliations',
                  'Track Evaluation Status & Scorecards',
                  'Upload Author Revisions & Rebuttal Notes',
                  'Submit Camera-Ready Final Proceedings',
                ],
                icon: 'bi-file-earmark-text',
                accentColor: '#C47D4C',
                badgeBg: '#FBEFE7',
              },
            ].map((item, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card sx={{ height: '100%', border: '1px solid #D3DDD7', borderRadius: 2.5, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
                  <Box sx={{ height: 4, backgroundColor: item.accentColor, width: '100%' }} />
                  <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: 1.5,
                          backgroundColor: item.badgeBg,
                          color: item.accentColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.1rem',
                        }}
                      >
                        <i className={`bi ${item.icon}`} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#123B32', fontSize: '1.05rem' }}>
                        {item.role}
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ color: '#334E43', mb: 2.5, fontSize: '0.875rem', lineHeight: 1.6, flexGrow: 1 }}>
                      {item.desc}
                    </Typography>

                    <Box sx={{ pt: 2, borderTop: '1px dashed #D3DDD7' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: item.accentColor, display: 'block', mb: 1, letterSpacing: '0.04em' }}>
                        CORE CAPABILITIES:
                      </Typography>
                      {item.actions.map((act, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.75 }}>
                          <i className="bi bi-check2" style={{ color: item.accentColor, fontSize: '0.9rem', marginTop: 1 }} />
                          <Typography variant="caption" sx={{ color: '#26322E', fontSize: '0.8rem', fontWeight: 600 }}>
                            {act}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Dual-Role & COI Integrity Card */}
          <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, border: '1px solid #527A68', borderRadius: 2.5, backgroundColor: '#E8EFEB' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: '#123B32', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                <i className="bi bi-shield-check" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#123B32', lineHeight: 1.2 }}>
                  Dual-Role (Author & Reviewer) Support & Conflict of Interest (COI) Guarantee
                </Typography>
                <Typography variant="caption" sx={{ color: '#2F5B4E', fontWeight: 600 }}>
                  Standard Academic Practice • Double-Blind Integrity Guaranteed
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 2, border: '1px solid #D3DDD7', height: '100%' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#123B32', mb: 0.75, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className="bi bi-person-badge text-success"></i> 1. Dual Participation
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#334E43', fontSize: '0.825rem', lineHeight: 1.55 }}>
                    In research conferences and journals, scholars frequently submit papers as <strong>Authors</strong> while reviewing manuscripts in their field as <strong>Reviewers</strong>. Shazu Soft CJMS fully supports holding both roles simultaneously.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 2, border: '1px solid #D3DDD7', height: '100%' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#123B32', mb: 0.75, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className="bi bi-shield-lock text-success"></i> 2. Automated COI Shield
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#334E43', fontSize: '0.825rem', lineHeight: 1.55 }}>
                    Reviewers are <strong>strictly blocked</strong> from evaluating their own papers, co-authored manuscripts, or papers from researchers at the same university or research department.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 2, border: '1px solid #D3DDD7', height: '100%' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#123B32', mb: 0.75, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className="bi bi-arrow-left-right text-success"></i> 3. Perspective Switcher
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#334E43', fontSize: '0.825rem', lineHeight: 1.55 }}>
                    Click your <strong>Role Badge</strong> in the top navigation bar anytime to toggle between the Author Portal and Reviewer Portal seamlessly.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Workflow Pipeline */}
          <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, border: '1px solid #D3DDD7', borderRadius: 2.5, backgroundColor: '#FFFFFF', mt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#123B32', mb: 0.5 }}>
              Publication Workflow Lifecycle Pipeline
            </Typography>
            <Typography variant="body2" sx={{ color: '#334E43', mb: 3 }}>
              Standard operating progression across all phases of the conference & journal management lifecycle:
            </Typography>

            <Grid container spacing={2}>
              {[
                { step: '1', title: 'Conference / Journal Setup', desc: 'Define online conference/journal themes, tracks, schedule/issue timeline, and submission deadlines.' },
                { step: '2', title: 'Paper Submissions', desc: 'Authors submit abstracts and upload manuscripts to Cloudflare R2.' },
                { step: '3', title: 'Reviewer Assignment', desc: 'Chair checks automated COI matrix and assigns reviewers.' },
                { step: '4', title: 'Peer Review', desc: 'Reviewers evaluate manuscripts across 5-point scorecards.' },
                { step: '5', title: 'Paper Decisions', desc: 'Chair calibrates scores and publishes Accept/Revision/Reject decisions.' },
                { step: '6', title: 'Camera-Ready & Publishing', desc: 'Authors upload final PDF; Admin approves and organizes sessions/issues.' },
              ].map((pipe, i) => (
                <Grid item xs={12} sm={6} md={2} key={i}>
                  <Box sx={{ p: 2, backgroundColor: '#F5F3EC', borderRadius: 2, border: '1px solid #D3DDD7', height: '100%' }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: '#123B32',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        mb: 1.25,
                      }}
                    >
                      {pipe.step}
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#123B32', mb: 0.5, fontSize: '0.875rem' }}>
                      {pipe.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#334E43', fontSize: '0.75rem', lineHeight: 1.45, display: 'block' }}>
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
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#123B32' }}>
            Program Chair Playbook
          </Typography>

          <Accordion defaultExpanded elevation={0} sx={{ border: '1px solid #D3DDD7', borderRadius: 2, '&:before': { display: 'none' }, backgroundColor: '#FFFFFF' }}>
            <AccordionSummary expandIcon={<i className="bi bi-chevron-down" />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#123B32' }}>
                Step 1: Conference / Journal Configuration & Track Setup
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ color: '#334E43', mb: 1.5, lineHeight: 1.6 }}>
                1. Navigate to <strong>Conferences & Journals</strong> and select <strong>Create New Conference / Journal</strong>.
                <br />2. Fill in Title, Acronym (e.g. <code>ICAI-2026</code> or <code>JCS-Vol5</code>), Online Platform/Publisher Info, and Submission Deadlines.
                <br />3. Add Subject Tracks (e.g., <em>Track 1: Artificial Intelligence, Track 2: Cybersecurity</em>) so authors can categorize submissions.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded elevation={0} sx={{ border: '1px solid #D3DDD7', borderRadius: 2, '&:before': { display: 'none' }, backgroundColor: '#FFFFFF' }}>
            <AccordionSummary expandIcon={<i className="bi bi-chevron-down" />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#123B32' }}>
                Step 2: Conflict of Interest (COI) & Reviewer Assignment
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ color: '#334E43', mb: 1.5, lineHeight: 1.6 }}>
                1. Go to <strong>Reviewer Assignment Desk</strong>.
                <br />2. The system automatically cross-references institution affiliations, co-author lists, and email domains to flag potential conflicts of interest.
                <br />3. Assign at least 2 to 3 reviewers per paper. Use the <strong>AI-Assisted Paper Matcher</strong> to automatically match research domain keywords with reviewer competencies.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion elevation={0} sx={{ border: '1px solid #D3DDD7', borderRadius: 2, '&:before': { display: 'none' }, backgroundColor: '#FFFFFF' }}>
            <AccordionSummary expandIcon={<i className="bi bi-chevron-down" />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#123B32' }}>
                Step 3: Paper Decisions & Brevo Broadcast
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ color: '#334E43', mb: 1.5, lineHeight: 1.6 }}>
                1. Navigate to <strong>Decisions Desk</strong> once reviews are finalized.
                <br />2. View average scores, recommendation matrices, and confidential chair notes.
                <br />3. Record decisions (<em>Accepted, Revision Required, Rejected</em>) and publish notifications to authors via the integrated Brevo email service.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {/* Tab 2: Author Submission Guide */}
      {tabValue === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#123B32' }}>
            Author Manuscript Submission Guide
          </Typography>

          <Card sx={{ border: '1px solid #D3DDD7', borderRadius: 2.5, backgroundColor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#123B32', mb: 1.5 }}>
                Manuscript Submission Checklist
              </Typography>
              <Typography variant="body2" sx={{ color: '#334E43', mb: 2, lineHeight: 1.6 }}>
                Please review these guidelines before uploading your research paper to ensure a smooth double-blind peer review:
              </Typography>

              <Grid container spacing={2}>
                {[
                  { title: 'Double-Blind Anonymization', text: 'Remove author names, affiliations, email addresses, and grant acknowledgments from the submitted manuscript PDF.' },
                  { title: 'PDF Format & R2 Storage', text: 'Upload your file in standard PDF format (maximum size 50 MB). Files are securely stored with Cloudflare R2.' },
                  { title: 'Co-Author Information', text: 'Accurately specify all co-author names, email addresses, and institutions in the submission form for correct COI detection.' },
                  { title: 'Keywords & Abstract', text: 'Provide 3 to 6 descriptive research keywords to assist matching with relevant technical reviewers.' },
                ].map((item, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Box sx={{ p: 2, backgroundColor: '#F5F3EC', borderRadius: 2, border: '1px solid #D3DDD7', height: '100%' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#123B32', mb: 0.5 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#334E43', lineHeight: 1.5, display: 'block' }}>
                        {item.text}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Tab 3: Reviewer Evaluation Guide */}
      {tabValue === 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#123B32' }}>
            Peer Reviewer Evaluation Rubric
          </Typography>

          <Card sx={{ border: '1px solid #D3DDD7', borderRadius: 2.5, backgroundColor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#123B32', mb: 1 }}>
                5-Point Technical Evaluation Criteria
              </Typography>
              <Typography variant="body2" sx={{ color: '#334E43', mb: 3 }}>
                Reviewers assess each assigned manuscript on a structured 1-5 point scale across the following technical dimensions:
              </Typography>

              <Grid container spacing={2}>
                {[
                  { criterion: '1. Originality & Novelty', desc: 'Is the core contribution unique, novel, and advancing the state of the art?' },
                  { criterion: '2. Technical Soundness & Methodology', desc: 'Are theoretical formulations, experiments, mathematical proofs, and data sets valid?' },
                  { criterion: '3. Empirical Evaluation & Results', desc: 'Are claims validated with benchmarks, comparative baselines, and statistical rigor?' },
                  { criterion: '4. Clarity & Presentation Quality', desc: 'Is the paper clearly structured, well-written, with legible figures and complete citations?' },
                  { criterion: '5. Relevance & Impact', desc: 'Does the topic align with conference tracks and provide tangible value to the scholarly community?' },
                ].map((crit, i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <Box sx={{ p: 2, backgroundColor: '#F5F3EC', borderRadius: 2, border: '1px solid #D3DDD7', height: '100%' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#123B32', mb: 0.5 }}>
                        {crit.criterion}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#334E43', lineHeight: 1.45, display: 'block' }}>
                        {crit.desc}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Tab 4: Camera-Ready & Proceedings */}
      {tabValue === 4 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#123B32' }}>
            Camera-Ready & Proceedings Desk
          </Typography>

          <Card sx={{ border: '1px solid #D3DDD7', borderRadius: 2.5, backgroundColor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#123B32', mb: 1.5 }}>
                Final Publication Steps for Accepted Papers
              </Typography>
              <Typography variant="body2" sx={{ color: '#334E43', mb: 2, lineHeight: 1.6 }}>
                Once a manuscript is Accepted, authors must complete the camera-ready stage:
              </Typography>

              <Grid container spacing={2}>
                {[
                  { step: '1. Re-add Author Metadata', text: 'Include author names, institutional affiliations, and grant acknowledgments.' },
                  { step: '2. Reviewer Corrections', text: 'Address any minor revisions or formatting comments provided in the decision scorecard.' },
                  { step: '3. Upload Final Camera-Ready PDF', text: 'Upload the final camera-ready PDF before the strict publication deadline.' },
                  { step: '4. Chair Final Approval', text: 'The Program Chair verifies page limits and format compliance before adding the paper to conference proceedings.' },
                ].map((item, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Box sx={{ p: 2, backgroundColor: '#F5F3EC', borderRadius: 2, border: '1px solid #D3DDD7', height: '100%' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#123B32', mb: 0.5 }}>
                        {item.step}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#334E43', lineHeight: 1.45, display: 'block' }}>
                        {item.text}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Tab 5: Frequently Asked Questions */}
      {tabValue === 5 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#123B32' }}>
            Frequently Asked Questions
          </Typography>

          {[
            { q: 'How does the ORCID iD integration work?', a: 'Users can sign up and authenticate in one click via ORCID OAuth. Your verified 16-digit ORCID identifier and academic credentials will sync automatically with your profile.' },
            { q: 'What happens if a conflict of interest is detected?', a: 'The system prevents assigning a reviewer who shares the same institutional domain, co-authorship history, or personal conflict declared by the chair.' },
            { q: 'Can authors revise a paper after submission?', a: 'Authors can update manuscript files and metadata until the submission deadline. After the deadline, revisions are only permitted if requested by the Program Chair.' },
            { q: 'Where are manuscript files stored?', a: 'All paper PDFs, supplementary files, and camera-ready documents are stored securely on Cloudflare R2 object storage with fast global distribution.' },
          ].map((faq, i) => (
            <Accordion key={i} defaultExpanded={i === 0} elevation={0} sx={{ border: '1px solid #D3DDD7', borderRadius: 2, '&:before': { display: 'none' }, backgroundColor: '#FFFFFF' }}>
              <AccordionSummary expandIcon={<i className="bi bi-chevron-down" />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#123B32' }}>
                  {faq.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Typography variant="body2" sx={{ color: '#334E43', lineHeight: 1.6 }}>
                  {faq.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
}
