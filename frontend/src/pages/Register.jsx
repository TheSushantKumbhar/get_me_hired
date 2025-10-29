import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resume, setResume] = useState(null);

  const { register, loading } = useAuth();

  const navigate = useNavigate();

  const submit = async () => {
    try {
      try {
        await register(username, email, password, resume);
      } finally {
        navigate("/");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="w-dvw h-screen flex justify-center items-center">
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-2/5 border p-4">
        <legend className="fieldset-legend w-full text-lg font-space-mono">
          Register
        </legend>

        <label className="label w-full">Username</label>
        <input
          type="text"
          name="username"
          value={username}
          className="input w-full"
          placeholder="your username"
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        />

        <label className="label w-full">Email</label>
        <input
          type="email"
          name="email"
          value={email}
          className="input w-full"
          placeholder="someone@example.com"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />

        <label className="label w-full">Password</label>
        <input
          type="password"
          name="password"
          className="input w-full"
          value={password}
          placeholder="your password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />

        <fieldset className="fieldset mt-0">
          <legend className="fieldset-legend">Upload Resume</legend>
          <input
            type="file"
            className="file-input w-full"
            accept=".pdf"
            onChange={(e) => {
              setResume(e.target.files[0]);
            }}
          />
          <label className="label">format: pdf</label>
        </fieldset>

        <button
          disabled={loading}
          className="btn btn-neutral w-full mt-2"
          onClick={submit}
        >
          {loading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            "Register"
          )}
        </button>
      </fieldset>
    </div>
  );
}

export default Register;
