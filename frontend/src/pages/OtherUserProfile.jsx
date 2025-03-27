import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../App'; 
import M from 'materialize-css';

function OtherUserProfile() {
  const [userData, setUserData] = useState(null);
  const [myposts, setMyPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false); 
  const { userId } = useParams();
  const { state, dispatch } = useContext(UserContext);  

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

  // Update isFollowing based on userData and logged-in user state
  useEffect(() => {
    if (userData && state) {
      // Check if logged-in user's id is in the followers list of the profile user
      setIsFollowing(userData.followers?.includes(state._id));
    }
  }, [userData, state]);

  const follow = () => {
    fetch('/api/follow', {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ followId: userId }),
    })
    .then(async (response) => {
        const result = await response.json();
        console.log("Follow API Response:", result);  // ✅ Check the response
        if (!response.ok) {
            throw new Error(result.error || "Failed to follow user");
        }
        return result;
    })
    .then((updatedUser) => {
        console.log("Updated User:", updatedUser);
        dispatch({type: "UPDATE", payload: {followers: updatedUser.followers , followers: updatedUser.followers}});
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserData((prevData) => ({
            ...prevData,
            followers: [...(prevData.followers || []), state._id],
        }));

        M.toast({ html: "Followed successfully!", classes: "green darken-2" });
    })
    .catch((error) => {
        console.error("Error following user:", error);
        M.toast({ html: "Something went wrong!", classes: "red darken-3" });
    });
};


const unfollow = () => {
  fetch('/api/unfollow', {
      method: "PUT",
      headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ unfollowId: userId }),
  })
  .then(async (response) => {
      const result = await response.json();
      console.log("Unfollow API Response:", result);  // ✅ Check API response
      if (!response.ok) {
          throw new Error(result.error || "Failed to unfollow user");
      }
      return result;
  })
  .then((updatedUser) => {
      console.log("Updated User After Unfollow:", updatedUser);
      dispatch({type: "UPDATE", payload: {followers: updatedUser.followers , followers: updatedUser.followers}});
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setUserData((prevData) => ({
          ...prevData,
          followers: (prevData.followers || []).filter(id => id !== state._id),
      }));

      M.toast({ html: "Unfollowed successfully!", classes: "blue darken-3" });
  })
  .catch((error) => {
      console.error("Error unfollowing user:", error);
      M.toast({ html: "Something went wrong!", classes: "red darken-3" });
  });
};


  return (
    <div className='main-container'>
      <div className='profile-container'>
        <div>
          {/* Display the profile picture */}
          <img 
            style={{ width: "166px", height: "166px", borderRadius: "83px" }} 
            src='https://images.unsplash.com/photo-1504593811423-6dd665756598?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
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
          {/* Render the follow/unfollow button only if userData is loaded, and the logged-in user is not viewing their own profile */}
          <button 
    onClick={userData?.followers?.includes(state._id) ? unfollow : follow} 
    className={`btn waves-effect waves-light ${userData?.followers?.includes(state._id) ? "red darken-3" : "blue darken-4"}`}
>
    {userData?.followers?.includes(state._id) ? "Unfollow" : "Follow"}
</button>

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
