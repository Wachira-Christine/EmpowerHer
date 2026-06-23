import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout Wrappers
import Layout from '../components/layout/Layout';
import UserLayout from '../components/layout/UserLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Public Pages
import Landing from '../pages/Landing';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import AdminLogin from '../pages/Auth/AdminLogin';
import NotFound from '../pages/NotFound';

// User Pages
import Dashboard from '../pages/Dashboard';
import Education from '../pages/Education';
import ArticleDetail from '../pages/ArticleDetail';
import SelfExam from '../pages/SelfExam';
import Records from '../pages/Records';
import Reminders from '../pages/Reminders';
import Directory from '../pages/Directory';
import Profile from '../pages/Profile';

// Admin Pages
import AdminDashboard from '../pages/Admin/AdminDashboard';
import ManageContent from '../pages/Admin/ManageContent';
import ManageSelfExamGuide from '../pages/Admin/ManageSelfExamGuide';
import ManageFacilities from '../pages/Admin/ManageFacilities';
import UserFeedback from '../pages/Admin/UserFeedback';
import SystemSummary from '../pages/Admin/SystemSummary';
import AdminSettings from '../pages/Admin/AdminSettings';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root wrapper mapping global styling context */}
      <Route path="/" element={<Layout />}>
        
        {/* Landing Page */}
        <Route index element={<Landing />} />
        
        {/* Authentication Flows */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="admin/login" element={<AdminLogin />} />
        
        {/* User Workspace Module (Under UserLayout) */}
        <Route element={<UserLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="education" element={<Education />} />
          <Route path="education/article" element={<ArticleDetail />} />
          <Route path="self-examination" element={<SelfExam />} />
          <Route path="records" element={<Records />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="clinics" element={<Directory />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin Workspace Module (Under AdminLayout) */}
        <Route element={<AdminLayout />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/content" element={<ManageContent />} />
          <Route path="admin/self-exam-guide" element={<ManageSelfExamGuide />} />
          <Route path="admin/facilities" element={<ManageFacilities />} />
          <Route path="admin/feedback" element={<UserFeedback />} />
          <Route path="admin/summary" element={<SystemSummary />} />
          <Route path="admin/settings" element={<AdminSettings />} />
        </Route>
        
        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
