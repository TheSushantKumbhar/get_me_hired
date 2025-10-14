import { Info } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

function JobCard({ job }) {
  const darkTheme = useTheme();
  const navigate = useNavigate();

  return (
    <div className="card bg-base-200 w-[30%] m-4 shadow-sm font-work-sans">
      <figure>
        <img
          src="https://img.freepik.com/premium-vector/business-meeting-discussion-man-woman-office-table-vector-illustration_107641-425.jpg?semt=ais_hybrid&w=740&q=80"
          alt="Shoes"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{job.title}</h2>
        <div className="flex gap-1">
          {job.languages.map((lang, i) => (
            <div
              className={`badge badge-soft ${!darkTheme ? "text-accent" : "text-primary-content"}`}
              key={i}
            >
              {lang}
            </div>
          ))}
        </div>
        <p>{job.description}</p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary">Start Interview</button>
          <div className="tooltip" data-tip="info">
            <button
              className="btn btn-circle btn-ghost"
              onClick={() => navigate("/interview")}
            >
              <Info />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobCard;
