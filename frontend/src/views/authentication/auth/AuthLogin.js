import React from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Checkbox,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Email, Person, Info } from '@mui/icons-material';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';

const AuthLogin = ({ formik, title, subtitle, subtext }) => {
  const { values, errors, touched, handleBlur, handleChange, handleSubmit } = formik;
  
  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <Stack>
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb="5px">
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="login"
            >
              Email or User ID
            </Typography>
            <Tooltip title="You can login with your email address or generated User ID">
              <Info sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Tooltip>
          </Box>
          <CustomTextField
            id="login"
            name="login"
            variant="outlined"
            placeholder="Enter your Email or User ID"
            value={values.login}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.login && errors.login ? true : false}
            helperText={touched.login && errors.login ? errors.login : null}
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
            Use your email address or the User ID provided by your teacher
          </Typography>
        </Box>
        <Box mt="25px">
          <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="password"
            mb="5px"
          >
            Password
          </Typography>
          <CustomTextField
            id="password"
            name="password"
            type="password"
            variant="outlined"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password && errors.password ? true : false}
            helperText={touched.password && errors.password ? errors.password : null}
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
          <FormGroup>
            <FormControlLabel 
              control={<Checkbox defaultChecked />} 
              label="Remember this Device" 
            />
          </FormGroup>
          <Typography
            component={Link}
            to="/forgot-password"
            fontWeight="500"
            sx={{
              textDecoration: 'none',
              color: 'primary.main',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Forgot Password ?
          </Typography>
        </Stack>
      </Stack>
      <Box>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          onClick={handleSubmit}
          sx={{
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 600,
          }}
        >
          Sign In
        </Button>
      </Box>
      
      {/* Demo Login Info */}
      <Box mt={3} p={2} sx={{ bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
        <Typography variant="subtitle2" fontWeight="600" gutterBottom>
          💡 Login Options:
        </Typography>
        <Typography variant="body2" color="textSecondary">
          • <strong>Email:</strong> yourname@example.com<br/>
          • <strong>User ID:</strong> john1234 (generated ID)<br/>
          • Same password works for both
        </Typography>
      </Box>
      
      {subtitle}
    </>
  );
};

export default AuthLogin;