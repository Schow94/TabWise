import React, { useState, useEffect } from "react";
import axios from "axios";

import "./Receipts.css";

const API_URL = "http://localhost:5000";

const Receipts = () => {
	const [receipts, setReceipts] = useState([]);

	useEffect(() => {
		getReceipts();
	}, []);

	const getReceipts = async () => {
		const response = await axios.get(`${API_URL}/receipts`);
		console.log("RECEIPTS: ", response);
		setReceipts(response.data);
	};

	const renderReceipts = () => {
		return receipts.map((r) => {
			return (
				<tr className="receipt-row">
					<td>{r.vendor["name"]}</td>
					<td>{r.date.slice(0, 10)}</td>
					<td>${r.subtotal}</td>
					<td>{r.category}</td>
				</tr>
			);
		});
	};

	return (
		<div className="bg-body">
			<div className="receipts-container">
				<h1 className="table-title">Past Receipts</h1>
				<table className="receipts-table">
					<thead>
						<tr className="receipt-row">
							<th>Vendor</th>
							<th>Date</th>
							<th>Price</th>
							<th>Category</th>
						</tr>
					</thead>

					<tbody>{renderReceipts()}</tbody>
				</table>
			</div>
		</div>
	);
};

export default Receipts;
