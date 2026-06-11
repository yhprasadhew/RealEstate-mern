import React from "react";
import Logo from "./common/Logo";
import { dashboardNavbarStyles as s } from "../assets/dummyStyles";
import { HiMenuAlt2 } from "react-icons/hi";

const DashboardNavbar = ({ onMenuClick }) => {
  return (
    <header className={s.header}>
      <button
        onClick={onMenuClick}
        className={s.menuButton}
      >
        <HiMenuAlt2 size={24} />
      </button>

      <div className={s.logoContainer}>
        <Logo />
        <span className={s.title}>
          Dashboard
        </span>
      </div>
    </header>
  );
};

export default DashboardNavbar;