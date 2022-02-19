import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import "./Login.css";

const Login = ({ login }) => {
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

	const handleSubmit = (e) => {
		login(e, usernameInput, passwordInput);
		navigate("/");
		//Clear form - This doesn't work
		resetUsername();
		// resetEmail();
		resetPassword();
	};

	return (
		<div className="login-bg">
			<div className="login-container">
				<form className="form-container" onSubmit={(e) => handleSubmit(e)}>
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
					<button className="login-btn">Login</button>
				</form>

				<button className="create-account-btn">
					<Link className="create-account" to="/signup">
						Sign Up{" "}
					</Link>
				</button>
			</div>
		</div>
	);
};

export default Login;
