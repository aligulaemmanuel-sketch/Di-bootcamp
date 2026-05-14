import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import ErrorBoundary from "./ErrorBoundary";

const HomeScreen = () => <h1>Home</h1>;
const ProfileScreen = () => <h1>Profile</h1>;
const ShopScreen = () => {
  throw new Error("Shop Component Crashed!");
};

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item"><NavLink className="nav-link" to="/">Home</NavLink></li>
          <li className="nav-item"><NavLink className="nav-link" to="/profile">Profile</NavLink></li>
          <li className="nav-item"><NavLink className="nav-link" to="/shop">Shop</NavLink></li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<ErrorBoundary><HomeScreen /></ErrorBoundary>} />
        <Route path="/profile" element={<ErrorBoundary><ProfileScreen /></ErrorBoundary>} />
        <Route path="/shop" element={<ErrorBoundary><ShopScreen /></ErrorBoundary>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;