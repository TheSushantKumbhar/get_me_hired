function LoginForm() {
  return (
    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
      <legend className="fieldset-legend w-full">Login</legend>

      <label className="label w-full">Username</label>
      <input
        type="text"
        className="input w-full"
        placeholder="your username..."
      />

      <label className="label w-full">Password</label>
      <input
        type="password"
        className="input w-full"
        placeholder="your password..."
      />
      <button className="btn btn-neutral w-full">Login</button>
    </fieldset>
  );
}

export default LoginForm;
