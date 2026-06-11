import React from "react";
import { Link } from "react-router-dom";
import { HiOutlineHome } from "react-icons/hi";
import { logoStyles as s } from "../../assets/dummyStyles";

const Logo = ({
  fontSize = "1.5rem",
  iconSize = 28,
  showText = true,
  ...props
}) => {
  return (
    <Link
      to="/"
      className={`${s.link} ${props.className || ""}`}
      style={{ fontSize, ...props.style }}
    >
      <div className={s.iconWrapper}>
        <HiOutlineHome size={iconSize} />
      </div>
//logo
      {showText && (
        <span className={s.text}>
          Emerald Estates
        </span>
      )}
    </Link>
  );
};

export default Logo;

