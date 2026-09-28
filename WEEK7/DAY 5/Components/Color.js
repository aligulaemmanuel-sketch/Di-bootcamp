import React, { useState } from 'react';

function Color() {
    const [favoriteColor, setFavoriteColor] = useState('red');

    return (
        <div>
            <p>My favorite color is {favoriteColor}.</p>
            <button onClick={() => setFavoriteColor('blue')}>Change Color</button>
        </div>
    );
}

export default Color;
