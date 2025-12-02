import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/services/auth";
import AuthForm from "../components/auth/AuthForm";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleRegister = async () => {
    try {
      const { status } = await registerUser(formData);
      if (status === 201 || status === 200) {
        alert("Registration successful! Please log in.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Register error:", err);
      alert("Registration failed.");
    }
  };

  return (
    <div className="container mt-5">
      <AuthForm
        title="Create Account"
        buttonText="Register"
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleRegister}
        showNameField={true}
      />
    </div>
  );
};

export default Register;
