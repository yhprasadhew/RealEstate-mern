import React from "react";
import { NavLink } from "react-router-dom";
import { 
  HiOutlineViewGrid, 
  HiOutlinePlusCircle, 
  HiOutlineChatAlt2, 
  HiOutlineUser 
} from "react-icons/hi";

import { sellerSidebarStyles as s } from "../assets/dummyStyles";
import { useAuth } from "../context/AuthContext";
import Logo from "./common/Logo";

const SellerSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const navItems = [
    { name: "Dashboard", icon: HiOutlineViewGrid, path: "/dashboard" },
    { name: "Create Listing", icon: HiOutlinePlusCircle, path: "/dashboard/create-listing" },
    { name: "Messages", icon: HiOutlineChatAlt2, path: "/chat-messages" },
    { name: "Profile", icon: HiOutlineUser, path: "/profile" },
  ];

  return (
    <>
      {/* Sidebar Backdrop for Mobile */}
      <div 
        className={`${s.backdrop} ${isOpen ? s.backdropVisible : s.backdropHidden}`} 
        onClick={onClose} 
      />

      {/* Sidebar Navigation Panel */}
      <aside className={`${s.sidebar} ${isOpen ? s.sidebarOpen : s.sidebarClosed}`}>
        <div className={s.logoContainer}>
          <Logo fontSize="1.5rem" iconSize={20} />
        </div>

        <nav className={s.nav}>
          {navItems.map((item) => {
            const IconComponent = item.icon; 
            return (
              <NavLink 
                key={item.name} 
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => 
                  `${s.navLink} ${isActive ? s.navLinkActive : s.navLinkInactive}`
                }
                end={item.path === "/dashboard"}
              >
                <IconComponent size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className={s.logoutContainer}>
          <button onClick={logout} className={s.logoutButton}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default SellerSidebar;