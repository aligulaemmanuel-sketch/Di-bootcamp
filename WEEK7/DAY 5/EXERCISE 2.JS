import React, { useState } from 'react';

const Events = () => {
    const [isToggleOn, setIsToggleOn] = useState(true);

    const clickMe = () => alert('I was clicked');

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            alert(`The Enter key was pressed, your input is: ${event.target.value}`);
        }
    };

    const toggleStatus = () => setIsToggleOn(!isToggleOn);

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
            <button onClick={clickMe}>Click Me</button>
            <br /><br />
            <input onKeyDown={handleKeyDown} placeholder="Press Enter..." />
            <br /><br />
            <button onClick={toggleStatus}>
                {isToggleOn ? 'ON' : 'OFF'}
            </button>
        </div>
    );
};

export default Events;