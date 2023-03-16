import Home from "./pages/Home"
import About from "./pages/About"
import NotFound from "./pages/NotFound"
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom"
import NavBar from "./components/Navbar"
import Footer from "./components/Footer"
import Gateway from "./pages/Gateway"
import { UserContext } from "./context/UserContext"
import { useContext } from "react"
import { CircularProgress } from "@mui/material"
import { styled } from "@mui/system"
import Dashboard from "./pages/Dashboard"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"

const StyledLoading = styled("div")({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
})

/**
 * The app shell and its route table.
 *
 * @returns The routed application.
 */
function App() {
    const { user, loading } = useContext(UserContext)

    return (
        <Router>
            <NavBar />
            {loading ? (
                // Route guards read `user`, which is undefined until the first session check lands.
                // Rendering the table before then bounces a signed-in visitor off /dashboard.
                <StyledLoading>
                    <CircularProgress />
                </StyledLoading>
            ) : (
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/gateway" element={user ? <Navigate to="/dashboard" replace /> : <Gateway />} />
                    <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} />
                    {/* No guard on purpose. A signed-in user who opens a reset link should still be able to use it. */}
                    <Route path="/reset-password" element={<ResetPassword />} />
                    {/* The old reset link format. Kept so links already sitting in inboxes do not land on a 404. */}
                    <Route path="/reset-password/:username/:token" element={<Navigate to="/reset-password" replace />} />
                    <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/gateway" replace />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            )}
            <Footer />
        </Router>
    )
}

export default App
