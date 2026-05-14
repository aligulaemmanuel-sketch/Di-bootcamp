import React, { Component } from 'react';
import data from './complexData.json';

class Example2 extends Component {
  render() {
    return (
      <div>
        {data.Skills.map((skillGroup, index) => (
          <div key={index}>
            <h3>{skillGroup.Area}</h3>
            <ul>
              {skillGroup.SkillSet.map((skill, i) => <li key={i}>{skill.Name}</li>)}
            </ul>
          </div>
        ))}
      </div>
    );
  }
}
export default Example2;