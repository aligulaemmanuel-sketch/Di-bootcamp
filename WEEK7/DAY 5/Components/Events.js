import React, { useState } from 'react';

function Events() {
    const [isOn, setIsOn] = useState(false);

    return (
        <button onClick={() => setIsOn(value => !value)}>
            Events: {isOn ? 'ON' : 'OFF'}
        </button>
    );
}

export default Events;
