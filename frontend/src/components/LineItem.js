const Lineitem = ({
	changeLineInput,
	setReceipt,
	numPeople,
	receipt,
	item,
	id,
}) => {
	return (
		<tr className="item" key={id}>
			<td className="name">
				<input
					id={id}
					type="text"
					name="description"
					className="receipt-input"
					onChange={changeLineInput(id)}
					value={item.description}></input>
			</td>
			<td className="price">
				$
				<input
					id={id}
					type="text"
					name="item_price"
					className="receipt-input"
					onChange={changeLineInput(id)}
					value={item.item_price}></input>
			</td>
			<td className="quantity">
				<input
					id={id}
					type="text"
					name="quantity"
					className="receipt-input"
					onChange={changeLineInput(id)}
					value={item.quantity}></input>
			</td>
			<td className="ppp">
				<input
					id={id}
					type="text"
					name="item_ppp"
					className="receipt-input"
					onChange={changeLineInput(id)}
					value={(item.item_ppp / numPeople).toFixed(2)}></input>
			</td>
		</tr>
	);
};

export default Lineitem;
