export const initialState = null;//initial value for user is null
export const userReducer = (state, action) => {
    if(action.type === "USER"){
        return action.payload;
    }
    return state;
}