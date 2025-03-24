import React, { useEffect, useState, useContext } from "react";
import "./Profile.css";
import { UserContext } from "../App";
import M from "materialize-css";

function Profile() {
  const [myposts, setMyPosts] = useState([]); // Initialize posts as empty array
  const { state, dispatch } = useContext(UserContext);

  // Fetch user from localStorage in case context is empty
  const storedUser = JSON.parse(localStorage.getItem("userInfo")) || {};
  const profilePic = state?.profilePicUrl || storedUser.profilePicUrl || "https://via.placeholder.com/166";

  useEffect(() => {
    fetch("/api/myposts", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setMyPosts(data.posts);
      })
      .catch((error) => {
        console.error("Error:", error);
        M.toast({
          html: "Something went wrong!",
          classes: "#c62828 red darken-3",
        });
      });
  }, []);

  return (
    <div className="main-container">
      <div className="profile-container">
        <div>
          <img
            style={{ width: "166px", height: "166px", borderRadius: "83px" }}
            src={profilePic}
            alt="Profile"
          />
        </div>
        <div className="details-section">
          <h4>{state?.fullName || "Loading..."}</h4>
          <h5>{state?.email || "Loading..."}</h5>
          <div className="followings">
            <h6>{myposts.length} posts</h6>
            <h6>{state?.followers?.length || 0} followers</h6>
            <h6>{state?.following?.length || 0} following</h6>
          </div>
        </div>
      </div>

      <div className="posts">
        {myposts.map((post) => (
          <img className="post" src={post.image} alt={post.title} key={post._id} />
        ))}
      </div>
    </div>
  );
}

export default Profile;
