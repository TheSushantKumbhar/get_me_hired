import { useNavigate } from "react-router-dom";
import LoginModal from "../Login/LoginModal";
import ThemeController from "./ThemeController";
import { Home } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

function Navbar() {
  const navigate = useNavigate();

  const { user, logout, loading } = useAuth();

  return (
    <div className="navbar fixed bg-base-100 shadow-sm z-2">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />{" "}
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li>
              <a>Item 1</a>
            </li>
            <li>
              <a>Parent</a>
              <ul className="p-2">
                <li>
                  <a>Submenu 1</a>
                </li>
                <li>
                  <a>Submenu 2</a>
                </li>
              </ul>
            </li>
            <li>
              <a>Item 3</a>
            </li>
          </ul>
        </div>
        <a
          className="btn btn-ghost text-xl font-space-mono"
          onClick={() => navigate("/")}
        >
          <Home />
          GMH
        </a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 font-work-sans">
          <li>
            <a onClick={() => navigate("/job")}>Jobs</a>
          </li>
          <li>
            <a>Experiences</a>
          </li>
          <li>
            <a>Blogs</a>
          </li>
        </ul>
      </div>
      <div className="navbar-end font-work-sans">
        {user ? (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img
                  alt={user.username[0].toUpperCase()}
                  src="https://avatar.iran.liara.run/public"
                />
              </div>
            </div>
            <ul
              tabIndex="-1"
              className="menu menu-sm dropdown-content bg-base-300 rounded-box z-1 mt-3 w-52 p-2 shadow"
            >
              <li>
                <button className="btn btn-soft btn-sm m-1">Profile</button>
              </li>
              <li>
                <button
                  className="btn btn-warning btn-soft btn-sm m-1"
                  onClick={logout}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Logout"
                  )}
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <LoginModal />
        )}
        <ThemeController />
      </div>
    </div>
  );
}

export default Navbar;
