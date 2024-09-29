// Card.js
// src/components/Card.js
// import React from "react";
import PropTypes from "prop-types"
import "./Card.css"

const Card = ({ suit, rank }) => (
  <div className="card">
    {/* <div className="card-corner">
      <div className="card-rank">{rank}</div>
      <div className={`card-suit ${suit}`}></div>
    </div> */}
    <div className="card-center">
      <div className="card-rank">{rank}</div>
      <div className={`card-suit ${suit}`}></div>
    </div>
  </div>
)

Card.propTypes = {
  suit: PropTypes.string.isRequired,
  rank: PropTypes.string.isRequired,
}

export default Card
