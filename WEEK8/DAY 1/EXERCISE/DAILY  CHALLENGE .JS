import React, { Component } from "react";

/**
 * Presentational Component
 * Handles the UI and displays the state passed via props
 */
function FormComponent(props) {
    return (
        <main style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <form action="/" method="GET">
                <input 
                    name="firstName" 
                    value={props.data.firstName} 
                    onChange={props.handleChange} 
                    placeholder="First Name" 
                /><br />
                
                <input 
                    name="lastName" 
                    value={props.data.lastName} 
                    onChange={props.handleChange} 
                    placeholder="Last Name" 
                /><br />
                
                <input 
                    name="age" 
                    value={props.data.age} 
                    onChange={props.handleChange} 
                    placeholder="Age" 
                /><br />

                <label>
                    <input 
                        type="radio" 
                        name="gender" 
                        value="male" 
                        checked={props.data.gender === "male"} 
                        onChange={props.handleChange} 
                    /> Male
                </label>
                <br />
                <label>
                    <input 
                        type="radio" 
                        name="gender" 
                        value="female" 
                        checked={props.data.gender === "female"} 
                        onChange={props.handleChange} 
                    /> Female
                </label>
                <br />

                <p>Select your destination</p>
                <select 
                    value={props.data.destination} 
                    name="destination" 
                    onChange={props.handleChange}
                >
                    <option value="">-- Please Choose a destination --</option>
                    <option value="Japan">Japan</option>
                    <option value="Germany">Germany</option>
                    <option value="Norway">Norway</option>
                    <option value="North Pole">North Pole</option>
                </select>
                <br /><br />

                <label>Dietary restrictions:</label>
                <br />
                <label>
                    <input 
                        type="checkbox" 
                        name="isNutsFree" 
                        checked={props.data.isNutsFree} 
                        onChange={props.handleChange} 
                    /> Nuts free
                </label>
                <br />
                <label>
                    <input 
                        type="checkbox" 
                        name="isLactoseFree" 
                        checked={props.data.isLactoseFree} 
                        onChange={props.handleChange} 
                    /> Lactose free
                </label>
                <br />
                <label>
                    <input 
                        type="checkbox" 
                        name="isVegan" 
                        checked={props.data.isVegan} 
                        onChange={props.handleChange} 
                    /> Vegan
                </label>
                <br /><br />

                <button type="submit">Submit</button>
            </form>
            
            <hr />
            
            <div style={{ backgroundColor: "#1b4d4b", color: "white", padding: "20px" }}>
                <h2>Entered information:</h2>
                <p>Your name: {props.data.firstName} {props.data.lastName}</p>
                <p>Your age: {props.data.age}</p>
                <p>Your gender: {props.data.gender}</p>
                <p>Your destination: {props.data.destination}</p>
                <p>Your dietary restrictions:</p>
                <p>**Nuts free : {props.data.isNutsFree ? "Yes" : "No"}</p>
                <p>**Lactose free : {props.data.isLactoseFree ? "Yes" : "No"}</p>
                <p>**Vegan meal : {props.data.isVegan ? "Yes" : "No"}</p>
            </div>
        </main>
    );
}

/**
 * Container Component
 * Handles the state logic and event handling
 */
class App extends Component {
    constructor() {
        super();
        this.state = {
            firstName: "",
            lastName: "",
            age: "",
            gender: "",
            destination: "",
            isNutsFree: false,
            isLactoseFree: false,
            isVegan: false
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        const { name, value, type, checked } = event.target;
        
        // Ternary operator logic for checkboxes vs standard inputs
        type === "checkbox" 
            ? this.setState({ [name]: checked }) 
            : this.setState({ [name]: value });
    }

    render() {
        return (
            <FormComponent 
                handleChange={this.handleChange} 
                data={this.state} 
            />
        );
    }
}

export default App;