import { useState } from "react";
import axios from "axios";
import jwt from "jwt-decode";
import { useNavigate } from "react-router-dom";

import "../styles/Login.css";

const API_URL = "http://localhost:5000";

const Signup = ({ addToken }) => {
	let navigate = useNavigate();

	// Generic input hook
	const useInputState = (initialVal) => {
		const [val, setVal] = useState(initialVal);
		const handleChange = (e) => {
			setVal(e.target.value);
		};
		const reset = () => {
			setVal("");
		};
		return [val, handleChange, reset];
	};

	// Hook for each input
	const [usernameInput, handleUsernameChange, resetUsername] =
		useInputState("");
	const [emailInput, handleEmailChange, resetEmail] = useInputState("");
	const [passwordInput, handlePasswordChange, resetPassword] =
		useInputState("");

	// Login
	const signup = async (e) => {
		e.preventDefault();
		const res = await axios({
			method: "POST",
			url: `${API_URL}/signup`,
			data: {
				username: usernameInput,
				email: emailInput,
				password: passwordInput,
			},
		});

		const data = await res.data;
		const token = data;

		addToken(token);

		const decodedToken = jwt(token);
		const decodedId = decodedToken.Id;
		const decodedUser = decodedToken.username;
		const decodedEmail = decodedToken.email;
		// store returned user somehow

		//Clear form - This doesn't work
		resetEmail();
		resetUsername();
		resetPassword();
		navigate("/");
	};

	const handleSubmit = (e) => {
		signup(e);
	};

	return (
		<div className="login-bg">
			<div className="login-container">
				<form
					className="form-container"
					onSubmit={(e) => handleSubmit(e)}
					autoComplete="new-password">
					<input
						className="input"
						placeholder="email"
						name="emailInput"
						value={emailInput}
						onChange={handleEmailChange}
						autoComplete="new-password"
					/>
					<input
						className="input"
						placeholder="username"
						name="usernameInput"
						value={usernameInput}
						onChange={handleUsernameChange}
						autoComplete="new-password"
					/>
					<input
						className="input"
						placeholder="password"
						name="passwordInput"
						type="password"
						value={passwordInput}
						onChange={handlePasswordChange}
						autoComplete="new-password"
					/>
					<button className="login-btn">Sign Up</button>
				</form>
			</div>
		</div>
	);
};

export default Signup;
