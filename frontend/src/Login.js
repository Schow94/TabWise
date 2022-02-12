import { useState } from "react";
import axios from "axios";
import jwt from "jwt-decode";
import { useNavigate } from "react-router-dom";

import "./Login.css";

const API_URL = "http://localhost:5000";

const Login = () => {
	let navigate = useNavigate();

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

	// Hook for each input
	const [usernameInput, handleUsernameChange, resetUsername] =
		useInputState("");
	// const [emailInput, handleEmailChange, resetEmail] = useInputState("");
	const [passwordInput, handlePasswordChange, resetPassword] =
		useInputState("");

	// Login
	const login = async (e) => {
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
		localStorage.setItem("token", token);

		const decodedToken = jwt(res.data);
		const decodedId = decodedToken.Id;
		const decodedUser = decodedToken.username;
		const decodedEmail = decodedToken.email;

		console.log("DECODED TOKEN: ", decodedToken);
		console.log("You are logged in as: ", decodedUser);
		// store returned user somehow

		//Clear form - This doesn't work
		resetUsername();
		// resetEmail();
		resetPassword();
		navigate("/");
	};

	const handleSubmit = (e) => {
		login(e);
	};

	return (
		<div className="Login">
			<div className="login-container">
				<form className="form-container" onSubmit={(e) => handleSubmit(e)}>
					<input
						className="input"
						placeholder="username"
						name="usernameInput"
						value={usernameInput}
						onChange={handleUsernameChange}
					/>
					{/* <input
						className="input"
						placeholder="email"
						name="emailInput"
						value={emailInput}
						onChange={handleEmailChange}
					/> */}
					<input
						className="input"
						placeholder="password"
						name="passwordInput"
						value={passwordInput}
						onChange={handlePasswordChange}
					/>
					<button>Submit</button>
				</form>

				<div>
					<p>
						<a href="#" className="create-account">
							Create an account
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Login;
