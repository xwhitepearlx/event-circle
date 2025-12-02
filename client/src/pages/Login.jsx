import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/services/auth";
import AuthForm from "../components/auth/AuthForm";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    try {
      const { data } = await loginUser(formData);
      localStorage.setItem("userId", data.user._id);
      localStorage.setItem("userName", data.user.name);
      navigate("/activities");
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed.");
    }
  };

  return (
    <div className="container mt-5">
      <AuthForm
        title="Login"
        buttonText="Sign In"
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleLogin}
      />
    </div>
  );
};

export default Login;
