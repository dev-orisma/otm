import React, { Component } from 'react';
import auth from './Module/Auth';
const socket = io.connect();
class Workload extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: false,
			errorMsg:""
		}
		
	}
	componentDidMount(){
		
	}
	
	render() {
		return (
			<div></div>

			)
	}
}

export default Workload;