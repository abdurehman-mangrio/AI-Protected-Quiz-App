import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Grid, Box, Card, Stack, Typography, Button, TextField } from '@mui/material';

import PageContainer from 'src/components/container/PageContainer';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from './../../slices/usersApiSlice';
import { setCredentials } from './../../slices/authSlice';
import { toast } from 'react-toastify';
import Loader from './Loader';

import CyberAreenaLogo from 'src/assets/images/logos/cyberareena-logo.png';

const userValidationSchema = yup.object({
  login: yup.string('Enter your email or user ID').required('Email or User ID is required'),
  password: yup
    .string('Enter your password')
    .min(2, 'Password should be of minimum 8 characters length')
    .required('Password is required'),
});

const initialUserValues = {
  login: '',
  password: '',
};

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: initialUserValues,
    validationSchema: userValidationSchema,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  const handleSubmit = async (values) => {
    try {
      const res = await login({ 
        login: values.login, 
        password: values.password 
      }).unwrap();
      
      dispatch(setCredentials({ ...res }));
      formik.resetForm();

      const redirectLocation = JSON.parse(localStorage.getItem('redirectLocation'));
      if (redirectLocation) {
        localStorage.removeItem('redirectLocation');
        navigate(redirectLocation.pathname);
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Login failed');
    }
  };

  return (
    <PageContainer title="Login" description="this is Login page">
      <Box
        sx={{
          position: 'relative',
          backgroundColor: '#1a1a1a',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
            opacity: 1,
          },
        }}
      >
        <Grid container spacing={0} justifyContent="center" alignItems="center" sx={{ height: '100vh' }}>
          <Grid
            item
            xs={12}
            sm={10}
            md={8}
            lg={9}
            xl={8}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Card 
              elevation={24} 
              sx={{ 
                p: 0,
                zIndex: 1, 
                width: '100%', 
                maxWidth: '900px',
                height: '400px',
                backgroundColor: '#2d2d2d',
                border: '2px solid #444',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                overflow: 'hidden',
              }}
            >
              {/* Left Side - Logo Section */}
              <Box
                sx={{
                  flex: 1,
                  backgroundColor: '#1976d2',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 4,
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 3,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    border: '3px solid #2d2d2d',
                    overflow: 'hidden',
                    padding: '8px',
                  }}
                >
                  <img 
                    src={CyberAreenaLogo} 
                    alt="Cyber Areena Logo" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      borderRadius: '50%',
                    }}
                  />
                </Box>

                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 'bold',
                    color: '#ffffff',
                    textAlign: 'center',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                    letterSpacing: '1px',
                  }}
                >
                  CYBERARENA
                </Typography>
                
                <Typography 
                  variant="h6" 
                  textAlign="center" 
                  color="#e3f2fd" 
                  sx={{ 
                    letterSpacing: '2px',
                    marginTop: 2,
                    fontWeight: '500',
                  }}
                >
                  WELCOME TO CYBERARENA QUIZ
                </Typography>
              </Box>

              {/* Right Side - Login Form */}
              <Box
                sx={{
                  flex: 1,
                  padding: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Box 
                  component="form" 
                  onSubmit={formik.handleSubmit}
                  sx={{ width: '100%' }}
                >
                  <Stack spacing={3}>
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        color="#ffffff" 
                        mb={1}
                        sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                      >
                        Email or User ID
                      </Typography>
                      <TextField
                        fullWidth
                        id="login"
                        name="login"
                        placeholder="Enter your email or user ID"
                        value={formik.values.login}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.login && Boolean(formik.errors.login)}
                        helperText={formik.touched.login && formik.errors.login}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#1a1a1a',
                            color: '#ffffff',
                            '& fieldset': {
                              borderColor: '#555',
                              borderRadius: '4px',
                            },
                            '&:hover fieldset': {
                              borderColor: '#777',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#1976d2',
                            },
                          },
                          '& .MuiFormHelperText-root': {
                            color: '#ff6b6b',
                          }
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        color="#ffffff" 
                        mb={1}
                        sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                      >
                        Password
                      </Typography>
                      <TextField
                        fullWidth
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#1a1a1a',
                            color: '#ffffff',
                            '& fieldset': {
                              borderColor: '#555',
                              borderRadius: '4px',
                            },
                            '&:hover fieldset': {
                              borderColor: '#777',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#1976d2',
                            },
                          },
                        }}
                      />
                    </Box>

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={isLoading}
                      sx={{
                        mt: 2,
                        mb: 1,
                        backgroundColor: '#1976d2',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        py: 1.5,
                        borderRadius: '4px',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                        '&:hover': {
                          backgroundColor: '#1565c0',
                          boxShadow: '0 6px 16px rgba(25, 118, 210, 0.5)',
                          transform: 'translateY(-1px)',
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                        },
                        '&:disabled': {
                          backgroundColor: '#666',
                        }
                      }}
                    >
                      {isLoading ? 'LOGGING IN...' : 'Login'}
                    </Button>
                  </Stack>
                  
                  {isLoading && <Loader />}
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Login;