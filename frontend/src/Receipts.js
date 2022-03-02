import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import axios from "axios";
import { BsTrash } from "react-icons/bs";

import "./Receipts.css";

const API_URL = "http://localhost:5000";

const Receipts = ({ token, user }) => {
	const [receipts, setReceipts] = useState([]);
	const { id } = useParams();

	useEffect(() => {
		getReceipts();
	}, []);

	const getReceipts = async () => {
		const response = await axios.get(`${API_URL}/receipts/${id}`);
		console.log("RECEIPTS: ", response);
		setReceipts(response.data);
	};

	const onDelete = async (e, receipt_id) => {
		e.preventDefault();
		console.log("DELETING", receipt_id);
		// const response = await axios.delete(`${API_URL}/receipts/${id}`);
		// console.log("RECEIPTS: ", response);

		// Use filter to remove receipt from state
		const newReceipts = receipts.filter((x) => x.receipt_id !== receipt_id);
		console.log("new receipts", newReceipts);
		setReceipts(newReceipts);
	};

	const renderReceipts = () => {
		return receipts.map((r, idx) => {
			return (
				<tr className="receipt-row" key={idx}>
					<td>
						<Link className="receipt-link" to={`/receipt/${r.receipt_id}`}>
							{r.vendor_name}
						</Link>
					</td>
					<td>{r.transaction_date.slice(0, 10)}</td>
					<td>${r.receipt_price}</td>
					<td>{r.category}</td>
					<td>
						<BsTrash
							size={30}
							className="trash-icon"
							onClick={(e) => onDelete(e, r.receipt_id)}
						/>
					</td>
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
								<th></th>
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
