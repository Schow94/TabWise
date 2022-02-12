import React from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Navbar.css";

const Navbar = ({ token, logout }) => {
	const navigate = useNavigate();
	const user = token["username"];

	const handleClick = (e) => {
		e.preventDefault();
		logout();
		navigate("/");
	};

	return (
		<nav className="navbar">
			<ul>
				<li>
					<Link to="/">Split Receipts</Link>
				</li>

				<li>
					<a href="#">Receipts</a>
				</li>

				<li>
					<a href="#">Download the app</a>
				</li>
				{user ? (
					<>
						<p>
							Logged in as <b>{user}</b>
						</p>
						<button onClick={(e) => handleClick(e)}>Logout</button>
					</>
				) : (
					<>
						<li>
							<a href="#">Sign Up</a>
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
