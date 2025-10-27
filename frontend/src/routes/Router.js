import React, { lazy } from 'react';
import { Navigate, Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import Loadable from '../layouts/full/shared/loadable/Loadable';

/* ***Layouts**** */
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const ExamLayout = Loadable(lazy(() => import('../layouts/full/ExamLayout')));

/* ****Pages***** */
const SamplePage = Loadable(lazy(() => import('../views/sample-page/SamplePage')));
const Success = Loadable(lazy(() => import('../views/Success')));

// Student Routes
const TestPage = Loadable(lazy(() => import('./../views/student/TestPage')));
const ExamPage = Loadable(lazy(() => import('./../views/student/ExamPage')));
const ExamDetails = Loadable(lazy(() => import('./../views/student/ExamDetails')));
const CodeDetails = Loadable(lazy(() => import('../views/student/CodeDetails')));
const ResultPage = Loadable(lazy(() => import('./../views/student/ResultPage')));
const Coder = Loadable(lazy(() => import('../views/student/Coder')));

// Auth Routes
const Error = Loadable(lazy(() => import('../views/authentication/Error')));
const Login = Loadable(lazy(() => import('../views/authentication/Login')));
const UserAccount = Loadable(lazy(() => import('../views/authentication/UserAccount')));

// Teacher Routes
const CreateExamPage = Loadable(lazy(() => import('./../views/teacher/CreateExamPage')));
const ExamLogPage = Loadable(lazy(() => import('./../views/teacher/ExamLogPage')));
const AddQuestions = Loadable(lazy(() => import('./../views/teacher/AddQuestions')));
const UserManagement = Loadable(lazy(() => import('./../views/teacher/UserManagement')));
const PrivateRoute = Loadable(lazy(() => import('../views/authentication/PrivateRoute')));
const TeacherRoute = Loadable(lazy(() => import('../views/authentication/TeacherRoute')));

const Router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* Public Routes */}
      <Route path="/auth" element={<BlankLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="404" element={<Error />} />
      </Route>

      {/* Private Routes with FullLayout */}
      <Route path="/" element={<PrivateRoute><FullLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<ExamPage />} />
        <Route path="sample-page" element={<SamplePage />} />
        <Route path="success" element={<Success />} />
        <Route path="exam" element={<ExamPage />} />
        <Route path="result" element={<ResultPage />} />
        
        {/* User Account Route */}
        <Route path="user/account" element={<UserAccount />} />
      </Route>

      {/* Teacher Routes with FullLayout */}
      <Route path="/" element={<PrivateRoute><FullLayout /></PrivateRoute>}>
        <Route path="create-exam" element={<TeacherRoute><CreateExamPage /></TeacherRoute>} />
        <Route path="add-questions" element={<TeacherRoute><AddQuestions /></TeacherRoute>} />
        <Route path="exam-log" element={<TeacherRoute><ExamLogPage /></TeacherRoute>} />
        <Route path="user-management" element={<TeacherRoute><UserManagement /></TeacherRoute>} />
      </Route>

      {/* Exam Routes with ExamLayout */}
      <Route path="/" element={<PrivateRoute><ExamLayout /></PrivateRoute>}>
        <Route path="exam/:examId" element={<ExamDetails />} />
        <Route path="exam/:examId/codedetails" element={<CodeDetails />} />
        <Route path="exam/:examId/:testId" element={<TestPage />} />
        <Route path="exam/:examId/code" element={<Coder />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/auth/404" replace />} />
    </Route>
  )
);

export default Router;