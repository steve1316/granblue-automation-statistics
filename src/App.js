import Home from './pages/Home';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import NotFound from './pages/NotFound';

function App() {
	return (
		<Router>
			<div className="content">
				<Switch>
					<Route exact path="/">
						<Home />
					</Route>
					<Route path="*">
						<NotFound />
					</Route>
				</Switch>
			</div>
		</Router>
	);
}

export default App;
