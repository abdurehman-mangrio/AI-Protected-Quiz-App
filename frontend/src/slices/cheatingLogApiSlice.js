import { apiSlice } from './apiSlice';

const CHEATING_LOGS_URL = '/api/users';

export const cheatingLogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCheatingLogs: builder.query({
      query: (examId) => ({
        url: `${CHEATING_LOGS_URL}/cheatingLogs/${examId}`,
        method: 'GET',
      }),
      providesTags: (result, error, examId) => [
        { type: 'CheatingLog', id: examId }
      ],
    }),
    saveCheatingLog: builder.mutation({
      query: (data) => ({
        url: `${CHEATING_LOGS_URL}/cheatingLogs`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { examId }) => [
        { type: 'CheatingLog', id: examId }
      ],
    }),
  }),
});

export const { 
  useGetCheatingLogsQuery, 
  useSaveCheatingLogMutation 
} = cheatingLogApiSlice;