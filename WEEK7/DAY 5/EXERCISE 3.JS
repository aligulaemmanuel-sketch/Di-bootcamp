import React, { useState } from 'react';

const Phone = () => {
    const [phone, setPhone] = useState({
        brand: "Samsung",
        model: "Galaxy S20",
        color: "black",
        year: 2020
    });

    const changeColor = () => {
        // We spread the existing state and update only the color
        setPhone(prevPhone => ({ ...prevPhone, color: 'blue' }));
    };

    return (
        <div>
            <h2>My phone is a {phone.brand}</h2>
            <p>It is a {phone.color} {phone.model} from {phone.year}</p>
            <button onClick={changeColor}>Change Color</button>
        </div>
    );
};

export default Phone;