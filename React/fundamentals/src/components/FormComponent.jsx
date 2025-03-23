import React, { Component } from 'react'

class FormComponent extends Component {

    constructor(props) {
        console.log("constructor called");
      super(props)
    
      this.state = {
         email: '',
         query: '',
         timeToReach:''
      }
    }

    onChangeEmail = (event) =>{
        //gives the data entered into the input box
        console.log(event.target.value);
        this.setState({
            email: event.target.value
        })
    }

    onChangeQuery = (event) =>{
        this.setState({
            query: event.target.value
        });
    }

    onChangetimeToReach = (event) =>{
        this.setState({
            timeToReach: event.target.value
        });
    } 

    onSubmitEnquiry = (event) =>{
        event.preventDefault();//it will prevent the default refresh behaviour of the form
        console.log("form submitted");
        console.log(`Email: ${this.state.email} , Query: ${this.state.query} , TimetoReach: ${this.state.timeToReach}`)
    }

    //will be called after constructor and all the elemtns of dom has been loaded
    componentDidMount(){
        //onload api call
        console.log("componentDidMount called");
        this.setState({
            timeToReach: 'evening'
        });
    }
  render() {
    return (
      <div>
        Enquiry Form
        <form onSubmit={this.onSubmitEnquiry}>
            <div>
                <label>Email</label>
                <input type="email" 
                    value={this.state.email}
                    onChange={this.onChangeEmail}
                />
            </div>
            <div>
                <label>Query</label>
                <textarea value={this.state.query} onChange={this.onChangeQuery}></textarea>
            </div>
            <div>
                <label>Prefered time to reach</label>
                <select value={this.state.timeToReach} onChange={this.onChangetimeToReach}>
                    <option value="morning">morning</option>
                    <option value="afternoon">afternoon</option>
                    <option value="evening">evening</option>
                </select>
            </div>
            <button type='submit'>Send Enquiry</button>
        </form>
      </div>
    )
  }
}

export default FormComponent