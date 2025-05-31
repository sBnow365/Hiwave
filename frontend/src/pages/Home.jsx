import React, { useState, useEffect, useContext } from 'react';
import './Home.css';
import M from 'materialize-css';
import { UserContext } from '../App';
import { Link } from 'react-router-dom';

function Home() {
  const [posts, setPosts] = useState([]);
  const { state, dispatch } = useContext(UserContext);

  // Helper function to check if poll is valid
  const hasValidPoll = (poll) => {
    return poll && 
           poll.options && 
           Array.isArray(poll.options) && 
           poll.options.length > 0 &&
           poll.options.some(option => option.text && option.text.trim() !== '');
  };

  useEffect(() => {
    fetch("/api/posts", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setPosts(data.posts);
      }).catch(error => {
        console.error("Error:", error);
        M.toast({ html: "Something went wrong!", classes: "#c62828 red darken-3" });
      });
  }, []);

  const likeUnlike = (postId, url) => {
    fetch(`/api${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ postId }),
    })
      .then((response) => response.json())
      .then((data) => {
        setPosts((prevPosts) =>
          prevPosts.map((oldPost) =>
            oldPost._id === data._id ? data : oldPost
          )
        );
      })
      .catch((error) => {
        console.error("Error updating likes:", error);
        M.toast({ html: "Something went wrong!", classes: "#c62828 red darken-3" });
      });
  };

  const deletePost = (postId) => {
    fetch(`/api/deletepost/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      }
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          M.toast({ html: "Failed to delete post!", classes: "#c62828 red darken-3" });
          return;
        }
        setPosts(posts.filter((post) => post._id !== postId));
        M.toast({ html: "Post deleted successfully!", classes: "#43a047 green darken-1" });
      })
      .catch(error => {
        console.error("Error:", error);
        M.toast({ html: "Something went wrong!", classes: "#c62828 red darken-3" });
      });
  };

  const deleteComment = (postId, commentId) => {
    fetch(`/api/deletecomment/${postId}/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          M.toast({ html: "Failed to delete comment!", classes: "#c62828 red darken-3" });
          return;
        }
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post._id === postId
              ? { ...post, comments: post.comments.filter(c => c._id !== commentId) }
              : post
          )
        );
        M.toast({ html: "Comment deleted successfully!", classes: "#43a047 green darken-1" });
      })
      .catch(error => {
        console.error("Error:", error);
        M.toast({ html: "Something went wrong!", classes: "#c62828 red darken-3" });
      });
  };

  const submitComment = (event, postId) => {
    event.preventDefault();
    const commentText = event.target[0].value;
    if (!commentText.trim()) return;

    fetch("/api/comment", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ commentText, postId }),
    })
      .then((response) => response.json())
      .then((data) => {
        setPosts((prevPosts) =>
          prevPosts.map((oldPost) =>
            oldPost._id === data._id ? data : oldPost
          )
        );
        event.target.reset();
      })
      .catch((error) => {
        console.error("Error submitting comment:", error);
        M.toast({ html: "Something went wrong!", classes: "#c62828 red darken-3" });
      });
  };

  // Poll functionality functions
  const voteOnPoll = (postId, optionIndex) => {
    fetch("/api/vote", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ postId, optionIndex }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          M.toast({ html: data.error, classes: "#ff9800 orange" });
          return;
        }
        setPosts((prevPosts) =>
          prevPosts.map((oldPost) =>
            oldPost._id === data.post._id ? data.post : oldPost
          )
        );
        M.toast({ html: "Vote recorded successfully!", classes: "#43a047 green darken-1" });
      })
      .catch((error) => {
        console.error("Error voting on poll:", error);
        M.toast({ html: "Something went wrong!", classes: "#c62828 red darken-3" });
      });
  };

  const changeVote = (postId, newOptionIndex) => {
    fetch("/api/changevote", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ postId, newOptionIndex }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          M.toast({ html: data.error, classes: "#ff9800 orange" });
          return;
        }
        setPosts((prevPosts) =>
          prevPosts.map((oldPost) =>
            oldPost._id === data.post._id ? data.post : oldPost
          )
        );
        M.toast({ html: "Vote changed successfully!", classes: "#43a047 green darken-1" });
      })
      .catch((error) => {
        console.error("Error changing vote:", error);
        M.toast({ html: "Something went wrong!", classes: "#c62828 red darken-3" });
      });
  };

  const getUserVote = (poll) => {
    if (!poll || !state?._id) return null;
    
    for (let i = 0; i < poll.options.length; i++) {
      if (poll.options[i].votes.includes(state._id)) {
        return i;
      }
    }
    return null;
  };

  const isPollExpired = (poll) => {
    if (!poll?.expiresAt) return false;
    return new Date() > new Date(poll.expiresAt);
  };

  const formatTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m remaining`;
  };

  return (
    <div className='home-container'>
      {posts.map((post) => {
        const isMyPost = post?.author?._id === state?._id;
        const userVote = getUserVote(post.poll);
        const pollExpired = isPollExpired(post.poll);
        
        return (
          <div className='card home-card' key={post._id}>
            <h5 style={{ padding: "10px" }}>
              <Link to={!isMyPost ? `/profile/${post.author?._id}` : "/profile"}>
                {post.author?.fullName || "Unknown Author"}
              </Link>
              {isMyPost && (
                <i onClick={() => deletePost(post._id)} className="material-icons"
                  style={{ color: "red", cursor: "pointer", float: "right", fontSize: "30px" }}>
                  delete_forever
                </i>
              )}
            </h5>

            {/* Media Content */}
            <div className='card-image'>
              {post.mediaType === "image" ? (
                <img src={post.mediaUrl} alt="post" style={{ maxWidth: "100%" }} />
              ) : post.mediaType === "video" ? (
                <video controls style={{ maxWidth: "100%" }}>
                  <source src={post.mediaUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : post.image ? (
                <img src={post.image} alt="legacy post" style={{ maxWidth: "100%" }} />
              ) : null}
            </div>

            <div className='card-content'>
              {/* Like/Unlike section */}
              <i className="material-icons" style={{ color: "red", marginRight: "10px" }}>favorite</i>
              {post.likes.includes(state?._id)
                ? <i onClick={() => likeUnlike(post._id, '/unlike')} className="material-icons" style={{ color: "red", cursor: "pointer" }}>thumb_down</i>
                : <i onClick={() => likeUnlike(post._id, '/like')} className="material-icons" style={{ color: "blue", marginRight: "10px", cursor: "pointer" }}>thumb_up</i>
              }
              <h6>{post.likes.length} likes</h6>
              
              {/* Post content */}
              <h6>{post.title}</h6>
              <p>{post.body}</p>

              {/* Poll Section - Only show if post has a valid poll */}
              {hasValidPoll(post.poll) && (
                <div className="poll-container" style={{ 
                  border: "1px solid #ddd", 
                  borderRadius: "8px", 
                  padding: "15px", 
                  margin: "15px 0",
                  backgroundColor: "#f9f9f9"
                }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    marginBottom: "10px" 
                  }}>
                    <h6 style={{ margin: 0, fontWeight: "bold" }}>Poll</h6>
                    <small style={{ color: pollExpired ? "red" : "#666" }}>
                      {formatTimeRemaining(post.poll.expiresAt)}
                    </small>
                  </div>
                  
                  <div className="poll-options">
                    {post.poll.options.map((option, index) => {
                      const voteCount = option.votes.length;
                      const percentage = post.poll.totalVotes > 0 
                        ? Math.round((voteCount / post.poll.totalVotes) * 100) 
                        : 0;
                      const isUserVote = userVote === index;
                      
                      return (
                        <div 
                          key={index} 
                          className="poll-option" 
                          style={{
                            border: `2px solid ${isUserVote ? "#2196f3" : "#ddd"}`,
                            borderRadius: "6px",
                            margin: "8px 0",
                            padding: "10px",
                            cursor: pollExpired ? "default" : "pointer",
                            position: "relative",
                            backgroundColor: isUserVote ? "#e3f2fd" : "white",
                            opacity: pollExpired ? 0.7 : 1
                          }}
                          onClick={() => {
                            if (!pollExpired) {
                              if (userVote === null) {
                                voteOnPoll(post._id, index);
                              } else if (userVote !== index) {
                                changeVote(post._id, index);
                              }
                            }
                          }}
                        >
                          <div style={{ 
                            position: "absolute", 
                            top: 0, 
                            left: 0, 
                            height: "100%", 
                            width: `${percentage}%`, 
                            backgroundColor: isUserVote ? "#bbdefb" : "#f0f0f0", 
                            borderRadius: "4px",
                            zIndex: 1,
                            opacity: 0.3
                          }}></div>
                          
                          <div style={{ 
                            position: "relative", 
                            zIndex: 2, 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center" 
                          }}>
                            <span style={{ fontWeight: isUserVote ? "bold" : "normal" }}>
                              {option.text}
                              {isUserVote && " ✓"}
                            </span>
                            <span style={{ fontSize: "14px", color: "#666" }}>
                              {voteCount} votes ({percentage}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div style={{ 
                    textAlign: "center", 
                    marginTop: "10px", 
                    fontSize: "14px", 
                    color: "#666" 
                  }}>
                    Total votes: {post.poll.totalVotes}
                    {userVote !== null && !pollExpired && (
                      <span style={{ marginLeft: "15px", color: "#2196f3" }}>
                        Click another option to change vote
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Comments section */}
              {post.comments.length > 0 && <h6 style={{ fontWeight: '600' }}>All Comments</h6>}
              {post.comments.map((comment) => (
                <div key={comment._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "5px 0",
                    borderBottom: "1px solid #ddd"
                  }}
                >
                  <div style={{ flexGrow: 1 }}>
                    <span style={{ fontWeight: "500", marginRight: "10px" }}>
                      {comment.commentedBy?.fullName}
                    </span>
                    <span>{comment.commentText}</span>
                  </div>
                  {comment.commentedBy?._id === state?._id && (
                    <i
                      onClick={() => deleteComment(post._id, comment._id)}
                      className="material-icons"
                      style={{ color: "red", cursor: "pointer", fontSize: "20px" }}
                    >
                      delete
                    </i>
                  )}
                </div>
              ))}

              <form onSubmit={(event) => submitComment(event, post._id)}>
                <input type="text" placeholder='Enter comment' />
              </form>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Home;