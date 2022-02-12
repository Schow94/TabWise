import React from "react";
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
					<button className="upload-receipt-btn">Upload Receipt</button>
				) : null}
				<div className="testimonial-images-container">
					<img
						className="testimonial-img"
						src="./stefania.jpeg"
						alt="stefania"></img>
					<img className="testimonial-img" src="./anne.jpeg" alt="anne"></img>
				</div>
			</div>
		</>
	);
};

export default Landing;
