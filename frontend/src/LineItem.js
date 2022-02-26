import React, { useState } from "react";

const Lineitem = ({ item }) => {
	// Generic input hook
	const useInputState = (initialVal) => {
		const [val, setVal] = useState(initialVal);
		const handleChange = (e) => {
			setVal(e.target.value);
			// console.log(e.target.name, ": ", val);
		};
		const reset = () => {
			setVal("");
		};
		return [val, handleChange, reset];
	};

	// This is not actually modifying receipt state
	// It's only modifying the input's state
	const [descriptionInput, handleDescriptionChange, resetDescription] =
		useInputState(item.description);
	const [totalInput, handleTotalChange, resetTotal] = useInputState(item.total);
	const [quantityInput, handleQuantityChange, resetQuantity] = useInputState(
		item.quantity
	);
	const [priceInput, handlePriceChange, resetPrice] = useInputState(
		item.quantity
	);

	return (
		<tr className="item" key={item.id}>
			<td className="name">
				<input
					className="receipt-input"
					onChange={handleDescriptionChange}
					value={descriptionInput}></input>
			</td>
			<td className="price">
				$
				<input
					className="receipt-input"
					onChange={handleTotalChange}
					value={totalInput}></input>
			</td>
			<td className="quantity">
				<input
					className="receipt-input"
					onChange={handleQuantityChange}
					value={quantityInput}></input>
			</td>
			<td className="ppp">
				<input
					className="receipt-input"
					onChange={handlePriceChange}
					value={priceInput}></input>
			</td>
		</tr>
	);
};

export default Lineitem;
