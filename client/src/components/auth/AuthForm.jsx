const AuthForm = ({
  title,
  buttonText,
  formData,
  setFormData,
  onSubmit,
  showNameField = false,
}) => {
  return (
    <div className="card shadow p-4 mx-auto" style={{ maxWidth: "420px" }}>
      <h3 className="text-center mb-3">{title}</h3>

      <div className="mb-3">
        {showNameField && (
          <>
            <label className="form-label">Name</label>
            <input
              className="form-control mb-3"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Your full name"
            />
          </>
        )}

        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control mb-3"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="example@mail.com"
        />

        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-control mb-4"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          placeholder="Enter your password"
        />
      </div>

      <button className="btn btn-primary w-100" onClick={onSubmit}>
        {buttonText}
      </button>
    </div>
  );
};

export default AuthForm;
