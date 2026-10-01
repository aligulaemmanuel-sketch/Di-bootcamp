import { Component } from 'react';
import './Exercise.css';

class Exercise extends Component {
  render() {
    const style_header = {
      color: 'white',
      backgroundColor: 'DodgerBlue',
      padding: '10px',
      fontFamily: 'Arial',
    };

    return (
      <section>
        <h1 style={style_header}>This is a heading</h1>
        <p className="para">This is a paragraph.</p>
        <a href="https://react.dev/">Learn about React</a>
        <form onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="name">Name: </label>
          <input id="name" name="name" type="text" />
          <button type="submit">Submit</button>
        </form>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
          alt="React logo"
          width="100"
          height="100"
        />
        <ul>
          <li>HTML</li>
          <li>CSS</li>
          <li>JavaScript</li>
        </ul>
      </section>
    );
  }
}

export default Exercise;