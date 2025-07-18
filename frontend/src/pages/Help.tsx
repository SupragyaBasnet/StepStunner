import React, { useState } from 'react';
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Link,
  Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import InfoIcon from '@mui/icons-material/Info';

const Help: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqItems = [
    {
      id: 'panel1',
      question: 'How long does shipping take?',
      answer: 'Standard shipping typically takes 5-7 business days. Express shipping options are available for faster delivery, usually within 2-3 business days. You can track your order status from your account.'
    },
    {
      id: 'panel2',
      question: 'What is your return policy?',
      answer: 'We accept returns within 30 days of purchase for unused items in their original packaging. Please refer to our detailed return policy for more information.'
    },
    {
      id: 'panel3',
      question: 'How can I contact customer support?',
              answer: 'You can reach our customer support team via email at support@stepstunner.com or by phone at +977-9816315056 during business hours (9:00 AM - 5:00 PM, Sunday to Friday).'
    },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ bgcolor: 'rgba(244,106,106,0.05)', borderRadius: 5, p: { xs: 2, md: 4 }, boxShadow: '0 4px 24px rgba(224,85,85,0.07)' }}>
        <Typography variant="h3" component="h1" align="center" gutterBottom fontWeight={800} sx={{ mb: 0, fontSize: { xs: '2rem', md: '2.2rem' } }}>
          Help & Support
        </Typography>
        <div className="heading-dash" />

        <Box sx={{ mb: 5, mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight={600} sx={{ mb: 2, textAlign: 'center' }}>
            Frequently Asked Questions
          </Typography>
          <Box>
            {faqItems.map((item) => (
              <Accordion
                key={item.id}
                expanded={expanded === item.id}
                onChange={handleChange(item.id)}
                sx={{
                  mb: 2,
                  borderRadius: 3,
                  boxShadow: '0 2px 8px rgba(224,85,85,0.06)',
                  bgcolor: 'white',
                  '&.Mui-expanded': { margin: '12px 0' },
                  '&:before': { display: 'none' }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`${item.id}-content`}
                  id={`${item.id}-header`}
                >
                  <Typography variant="subtitle1" fontWeight={600}>{item.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" color="text.secondary">{item.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 6 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 8px rgba(224,85,85,0.06)', minWidth: 320, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              If you have any other questions or need assistance, feel free to reach out to us.
            </Typography>
            <Link href="/contact" underline="none">
              <Box component="span" sx={{ display: 'inline-block' }}>
                <Paper elevation={2} sx={{ px: 4, py: 1.5, bgcolor: 'primary.main', color: 'white', borderRadius: 2, fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', '&:hover': { bgcolor: 'primary.dark' } }}>
                  Contact Us
                </Paper>
              </Box>
            </Link>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default Help; 