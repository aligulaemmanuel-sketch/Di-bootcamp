import React, { useState, useEffect } from 'react';

const Color = () => {
    const [favoriteColor, setFavoriteColor] = useState("red");

    useEffect(() => {
        alert("useEffect reached");
    }, [favoriteColor]); // Triggers every time favoriteColor changes

    const changeToBlue = () => setFavoriteColor("blue");

    return (
        <div>
            <h1>My Favorite Color is {favoriteColor}</h1>
            <button onClick={changeToBlue}>Change Color</button>
        </div>
    );
};

export default Color;