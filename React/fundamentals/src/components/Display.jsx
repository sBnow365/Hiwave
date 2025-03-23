import React from "react";
import "./Display.css"

const Display = (props) => {
    console.log(props);
    //props has immutable properties
    //props.firstName = "xyz"
    return(
        <div>
            <div style={{margin: "auto" ,backgroundColor: "blue" , border: "1px solid red" , height: "120px" , width: "500px" }}>
            <h3>Hello {props.firstName} {props.lastName}</h3>
            <h4 className="text-styling">Your age is {props.age}</h4>
            </div>
            {props.children}
        </div>
    );
}
// function Display(props){
//     return(
//         <div>
//             <h4>Hello props.firstName props.lastName</h4>
//         </div>
//     );
// }

export default Display;