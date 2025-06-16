import React, {useState, useContext} from 'react'
import { Link, useNavigate} from 'react-router-dom'
import M from 'materialize-css';
import { UserContext } from '../App';
import './Login.css'  // Import the new CSS file
import brandLogo from '../assets/brand.jpeg';

function Login() {
  const {state, dispatch} = useContext(UserContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const login = () => {
    if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)){
      M.toast({html: "Enter valid email", classes: "#c62828 red darken-3"})
      return
    }
    
    setIsLoading(true);

    fetch("/api/login", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    })
    .then(response => response.json())
    .then(function(data){
      setIsLoading(false);
      console.log(data);
      if(data.error){
        M.toast({html: data.error, classes: "#c62828 red darken-3"})
      }
      else{
        localStorage.setItem("token", data.token);
        localStorage.setItem("userInfo", JSON.stringify(data.userInfo));
        //dispatch the action and state to the reducer
        dispatch({type: "USER", payload: data.userInfo});
        M.toast({html: "Login Successful", classes: "#388e3c green darken-2"})
        navigate('/');  
      }
    }).catch(error => {
      setIsLoading(false);
      console.error("Error:", error);
      M.toast({ html: "Something went wrong!", classes: "#c62828 red darken-3" });
    });
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={brandLogo} alt="Logo" className="brand-img" />
        <h2>Hi Wave</h2>
        
        <input 
          type="text" 
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        
        {/* Optional: Uncomment if you want to add a forgot password link */}
        {/* <div className="forgot-password">
          <Link to="/reset-password">Forgot password?</Link>
        </div> */}
        
        <button 
          onClick={() => login()} 
          className={`btn ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
        
        {/* Optional: Uncomment if you want to add social login options */}
        {/* <div className="divider-text">OR</div>
        
        <div className="social-login">
          <button className="btn-social facebook">
            <i className="fa fa-facebook"></i> Login with Facebook
          </button>
          <button className="btn-social google">
            <i className="fa fa-google"></i> Login with Google
          </button>
        </div> */}
        
        <h6>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </h6>
      </div>
    </div>
  )
}

export default Login