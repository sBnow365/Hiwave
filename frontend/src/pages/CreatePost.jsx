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
  
  // Poll states
  const [postType, setPostType] = useState("media"); // "media" or "poll"
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollDuration, setPollDuration] = useState(7); // days
  
  const navigate = useNavigate();

  useEffect(() => {
    if (mediaUrl) {
      // Once media is uploaded and we have the URL
      createPost({
        title,
        body,
        mediaUrl,
        mediaType
      });
    }
  }, [mediaUrl]);

  const createPost = (postData) => {
    fetch("/api/createpost", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify(postData)
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
  };

  const submitPost = () => {
    if (!title || !body) {
      M.toast({ html: "Please fill title and content", classes: "#c62828 red darken-3" });
      return;
    }

    if (postType === "media") {
      if (!file) {
        M.toast({ html: "Please select a file", classes: "#c62828 red darken-3" });
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
    } else if (postType === "poll") {
      // Validate poll options
      const validOptions = pollOptions.filter(option => option.trim() !== "");
      if (validOptions.length < 2) {
        M.toast({ html: "Please provide at least 2 poll options", classes: "#c62828 red darken-3" });
        return;
      }

      setLoading(true);

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + pollDuration);

      createPost({
        title,
        body,
        pollOptions: validOptions,
        pollExpiresAt: expiresAt.toISOString()
      });
    } else {
      // Text-only post
      setLoading(true);
      createPost({
        title,
        body
      });
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 10) {
      setPollOptions([...pollOptions, ""]);
    } else {
      M.toast({ html: "Maximum 10 options allowed", classes: "#ff9800 orange" });
    }
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    } else {
      M.toast({ html: "Minimum 2 options required", classes: "#ff9800 orange" });
    }
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  return (
    <div className={`card create-post-container ${loading ? 'uploading' : ''}`}>
      {/* Post Type Selection */}
      <div className="post-type-selector" style={{ marginBottom: '20px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Post Type:</p>
        <p>
          <label>
            <input
              name="postType"
              type="radio"
              value="media"
              checked={postType === "media"}
              onChange={(e) => setPostType(e.target.value)}
            />
            <span>Media Post (Image/Video)</span>
          </label>
        </p>
        <p>
          <label>
            <input
              name="postType"
              type="radio"
              value="poll"
              checked={postType === "poll"}
              onChange={(e) => setPostType(e.target.value)}
            />
            <span>Poll Post</span>
          </label>
        </p>
        <p>
          <label>
            <input
              name="postType"
              type="radio"
              value="text"
              checked={postType === "text"}
              onChange={(e) => setPostType(e.target.value)}
            />
            <span>Text Only</span>
          </label>
        </p>
      </div>

      {/* Title and Body (common for all post types) */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        type="text"
        placeholder='Post title'
        style={{ marginBottom: '15px' }}
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder='Post content'
        className="materialize-textarea"
        style={{ marginBottom: '15px', minHeight: '100px' }}
      />

      {/* Media Upload Section */}
      {postType === "media" && (
        <div className="file-field input-field" style={{ marginBottom: '15px' }}>
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
      )}

      {/* Poll Section */}
      {postType === "poll" && (
        <div className="poll-section" style={{ marginBottom: '20px' }}>
          <h6 style={{ fontWeight: 'bold', marginBottom: '15px' }}>Poll Options:</h6>
          
          {pollOptions.map((option, index) => (
            <div key={index} className="poll-option-input" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => updatePollOption(index, e.target.value)}
                style={{ flex: '1', marginRight: '10px' }}
              />
              {pollOptions.length > 2 && (
                <button
                  type="button"
                  className="btn-small red"
                  onClick={() => removePollOption(index)}
                  style={{ minWidth: '40px' }}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <div style={{ marginBottom: '15px' }}>
            <button
              type="button"
              className="btn-small #4caf50 green"
              onClick={addPollOption}
              disabled={pollOptions.length >= 10}
            >
              Add Option
            </button>
          </div>

          {/* Poll Duration */}
          <div className="poll-duration" style={{ marginBottom: '15px' }}>
            <label htmlFor="pollDuration" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              Poll Duration (days):
            </label>
            <select
              id="pollDuration"
              value={pollDuration}
              onChange={(e) => setPollDuration(parseInt(e.target.value))}
              className="browser-default"
              style={{ width: '150px' }}
            >
              <option value={1}>1 day</option>
              <option value={3}>3 days</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
            </select>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={submitPost}
        className="btn waves-effect waves-light btn-large #64b5f6 blue darken-1"
        disabled={loading}
        style={{ width: '100%' }}
      >
        {loading ? 'Creating Post...' : 'Submit Post'}
      </button>

      {loading && (
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <div className="preloader-wrapper small active">
            <div className="spinner-layer spinner-blue-only">
              <div className="circle-clipper left">
                <div className="circle"></div>
              </div>
              <div className="gap-patch">
                <div className="circle"></div>
              </div>
              <div className="circle-clipper right">
                <div className="circle"></div>
              </div>
            </div>
          </div>
          <p style={{ marginTop: '10px', color: '#666' }}>
            {postType === "media" ? "Uploading media..." : "Creating post..."}
          </p>
        </div>
      )}
    </div>
  );
}

export default CreatePost;