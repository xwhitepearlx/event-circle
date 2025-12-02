import { Link } from "react-router-dom";

const Home = () => {
  const userId = localStorage.getItem("userId");

  return (
    <div className="container mt-5">
      <div
        className="card shadow p-5 text-center mx-auto"
        style={{ maxWidth: "720px" }}
      >
        <h1 className="mb-3">Group Activity Planner</h1>

        <p className="text-muted fs-5">
          Plan events, gather participants, track availability, and keep
          everything organized — all in one simple place.
        </p>

        <div className="mt-4">
          {!userId ? (
            <>
              <Link to="/login" className="btn btn-primary me-2 px-4">
                Login
              </Link>

              <Link to="/register" className="btn btn-outline-primary px-4">
                Register
              </Link>
            </>
          ) : (
            <>
              <Link to="/activities" className="btn btn-primary me-2 px-4">
                View Activities
              </Link>

              <Link to="/create" className="btn btn-success px-4">
                Create Activity
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
