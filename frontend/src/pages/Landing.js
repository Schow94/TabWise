import React from "react";
import Upload from "../components/Upload";

import "../styles/Landing.css";
const Landing = ({
	user,
	token,
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
					{user && token ? (
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
				{user && token ? (
					<div className="instructions-container">
						<div className="instructions">
							<h1 className="instructions-title">How to Use</h1>
							<hr />

							<p>1) Login/Signup</p>
							<p>2) Upload Receipt Image (Only .jpeg supported right now)</p>
							<p>
								3) Review extracted data and make changes if needed. Confirm
								before saving
							</p>
							<p>
								4) (Optional) Email link to receipt to participants and how much
								they owe
							</p>
							<p>5) View Past Receipts or newly uploaded receipt</p>
						</div>
						<img
							className="instructions-image"
							src="./Instructions.png"
							alt="instructions"
						/>
					</div>
				) : (
					<div className="testimonial-images-container">
						<div className="testimonial-container">
							<img
								className="testimonial-img"
								src="./stefania.jpeg"
								alt="stefania"
							/>

							<div className="testimonial-box">
								<p className="testimonial-text">
									Stefania has improved her social life using TabWise
								</p>
							</div>
						</div>
						<div className="testimonial-container">
							<img className="testimonial-img" src="./anne.jpeg" alt="anne" />

							<div className="testimonial-box">
								<p className="testimonial-text">
									Anne has a fast-paced life that doesn't allow her to dwell
									over the boring things in life
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
};

export default Landing;
