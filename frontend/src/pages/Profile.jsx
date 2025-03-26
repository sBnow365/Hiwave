import React , {use, useEffect , useState , useContext} from 'react'
import './Profile.css'
import {UserContext} from '../App'

function Profile() {

  const [myposts, setMyPosts] = useState([]); //initialize posts as empty array
  const {state, dispatch} = useContext(UserContext);

  useEffect(()=>{
        //call to create post api
        fetch("/api/myposts",{
          method: "GET",
          headers: {
            "Authorization": "Bearer "+localStorage.getItem("token")
          },
        })
        .then((response)=>response.json())
        .then(function(data){
          console.log(data);
          setMyPosts(data.posts);
        }).catch(error => {
          console.error("Error:", error);
          M.toast({ html: "Something went wrong!", classes: "#c62828 red darken-3" });
      });
    },[]);

  return (
    <div className='main-container'>
      <div className='profile-container'>
        <div>
          <img style={{width:"166px" , height:"166px" , borderRadius:"83px"}} src='https://images.unsplash.com/photo-1504593811423-6dd665756598?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'/>
        </div>
        <div className='details-section'>
            <h4>{state ?state.fullName:"Loading..."}</h4>
            <div className='followings'>
              <h6>19 posts</h6>
              <h6>190 followers</h6>
              <h6>257 following</h6>
            </div>
        </div>
      </div>
      
      <div className='posts'>
        {
          myposts.map((post)=>{
            return(
              <img className='post' src={post.image} alt={post.title} key={post._id} />
            )
          })     
        }
        <img className='post' 
          src="https://images.unsplash.com/photo-1504593811423-6dd665756598?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
      </div>

    </div>
  )
}

export default Profile