import { useState } from "react";
import { Link } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";

import { navbarStyles as s } from "../../assets/dummyStyles";
import Logo from "./Logo";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  // Center links visible to all desktop/mobile users, with role-specific items appended
  const centerLinks = (
    <>
      <Link to="/" className={s.navLink} onClick={() => setIsOpen(false)}>
        Home
      </Link>
      <Link to="/properties" className={s.navLink} onClick={() => setIsOpen(false)}>
        Browse Properties
      </Link>
      <Link to="/contact" className={s.navLink} onClick={() => setIsOpen(false)}>
        Contact Us
      </Link>

      {/* Role specific links in the middle */}
      {user?.role === "buyer" && (
        <>
          <Link to="/wishlist" className={s.navLink} onClick={() => setIsOpen(false)}>
            Wishlist
          </Link>
          <Link to="/chat-messages" className={s.navLink} onClick={() => setIsOpen(false)}>
            Messages
          </Link>
        </>
      )}

      {user?.role === "seller" && (
        <>
          <Link to="/dashboard" className={s.navLink} onClick={() => setIsOpen(false)}>
            Dashboard
          </Link>
          <Link to="/properties/manage" className={s.navLink} onClick={() => setIsOpen(false)}>
            My Properties
          </Link>
          <Link to="/chat-messages" className={s.navLink} onClick={() => setIsOpen(false)}>
            Messages
          </Link>
        </>
      )}

      {user?.role === "admin" && (
        <>
          <Link to="/admin-dashboard" className={s.navLink} onClick={() => setIsOpen(false)}>
            Admin Dashboard
          </Link>
        </>
      )}
    </>
  );

  // Right side links: Sign In and Register for guest, Avatar and Logout for authenticated members
  const rightLinks = (
    <>
      {!user ? (
        <div className="flex items-center gap-4">
          <Link to="/login" className={s.navLink} onClick={() => setIsOpen(false)}>
            Login
          </Link>
          <Link to="/register" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all duration-200 shadow-sm" onClick={() => setIsOpen(false)}>
            Register
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link to="/profile" className="flex items-center" onClick={() => setIsOpen(false)}>
            <img
              src={user?.profilePicture || "https://via.placeholder.com/40"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
          </Link>
          <button 
            onClick={handleLogout} 
            className={s.logoutBtn || "px-3 py-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"}
          >
            Logout
          </button>
        </div>
      )}
    </>
  );

  return (
    <nav className="relative flex items-center justify-between px-6 py-4 bg-white shadow-sm z-50 w-full">
      
      {/* 1. LEFT SIDE: Logo gets equal flex weight */}
      <div className="flex-1 flex justify-start">
        <Logo />
      </div>

      {/* 2. CENTER SIDE: Absolute dead-center alignment on Desktop */}
      <div className="hidden md:flex flex-initial justify-center items-center">
        <div className={s.desktopMenu || "flex items-center gap-6 font-medium text-gray-600"}>
          {centerLinks}
        </div>
      </div>

      {/* 3. RIGHT SIDE: Profile Action / Guest Auth / Mobile Toggle Button Area */}
      <div className="flex-1 flex items-center justify-end gap-4">
        <div className="hidden md:flex items-center gap-4">
          {rightLinks}
        </div>

        {/* Hamburger Trigger button - Fixed to the right edge (Visible only under 768px wide viewport) */}
        <button
          className="block md:hidden p-1 text-gray-700 hover:text-gray-900 focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <HiMenu size={28} />
        </button>
      </div>

      {/* 4. MOBILE RIGHT SLIDE DRAWER OVERLAY */}
      {isOpen && (
        <>
          {/* Backdrop Blur Mask */}
          <div 
            className="fixed inset-0 bg-black/40 md:hidden transition-opacity duration-300 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)} 
          />

          {/* Right Mobile Drawer Panel */}
          <div className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl p-6 flex flex-col md:hidden z-50">
            
            {/* Top Row: Brand Logo on Left, Close Trigger on Right inside Mobile Menu */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-100">
              <Logo />
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1 text-gray-600 hover:text-gray-900"
                aria-label="Close menu"
              >
                <HiX size={28} />
              </button>
            </div>

            {/* Optional Profile Dashboard Card inside Mobile Drawer */}
            {user && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-6">
                <Link to="/profile" onClick={() => setIsOpen(false)}>
                  <img
                    src={user?.profilePicture || "https://via.placeholder.com/40"}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border border-white shadow-sm"
                  />
                </Link>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800">{user.name || "User"}</span>
                  <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                </div>
              </div>
            )}

            {/* Vertically Stacked Interactive Links */}
            <div className="flex flex-col gap-4 text-left overflow-y-auto flex-1">
              {centerLinks}
              {!user && (
                <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                  <Link to="/login" className={s.navLink} onClick={() => setIsOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="w-full p-3 text-center font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-750 rounded-xl transition-colors" onClick={() => setIsOpen(false)}>
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Footer Logout Button */}
            {user && (
              <div className="pt-4 mt-auto border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full p-3 text-center font-medium text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;