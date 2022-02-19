import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import axios from "axios";

import "./Receipt.css";

const API_URL = "http://localhost:5000";

const Receipt = (props) => {
	const [receipt, setReceipt] = useState({});
	const [people, setPeople] = useState(5);
	const { id } = useParams();

	useEffect(() => {
		getReceipt(id);
	}, []);

	const getReceipt = async (id) => {
		const response = await axios.get(`${API_URL}/receipt/${id}`);
		setReceipt(response.data);
	};

	const renderItems = () => {
		console.log("RECEIPT:", receipt);
		return receipt["line_items"].map((r, idx) => {
			return (
				<>
					<tr className="item-row" key={idx}>
						<td>{r["description"]}</td>
						<td>${r["total"]}</td>
						<td>{r["quantity"]}</td>
						<td>{`$${parseFloat(r["total"] / people).toFixed(2)}`}</td>
					</tr>
					<hr />
				</>
			);
		});
	};

	return (
		<div className="bg-body">
			{Object.keys(receipt).length > 0 ? (
				<div className="receipts-container">
					<div className="receipt-summary">
						<div className="vendor-container">
							<div className="vendor-title">
								<img
									className="vendor-icon"
									src={receipt["vendor"]["vendor_logo"]}
									alt={receipt["vendor"]["raw_name"]}
								/>
								<h1 className="table-title">
									{`${receipt["vendor"]["raw_name"]}`}
								</h1>
							</div>
							<div className="vendor-info">
								<p>{receipt["vendor"]["address"]}</p>
								<p>{receipt["vendor"]["phone_number"]}</p>
								<p>{receipt["vendor"]["web"]}</p>
								<p>Category: {receipt["vendor"]["category"]}</p>
							</div>
						</div>

						<div className="transaction-summary">
							<p>Date: {receipt["date"].slice(0, 10)}</p>

							<p>Total: ${receipt["total"]}</p>
							<p>People: {people}</p>
							<p>
								Price/person: $
								{parseFloat(receipt["total"] / people).toFixed(2)}
							</p>

							<p>Payment: {receipt["payment_display_name"]}</p>
						</div>
					</div>

					<table className="receipt-table">
						<thead>
							<tr className="8 th">
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
		</div>
	);
};

export default Receipt;
