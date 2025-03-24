import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../App'; 
import M from 'materialize-css'; 

function OtherUserProfile() {
  const [userData, setUserData] = useState(null); 
  const [myposts, setMyPosts] = useState([]); 
  const { userId } = useParams();
  const { state } = useContext(UserContext);

  useEffect(() => {
    if (!userId) {
      M.toast({ html: "User ID not found!", classes: "red darken-3" });
      return;
    }

    const token = localStorage.getItem("token");

    fetch(`/api/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        console.log("Full API Response:", data);

        if (data && data.user) { 
          console.log("User Info:", data.user);
          setUserData(data.user);
        } else {
          console.log("No user data received");
          setUserData({});
        }
        
        setMyPosts(data.posts || []);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        M.toast({ html: "Failed to load user data", classes: "red darken-3" });
      });

  }, [userId]);

  return (
    <div className='main-container'>
      <div className='profile-container'>
        <div>
          {/* ✅ Fix: Correctly display the profile picture */}
          <img 
            style={{ width: "166px", height: "166px", borderRadius: "83px" }} 
            src = 'https://images.unsplash.com/photo-1504593811423-6dd665756598?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            alt="Profile"
          />
        </div>
        <div className='details-section'>
          <h4>{userData?.fullName || "No name available"}</h4>
          <h5>{userData?.email || "No email available"}</h5>
          <div className='followings'>
            <h6>{myposts.length} posts</h6>
            <h6>{userData?.followers?.length || 0} followers</h6>
            <h6>{userData?.following?.length || 0} following</h6>
          </div>
        </div>
      </div>

      <div className='posts'>
        {myposts.length > 0 ? (
          myposts.map((post) => (
            <img 
              className='post' 
              src={post.image} 
              alt={post.title || "Post"} 
              key={post._id} 
            />
          ))
        ) : (
          <p>No posts available</p>
        )}
      </div>
    </div>
  );
}

export default OtherUserProfile;
