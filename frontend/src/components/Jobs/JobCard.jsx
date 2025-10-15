import { Info } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

function JobCard({ job }) {
  const darkTheme = useTheme();
  const navigate = useNavigate();

  return (
    <div className="card bg-base-200 w-[30%] m-4 shadow-sm font-work-sans">
      <figure className="h-[10vh]">
        <img
          src="https://img.freepik.com/premium-vector/business-meeting-discussion-man-woman-office-table-vector-illustration_107641-425.jpg?semt=ais_hybrid&w=740&q=80"
          alt="Shoes"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title text-2xl font-space-mono">
          {job.companyName}
        </h2>
        <h2 className="card-title">{job.title}</h2>
        <div className="flex gap-1">
          {job.languages.map((lang, i) => (
            <div
              className={`badge badge-soft ${darkTheme ? "text-warning" : "text-primary-content"}`}
              key={i}
            >
              {lang}
            </div>
          ))}
        </div>
        <div className="card-actions justify-end">
          <button className="btn btn-primary w-full">Start Interview</button>
        </div>
      </div>
    </div>
  );
}

export default JobCard;
