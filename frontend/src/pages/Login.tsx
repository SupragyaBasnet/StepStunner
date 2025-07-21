import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  Snackbar,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Visibility, VisibilityOff, Security } from '@mui/icons-material';
import ReCAPTCHA from 'react-google-recaptcha';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [mfaMethod, setMfaMethod] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Add state for snackbar
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});
  const [recaptchaToken, setRecaptchaToken] = useState('');

  const RECAPTCHA_SITE_KEY = '6LcMSoorAAAAAIU3ZI8wh1TtxnXNmnwScxPLrplu';

  // Show account deleted message if redirected here
  React.useEffect(() => {
    if (sessionStorage.getItem('accountDeleted')) {
      setSnackbar({
        open: true,
        message: 'Account deleted successfully.',
        severity: 'success',
      });
      sessionStorage.removeItem('accountDeleted');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recaptchaToken) {
      setError('Please complete the CAPTCHA');
      return;
    }
    try {
      setError('');
      setLoading(true);
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password,
          mfaToken: requiresMFA ? mfaToken : undefined,
          recaptchaToken
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.requiresMFA) {
          setRequiresMFA(true);
          setMfaMethod(data.mfaMethod);
          setError('');
          setLoading(false);
          return;
        }
        throw new Error(data.message || data.error || "Login failed");
      }
      
      setSnackbar({open: true, message: 'Login successful!', severity: 'success'});
      setTimeout(() => {
        if (data.user && data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 500);
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaToken.trim()) {
      setError('Please enter your MFA token');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password,
          mfaToken
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "MFA verification failed");
      }
      
      setSnackbar({open: true, message: 'Login successful!', severity: 'success'});
      setTimeout(() => {
        if (data.user && data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 500);
    } catch (err) {
      setError('Invalid MFA token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMFAMethodLabel = (method: string) => {
    switch (method) {
      case 'totp':
        return 'Authenticator App (TOTP)';
      case 'sms':
        return 'SMS Code';
      case 'email':
        return 'Email Code';
      default:
        return 'Verification Code';
    }
  };

  const getMFAPlaceholder = (method: string) => {
    switch (method) {
      case 'totp':
        return 'Enter 6-digit code from your authenticator app';
      case 'sms':
        return 'Enter 6-digit code sent to your phone';
      case 'email':
        return 'Enter 6-digit code sent to your email';
      default:
        return 'Enter verification code';
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            {requiresMFA ? 'Two-Factor Authentication' : 'Sign In'}
          </Typography>
          
          {requiresMFA && (
            <Box sx={{ mb: 3 }}>
              <Stepper activeStep={1} sx={{ mb: 3 }}>
                <Step>
                  <StepLabel>Login</StepLabel>
                </Step>
                <Step>
                  <StepLabel>MFA Verification</StepLabel>
                </Step>
              </Stepper>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Security sx={{ mr: 1 }} />
                Please enter your {getMFAMethodLabel(mfaMethod)} to complete login.
              </Alert>
            </Box>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {!requiresMFA ? (
            // Step 1: Email and Password
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <ReCAPTCHA
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token: string | null) => setRecaptchaToken(token || '')}
                style={{ margin: '16px 0' }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link component={RouterLink} to="/forgot-password" variant="body2">
                  Forgot password?
                </Link>
              </Box>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2">
                  Don't have an account?{' '}
                  <Link component={RouterLink} to="/register">
                    Sign up
                  </Link>
                </Typography>
              </Box>
            </Box>
          ) : (
            // Step 2: MFA Token
            <Box component="form" onSubmit={handleMFAVerification}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="mfaToken"
                label={getMFAMethodLabel(mfaMethod)}
                name="mfaToken"
                autoComplete="off"
                autoFocus
                value={mfaToken}
                onChange={(e) => setMfaToken(e.target.value)}
                placeholder={getMFAPlaceholder(mfaMethod)}
                inputProps={{
                  maxLength: 6,
                  pattern: '[0-9]*'
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                onClick={() => {
                  setRequiresMFA(false);
                  setMfaToken('');
                  setError('');
                }}
              >
                Back to Login
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login; 