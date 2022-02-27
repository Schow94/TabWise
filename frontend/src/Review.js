import React, { useEffect } from "react";
import axios from "axios";

import LineItem from "./LineItem";

import "./Review.css";

const API_URL = "http://localhost:5000";

const Review = ({ receipt, token, user, numPeople, setNumPeople }) => {
	const renderItems = () => {
		return receipt["line_items"].map((x, idx) => {
			return <LineItem item={x} />;
		});
	};

	const saveReceipt = async () => {
		console.log("RECEIPT: ", receipt);

		// Save receipt to db
		const res = await axios({
			method: "POST",
			url: `${API_URL}/receipts`,
			data: {
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
			},
		});
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
												<p>{numPeople}</p>
											</div>
										</div>
									</div>
									<button
										onClick={() => saveReceipt()}
										className="save-receipt-btn">
										Save receipt
									</button>

									{/* Option to save receipt data via post request */}
									{/* Receipt has a date, user_id, receipt_id, # ppl, price/person, total_price*/}
									{/* Each receipt item can be related to a receipt_id */}
								</div>

								<div className="email-container">
									<h3>Send Email to Participants</h3>
									<form>
										<div className="email">
											<input
												className="email-input"
												placeholder="email"></input>
											<input className="email-input" placeholder="name"></input>
										</div>

										<div className="email">
											<input
												className="email-input"
												placeholder="email"></input>
											<input className="email-input" placeholder="name"></input>
										</div>

										<div>
											<div>
												<button className="recipient-btn">+</button>
												<button className="recipient-btn">-</button>
											</div>

											<button className="send-email-btn">Send Email</button>
										</div>
									</form>
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
