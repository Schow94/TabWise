import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import jwt from "jwt-decode";
import axios from "axios";

import "./App.css";

import Landing from "./Landing";
import Navbar from "./Navbar";
import Review from "./Review";
import Login from "./Login";
import Signup from "./Signup";
import Receipts from "./Receipts";
import Receipt from "./Receipt";

const API_URL = "http://localhost:5000";

const App = () => {
	const [token, setToken] = useState({});
	const [user, setUser] = useState("");
	const [receipt, setReceipt] = useState({});

	useEffect(() => {
		const token = localStorage.getItem("token");

		if (token) {
			let decodedToken = jwt(token);
			const expireDate = decodedToken.exp;
			const currentTime = Date.now() / 1000;

			//If token is expired, remove token from localstorage & set currentUser to ''
			if (expireDate < currentTime) {
				console.log(
					expireDate,
					currentTime,
					"Token is expired. Please login again for valid credentials"
				);
				//logout here
				decodedToken = {};
				localStorage.removeItem("token");
				return;
			}

			setToken(decodedToken);
			setUser(decodedToken["username"]);
		}
	}, []);

	const addToken = (token) => {
		setToken(token);
		localStorage.setItem("token", token);
	};

	// const clearStorage = () => {
	// 	localStorage.removeItem("token");
	// 	setToken({});
	// };

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
		const decodedId = decodedToken.Id;
		const decodedUser = decodedToken.username;
		const decodedEmail = decodedToken.email;

		console.log("DECODED TOKEN: ", decodedToken);
		console.log("You are logged in as: ", decodedUser);
		setUser(decodedUser);
		// store returned user somehow
	};

	const logout = () => {
		localStorage.removeItem("token");
		setToken("");
	};

	return (
		<div className="App">
			<BrowserRouter>
				<Navbar token={token} user={user} logout={logout} />

				<Routes>
					<Route
						element={
							<Landing setReceipt={setReceipt} user={user} token={token} />
						}
						exact
						path="/"
					/>
					<Route element={<Review receipt={receipt} />} exact path="review" />
					<Route element={<Receipts />} exact path="receipts" />
					<Route element={<Receipt />} exact path="receipt/:id" />
					<Route element={<Login login={login} />} exact path="login" />
					<Route element={<Signup addToken={addToken} />} exact path="signup" />
				</Routes>
			</BrowserRouter>
		</div>
	);
};

export default App;
