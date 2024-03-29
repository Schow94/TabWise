import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import jwt from "jwt-decode";
import axios from "axios";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Review from "./pages/Review";
import Receipts from "./pages/Receipts";
import Receipt from "./pages/Receipt";

import Navbar from "./components/Navbar";

import "./styles/App.css";

const API_URL = process.env.REACT_APP_API_URL;

const App = () => {
	const [token, setToken] = useState("");
	const [user, setUser] = useState({});
	const [receipt, setReceipt] = useState({});
	const [numPeople, setNumPeople] = useState(1);
	const [receiptUploading, setReceiptUploading] = useState(false);

	useEffect(() => {
		const tokenLocalStorage = localStorage.getItem("token");
		// If browser is reset add token in local storage to state
		if (tokenLocalStorage) {
			let decodedToken = jwt(tokenLocalStorage);
			const expireDate = decodedToken.exp;
			const currentTime = Date.now() / 1000;

			//If token is expired, remove token from localstorage & reset user & token state
			if (expireDate < currentTime) {
				//logout here
				localStorage.removeItem("token");
				setUser({});
				setToken("");
				return;
			}
			setToken(tokenLocalStorage);
			setUser({ id: decodedToken["id"], username: decodedToken["username"] });
		}
		// No token in local storage
		else {
			logout();
		}
	}, []);

	const addToken = (token) => {
		setToken(token);
		localStorage.setItem("token", token);
	};

	// Login
	const login = async (e, usernameInput, passwordInput) => {
		e.preventDefault();
		const res = await axios({
			method: "POST",
			url: `${API_URL}/login`,
			data: {
				username: usernameInput,
				password: passwordInput,
			},
		});

		const data = await res.data;
		const token = data;
		addToken(token);

		const decodedToken = jwt(res.data);
		const decodedId = decodedToken.id;
		const decodedUser = decodedToken.username;
		const decodedEmail = decodedToken.email;

		setUser({ id: decodedId, username: decodedUser });
	};

	const logout = () => {
		localStorage.removeItem("token");
		setToken("");
		setUser({});
	};

	const changeLineInput = (id) => (e) => {
		e.preventDefault();
		const copy = { ...receipt };
		const newItems = copy.line_items.map((x) => {
			if (x.id === id) {
				return {
					...x,
					[e.target.name]: e.target.value,
				};
			} else {
				return x;
			}
		});

		copy["line_items"] = newItems;
		setReceipt(copy);
	};

	return (
		<div className="App">
			<BrowserRouter>
				<Navbar token={token} user={user} logout={logout} />

				<Routes>
					<Route
						element={
							<Landing
								setReceipt={setReceipt}
								receiptUploading={receiptUploading}
								setReceiptUploading={setReceiptUploading}
								user={user}
								numPeople={numPeople}
								setNumPeople={setNumPeople}
								token={token}
							/>
						}
						exact
						path="/"
					/>
					<Route
						element={
							<Review
								changeLineInput={changeLineInput}
								numPeople={numPeople}
								setNumPeople={setNumPeople}
								token={token}
								user={user}
								receipt={receipt}
								setReceipt={setReceipt}
							/>
						}
						exact
						path="review"
					/>
					<Route
						element={<Receipts token={token} user={user} />}
						exact
						path={`receipts/:id`}
					/>
					<Route
						element={<Receipt token={token} user={user} />}
						exact
						path="receipt/:id"
					/>
					<Route element={<Login login={login} />} exact path="login" />
					<Route element={<Signup addToken={addToken} />} exact path="signup" />
				</Routes>
			</BrowserRouter>
		</div>
	);
};

export default App;
