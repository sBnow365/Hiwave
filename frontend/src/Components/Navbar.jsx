import React , {useContext} from "react";
import './Navbar.css'
import { Link , useNavigate} from "react-router-dom";
import { UserContext } from "../App";

const Navbar = () =>{
  const {state, dispatch} = useContext(UserContext);
  const navigate = useNavigate();
  const logout = () =>{
    localStorage.clear();
    dispatch({type: "LOGOUT"});
    navigate('/login');
  }
  const navList = () =>{
    if(state){ //if the user object is present that is user is loggged in
      return [
        <li key="create-post"><Link to="/create-post">CreatePost</Link></li>,
        <li key="profile"><Link to="/profile">Profile</Link></li>,
        <li key ="logout">
          <button onClick={() => logout()} className="btn waves-effect waves-light  #d32f2f red darken-2">Logout</button>
        </li> 
      ];
    }else{
      return [
        <li key="login"><Link to="/login">Login</Link></li>,
        <li key="signup" ><Link to="/signup">Signup</Link></li>
      ];
    }
  };

  return(
      <nav>
      <div className="nav-wrapper white">
        <Link to={state? "/" : "/login"} className="brand-logo">Instagram</Link>
        <ul id="nav-mobile" className="right">
          {navList()}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;