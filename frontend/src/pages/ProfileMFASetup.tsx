import {
  Cancel, CheckCircle, Email,
  Key, Security, Smartphone, Visibility,
  VisibilityOff
} from '@mui/icons-material';
import {
  Alert, Box, Button, Card, CardActions, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  IconButton,
  InputAdornment, Paper, Step,
  StepLabel, Stepper, TextField, Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfileMFASetup: React.FC = () => {
  const { user } = useAuth() as any;
  const navigate = useNavigate();
  const [mfaStatus, setMfaStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [setupStep, setSetupStep] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationToken, setVerificationToken] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisablePassword, setShowDisablePassword] = useState(false);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('stepstunnerToken');
    const userData = localStorage.getItem('stepstunnerUser');
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    fetchMFAStatus();
  }, [navigate]);

  const fetchMFAStatus = async () => {
    try {
      const token = localStorage.getItem('stepstunnerToken');
      const response = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMfaStatus({
          enabled: data.mfaEnabled || false,
          method: data.mfaMethod || 'totp',
          verified: data.mfaVerified || false
        });
      }
    } catch (err) {
      console.error('Failed to fetch MFA status:', err);
    }
  };

  const handleSetupMFA = async (method: string) => {
    try {
      setLoading(true);
      setError('');
      setSelectedMethod(method);
      setSetupStep(1);

      const token = localStorage.getItem('stepstunnerToken');
      const response = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ mfaMethod: method })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      if (method === 'totp') {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setBackupCodes(data.backupCodes);
        setSetupStep(2);
      } else {
        setSuccess(data.message);
        setSetupStep(2);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup MFA');
      setSetupStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMFA = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('stepstunnerToken');
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ token: verificationToken })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setSuccess('MFA enabled successfully!');
      setSetupStep(0);
      setVerificationToken('');
      fetchMFAStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('stepstunnerToken');
      const response = await fetch('/api/auth/mfa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password: disablePassword })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setSuccess('MFA disabled successfully!');
      setDisablePassword('');
      fetchMFAStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable MFA');
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'totp': return <Key />;
      case 'sms': return <Smartphone />;
      case 'email': return <Email />;
      default: return <Security />;
    }
  };

  const getMethodDescription = (method: string) => {
    switch (method) {
      case 'totp':
        return 'Use an authenticator app like Google Authenticator or Authy to generate time-based codes.';
      case 'sms':
        return 'Receive verification codes via SMS to your registered phone number.';
      case 'email':
        return 'Receive verification codes via email to your registered email address.';
      default:
        return '';
    }
  };

  if (setupStep > 0) {
    return (
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Setup Two-Factor Authentication
          </Typography>

          <Stepper activeStep={setupStep} sx={{ mb: 4 }}>
            <Step>
              <StepLabel>Choose Method</StepLabel>
            </Step>
            <Step>
              <StepLabel>Setup</StepLabel>
            </Step>
            <Step>
              <StepLabel>Verify</StepLabel>
            </Step>
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {setupStep === 1 && selectedMethod === 'totp' && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Step 1: Scan QR Code
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Open your authenticator app and scan this QR code:
              </Typography>
              
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <img src={qrCode} alt="QR Code" style={{ maxWidth: 200 }} />
              </Box>

              <Typography variant="h6" gutterBottom>
                Step 2: Manual Setup (if needed)
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                If you can't scan the QR code, enter this secret manually:
              </Typography>
              
              <TextField
                fullWidth
                value={showSecret ? secret : '••••••••••••••••'}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowSecret(!showSecret)}
                        edge="end"
                      >
                        {showSecret ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Typography variant="h6" gutterBottom>
                Step 3: Backup Codes
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device:
              </Typography>
              
              <Grid container spacing={1} sx={{ mb: 3 }}>
                {backupCodes.map((code, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Chip label={code} variant="outlined" fullWidth />
                  </Grid>
                ))}
              </Grid>

              <Button
                variant="contained"
                onClick={() => setSetupStep(2)}
                sx={{ mr: 2 }}
              >
                Continue to Verification
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setSetupStep(0);
                  setSelectedMethod('');
                  setQrCode('');
                  setSecret('');
                  setBackupCodes([]);
                }}
              >
                Cancel
              </Button>
            </Box>
          )}

          {setupStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Verify Your Setup
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Enter the verification code from your {selectedMethod === 'totp' ? 'authenticator app' : selectedMethod}:
              </Typography>
              
              <TextField
                fullWidth
                label="Verification Code"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value)}
                placeholder="Enter 6-digit code"
                inputProps={{ maxLength: 6 }}
                sx={{ mb: 3 }}
              />

              <Button
                variant="contained"
                onClick={handleVerifyMFA}
                disabled={loading || !verificationToken}
                sx={{ mr: 2 }}
              >
                {loading ? 'Verifying...' : 'Verify & Enable MFA'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setSetupStep(0);
                  setVerificationToken('');
                }}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    );
  }

  return (
    <Paper sx={{ borderRadius: 5, p: 4, minWidth: 350, maxWidth: 515, minHeight: 625, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', mx: 'auto', width: '100%' }}>
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Two-Factor Authentication
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {mfaStatus?.enabled ? (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
              <Typography variant="h6">
                MFA is Enabled
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Your account is protected with {getMethodDescription(mfaStatus.method).toLowerCase()}
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setSetupStep(3)}
              startIcon={<Cancel />}
            >
              Disable MFA
            </Button>
          </CardActions>
        </Card>
      ) : (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Cancel sx={{ color: 'warning.main', mr: 1 }} />
              <Typography variant="h6">
                MFA is Disabled
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Enable two-factor authentication to add an extra layer of security to your account.
            </Typography>
          </CardContent>
        </Card>
      )}

      {!mfaStatus?.enabled && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Key sx={{ mr: 1 }} />
                  <Typography variant="h6">Authenticator App</Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Use apps like Google Authenticator or Authy for time-based codes.
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleSetupMFA('totp')}
                  disabled={loading}
                >
                  Setup TOTP
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Smartphone sx={{ mr: 1 }} />
                  <Typography variant="h6">SMS</Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Receive verification codes via SMS to your phone.
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleSetupMFA('sms')}
                  disabled={loading}
                >
                  Setup SMS
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Email sx={{ mr: 1 }} />
                  <Typography variant="h6">Email</Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Receive verification codes via email.
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleSetupMFA('email')}
                  disabled={loading}
                >
                  Setup Email
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Disable MFA Dialog */}
      <Dialog open={setupStep === 3} onClose={() => setSetupStep(0)}>
        <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            To disable MFA, please enter your current password:
          </Typography>
          <TextField
            fullWidth
            type={showDisablePassword ? 'text' : 'password'}
            label="Current Password"
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowDisablePassword(!showDisablePassword)}
                    edge="end"
                  >
                    {showDisablePassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSetupStep(0)}>Cancel</Button>
          <Button
            onClick={handleDisableMFA}
            disabled={loading || !disablePassword}
            color="error"
          >
            {loading ? 'Disabling...' : 'Disable MFA'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </Paper>
  );
};

export default ProfileMFASetup;