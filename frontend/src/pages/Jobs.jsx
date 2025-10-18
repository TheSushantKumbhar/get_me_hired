import { useQuery } from "@tanstack/react-query";
import JobCard from "../components/Jobs/JobCard";
import { Search, Briefcase, Filter } from "lucide-react";
import { getJobs } from "../api/api";

function Jobs() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: getJobs,
  });


  const allJobs = data;

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl font-space-mono animate-pulse">Loading opportunities...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl font-space-mono text-error">
          Error loading jobs. Please try again.
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-base-200 pt-[5vh] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-secondary py-12 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold font-space-mono text-white mb-3">
              Discover 
            </h1>
            <p className="text-lg text-white/90 font-work-sans">
              Explore opportunities and find your perfect match
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-base-100 rounded-xl shadow-2xl p-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/50" />
                <input
                  type="search"
                  placeholder="Search by job title, company, or keyword..."
                  className="input input-bordered w-full pl-12 bg-base-100 focus:outline-primary"
                />
              </div>
              <div className="flex gap-3">
                {/* <button className="btn btn-outline gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </button> */}
                <button className="btn btn-primary gap-2 px-8">
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <span className="text-lg font-semibold text-base-content">
              {allJobs.length} Jobs Found
            </span>
          </div>
          <div className="flex gap-2">
            <select className="select select-bordered select-sm">
              <option>Most Recent</option>
              <option>Most Relevant</option>
              <option>Salary: High to Low</option>
              <option>Salary: Low to High</option>
            </select>
          </div>
        </div>

        {/* 3 Column Card Layout */}
       {/* 3 Column Grid Layout */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {allJobs.map((job, i) => (
    <JobCard key={job.id || i} job={job} />
  ))}
</div>


        {/* Empty State */}
        {allJobs.length === 0 && (
          <div className="text-center py-16">
            <Briefcase className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
            <h3 className="text-2xl font-semibold text-base-content mb-2">
              No jobs found
            </h3>
            <p className="text-base-content/60">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Jobs;
