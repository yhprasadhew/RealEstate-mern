import React from 'react';
import { NavLink } from 'react-router-dom'; // Added missing import
import { 
  HiOutlineUsers, 
  HiOutlineViewGrid, 
  HiOutlineUserCircle,   // Added missing import
  HiOutlineLibrary,      // Added missing import
  HiOutlineChatAlt2,     // Added missing import
  HiOutlineMail,          // Added missing import
  HiOutlineStar
} from 'react-icons/hi';
import { adminSidebarStyles as s } from '../assets/dummyStyles';
import { useAuth } from '../context/AuthContext';
import Logo from './common/Logo';

const AdminSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const navItems = [
    { name: "Overview", icon: HiOutlineViewGrid, path: "/admin-dashboard" },
    { name: "Users", icon: HiOutlineUsers, path: "/admin/users" },
    { name: "Seller Requests", icon: HiOutlineUserCircle, path: "/admin/seller-requests" },
    { name: "Properties", icon: HiOutlineLibrary, path: "/admin/properties" },
    { name: "Inquiries", icon: HiOutlineChatAlt2, path: "/admin/inquiries" },
    { name: "Contact Inbox", icon: HiOutlineMail, path: "/admin/contacts" },
    { name: "Reviews", icon: HiOutlineStar, path: "/admin/reviews" },
  ];

  return (
    <>
      {/* Sidebar Backdrop for Mobile */}
      <div className={s.backdrop(isOpen)} onClick={onClose} />

      {/* Sidebar Navigation Panel */}
      <aside className={s.sidebar(isOpen)}>
        <div className={s.logoContainer}>
          {/* Capitalized Logo component */}
          <Logo fontSize="1.5rem" iconSize={20} />
        </div>

        <nav className={s.navContainer}>
          {navItems.map((item) => {
            // Store the component reference dynamically
            const IconComponent = item.icon; 
            return (
              <NavLink 
                key={item.name} 
                to={item.path}
                onClick={onClose} // Fixed lowercase onclick
                className={({ isActive }) => s.navLink(isActive)}
              >
                <IconComponent size={20} className={s.linkIcon} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Optional: You can place your logout button here if needed */}
        <div className={s.footerContainer}>
          <button onClick={logout} className={s.logoutButton}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;