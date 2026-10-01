import { Component } from 'react';

class UserFavoriteAnimals extends Component {
  render() {
    const { favAnimals } = this.props;

    return (
      <ul>
        {favAnimals.map((animal) => (
          <li key={animal}>{animal}</li>
        ))}
      </ul>
    );
  }
}

export default UserFavoriteAnimals;