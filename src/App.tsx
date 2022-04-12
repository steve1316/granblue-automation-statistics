import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import { BrowserRouter as Router, Redirect, Route, Switch } from "react-router-dom"
import NavBar from "./components/Navbar"
import Footer from "./components/Footer"
import Gateway from "./pages/Gateway"
import { UserContext } from "./context/UserContext"
import { useContext } from "react"
import Dashboard from "./pages/Dashboard"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"

function App() {
    const user = useContext(UserContext)

    return (
        <Router>
            <NavBar />
            <Switch>
                <Route path="/" component={Home} exact>
                    <Home />
                </Route>
                <Route path="/gateway" exact>
                    {user ? <Redirect to="/dashboard" /> : <Gateway />}
                </Route>
                <Route path="/forgot-password" exact>
                    {user ? <Redirect to="/dashboard" /> : <ForgotPassword />}
                </Route>
                <Route path="/reset-password/:username/:token">{user ? <Redirect to="/dashboard" /> : <ResetPassword />}</Route>
                <Route path={["/dashboard"]} component={Dashboard} exact>
                    {user ? <Dashboard /> : <Redirect to="/gateway" />}
                </Route>
                <Route path="*">
                    <NotFound />
                </Route>
            </Switch>
            <Footer />
        </Router>
    )
}

export default App
