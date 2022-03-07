import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import axios from "axios";

import "./Receipt.css";

const API_URL = "http://localhost:5000";

const Receipt = ({ token, user }) => {
	const [receipt, setReceipt] = useState({});
	// Theres also a numPeople state in App.js
	// Need to change to use only 1 state at some point
	// const [people, setPeople] = useState(receipt["num_people"]);
	const { id } = useParams();

	useEffect(() => {
		getReceipt(id);
	}, []);

	const getReceipt = async (id) => {
		const response = await axios({
			method: "GET",
			url: `${API_URL}/receipt/${id}`,
			headers: { Authorization: `Bearer${token}` },
		});

		setReceipt(response.data);
		// setPeople(receipt["num_people"]);
	};

	const renderItems = () => {
		return receipt["line_items"].map((r) => {
			return (
				<>
					<tr className="item-row" key={r.item_id}>
						<td>{r["description"]}</td>
						<td>${r["item_price"]}</td>
						<td>{r["quantity"]}</td>
						<td>{`$${parseFloat(
							r["item_price"] / receipt["num_people"]
						).toFixed(2)}`}</td>
					</tr>
					<hr />
				</>
			);
		});
	};

	return (
		<div className="bg-body">
			{token && user ? (
				<>
					{Object.keys(receipt).length > 0 ? (
						<div className="receipts-container">
							<div className="receipt-summary">
								<div className="vendor-container">
									<div className="vendor-title">
										<img
											className="vendor-icon"
											src={receipt["vendor_logo"]}
											alt={receipt["vendor_name"]}
										/>
										<h1 className="table-title">
											{`${receipt["vendor_name"]}`}
										</h1>
									</div>
									<div className="vendor-info">
										<p>{receipt["vendor_address"]}</p>
										<p>{receipt["vendor_phone"]}</p>
										<p>{receipt["vendor_url"]}</p>
										<p>Category: {receipt["category"]}</p>
									</div>
								</div>

								<div className="transaction-summary">
									<p>
										Transaction Date: {receipt["transaction_date"].slice(0, 10)}
									</p>

									<p>Total: ${receipt["receipt_price"]}</p>
									<p>People: {receipt["num_people"]}</p>
									<p>
										Price/person: $
										{parseFloat(
											receipt["receipt_price"] / receipt["num_people"]
										).toFixed(2)}
									</p>

									<p>Payment: {receipt["payment"]}</p>
								</div>
							</div>

							<table className="receipt-table">
								<thead>
									<tr className="th">
										<th>Item</th>
										<th>Price</th>
										<th>Quantity</th>
										<th>Price/Person</th>
									</tr>
								</thead>

								<tbody>{renderItems()}</tbody>
							</table>
						</div>
					) : (
						<div className="invalid-receipt">
							<h1>Invalid Receipt</h1>
						</div>
					)}
				</>
			) : (
				<div className="no-receipt">
					<h1>Please login</h1>
				</div>
			)}
		</div>
	);
};

export default Receipt;
