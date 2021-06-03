import { Link } from 'react-router-dom';

const NotFound = () => {
	return (
		<div className="not-found">
			<h2>Sorry</h2>
			<p>404 - Page cannot be found</p>
			<Link to="/">Head back to the Home page...</Link>
		</div>
	);
};

export default NotFound;
