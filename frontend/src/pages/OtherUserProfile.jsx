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
        setUserData(data.user || {});
        setMyPosts(data.posts || []);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        M.toast({ html: "Failed to load user data", classes: "red darken-3" });
      });
  }, [userId]);

  useEffect(() => {
    if (userData && state) {
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
      .then(res => res.json())
      .then(updatedUser => {
        dispatch({ type: "UPDATE", payload: { followers: updatedUser.followers } });
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserData(prev => ({
          ...prev,
          followers: [...(prev.followers || []), state._id],
        }));
        M.toast({ html: "Followed successfully!", classes: "green darken-2" });
      })
      .catch(err => {
        console.error(err);
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
      .then(res => res.json())
      .then(updatedUser => {
        dispatch({ type: "UPDATE", payload: { followers: updatedUser.followers } });
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserData(prev => ({
          ...prev,
          followers: (prev.followers || []).filter(id => id !== state._id),
        }));
        M.toast({ html: "Unfollowed successfully!", classes: "blue darken-3" });
      })
      .catch(err => {
        console.error(err);
        M.toast({ html: "Something went wrong!", classes: "red darken-3" });
      });
  };

 return (
  <div className='main-container'>
    <div className='profile-container'>
      <div>
        <img 
          style={{ width: "166px", height: "166px", borderRadius: "83px" }}
          src={userData?.profilePicUrl || '/default-profile.jpg'} 
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
        {state?._id !== userId && (
          <button
            onClick={isFollowing ? unfollow : follow}
            className={`btn waves-effect waves-light ${isFollowing ? "red darken-3" : "blue darken-4"}`}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>
    </div>

    <div className='posts'>
      {myposts.length > 0 ? (
        myposts.map(post => (
          <div key={post._id} className="post-item">
{post.mediaType === "video" ? (
  <video
    controls
    style={{
      width: "100%",
      maxHeight: "350px",
      borderRadius: "10px",
      objectFit: "cover"
    }}
  >
    <source src={post.mediaUrl} type="video/mp4" />
    Your browser does not support the video tag.
  </video>
) : (
  <img
    src={post.mediaUrl || post.image}
    alt={post.title || "Post"}
    style={{
      width: "100%",
      maxHeight: "350px",
      borderRadius: "10px",
      objectFit: "cover"
    }}
  />
)}


            <h6>{post.title}</h6>

            {post.poll && Array.isArray(post.poll.options) && post.poll.options.length > 0 && (
              <div className="poll-section">
                <strong>Poll:</strong>
                {post.poll.options.map((opt, i) => (
                  <div key={i} className="poll-option">
                    <input 
                      type="radio" 
                      name={`poll-${post._id}`} 
                      id={`option-${post._id}-${i}`} 
                    />
                    <label htmlFor={`option-${post._id}-${i}`}>{opt.option}</label>
                  </div>
                ))}
              </div>
            )}
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
