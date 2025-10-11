import { useQuery } from "@tanstack/react-query";
import JobCard from "../components/Jobs/JobCard";
import { Search } from "lucide-react";

function Jobs() {
  const { data, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: getJobs,
  });

  if (isLoading)
    return <div className="pt-[5vh] text-6xl font-space-mono">Loading....</div>;

  return (
    <div className="w-full h-full pt-[5vh] flex justify-center align-middle flex-wrap">
      <div className="w-3/4 p-3 flex">
        <h1 className="text-5xl font-space-mono">All Jobs</h1>
        <label className="input input-neutral ml-auto mr-10">
          <Search />
          <input type="search" placeholder="search" />
        </label>
      </div>
      <div className="max-w-3/4 flex flex-wrap">
        {data.map((job, i) => (
          <JobCard key={i} job={job} />
        ))}
      </div>
    </div>
  );
}

const getJobs = async () => {
  const response = await fetch("http://localhost:3000/job");
  return await response.json();
};

export default Jobs;
