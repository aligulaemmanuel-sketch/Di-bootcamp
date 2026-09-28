import React from 'react';

function Car({ carInfo }) {
    return <h2>{carInfo.name} {carInfo.model}</h2>;
}

export default Car;
