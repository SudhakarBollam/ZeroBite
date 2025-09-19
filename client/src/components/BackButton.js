import React from 'react';
import './BackButton.css';

function BackButton({ onClick, text = "Back" }) {
    return (
        <button className="back-button" onClick={onClick}>
            <span className="back-icon">←</span>
            <span className="back-text">{text}</span>
        </button>
    );
}

export default BackButton;


