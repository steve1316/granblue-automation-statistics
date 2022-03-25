import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import NavBar from "./components/Navbar"
import Footer from "./components/Footer"
import Gateway from "./pages/Gateway"
import UserContext from "./context/UserContext"

function App() {
    return (
        <Router>
            <UserContext>
                <NavBar />
                <Switch>
                    <Route path="/" component={Home} exact>
                        <Home />
                    </Route>
                    <Route path="/gateway" component={Gateway} exact>
                        <Gateway />
                    </Route>
                    <Route path="*">
                        <NotFound />
                    </Route>
                </Switch>
                <Footer />
            </UserContext>
        </Router>
    )
}

export default App
