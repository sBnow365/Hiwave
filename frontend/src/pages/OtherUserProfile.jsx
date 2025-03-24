import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../App'; 
import M from 'materialize-css'; 

function OtherUserProfile() {
  const [userData, setUserData] = useState(null); 
  const [myposts, setMyPosts] = useState([]); 
  const { userId } = useParams();
  const { state, dispatch } = useContext(UserContext); // Include dispatch

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

  const follow = () => {
    fetch(`/api/follow`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ followId: userId }),
    })
      .then((response) => response.json())
      .then((updatedUser) => {
        setUserData((prev) => ({
          ...prev,//expand what we currently have in state
          followers: [...prev.followers, state._id],
        }));

        dispatch({
          type: "UPDATE",
          payload: {
            followers: updatedUser.followers,
            following: [...state.following, userId],
          },
        });

        //updating the local storage
        localStorage.setItem("userInfo", JSON.stringify(updatedUser));

        M.toast({ html: "Followed Successfully!", classes: "green darken-2" });
      })
      .catch((error) => {
        console.error("Error updating likes:", error);
        M.toast({ html: "Something went wrong!", classes: "red darken-3" });
      });
  };

  const unfollow = () => {
    fetch(`/api/unfollow`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ followId: userId }),
    })
      .then((response) => response.json())
      .then((updatedUser) => {
        setUserData((prev) => ({
          ...prev,
          followers: prev.followers.filter((id) => id !== state._id),
        }));

        dispatch({
          type: "UPDATE",
          payload: {
            followers: updatedUser.followers,
            following: state.following.filter((id) => id !== userId),
          },
        });
  
        localStorage.setItem("userInfo", JSON.stringify(updatedUser));

        M.toast({ html: "Unfollowed Successfully!", classes: "red darken-2" });
      })
      .catch((error) => {
        console.error("Error updating likes:", error);
        M.toast({ html: "Something went wrong!", classes: "red darken-3" });
      });
  };
  
  return (
    <div className='main-container'>
      <div className='profile-container'>
        <div>
          <img 
            style={{ width: "166px", height: "166px", borderRadius: "83px" }} 
            src={user.Profile.user.profilePicUrl}
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
          {!userData?.followers?.includes(state._id) ? (
            <button style={{margin: "10px"}} onClick={follow} className="btn waves-effect waves-light  #0d47a1 blue darken-4">Follow</button>
          ) : (
            <button style={{margin: "10px"}} onClick={unfollow} className="btn waves-effect waves-light  red darken-4">Unfollow</button>
          )}
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
