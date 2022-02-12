import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import jwt from "jwt-decode";

import "./App.css";

import Landing from "./Landing";
import Navbar from "./Navbar";
import Review from "./Review";
import Login from "./Login";

const App = () => {
	const [token, setToken] = useState({});

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
			}
			setToken(decodedToken);
		}
	}, []);

	// const clearStorage = () => {
	// 	localStorage.removeItem("token");
	// 	setToken({});
	// };

	const logout = () => {
		localStorage.removeItem("token");
	};

	return (
		<div className="App">
			<BrowserRouter>
				<Navbar token={token} logout={logout} />

				<Routes>
					<Route element={<Landing token={token} />} exact path="/" />
					<Route element={<Review />} exact path="review" />
					<Route element={<Login />} exact path="login" />
				</Routes>
			</BrowserRouter>
		</div>
	);
};

export default App;
