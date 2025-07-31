import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import {
  Security,
  CheckCircle,
  Error,
  PlayArrow,
  Refresh
} from '@mui/icons-material';
import { runFrontendSecurityTests, TestSummary } from '../utils/securityTests';

interface SecurityTestResult {
  testName: string;
  passed: boolean;
  details: string;
  timestamp: string;
}

const SecurityTestPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    setError(null);
    setTestResults(null);

    try {
      const results = await runFrontendSecurityTests();
      setTestResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run security tests');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (passed: boolean) => {
    return passed ? 'success' : 'error';
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? <CheckCircle color="success" /> : <Error color="error" />;
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Security sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h5" component="h2">
            Security Test Panel
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Run comprehensive security tests to verify that all security features are working correctly.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={isRunning ? <CircularProgress size={20} /> : <PlayArrow />}
            onClick={handleRunTests}
            disabled={isRunning}
            sx={{ mr: 2 }}
          >
            {isRunning ? 'Running Tests...' : 'Run Security Tests'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              setTestResults(null);
              setError(null);
            }}
            disabled={isRunning}
          >
            Clear Results
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {testResults && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ mr: 2 }}>
                Test Results
              </Typography>
              <Chip
                label={`${testResults.passed} passed, ${testResults.failed} failed`}
                color={testResults.failed === 0 ? 'success' : 'warning'}
                size="small"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Success Rate: {testResults.successRate.toFixed(1)}%
              </Typography>
            </Box>

            <List>
              {testResults.tests.map((test, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      {getStatusIcon(test.passed)}
                    </ListItemIcon>
                    <ListItemText
                      primary={test.testName}
                      secondary={test.details || (test.passed ? 'Test passed successfully' : 'Test failed')}
                    />
                    <Chip
                      label={test.passed ? 'PASS' : 'FAIL'}
                      color={getStatusColor(test.passed)}
                      size="small"
                    />
                  </ListItem>
                  {index < testResults.tests.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {testResults.failed > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {testResults.failed} test(s) failed. Please review the security configuration.
              </Alert>
            )}

            {testResults.failed === 0 && (
              <Alert severity="success" sx={{ mt: 2 }}>
                All security tests passed! Your application is properly secured.
              </Alert>
            )}
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Security Features Tested
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText primary="Password Strength Validation" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText primary="Input Sanitization (XSS Prevention)" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText primary="Token Storage Security" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText primary="reCAPTCHA Integration" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText primary="Session Management (7-day timeout)" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText primary="File Upload Security" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText primary="MFA Integration" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText primary="Security Headers" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText primary="Rate Limiting UI" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText primary="Error Handling" />
            </ListItem>
          </List>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SecurityTestPanel; 