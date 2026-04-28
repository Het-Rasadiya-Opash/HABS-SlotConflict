import React from "react";
import { Route, Routes } from "react-router";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";

const App = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-900">
      <main className="flex-grow">
        <Routes>
           <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}></Route>
        </Routes>
      </main>
    </div>
  );
};

export default App;
