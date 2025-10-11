import LoginForm from "./LoginForm";

function LoginModal() {
  return (
    <>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <button
        className="btn"
        onClick={() => document.getElementById("my_modal_2").showModal()}
      >
        Login
      </button>
      <dialog id="my_modal_2" className="modal">
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
        <div className="modal-box">
          <LoginForm />
        </div>
      </dialog>
    </>
  );
}

export default LoginModal;
