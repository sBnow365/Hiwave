import { useState } from 'react'
import './App.css'
import HelloFunctional from './components/HelloFunctional'
import HelloClass from './components/HelloClass'

//named import should always be imported within {}
import {HelloFunctionalES6} from './components/HelloFunctionalES6' 

import Display from './components/Display';
import Welcome from './components/Welcome'
import Count from './components/Count'
import FormComponent from './components/FormComponent'

function App() {
  return (

    <div className='App'>
      {/* <h2>Hello APP component</h2>
      <HelloFunctional></HelloFunctional> */}
      {/*<HelloFunctional></HelloFunctional>
      <HelloFunctional></HelloFunctional>*/}
      {/* <HelloFunctional />
      <HelloClass></HelloClass>
      <HelloClass name="Max" age = "22" /> */}
      {/* <HelloFunctionalES6 /> */}

      {/* <Display firstName = "John" lastName = "Doe" age = "3">
        <p>Some text data from John</p>  
      </Display><br/>
      <Display firstName = "Peter" lastName = "Warry" age = "55">
        <input type="text" placeholder='Enter your details'/>
      </Display> */}

      {/* <Welcome></Welcome> */}
      
      {/* <Count /> */}

      <FormComponent />
    </div>

  )
}

export default App
