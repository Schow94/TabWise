import React from "react";
import { Link } from "react-router-dom";
import Upload from "./Upload";

import "./Landing.css";
const Landing = ({
	user,
	numPeople,
	setNumPeople,
	setReceipt,
	receiptUploading,
	setReceiptUploading,
}) => {
	return (
		<>
			<div className="top-bg">
				<div className="top-container">
					{user ? (
						<div className="upload-container">
							<Upload
								receiptUploading={receiptUploading}
								setReceiptUploading={setReceiptUploading}
								setReceipt={setReceipt}
								user={user}
								numPeople={numPeople}
								setNumPeople={setNumPeople}
							/>
						</div>
					) : (
						<>
							<h1> Speak with TabWise</h1>
							<p className="top-slogan">Split any tab - minus the hassle</p>
						</>
					)}
				</div>
			</div>

			<div className="landing-body">
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
