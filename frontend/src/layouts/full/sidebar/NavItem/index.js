import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
// mui imports
import {
  ListItemIcon,
  ListItem,
  List,
  styled,
  ListItemText,
  useTheme,
  Tooltip
} from '@mui/material';

const NavItem = ({ item, level, pathDirect, onClick, isCollapsed = false }) => {
  const Icon = item.icon;
  const theme = useTheme();
  const itemIcon = <Icon stroke={1.5} size="1.3rem" />;

  const ListItemStyled = styled(ListItem)(() => ({
    whiteSpace: 'nowrap',
    marginBottom: '2px',
    padding: '8px 10px',
    borderRadius: '8px',
    backgroundColor: level > 1 ? 'transparent !important' : 'inherit',
    color: theme.palette.text.secondary,
    paddingLeft: isCollapsed ? '10px' : '10px',
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
    },
    '&.Mui-selected': {
      color: 'white',
      backgroundColor: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      },
    },
  }));

  const listItemContent = (
    <ListItemStyled
      button
      component={item.external ? 'a' : NavLink}
      to={item.href}
      href={item.external ? item.href : ''}
      disabled={item.disabled}
      selected={pathDirect === item.href}
      target={item.external ? '_blank' : ''}
      onClick={onClick}
    >
      <ListItemIcon
        sx={{
          minWidth: isCollapsed ? 'auto' : '36px',
          p: '3px 0',
          color: 'inherit',
          justifyContent: 'center',
        }}
      >
        {itemIcon}
      </ListItemIcon>
      {!isCollapsed && (
        <ListItemText>
          <>{item.title}</>
        </ListItemText>
      )}
    </ListItemStyled>
  );

  return (
    <List component="li" disablePadding key={item.id}>
      {isCollapsed ? (
        <Tooltip title={item.title} placement="right">
          {listItemContent}
        </Tooltip>
      ) : (
        listItemContent
      )}
    </List>
  );
};

NavItem.propTypes = {
  item: PropTypes.object,
  level: PropTypes.number,
  pathDirect: PropTypes.any,
  isCollapsed: PropTypes.bool,
};

export default NavItem;