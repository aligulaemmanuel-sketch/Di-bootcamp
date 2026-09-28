import React, { useState } from 'react';

function Phone() {
    const [color, setColor] = useState('black');

    return (
        <div>
            <p>My phone is {color}.</p>
            <button onClick={() => setColor('blue')}>Change Color</button>
        </div>
    );
}

export default Phone;
