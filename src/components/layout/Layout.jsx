import React from 'react';
import { Outlet } from 'react-router-dom';
import '../../styles/global.css';
import '../../styles/responsive.css';

const Layout = () => {
  return <Outlet />;
};

export default Layout;
