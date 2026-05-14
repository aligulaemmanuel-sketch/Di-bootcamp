import React, { Component } from 'react';
import data from './complexData.json';

class Example1 extends Component {
  render() {
    return (
      <ul>
        {data.SocialMedias.map((link, index) => <li key={index}>{link}</li>)}
      </ul>
    );
  }
}
export default Example1;