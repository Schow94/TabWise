import * as React from "react";
import "../styles/Pagination.css";

const Pagination = ({
	postsPerPage,
	totalPosts,
	paginate,
	currentPage,
	user,
}) => {
	const pageNumbers = [];

	for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
		pageNumbers.push(i);
	}

	return (
		<nav className="pagination-container">
			<ul className="pagination">
				{pageNumbers.map((num) => {
					return (
						<li
							onClick={() => paginate(num)}
							key={num}
							className={`page-item ${num === currentPage ? `active` : ""}`}>
							<a href="#" className="page-link">
								{num}
							</a>
						</li>
					);
				})}
			</ul>
		</nav>
	);
};
export default Pagination;
