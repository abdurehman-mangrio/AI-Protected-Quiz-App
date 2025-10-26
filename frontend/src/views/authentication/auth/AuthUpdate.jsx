import React from 'react';
import { Box, Typography, Button, Select, MenuItem } from '@mui/material';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import { Stack } from '@mui/system';

const AuthUpdate = ({ formik, title, subtitle, subtext }) => {
  const { values, errors, touched, handleBlur, handleChange, handleSubmit } = formik;
  
  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <Box component="form">
        <Stack mb={3}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="name"
            mb="5px"
          >
            Name
          </Typography>
          <CustomTextField
            id="name"
            name="name"
            placeholder="Enter Your Name "
            variant="outlined"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name && errors.name ? true : false}
            helperText={touched.name && errors.name ? errors.name : null}
            fullWidth
            required
          />

          <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="email"
            mb="5px"
            mt="25px"
          >
            Email Address
          </Typography>
          <CustomTextField
            id="email"
            name="email"
            variant="outlined"
            placeholder="Enter Your Email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && errors.email ? true : false}
            helperText={touched.email && errors.email ? errors.email : null}
            required
            fullWidth
          />

          <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="password"
            mb="5px"
            mt="25px"
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
          />
          
          <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="confirm_password"
            mb="5px"
            mt="25px"
          >
            Confirm Password
          </Typography>
          <CustomTextField
            id="confirm_password"
            name="confirm_password"
            type="password"
            autoComplete="false"
            variant="outlined"
            value={values.confirm_password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.confirm_password && errors.confirm_password ? true : false}
            helperText={
              touched.confirm_password && errors.confirm_password ? errors.confirm_password : null
            }
            fullWidth
            required
          />
          
          {/* SECURITY FIX: Display role as read-only instead of editable dropdown */}
          <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="role"
            mb="5px"
            mt="25px"
          >
            Role (Cannot be changed)
          </Typography>
          <CustomTextField
            id="role"
            name="role"
            variant="outlined"
            value={values.role}
            fullWidth
            disabled
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#000000',
              },
            }}
          />
        </Stack>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          onClick={handleSubmit}
        >
          Update
        </Button>
      </Box>
      {subtitle}
    </>
  );
};

export default AuthUpdate;