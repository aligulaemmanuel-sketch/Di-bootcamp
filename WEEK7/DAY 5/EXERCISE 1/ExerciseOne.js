import React, { useState } from 'react';

// Part III: Garage Component
// Defined here so it can be used by the Car component below
const Garage = (props) => {
    return (
        <header>
            Who lives in my {props.size} Garage?
        </header>
    );
};

// Part I & II: Car Component
const Car = (props) => {
    // Part II: useState Hook
    // Initializing the color state with "red"
    const [color, setColor] = useState("red");

    return (
        <div>
            {/* Rendering the model from props and color from state */}
            <h1>This car is {color} {props.carInfo.model}</h1>
            
            {/* Part III: Using the Garage component and passing the 'size' prop */}
            <Garage size="small" />
        </div>
    );
};

export default Car;