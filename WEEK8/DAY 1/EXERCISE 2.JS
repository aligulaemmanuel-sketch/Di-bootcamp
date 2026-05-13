import React, { Component } from 'react';

class Child extends Component {
  componentWillUnmount() {
    alert("The component named Child is about to be unmounted.");
  }

  render() {
    return <h1>Hello World!</h1>;
  }
}

class Color extends Component {
  constructor(props) {
    super(props);
    this.state = {
      favoriteColor: "red",
      show: true
    };
  }

  // Part II: Lifecycle - Timer
  componentDidMount() {
    setTimeout(() => {
      this.setState({ favoriteColor: "yellow" });
    }, 2000);
  }

  // Part I: shouldComponentUpdate
  shouldComponentUpdate() {
    return true; // Change to false to prevent updates
  }

  // Part III: getSnapshotBeforeUpdate
  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log("in getSnapshotBeforeUpdate");
    return null;
  }

  componentDidUpdate() {
    console.log("after update");
  }

  changeColor = () => {
    this.setState({ favoriteColor: "blue" });
  };

  handleDelete = () => {
    this.setState({ show: false });
  };

  render() {
    return (
      <div>
        <h1>My Favorite Color is <i>{this.state.favoriteColor}</i></h1>
        <button onClick={this.changeColor}>Change Color</button>
        
        <hr />
        {this.state.show && <Child />}
        <button onClick={this.handleDelete}>Delete Child</button>
      </div>
    );
  }
}

export default Color;