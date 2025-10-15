import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

function JobModal({ job }) {
  const darkTheme = useTheme();
  const navigate = useNavigate();

  return (
    <dialog id={`modal_${job.companyName}`} className="modal">
      <div className="modal-box w-[60vw]">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h1 className="text-3xl font-space-mono">Interview Details</h1>
        <div className="divider"></div>
        <div className="m-2 font-work-sans">
          <h2 className="text-xl">
            Company Name: <span className="font-bold">{job.companyName}</span>
          </h2>
          <h2 className="text-xl">
            Job Title: <span className="font-bold">{job.title}</span>
          </h2>
          <p className="text-md my-2">
            Job Description:
            <br /> {job.description}
          </p>

          <h1 className="font-bold">Languages:</h1>
          {job.languages.map((lang, i) => (
            <div
              className={`mr-2 my-2 badge ${darkTheme ? "text-warning badge-primary" : "badge-neutral badge-soft"}`}
              key={i}
            >
              {lang}
            </div>
          ))}
          <button
            className="btn btn-success w-full my-2"
            onClick={() => navigate("/interview")}
          >
            Confirm
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default JobModal;
