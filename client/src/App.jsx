import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Activities from "./pages/Activities.jsx";
import CreateActivity from "./pages/CreateActivity.jsx";
import ActivityDetails from "./pages/ActivityDetails.jsx";
// import "./style.css";

// import "./App.css";

function App() {
  return (
    <>
      <Navbar />

      <div className="container-fluid px-5 py-4">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/activities" element={<Activities />} />
          <Route path="/activities/:id" element={<ActivityDetails />} />

          <Route path="/create" element={<CreateActivity />} />
        </Routes>
      </div>
    </>
  );
}

export default App
