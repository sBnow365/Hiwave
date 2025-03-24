import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../App'; // Ensure correct path
import M from 'materialize-css'; // Toast notifications

function OtherUserProfile() {
  const [userData, setUserData] = useState(null); // Store user data
  const [myposts, setMyPosts] = useState([]); // Initialize posts state separately
  const { state } = useContext(UserContext); // Access context

  const { userId } = useParams();
  console.log("Fetching user data for:", userId);

  useEffect(() => {
    if (!userId) {
      M.toast({ html: "User ID not found!", classes: "red darken-3" });
      return;
    }

    const token = localStorage.getItem("token"); // Ensure token is stored after login

    fetch(`/api/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Send the token
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("User data received:", data);
        setUserData(data.userInfo);
        setMyPosts(data.posts || []); // Assuming the backend returns posts in `data.posts`
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        M.toast({ html: "Failed to load user data", classes: "red darken-3" });
      });

  }, [userId]); // Remove setMyPosts from dependencies to avoid unnecessary re-renders

  return (
    <div>
      {/* Render user profile */}
      {userData ? (
        <h2>{userData.fullName}</h2>
      ) : (
        <p>Loading user data...</p>
      )}

      {/* Render posts if available */}
      <div>
        {myposts.length > 0 ? (
          myposts.map((post) => (
            <div key={post._id}>
              <p>{post.content}</p>
            </div>
          ))
        ) : (
          <p>No posts available</p>
        )}
      </div>
    </div>
  );
}

export default OtherUserProfile;
