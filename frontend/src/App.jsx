import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import './App.css';
import { useEffect, createContext, useReducer, useContext } from 'react';
import { userReducer, initialState } from './reducers/userReducer.jsx';
import OtherUserProfile from './pages/OtherUserProfile';

export const UserContext = createContext();  //creating a user context

const CustomRouting = () => {

  const navigate = useNavigate();
  const { dispatch } = useContext(UserContext);
  useEffect(()=>{
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if(user){
      dispatch({type: "USER", payload
      : user});
      // navigate('/');//user logged in so redirect to home page
    }
    else{
      navigate('/login');
    }
  }
  ,[]);//called when the component mounts and gets called only once
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/:userId" element={<OtherUserProfile />} />
      <Route path="/create-post" element={<CreatePost />} />
    </Routes>
  );
};



function App() {
  const [state, dispatch] = useReducer(userReducer, initialState); 
  return (
    <UserContext.Provider value={{state : state, dispatch : dispatch}}>
      <BrowserRouter>
        <Navbar />
      <CustomRouting />
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
