import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom"
import NavBar from "./components/Navbar"
import Footer from "./components/Footer"
import Gateway from "./pages/Gateway"
import { UserContext } from "./context/UserContext"
import { useContext } from "react"
import Dashboard from "./pages/Dashboard"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"

function App() {
    const user = useContext(UserContext).user

    return (
        <Router>
            <NavBar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/gateway" element={user ? <Navigate to="/dashboard" replace /> : <Gateway />} />
                <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} />
                <Route path="/reset-password/:username/:token" element={user ? <Navigate to="/dashboard" replace /> : <ResetPassword />} />
                <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/gateway" replace />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
        </Router>
    )
}

export default App
