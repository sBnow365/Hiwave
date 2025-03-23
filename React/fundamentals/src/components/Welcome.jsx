import React , {Component} from "react";

class Welcome extends Component{

    constructor(){
        super(); //call super class constructor -> component is the super class
        //data in the state is mutable and can be modified
        this.state = { name: "John Doe" , age: 27};
    }

    changeData(){
        // debugger
        this.setState({
            name: "Peter Warry",
            age: 38
        });
    }

    render(){
        return(
            <div>
                <h2>Name is {this.state.name}  and age is {this.state.age} </h2>
                <button onClick={() => this.changeData()}>Change Details</button>
            </div>
        );
    }
}

export default Welcome;