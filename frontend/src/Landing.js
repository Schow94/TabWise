import React from "react";
import { Link } from "react-router-dom";

import "./Landing.css";
const Landing = ({ token }) => {
	const user = token["username"];
	return (
		<>
			<div className="top-bg">
				<div className="top-container">
					<h1> Speak with TabWise</h1>
					<p className="top-slogan">Split any tab - minus the hassle</p>
				</div>
			</div>

			<div className="landing-body">
				{user ? (
					<Link to="review">
						<button className="upload-receipt-btn">Upload Receipt</button>
					</Link>
				) : null}
				<div className="testimonial-images-container">
					<div className="testimonial-container">
						<img
							className="testimonial-img"
							src="./stefania.jpeg"
							alt="stefania"
						/>
						{/* <p className="testimonial-text">
							Stefania has improved her social life using TabWise
						</p> */}
					</div>
					<div className="testimonal-container">
						<img className="testimonial-img" src="./anne.jpeg" alt="anne" />
						{/* <p className="testimonial-text">
							Anne has a fast-paced life that doesn't allow her to dwell over
							the boring things in life
						</p> */}
					</div>
				</div>
			</div>
		</>
	);
};

export default Landing;
