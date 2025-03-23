import React , {useState , useEffect} from 'react'
import './CreatePost.css'
import M from 'materialize-css';
import { useNavigate } from 'react-router-dom';

const CLOUD_NAME = "dku7k2gnt"; // Your Cloudinary cloud name
const UPLOAD_PRESET = "your_upload_preset"; // Your upload preset

function CreatePost() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState("");
  const navigate = useNavigate(); 

  useEffect(()=>{//only call when the value of image exists
    if(image){
      //call to create post api
      fetch("/api/createpost",{
            method: "post",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer "+localStorage.getItem("token")
            },
            body: JSON.stringify({
              title: title,
              body: body,
              image: image
            })
          })
          .then(response=>response.json())
          .then(function(data){
            console.log(data);
            if(data.error){
              M.toast({html: data.error , classes: "#c62828 red darken-3"})
            }
            else{
              M.toast({html: "Post created successfully" , classes: "#388e3c green darken-2"})
              navigate('/login');  
            }
          }).catch(error => {
            console.error("Error:", error);
            M.toast({ html: "Something went wrong!", classes: "#c62828 red darken-3" });
          });
    }
  },[image]);//only call when the value of image changes
  const submitPost = ()=>{
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "dynamicduo");
    formData.append("cloud_name", "Dynamic Duo"); 

    fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "post",
      body: formData
    }).then(response=>response.json())
      .then(data=>{
        setImage(data.url);
        console.log(data);
      })
      .catch(error=>{
        console.error("Error:", error);
      });
  }

  return (
    <div className='card create-post-container'>
        <input 
          value={title}
          onChange={(event)=>setTitle(event.target.value)}
          type="text" placeholder='post title' 
        />
        <input
        value={body}
          onChange={(event)=>setBody(event.target.value)}
          type="text" placeholder='post content' 
        />
        <div className="file-field input-field">
            <div className="btn #64b5f6 blue darken-1">
                <span>Upload Post Image</span>
                <input type="file" onChange={(event)=>setImage(event.target.files[0])}/>
            </div>
            <div className="file-path-wrapper">
                <input className="file-path validate" type="text" />
            </div>
        </div>
        <button onClick={()=> submitPost()} className="btn waves-effect waves-light btn-large #64b5f6 blue darken-1">Submit Post</button>
    </div>
  )
}

export default CreatePost