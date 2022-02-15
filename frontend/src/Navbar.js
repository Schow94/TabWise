import React from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Navbar.css";

const Navbar = ({ token, logout }) => {
	const navigate = useNavigate();
	const user = token["username"];

	const handleClick = (e) => {
		e.preventDefault();
		// For some reason have to refresh page to see logout take effect
		logout();
		navigate("/");
	};

	return (
		<nav className="navbar">
			<ul>
				<li>
					<Link to="/">
						<img className="logo" alt="logo" src="./tandem.png"></img>
					</Link>
				</li>

				<li>
					<Link to="receipts">Receipts</Link>
				</li>

				{user ? (
					<>
						<p className="logged-in">
							Signed in as <div className="current-user-nav">{user}</div>
						</p>
						<button onClick={(e) => handleClick(e)}>Logout</button>
					</>
				) : (
					<>
						<li>
							<Link to="signup">Sign Up</Link>
						</li>

						<li>
							<Link to="login">Login</Link>
						</li>
					</>
				)}
			</ul>
		</nav>
	);
};

export default Navbar;
