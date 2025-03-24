export const initialState = null;//initial value for user is null
export const userReducer = (state, action) => {
    if(action.type === "USER"){
        return action.payload;
    }
    if(action.type === "LOGOUT"){
        return null;
    }
    if(action.type === "UPDATE"){
        return{
            ...state,//exxpand what we currently have in state
            following: action.payload.following,//append to the state
            followers: action.payload.followers
        }
    }
    return state;
}