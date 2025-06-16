import React, { useContext } from "react";
import './Navbar.css';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../App";
import brandLogo from '../assets/brand.jpeg';

const Navbar = () => {
  const { state, dispatch } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation(); // To detect active links
  
  const logout = () => {
    localStorage.clear();
    dispatch({ type: "LOGOUT" });
    navigate('/login');
  };
  
  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const navList = () => {
    if (state) {
      return [
        <li key="create-post">
          <Link to="/create-post" className={`create-post-link ${isActive("/create-post")}`}>
            Create Post
          </Link>
        </li>,
        <li key="postfromfollowing">
          <Link to="/postsfromfollowing" className={`following-link ${isActive("/postsfromfollowing")}`}>
            Following
          </Link>
        </li>,
        <li key="profile">
          <Link to="/profile" className={`profile-link ${isActive("/profile")}`}>
            Profile
          </Link>
        </li>,
        <li key="logout">
          <button onClick={() => logout()} className="btn waves-effect waves-light">
            Logout
          </button>
        </li>
      ];
    } else {
      return [
        <li key="login">
          <Link to="/login" className={isActive("/login")}>Login</Link>
        </li>,
        <li key="signup">
          <Link to="/signup" className={isActive("/signup")}>Signup</Link>
        </li>
      ];
    }
  };

  return (
    <nav>
      <div className="nav-wrapper">
        <Link to="/" className="brand-logo">
  <img src={brandLogo} alt="Logo" className="brand-img1" />
  <span className="brand-text">HiWave</span>
</Link>
        <ul id="nav-mobile" className="right">
          {navList()}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;