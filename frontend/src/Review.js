import React from "react";

import "./Review.css";

const Review = ({ receipt, token, user }) => {
	// Generic input hook
	// const useInputState = (initialVal) => {
	// 	const [val, setVal] = useState(initialVal);
	// 	const handleChange = (e) => {
	// 		setVal(e.target.value);
	// 		// console.log(e.target.name, ": ", val);
	// 	};
	// 	const reset = () => {
	// 		setVal("");
	// 	};
	// 	return [val, handleChange, reset];
	// };

	// Going to need a way to have an onChange Handler for dynamic # of inputs/line items in receipt

	const renderItems = () => {
		console.log("RECEIPT: ", receipt);

		return receipt["line_items"].map((x, idx) => {
			return (
				<tr className="item" key={x.id}>
					<td className="name">
						<input className="receipt-input" value={x.description}></input>
					</td>
					<td className="price">
						$<input className="receipt-input" value={x.total}></input>
					</td>
					<td className="quantity">
						<input className="receipt-input" value={x.quantity}></input>
					</td>
					<td className="ppp">
						<input className="receipt-input" value={x.quantity}></input>
					</td>
				</tr>
			);
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
												<p>${receipt["total"]}</p>
											</div>
										</div>

										<div className="total-container">
											<p>Number of people: </p>
											<div className="total">
												<p>5</p>
											</div>
										</div>
									</div>
									<button className="save-receipt-btn">Save receipt</button>

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
