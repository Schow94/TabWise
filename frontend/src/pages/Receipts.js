import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import axios from "axios";
import { BsTrash } from "react-icons/bs";
import Pagination from "../components/Pagination";

import "../styles/Receipts.css";

const API_URL = process.env.REACT_APP_API_URL;

const Receipts = ({ token, user }) => {
	const [receipts, setReceipts] = useState([]);
	const { id } = useParams();
	const [currentPage, setCurrentPage] = useState(1);
	const [postsPerPage] = useState(7);

	useEffect(() => {
		if (user.id && token) {
			getReceipts();
		}
	}, []);

	const getReceipts = async () => {
		const response = await axios.get(`${API_URL}/receipts/${id}`);
		setReceipts(response.data);
	};

	const onDelete = async (receipt_id) => {
		const response = await axios.delete(`${API_URL}/receipt/${receipt_id}`);

		if (response) {
			const newReceipts = receipts.filter((x) => x.receipt_id !== receipt_id);
			setReceipts(newReceipts);
		}
	};

	const submit = (e, receipt_id) => {
		e.preventDefault();

		confirmAlert({
			title: "Confirm to submit",
			message: "Are you sure to do this.",
			buttons: [
				{
					label: "Yes",
					onClick: () => onDelete(receipt_id),
				},
				{
					label: "No",
				},
			],
		});
	};

	const renderReceipts = () => {
		return currentReceipts.map((r, idx) => {
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
							onClick={(e) => submit(e, r.receipt_id)}
						/>
					</td>
				</tr>
			);
		});
	};

	// Pagination
	const indexOfLastPost = currentPage * postsPerPage; // Page 1 * 10 posts per page --> indexOfLastPost is 10
	const indexOfFirstPost = indexOfLastPost - postsPerPage; // For Page 1 --> 10 - 10 = 0 --> indexOfFirstPost is 0
	const currentReceipts = receipts.slice(indexOfFirstPost, indexOfLastPost); // slice(0,10)

	const paginate = (num) => setCurrentPage(num);

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
								<th>Total</th>
								<th>Category</th>
								<th></th>
							</tr>
						</thead>

						<tbody>{renderReceipts()}</tbody>
					</table>

					<Pagination
						postsPerPage={postsPerPage}
						totalPosts={receipts.length}
						paginate={paginate}
						user={user}
						currentPage={currentPage}
					/>
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
