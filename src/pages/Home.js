import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="overlay">
        <h1 className="title">Snow</h1>
        <p className="tagline">Join Snow, where developers connect</p>
        <div className="buttons">
          <Link to="/login" className="btn">Log In</Link>
          <Link to="/signup" className="btn">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
