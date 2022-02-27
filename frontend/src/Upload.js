import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ImageUploading from "react-images-uploading";

import "./Upload.css";

const API_URL = "http://localhost:5000";

const Upload = ({
	user,
	numPeople,
	setNumPeople,
	setReceipt,
	receiptUploading,
	setReceiptUploading,
}) => {
	let navigate = useNavigate();
	const [images, setImages] = React.useState([]);
	const maxNumber = 1;

	const onChange = (imageList, addUpdateIndex) => {
		// data for submit
		console.log(imageList, addUpdateIndex);
		setImages(imageList);
	};

	const onSubmit = async (remove) => {
		setReceiptUploading(true);
		let formData = new FormData();
		formData.append("receipt", images[0]["file"]);
		// console.log("FORM DATA: ", formData);
		// console.log("IMAGE: ", images[0]);

		// OCR Microservice
		const response = await axios({
			method: "post",
			url: `http://localhost:8000/parse_receipt`,
			data: formData,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});

		await setReceiptUploading(false);

		// Remove image from UI
		remove(0);
		const data = response.data.data;

		// Only pull out data of interest from receipt
		const receiptData = {
			user_id: user.id,
			num_people: numPeople,
			receipt_price: data.total,
			receipt_ppp: data.total / numPeople,
			transaction_date: data.date,
			category: data.vendor.category,
			vendor_name: data.vendor.name,
			vendor_address: data.vendor.address,
			vendor_phone: data.vendor.phone_number,
			vendor_url: data.vendor.web,
			vendor_logo: data.vendor.vendor_logo,
			payment: data.payment_display_name,
			line_items: data.line_items.map((x) => {
				return {
					description: x.description,
					item_price: x.total,
					item_ppp: x.total / numPeople,
					quantity: x.quantity,
				};
			}),
		};

		// Save receipt to state
		setReceipt(receiptData);
		// Navigate user to review page once we get response back from backend
		navigate("/review");
	};

	return (
		<ImageUploading
			multiple
			value={images}
			onChange={onChange}
			maxNumber={maxNumber}
			dataURLKey="data_url">
			{({
				imageList,
				onImageUpload,
				onImageRemoveAll,
				onImageUpdate,
				onImageRemove,
				isDragging,
				dragProps,
			}) => (
				// write your building UI
				<div className="upload-body">
					{imageList.length > 0 ? null : (
						<button
							className="upload-btn"
							style={isDragging ? { color: "red" } : undefined}
							onClick={onImageUpload}
							{...dragProps}>
							Upload Receipt
						</button>
					)}
					&nbsp;
					{imageList.map((image, index) => (
						<div key={index} className="image-item">
							<img
								src={image["data_url"]}
								alt="receipt"
								className="receipt-image"
							/>
							<div className="image-item__btn-wrapper">
								<button onClick={() => onImageUpdate(index)}>Update</button>
								<button onClick={() => onImageRemove(index)}>Remove</button>
							</div>
						</div>
					))}
					{imageList.length > 0 ? (
						<button
							className="analyze-btn"
							onClick={() => onSubmit(onImageRemove)}>
							{receiptUploading ? `Uploading...` : `Analyze Receipt`}
						</button>
					) : null}
				</div>
			)}
		</ImageUploading>
	);
};

export default Upload;
