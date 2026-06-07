import React from "react";
import { Link } from "react-router-dom";

import { navbarStyles as s } from "../../assets/dummyStyles";
import Logo from "./Logo";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  const publicLinks = [
    { path: "/properties", label: "Browse Properties" },
    { path: "/login", label: "Login" },
    { path: "/register", label: "Register" },
  ];

  const buyerLinks = [
    { path: "/", label: "Home" },
    { path: "/properties", label: "Properties" },
    { path: "/wishlist", label: "Wishlist" },
    { path: "/chat-messages", label: "Messages" },
    { path: "/contact", label: "Contact" },
  ];

  const sellerLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/properties/manage", label: "My Properties" },
    { path: "/chat-messages", label: "Messages" },
  ];

  const adminLinks = [
    { path: "/admin-dashboard", label: "Admin Dashboard" },
  ];

  const getLinks = () => {
    if (!user) return publicLinks;

    switch (user.role) {
      case "buyer":
        return buyerLinks;

      case "seller":
        return sellerLinks;

      case "admin":
        return adminLinks;

      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <nav className={s.nav}>
      {/* Logo */}
      <Logo />

      {/* Navigation */}
      <div className={s.desktopMenu}>
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={s.navLink}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* User Section */}
      <div className={s.rightSection}>
        {user ? (
          <div className={s.userSection}>
            <Link
              to="/profile"
              className="flex items-center gap-3"
            >
              <img
                src={
                  user.profilePic ||
                  `https://ui-avatars.com/api/?name=${
                    encodeURIComponent(user.name || "User")
                  }&background=0d6e59&color=fff`
                }
                alt={user.name || "User"}
                className={s.avatar}
              />

              <span className={s.userName}>
                {user.name}
              </span>
            </Link>

            <button
              onClick={logout}
              className={s.logoutBtn}
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  );
};

export default Navbar;