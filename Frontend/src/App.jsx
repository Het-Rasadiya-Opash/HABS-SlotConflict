import { Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentUser, setCheckingAuth } from "./features/usersSlice";
import { useEffect } from "react";
import apiRequest from "./utils/apiRequest";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest.get("/users");
        const user = response.data.data;
        dispatch(setCurrentUser(user));
      } catch (err) {
        dispatch(setCheckingAuth(false));
      }
    };
    checkAuth();
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
};

export default App;
