import React from "react";
import { navbarStyles as s } from "../../assets/dummyStyles";
import Logo from "./Logo";

const Navbar = () => {
  return (
    <nav className={s.nav}>
      <div className="justify-self-start">
        <Logo />
      </div>
    </nav>
  );
};

export default Navbar;