import React from 'react';
import Menuitems from './MenuItems';
import { useLocation } from 'react-router';
import { Box, List } from '@mui/material';
import NavItem from './NavItem';
import NavGroup from './NavGroup/NavGroup';
import { useSelector } from 'react-redux';

const SidebarItems = ({ isCollapsed = false }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const { pathname } = useLocation();
  const pathDirect = pathname;

  return (
    <Box sx={{ px: isCollapsed ? 1 : 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {Menuitems.map((item) => {
          // Check if the user is a student and if the item should be hidden
          if (userInfo?.role === 'student') {
            if (
              ['User Management', 'Create Exam', 'Add Questions', 'Exam Logs'].includes(item.title) ||
              (item.subheader && item.subheader === 'Teacher')
            ) {
              return null; // Don't render these menu items for students
            }
          }

          // {/********SubHeader**********/}
          if (item.subheader) {
            return <NavGroup item={item} key={item.subheader} isCollapsed={isCollapsed} />;

          // {/********If Sub Menu**********/}
          } else {
            return (
              <NavItem 
                item={item} 
                key={item.id} 
                pathDirect={pathDirect} 
                isCollapsed={isCollapsed}
              />
            );
          }
        })}
      </List>
    </Box>
  );
};

export default SidebarItems;