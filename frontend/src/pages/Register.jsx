import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { register, loading } = useAuth();

  const navigate = useNavigate();

  const submit = async () => {
    try {
      try {
        await register(username, email, password);
      } finally {
        navigate("/");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="pt-[5vh] w-dvw h-full flex justify-center align-middle">
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-2/5 border p-4">
        <legend className="fieldset-legend w-full text-lg font-space-mono">
          Register
        </legend>

        <label className="label w-full">Username</label>
        <input
          type="text"
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
          className="input w-full"
          value={password}
          placeholder="your password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <button className="btn btn-neutral w-full mt-2" onClick={submit}>
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
