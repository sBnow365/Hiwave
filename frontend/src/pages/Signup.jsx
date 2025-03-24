import React, {useState , useEffect} from 'react'
import {Link , useNavigate} from 'react-router-dom'
import M from 'materialize-css';
import './Signup.css'
const CLOUD_NAME = "dku7k2gnt"; // Replace with your Cloud Name
const UPLOAD_PRESET = "dynamicduo"; // Ensure you have this from Cloudinary


function SignUp() {
  const navigate = useNavigate();
  const[fullName, setFullName] = useState("");
  const[email, setEmail] = useState("");
  const[password, setPassword] = useState("");
  const[profilePic, setProfilePic] = useState("");
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
    <div className="login-container" >
      <div className="card login-card .input-field input">
          <h2>Instagram</h2>
          <input 
            type="text" 
            placeholder='Full-Name'
            value={fullName}
            onChange={(event)=>setFullName(event.target.value)}
           />
          <input 
            type="text" 
            placeholder='email' 
            value={email}
            onChange={(event)=>setEmail(event.target.value)}
          />
          <input 
            type="password" 
            placeholder='password' 
            value={password}
            onChange={(event)=>setPassword(event.target.value)}
          />
          <div className="file-field input-field">
            <div className="btn #64b5f6 blue darken-1">
                <span>Profile Picture</span>
                <input type="file" onChange={(event)=>setProfilePic(event.target.files[0])}/>
            </div>
            <div className="file-path-wrapper">
                <input className="file-path validate" type="text" />
            </div>
        </div>
          <button onClick={() => register()} className="btn waves-effect waves-light btn-large #64b5f6 blue darken-1">SignUp</button>
          <h6>
            <Link to="/login">Already have an account?</Link>
          </h6>
      </div>
    </div>
  )
}

export default SignUp