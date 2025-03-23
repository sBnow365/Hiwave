import React, {useState} from 'react'
import {Link} from 'react-router-dom'
import M from 'materialize-css';
import './Signup.css'

function SignUp() {
  const[fullName, setFullName] = useState("");
  const[email, setEmail] = useState("");
  const[password, setPassword] = useState("");

  const register = ()=>{
    fetch("/api/register",{
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName: fullName,
        email: email,
        password: password
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
      }
    });
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
          <button onClick={() => register()} className="btn waves-effect waves-light btn-large #64b5f6 blue darken-1">SignUp</button>
          <h6>
            <Link to="/login">Already have an account?</Link>
          </h6>
      </div>
    </div>
  )
}

export default SignUp