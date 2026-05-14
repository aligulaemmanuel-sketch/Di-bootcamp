import React, { Component } from 'react';
import data from './complexData.json';

class Example3 extends Component {
  render() {
    return (
      <div>
        {data.Experiences.map((exp, index) => (
          <div key={index}>
            <img src={exp.logo} alt="logo" width="50" />
            <a href={exp.url}>{exp.companyName}</a>
            {exp.roles.map((role, i) => (
              <div key={i}>
                <p><strong>{role.title}</strong></p>
                <p>{role.startDate} - {role.endDate}</p>
                <p>{role.location}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
}
export default Example3;