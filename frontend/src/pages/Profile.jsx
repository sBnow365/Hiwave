import React, { useEffect, useState, useContext } from "react";
import "./Profile.css";
import { UserContext } from "../App";
import M from "materialize-css";

function Profile() {
  const [myposts, setMyPosts] = useState([]);
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { state, dispatch } = useContext(UserContext);

  // Determine if this is the current user's profile or another user's
  const isCurrentUserProfile = state?._id === profileUser?._id;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // If no specific user ID is provided, fetch current user's profile
        const userId = state?._id;
        
        if (!userId) {
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/user/${userId}`, {
          method: "GET",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        
        setProfileUser(data.user);
        setMyPosts(data.posts);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
        setLoading(false);
        M.toast({ html: "Something went wrong!", classes: "red darken-3" });
      }
    };

    fetchProfileData();
  }, [state?._id]);

  const handleFollow = async () => {
    try {
      const endpoint = profileUser.followers.includes(state._id) 
        ? '/api/unfollow' 
        : '/api/follow';

      const bodyKey = endpoint === '/api/follow' ? 'followId' : 'unfollowId';

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem("token")
        },
        body: JSON.stringify({ [bodyKey]: profileUser._id })
      });

      if (!response.ok) {
        throw new Error('Follow/Unfollow failed');
      }

      const updatedUser = await response.json();
      
      // Update the profile user state
      setProfileUser(prevUser => ({
        ...prevUser,
        followers: updatedUser.followers,
        following: updatedUser.following
      }));

      // Update global state
      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUser
      });

      M.toast({ 
        html: `Successfully ${endpoint === '/api/follow' ? 'followed' : 'unfollowed'}!`, 
        classes: "green" 
      });
    } catch (error) {
      console.error('Follow/Unfollow error:', error);
      M.toast({ html: "Failed to update follow status", classes: "red" });
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!profileUser) {
    return <div>No profile found</div>;
  }

  return (
    <div className="main-container">
      <div className="profile-container">
        <div>
          <img
            style={{ width: "166px", height: "166px", borderRadius: "83px" }}
            src={profileUser.profileImage || "https://m.media-amazon.com/images/M/MV5BODk3OWIyY2MtM2E0MS00OWYyLTlkNDktMzY4MTE1MDhiYzBiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"}
            alt="Profile"
          />
        </div>
        <div className="details-section">
          <h4>{profileUser.fullName}</h4>
          <h5>{profileUser.email}</h5>
          <div className="followings">
            <h6>{myposts.length} posts</h6>
            <h6>{profileUser.followers?.length || 0} followers</h6>
            <h6>{profileUser.following?.length || 0} following</h6>
          </div>
        </div>
      </div>

      {/* Follow/Unfollow Button for other user's profiles */}
      {!isCurrentUserProfile && (
        <button 
          onClick={handleFollow}
          className="follow-button"
        >
          {profileUser.followers.includes(state._id) 
            ? "Unfollow" 
            : "Follow"}
        </button>
      )}

      <div className="posts">
        {myposts.length > 0 ? (
          myposts.map((post) => (
            <img 
              className="post" 
              src={post.image} 
              alt={post.title} 
              key={post._id} 
            />
          ))
        ) : (
          <h4>No Posts Yet</h4>
        )}
      </div>
    </div>
  );
}

export default Profile;