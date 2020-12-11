import React from "react";
// import successity from "../successity.png";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="landing-wrapper">
      <div className="text-wrapper">
        <div className="text-header-wrapper">
          <p className="text-header font__p p__size">Welcome to</p>
          <span>Vita! </span>
        </div>

        <div className="text-section font__p p__size">
          We are a new forum dedicated to achieving success.
          <br />
          If you are looking for answers to questions like these:
          <ul>
            <li>How do I start a business?</li>
            <li>What is the best way to grow my company?</li>
            <li>How can I improve myself every day?</li>
            <br />
            <li>Or, if you just want to share your story:</li>
          </ul>
          <div className="text-button-wrapper">
            <Link to="/register">Register</Link> and add a post!
          </div>
        </div>
      </div>
      <div className="image-wrapper">
        {/* <img src={successity} className="landing-image" alt="" /> */}
      </div>
    </div>
  );
};

export default LandingPage;
