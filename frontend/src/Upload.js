import axios from "axios";
import React from "react";
import ImageUploading from "react-images-uploading";
import { useNavigate } from "react-router-dom";

import "./Upload.css";

const API_URL = "http://localhost:5000";

const Upload = ({ setReceipt }) => {
	let navigate = useNavigate();

	const [images, setImages] = React.useState([]);
	const maxNumber = 1;

	const onChange = (imageList, addUpdateIndex) => {
		// data for submit
		console.log(imageList, addUpdateIndex);
		setImages(imageList);
	};

	const onSubmit = async (remove) => {
		let formData = new FormData();
		formData.append("image", images[0]["file"]);
		console.log("IMAGE: ", images[0]);

		// Send image to backend
		const response = await axios.post(`${API_URL}/image`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});

		// Remove image from UI
		remove(0);

		// Save receipt to state
		setReceipt(response.data);
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
							Analyze Receipt
						</button>
					) : null}
				</div>
			)}
		</ImageUploading>
	);
};

export default Upload;
