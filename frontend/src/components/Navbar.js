import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";

import "../styles/Navbar.css";

const Navbar = ({ user, logout, token }) => {
	const navigate = useNavigate();

	const handleClick = (e) => {
		e.preventDefault();
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
					<Link to={`receipts/${user.id}`}>Receipts</Link>
				</li>

				{user && token ? (
					<>
						<p className="logged-in">
							Signed in as
							<span className="current-user-nav">{user.username}</span>
						</p>
						<button className="logout-btn" onClick={(e) => handleClick(e)}>
							<FiLogOut /> Logout
						</button>
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
