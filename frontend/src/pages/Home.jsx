import React from 'react'
import './Home.css'

function Home() {//home page
  return (
    <div className='home-container'>
      <div className='card home-card'>
          <h5 style={{padding:"10px"}}>John Doe</h5>
          <div className='card-image'>
              <img  src="https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
          </div>
          <div className='card-content'>
            <i className="material-icons" style={{color:"red"}}>favorite</i>
            <h6>Post Title</h6>
            <p>Welcome to the world of coding</p>
            <input type="text" placeholder='Enter comment'/>
          </div>
      </div>
      <div className='card home-card'>
          <h5 style={{padding:"10px"}}>John Doe</h5>
          <div className='card-image'>
              <img  src="https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
          </div>
          <div className='card-content'>
            <i className="material-icons" style={{color:"red"}}>favorite</i>
            <h6>Post Title</h6>
            <p>Welcome to the world of coding</p>
            <input type="text" placeholder='Enter comment'/>
          </div>
      </div>
      <div className='card home-card'>
          <h5 style={{padding:"10px"}}>John Doe</h5>
          <div className='card-image'>
              <img  src="https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
          </div>
          <div className='card-content'>
            <i className="material-icons" style={{color:"red"}}>favorite</i>
            <h6>Post Title</h6>
            <p>Welcome to the world of coding</p>
            <input type="text" placeholder='Enter comment'/>
          </div>
      </div>
      <div className='card home-card'>
          <h5 style={{padding:"10px"}}>John Doe</h5>
          <div className='card-image'>
              <img  src="https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
          </div>
          <div className='card-content'>
            <i className="material-icons" style={{color:"red"}}>favorite</i>
            <h6>Post Title</h6>
            <p>Welcome to the world of coding</p>
            <input type="text" placeholder='Enter comment'/>
          </div>
      </div>
    </div>
    
  )
}

export default Home