// Routes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../components/Login';
import VisitorRegistration from '../components/VisitorRegistration';
import UserDashboard from '../components/UserDashboard';
import AdminDashboard from '../components/AdminDashboard';
import ExistingUsersTable from '../components/common/ExistingUsersTable';
import VisitorPreview from '../components/VisitorPreview';

// import Registration from '../components/Registration'; // Uncomment if Registration is used

const routes = [
  { path: "/", element: <Login /> }, // Using Login as temporary root

  { path: "/visitor_registration", element: <VisitorRegistration /> },
  { path: "/user_dashboard", element: <UserDashboard /> },
  { path: "/admin_dashboard", element: <AdminDashboard /> },
  { path: "/admin/existing-users", element: <ExistingUsersTable /> },
  { path: "/visitor_preview/:aadhaar", element: <VisitorPreview /> },
];

const AppRoutes = () => {
  return (
    <Routes>
      {routes.map(({ path, element }, index) => (
        <Route key={index} path={path} element={element} />
      ))}
    </Routes>
  );
};

export default AppRoutes;
