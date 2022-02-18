import axios from "axios";
import React from "react";
import ImageUploading from "react-images-uploading";

const API_URL = "http://localhost:5000";

const Upload = () => {
	const [images, setImages] = React.useState([]);
	const maxNumber = 1;

	const onChange = (imageList, addUpdateIndex) => {
		// data for submit
		console.log(imageList, addUpdateIndex);
		setImages(imageList);
	};

	const onSubmit = async () => {
		let formData = new FormData();
		formData.append("image", images[0]["file"]);
		console.log(images[0]);
		const response = await axios.post(`${API_URL}/image`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});

		console.log(response);
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
				<div className="upload__image-wrapper">
					<button
						style={isDragging ? { color: "red" } : undefined}
						onClick={onImageUpload}
						{...dragProps}>
						Click or Drop here
					</button>
					&nbsp;
					<button onClick={onImageRemoveAll}>Remove all images</button>
					{imageList.map((image, index) => (
						<div key={index} className="image-item">
							<img src={image["data_url"]} alt="" width="100" />
							<div className="image-item__btn-wrapper">
								<button onClick={() => onImageUpdate(index)}>Update</button>
								<button onClick={() => onImageRemove(index)}>Remove</button>
							</div>
						</div>
					))}
					{imageList.length > 0 ? (
						<button onClick={() => onSubmit()}>Analyze Receipt</button>
					) : null}
				</div>
			)}
		</ImageUploading>
	);
};

export default Upload;
