import React, { useState, useEffect, useContext } from 'react';
import './Home.css';
import M from 'materialize-css';
import { UserContext } from '../App';
import { Link } from 'react-router-dom';

function Home() {
  const [posts, setPosts] = useState([]);
  const { state, dispatch } = useContext(UserContext);

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

  return (
    <div className='home-container'>
      {posts.map((post) => {
        const isMyPost = post?.author?._id === state?._id;
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
              <i className="material-icons" style={{ color: "red", marginRight: "10px" }}>favorite</i>
              {post.likes.includes(state?._id)
                ? <i onClick={() => likeUnlike(post._id, '/unlike')} className="material-icons" style={{ color: "red", cursor: "pointer" }}>thumb_down</i>
                : <i onClick={() => likeUnlike(post._id, '/like')} className="material-icons" style={{ color: "blue", marginRight: "10px", cursor: "pointer" }}>thumb_up</i>
              }
              <h6>{post.likes.length} likes</h6>
              <h6>{post.title}</h6>
              <p>{post.body}</p>

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
