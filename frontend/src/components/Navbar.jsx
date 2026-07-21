import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b bg-white sticky top-0 z-10">
      <Link to="/" className="text-xl font-bold">
        ▶ VideoTube
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/upload" className="text-sm font-medium hover:underline">
              Upload
            </Link>
            <Link
              to={`/channel/${user.username}`}
              className="flex items-center gap-2"
            >
              <img
                src={user.avatar}
                alt={user.username}
                className="w-8 h-8 rounded-full"
              />
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-medium px-3 py-1 border rounded-full hover:bg-gray-100"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm font-medium hover:underline">
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium px-3 py-1 bg-black text-white rounded-full"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;