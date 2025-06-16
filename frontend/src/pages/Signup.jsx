import React, {useState, useEffect} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import M from 'materialize-css';
import './Signup.css'
import brandLogo from '../assets/brand.jpeg';  // Import your brand logo

const CLOUD_NAME = "dku7k2gnt"; // Replace with your Cloud Name
const UPLOAD_PRESET = "dynamicduo"; // Ensure you have this from Cloudinary

function SignUp() {
  const navigate = useNavigate();
  const[fullName, setFullName] = useState("");
  const[email, setEmail] = useState("");
  const[password, setPassword] = useState("");
  const[profilePic, setProfilePic] = useState("");
  const[profilePreview, setProfilePreview] = useState(null);
  const[url, setUrl] = useState("");

  useEffect(()=>{ 
    if(url){
      submitData();
    }
  },[url]);

  const uploadProfilePicture = () => {
    const formData = new FormData();
    formData.append("file", profilePic);
    formData.append("upload_preset", UPLOAD_PRESET); // Use the correct preset from Cloudinary
    formData.append("cloud_name", CLOUD_NAME); 
  
    fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log("Cloudinary Response:", data);  // Log response to check if upload works
      if (data.secure_url) {
        setUrl(data.secure_url);  // Use `secure_url` instead of `url`
      } else {
        console.error("Upload failed: ", data);
      }
    })
    .catch(error => {
      console.error("Cloudinary Upload Error:", error);
    });
  };
  
  // Add new function to handle file selection with preview
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePic(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitData = ()=>{
    if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)){
      M.toast({html: "Enter valid email" , classes: "#c62828 red darken-3"})
      return
      
    }

    fetch("/api/register",{
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName: fullName,
        email: email,
        password: password,
        profilePic: url
      })
    })
    .then(response=>response.json())
    .then(function(data){
      console.log(data);
      if(data.error){
        M.toast({html: data.error , classes: "#c62828 red darken-3"})
      }
      else{
        M.toast({html: data.result , classes: "#388e3c green darken-2"})
        navigate('/login');  
      }
    }).catch(error => {
      console.error("Error:", error);
      M.toast({ html: "Something went wrong!", classes: "#c62828 red darken-3" });
    });
  } 

  const register = ()=>{
    if(profilePic){
      uploadProfilePicture();
    }else{
      submitData();
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-header">
        <img src={brandLogo} alt="Logo" className="signup-brand-img" />
        <h2 className="signup-logo">Hi Wave</h2>
        <p className="signup-subtitle">Sign up to see photos and videos from your friends.</p>
      </div>
      <div className="input-field">
        <input 
          type="text" 
          id="fullName"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
        <label htmlFor="fullName" className={fullName ? "active" : ""}>Full Name</label>
      </div>
      <div className="input-field">
        <input 
          type="text" 
          id="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <label htmlFor="email" className={email ? "active" : ""}>Email</label>
      </div>
      <div className="input-field">
        <input 
          type="password" 
          id="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <label htmlFor="password" className={password ? "active" : ""}>Password</label>
      </div>
      
      {/* Updated profile picture section */}
      <div className="profile-upload-container">
        {profilePreview && (
          <div className="profile-preview">
            <img src={profilePreview} alt="Profile Preview" />
          </div>
        )}
        <div className="file-field input-field profile-upload">
          <div className="btn upload-btn">
            <span>{profilePreview ? "Change Profile Picture" : "Upload Profile Picture"}</span>
            <input 
              type="file" 
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>
          <div className="file-path-wrapper">
            <input className="file-path validate" type="text" placeholder="Upload your profile picture" />
          </div>
        </div>
      </div>
      
      <button onClick={() => register()} className="btn signup">Sign Up</button>
      <div className="login-link">
        <p>Already have an account? <Link to="/login">Log In</Link></p>
      </div>
    </div>
  )
}

export default SignUp