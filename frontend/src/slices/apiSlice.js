import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL, // ← FIXED: Changed BACKEND_URL to API_URL
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ['User'],
  endpoints: (builder) => ({}),
});