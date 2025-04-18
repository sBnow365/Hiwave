import React, { useState, useEffect } from 'react';
import './CreatePost.css';
import M from 'materialize-css';
import { useNavigate } from 'react-router-dom';

const CLOUD_NAME = "dku7k2gnt"; // Your Cloudinary cloud name
const UPLOAD_PRESET = "dynamicduo"; // Your upload preset

function CreatePost() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState(""); // "image" or "video"
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (mediaUrl) {
      // Once media is uploaded and we have the URL
      fetch("/api/createpost", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({
          title,
          body,
          mediaUrl,
          mediaType
        })
      })
        .then(response => response.json())
        .then(data => {
          setLoading(false);
          if (data.error) {
            M.toast({ html: data.error, classes: "#c62828 red darken-3" });
          } else {
            M.toast({ html: "Post created successfully", classes: "#388e3c green darken-2" });
            navigate('/');
          }
        }).catch(error => {
          setLoading(false);
          console.error("Error:", error);
          M.toast({ html: "Something went wrong!", classes: "#c62828 red darken-3" });
        });
    }
  }, [mediaUrl]);

  const submitPost = () => {
    if (!title || !body || !file) {
      M.toast({ html: "Please fill all fields", classes: "#c62828 red darken-3" });
      return;
    }

    const fileType = file.type.startsWith("video") ? "video" : "image";
    setMediaType(fileType);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("cloud_name", CLOUD_NAME);

    const cloudUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${fileType}/upload`;

    fetch(cloudUrl, {
      method: "post",
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        setMediaUrl(data.secure_url);
      })
      .catch(error => {
        setLoading(false);
        console.error("Error:", error);
        M.toast({ html: `Error uploading ${fileType}`, classes: "#c62828 red darken-3" });
      });
  };

  return (
    <div className={`card create-post-container ${loading ? 'uploading' : ''}`}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        type="text"
        placeholder='Post title'
      />
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        type="text"
        placeholder='Post content'
      />
      <div className="file-field input-field">
        <div className="btn #64b5f6 blue darken-1">
          <span>Upload Image or Video</span>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
        <div className="file-path-wrapper">
          <input className="file-path validate" type="text" />
        </div>
      </div>
      <button
        onClick={submitPost}
        className="btn waves-effect waves-light btn-large #64b5f6 blue darken-1"
        disabled={loading}
      >
        Submit Post
      </button>
    </div>
  );
}

export default CreatePost;
