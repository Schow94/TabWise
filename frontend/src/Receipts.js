import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import axios from "axios";

import "./Receipts.css";

const API_URL = "http://localhost:5000";

const Receipts = ({ token, user }) => {
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
		return receipts.map((r, idx) => {
			return (
				<tr className="receipt-row" key={idx}>
					<td>
						<Link className="receipt-link" to={`/receipt/${r.id}`}>
							{r.vendor["name"]}
						</Link>
					</td>
					<td>{r.date.slice(0, 10)}</td>
					<td>${r.subtotal}</td>
					<td>{r.category}</td>
				</tr>
			);
		});
	};

	return (
		<div className="bg-body">
			{token && user ? (
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
			) : (
				<div className="no-receipt">
					<h1>Please login</h1>
				</div>
			)}
		</div>
	);
};

export default Receipts;
