import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AiOutlineCheck } from "react-icons/ai";

import LineItem from "../components/LineItem";

import "../styles/Review.css";

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
	let navigate = useNavigate();

	const [participants, setParticipants] = useState([
		{ id: 1, name: "", email: "" },
	]);

	const [saved, setSaved] = useState(false);
	const [emailSent, setEmailSent] = useState(false);
	const [savedReceiptId, setSavedReceiptId] = useState(undefined);

	const changeNumParticipants = (e, val) => {
		e.preventDefault();
		if (val === "+") {
			const recipients = [
				...participants,
				{
					name: "",
					email: "",
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
				senderName: "Stephen",
				subject: `Bill for ${
					receipt.vendor_name
				} - ${receipt.transaction_date.slice(0, 11)}`,
				body: `Your portion of the bill is $${receipt.receipt_ppp}. You can find the entire tab breakdown here: http://localhost:3000/receipt/${savedReceiptId}`,
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
		setParticipants([{ id: 1, name: "", email: "" }]);
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

	const saveReceipt = async () => {
		const receiptData = {
			user_id: user.id,
			num_people: receipt.num_people,
			receipt_price: receipt.receipt_price,
			receipt_ppp: receipt.receipt_price / receipt.num_people,
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

		// Save receipt to db
		const res = await axios({
			method: "POST",
			url: `${API_URL}/receipts`,
			data: receiptData,
		});

		setSavedReceiptId(res.data["receipt_id"]);

		setSaved(true);
	};

	const changePeople = (e) => {
		setNumPeople(e.target.value);

		const copy = { ...receipt };
		copy["num_people"] = parseInt(e.target.value);
		copy["receipt_ppp"] = copy["receipt_price"] / parseInt(e.target.value);
		copy["line_items"].map(
			(x) => (x["item_ppp"] = x["item_price"] / e.target.value)
		);
		setReceipt(copy);
	};

	const done = () => {
		navigate(`/receipts/${user.id}`);
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
											<p>Total: </p>
											<div className="total">
												<p>${receipt["receipt_price"]}</p>
											</div>
										</div>

										<div className="total-container">
											<p>Per person: </p>
											<div className="total">
												<p>
													${(receipt["receipt_price"] / numPeople).toFixed(2)}
												</p>
											</div>
										</div>

										<div className="total-container">
											<p>People: </p>
											<input
												type="text"
												className="total-input"
												name="numPeople"
												value={numPeople}
												placeholder="# of people"
												onChange={changePeople}
											/>
										</div>
									</div>

									{saved ? (
										<div className="saved-status">
											<p>
												Saved <AiOutlineCheck />
											</p>
										</div>
									) : null}

									<div className="receipt-btns-container">
										<button
											onClick={() => saveReceipt()}
											className="save-receipt-btn">
											{saved ? `Save again` : `Save receipt`}
										</button>

										{saved ? (
											<button onClick={() => done()} className="done-btn">
												Done
											</button>
										) : null}
									</div>
								</div>

								{saved ? (
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
															placeholder="Name"
															onChange={changeParticipantInput(x.id)}
														/>
														<input
															type="text"
															id={x.id}
															className="email-input"
															name="email"
															value={x.email}
															placeholder="Email"
															onChange={changeParticipantInput(x.id)}
														/>
													</div>
												);
											})}

											<div className="email-btns">
												<button
													onClick={(e) => loopParticipants(e)}
													className="send-email-btn">
													Send Email
												</button>
												<div className="email-btn-container">
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
										</form>
									</div>
								) : null}
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
