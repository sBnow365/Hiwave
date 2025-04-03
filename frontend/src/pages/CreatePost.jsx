import React , {useState , useEffect} from 'react'
import './CreatePost.css'
import M from 'materialize-css';
import { useNavigate } from 'react-router-dom';

const CLOUD_NAME = "dku7k2gnt"; // Your Cloudinary cloud name
const UPLOAD_PRESET = "your_upload_preset"; // Your upload preset

function CreatePost() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState(null);  // For the file object
  const [imageUrl, setImageUrl] = useState("");      // For the Cloudinary URL
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (imageUrl) {
      // Only when we have a valid URL from Cloudinary
      fetch("/api/createpost", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({
          title: title,
          body: body,
          image: imageUrl
        })
      })
      .then(response => response.json())
      .then(function(data) {
        setLoading(false);
        if (data.error) {
          M.toast({html: data.error, classes: "#c62828 red darken-3"});
        } else {
          M.toast({html: "Post created successfully", classes: "#388e3c green darken-2"});
          navigate('/');
        }
      }).catch(error => {
        setLoading(false);
        console.error("Error:", error);
        M.toast({html: "Something went wrong!", classes: "#c62828 red darken-3"});
      });
    }
  }, [imageUrl]); // Only trigger when imageUrl changes

  const submitPost = () => {
    // Check if all fields are filled
    if (!title || !body || !imageFile) {
      M.toast({html: "Please fill all fields", classes: "#c62828 red darken-3"});
      return;
    }
    
    setLoading(true);
    
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "dynamicduo");
    formData.append("cloud_name", "Dynamic Duo");

    fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "post",
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      setImageUrl(data.url); // This will trigger the useEffect
    })
    .catch(error => {
      setLoading(false);
      console.error("Error:", error);
      M.toast({html: "Error uploading image", classes: "#c62828 red darken-3"});
    });
  }

  return (
    <div className={`card create-post-container ${loading ? 'uploading' : ''}`}>
      <input 
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        type="text" 
        placeholder='Post title' 
      />
      <input
        value={body}
        onChange={(event) => setBody(event.target.value)}
        type="text" 
        placeholder='Post content' 
      />
      <div className="file-field input-field">
        <div className="btn #64b5f6 blue darken-1">
          <span>Upload Post Image</span>
          <input 
            type="file" 
            onChange={(event) => setImageFile(event.target.files[0])}
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
  )
}

export default CreatePost