import React, { useState } from "react";
import axios from "axios";
import { AiOutlineCheck } from "react-icons/ai";

import LineItem from "./LineItem";

import "./Review.css";

const API_URL = process.env.REACT_APP_API_URL;
const EMAIL_API_URL = process.env.REACT_APP_EMAIL_API_URL;
const REACT_APP_SENDER_EMAIL = process.env.REACT_APP_SENDER_EMAIL;
const REACT_APP_SENDER_EMAIL_PW = process.env.REACT_APP_SENDER_EMAIL_PW;

const Review = ({
	changeLineInput,
	setReceipt,
	receipt,
	token,
	user,
	numPeople,
	setNumPeople,
}) => {
	const [participants, setParticipants] = useState([
		{ id: 1, name: "Bob", email: "bob@gmail.com" },
	]);

	const changeNumParticipants = (e, val) => {
		e.preventDefault();
		if (val === "+") {
			const recipients = [
				...participants,
				{
					name: "Stephen",
					email: "stephen@gmail.com",
					id: participants.length + 1,
				},
			];
			setParticipants(recipients);
		} else if (val === "-") {
			if (participants.length > 1) {
				setParticipants(participants.slice(0, participants.length - 1));
			}
		}
	};

	const changeParticipantInput = (id) => (e) => {
		e.preventDefault();

		const newParticipants = participants.map((x) => {
			if (x.id === id) {
				return {
					...x,
					[e.target.name]: e.target.value,
				};
			} else {
				return x;
			}
		});
		setParticipants(newParticipants);
	};

	const promises = [];

	// Send email to participants
	const sendEmail = (name, email) => {
		// Save receipt to db
		const res = axios({
			method: "POST",
			url: `${EMAIL_API_URL}/email`,
			data: {
				senderEmail: REACT_APP_SENDER_EMAIL,
				password: REACT_APP_SENDER_EMAIL_PW,
				senderName: "Sel",
				subject: "Long time no see!",
				body: "It's been a while since you've heard from us. Don't worry, we didn't forget about you. There's so much we have to update you on. First of all, we're going out of business! So there's that....",
				htmlTemplate: "<h1>{{.PageTitle}}</h1>",
				recipients: [{ name: name, email: email }],
			},
		});

		promises.push(res);

		setEmailSent(true);
	};

	const loopParticipants = async (e) => {
		e.preventDefault();
		for (let p of participants) {
			sendEmail(p.name, p.email);
		}

		let res = await axios.all(promises);
	};

	const renderItems = () => {
		return receipt["line_items"].map((x, idx) => {
			return (
				<LineItem
					changeLineInput={changeLineInput}
					setReceipt={setReceipt}
					receipt={receipt}
					item={x}
					id={idx}
					numPeople={numPeople}
				/>
			);
		});
	};

	const [saved, setSaved] = useState(false);
	const [emailSent, setEmailSent] = useState(false);

	const saveReceipt = async () => {
		const receiptData = {
			user_id: user.id,
			num_people: receipt.num_people,
			receipt_price: receipt.receipt_price,
			receipt_ppp: receipt.receipt_ppp,
			transaction_date: receipt.transaction_date,
			category: receipt.category,
			vendor_name: receipt.vendor_name,
			vendor_address: receipt.vendor_address,
			vendor_phone: receipt.vendor_phone,
			vendor_url: receipt.vendor_url,
			vendor_logo: receipt.vendor_logo,
			payment: receipt.payment,
			line_items: receipt.line_items,
		};

		console.log(receiptData);

		// Save receipt to db
		const res = await axios({
			method: "POST",
			url: `${API_URL}/receipts`,
			data: receiptData,
		});

		// if (res) {
		setSaved(true);
		// }
	};

	// Generic input hook
	const useInputState = (initialVal) => {
		const [val, setVal] = useState(initialVal);
		const handleChange = (e) => {
			setVal(e.target.value);
			// console.log(e.target.name, ": ", val);
		};
		const reset = () => {
			setVal("");
		};
		return [val, handleChange, reset];
	};

	const changePeople = (e) => {
		// Proceed only if input is a valid integer
		// if (
		// 	!Number.isInteger(parseInt(e.target.value)) ||
		// 	parseInt(e.target.value) < 0
		// )
		// 	return;

		setNumPeople(e.target.value);

		const copy = { ...receipt };
		copy["num_people"] = parseInt(e.target.value);
		copy["line_items"].map(
			(x) => (x["item_ppp"] = x["item_price"] / e.target.value)
		);
		console.log("COPY: ", copy);
		setReceipt(copy);
	};

	return (
		<div className="bg-body">
			{token && user ? (
				<div className="review-body">
					{Object.keys(receipt).length > 0 ? (
						<div className="review-bottom-container">
							<div className="sidebar-container">
								<div className="summary-container">
									<div className="summary">
										<div className="total-container">
											<p>Total Price: </p>
											<div className="total">
												<p>${receipt["receipt_price"]}</p>
											</div>
										</div>

										<div className="total-container">
											<p>Number of people: </p>
											<div className="total">
												<input
													type="text"
													className="total"
													name="numPeople"
													value={numPeople}
													placeholder="# of people"
													onChange={changePeople}
												/>
											</div>
										</div>
									</div>

									{saved ? (
										<div className="saved-status">
											<p>
												Saved <AiOutlineCheck />
											</p>
										</div>
									) : null}

									<button
										onClick={() => saveReceipt()}
										className="save-receipt-btn">
										{saved ? `Save again` : `Save receipt`}
									</button>

									{/* Option to save receipt data via post request */}
									{/* Receipt has a date, user_id, receipt_id, # ppl, price/person, total_price*/}
									{/* Each receipt item can be related to a receipt_id */}
								</div>

								<div className="email-container">
									<h3>Send Email to Participants</h3>
									<form>
										{participants.map((x) => {
											return (
												<div className="participant" key={x.id}>
													<input
														type="text"
														id={x.id}
														className="email-input"
														name="name"
														value={x.name}
														placeholder="name"
														onChange={changeParticipantInput(x.id)}
													/>
													<input
														type="text"
														id={x.id}
														className="email-input"
														name="email"
														value={x.email}
														placeholder="email"
														onChange={changeParticipantInput(x.id)}
													/>
												</div>
											);
										})}

										{/* <div className="email">
											<input
												className="email-input"
												placeholder="email"></input>
											<input className="email-input" placeholder="name"></input>
										</div> */}

										<button
											onClick={(e) => loopParticipants(e)}
											className="send-email-btn">
											Send Email
										</button>
									</form>
									<div>
										<button
											onClick={(e) => changeNumParticipants(e, "+")}
											className="recipient-btn">
											+
										</button>
										<button
											onClick={(e) => changeNumParticipants(e, "-")}
											className="recipient-btn">
											-
										</button>
									</div>
								</div>
							</div>

							<table className="items">
								<thead>
									<tr className="item">
										<th className="name">Item</th>
										<th className="price">Price</th>
										<th className="quantity">Quantity</th>
										<th className="ppp">Price/person</th>
									</tr>
								</thead>
								<tbody>{renderItems()}</tbody>
							</table>
						</div>
					) : (
						<div className="no-receipt">
							<h1>Please upload a receipt first</h1>
						</div>
					)}
				</div>
			) : (
				<div className="no-receipt">
					<h1>Please login</h1>
				</div>
			)}
		</div>
	);
};

export default Review;
