import React, { Component } from 'react';
import '../../App.css';
export class Input extends Component {
  
  render(){
    return(
      <input 
        type="number"
        name={this.props.name}
        placeholder= {this.props.placeholder}
        value={this.props.value}
        className="input"
        onChange = {this.props.onChange}
      />
    )
  }
}

export default Input;