import { Info } from "lucide-react";

function JobCard({ job }) {
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
        <p>{job.description}</p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary">Start Interview</button>
          <div className="tooltip" data-tip="info">
            <button className="btn btn-circle btn-ghost">
              <Info />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobCard;
