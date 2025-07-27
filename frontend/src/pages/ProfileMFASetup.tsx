import {
  Cancel, CheckCircle, Email,
  Key, Security, Smartphone, Visibility,
  VisibilityOff, Download, Refresh
} from '@mui/icons-material';
import {
  Alert, Box, Button, Card, CardActions, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  IconButton,
  InputAdornment, Paper, Step,
  StepLabel, Stepper, TextField, Typography, Tooltip
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
        
        // Auto-enable MFA after QR code is generated
        setTimeout(() => {
          handleAutoEnableMFA(data.secret, data.backupCodes);
        }, 2000); // Give user 2 seconds to scan
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

  const handleAutoEnableMFA = async (secret: string, backupCodes: string[]) => {
    try {
      const token = localStorage.getItem('stepstunnerToken');
      const response = await fetch('/api/auth/mfa/auto-enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          secret: secret, 
          backupCodes: backupCodes 
        })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('MFA enabled successfully! QR code scanned and verified.');
        setSetupStep(0);
        fetchMFAStatus();
      }
    } catch (err) {
      console.log('Auto-enable failed, user will need to verify manually');
    }
  };

  const handleVerifyMFA = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('stepstunnerToken');
      const requestBody = selectedMethod === 'totp' 
        ? { 
            token: verificationToken, 
            secret: secret, 
            backupCodes: backupCodes 
          }
        : { token: verificationToken };

      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
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
      setSetupStep(0); // Close the dialog
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

  if (setupStep > 0 && setupStep < 3) {
    return (
      
      <Container maxWidth="md">
         <Paper elevation={3} sx={{ width: '100%', maxWidth: 600, height: 620, overflowY: 'auto', p: 2, borderRadius: 5, mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#fff' }}>
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
                <Paper elevation={3} sx={{ p: 2, display: 'inline-block', borderRadius: 2 }}>
                  <img 
                    src={qrCode} 
                    alt="QR Code" 
                    style={{ 
                      maxWidth: 200, 
                      borderRadius: 8,
                      border: '2px solid #f0f0f0'
                    }} 
                  />
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Tooltip title="Download QR Code">
                      <IconButton 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = qrCode;
                          link.download = 'stepstunner-mfa-qr.png';
                          link.click();
                        }}
                        size="small"
                        color="primary"
                      >
                        <Download />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Refresh QR Code">
                      <IconButton 
                        onClick={() => handleSetupMFA('totp')}
                        size="small"
                        color="secondary"
                      >
                        <Refresh />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
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
                    <Chip label={code} variant="outlined" />
                  </Grid>
                ))}
              </Grid>

              <Button
                variant="contained"
                onClick={() => setSetupStep(2)}
                sx={{ mr: 2, backgroundColor: '#d72660', color: 'white', '&:hover': { backgroundColor: '#b71c4a' } }}
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
                sx={{ borderColor: '#d72660', color: '#d72660', '&:hover': { backgroundColor: 'rgba(215,38,96,0.08)', borderColor: '#d72660', color: '#d72660' } }}
              >
                Cancel
              </Button>
            </Box>
          )}

          {setupStep === 2 && (
            <Box>
              {selectedMethod === 'totp' && qrCode && (
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Scan QR Code with Your Phone
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                    Open your authenticator app (Google Authenticator, Authy, etc.) and scan this QR code
                  </Typography>
                  <Paper elevation={3} sx={{ p: 2, display: 'inline-block', borderRadius: 2 }}>
                    <img 
                      src={qrCode} 
                      alt="QR Code" 
                      style={{ 
                        maxWidth: 250, 
                        borderRadius: 8,
                        border: '2px solid #f0f0f0'
                      }} 
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="Download QR Code">
                        <IconButton 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = qrCode;
                            link.download = 'stepstunner-mfa-qr.png';
                            link.click();
                          }}
                          size="small"
                          color="primary"
                        >
                          <Download />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Refresh QR Code">
                        <IconButton 
                          onClick={() => handleSetupMFA('totp')}
                          size="small"
                          color="secondary"
                        >
                          <Refresh />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Paper>
                  
                  <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                      MFA will be automatically enabled once you scan the QR code
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      If you need to verify manually, enter the code from your app below
                    </Typography>
                  </Box>
                </Box>
              )}
              

              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  MFA will be automatically enabled in a few seconds...
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSetupStep(0);
                    setVerificationToken('');
                  }}
                  sx={{ borderColor: '#d72660', color: '#d72660', '&:hover': { backgroundColor: 'rgba(215,38,96,0.08)', borderColor: '#d72660', color: '#d72660' } }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{  display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh' }}>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 600, height: 625, overflowY: 'auto', p: 2, borderRadius: 5, mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#fff' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#d72660', mb: 3, textAlign: 'center' }}>
          Two-Factor Authentication
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>{error}</Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>{success}</Alert>
        )}
        <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto' }}>
          {mfaStatus?.enabled ? (
            <>
              <Card sx={{ mb: 3, borderRadius: 4, boxShadow: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                    <Typography variant="h6" fontWeight={700}>MFA is Enabled</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Your account is protected with {getMethodDescription(mfaStatus.method).toLowerCase()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getMethodIcon(mfaStatus.method)}
                    <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                      {getMethodDescription(mfaStatus.method)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    Verification codes are sent to your registered email address.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setSetupStep(3)}
                    startIcon={<Cancel />}
                    sx={{ fontWeight: 600, borderRadius: 3 }}
                  >
                    Disable MFA
                  </Button>
                </CardActions>
              </Card>
              
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Your account is now protected with two-factor authentication. 
                  You'll receive verification codes via email when logging in.
                </Typography>
              </Box>
            </>
          ) : (
            <Card sx={{ mb: 3, borderRadius: 4, boxShadow: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Cancel sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography variant="h6" fontWeight={700}>MFA is Disabled</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Enable two-factor authentication to add an extra layer of security to your account.
                </Typography>
              </CardContent>
            </Card>
          )}
          {!mfaStatus?.enabled && (
            <Grid container spacing={3} justifyContent="center" alignItems="stretch" sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ 
                  borderRadius: 4, 
                  boxShadow: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  height: '100%',
                  px: 3,
                  py: 2
                }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Key sx={{ color: '#d72660', fontSize: 32, mr: 2, flexShrink: 0 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        QR Code Authentication
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      Scan QR code with your authenticator app to enable two-factor authentication.
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 0, pt: 0, pb: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleSetupMFA('totp')}
                      sx={{ 
                        backgroundColor: '#d72660', 
                        color: 'white', 
                        '&:hover': { backgroundColor: '#b71c4a' },
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 600
                      }}
                    >
                      SCAN QR CODE
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ 
                  borderRadius: 4, 
                  boxShadow: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  height: '100%',
                  px: 3,
                  py: 2
                }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Email sx={{ color: '#d72660', fontSize: 32, mr: 2, flexShrink: 0 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Email Verification
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      Receive verification codes via email to your registered email address.
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 0, pt: 0, pb: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleSetupMFA('email')}
                      sx={{ 
                        backgroundColor: '#d72660', 
                        color: 'white', 
                        '&:hover': { backgroundColor: '#b71c4a' },
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 600
                      }}
                    >
                      SETUP EMAIL
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>
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
  );
};

export default ProfileMFASetup;