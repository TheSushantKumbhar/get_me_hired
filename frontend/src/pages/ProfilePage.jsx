import { useParams } from "react-router-dom";
import { getUserByUsername } from "../api/api";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";

function ProfilePage() {
  const { username } = useParams();
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => getUserByUsername(username),
  });

  if (error) return <h1 className="flex justify-center items-center min-h-screen">error!: {error}</h1>;
  if (isLoading) return <h1 className="flex justify-center items-center min-h-screen">Loading</h1>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200  font-work-sans">
      <div className="w-full max-w-2xl mx-auto p-8 bg-base-100 rounded-lg shadow-2xl">
        <div className="text-center space-y-4">
          {/* THIS IS THE PLACEHOLDER - Profile Picture */}
          <div className="flex justify-center mb-4">
            <div className="w-32 h-32 rounded-full ring-4 ring-primary bg-base-300 flex items-center justify-center">
              <svg className="w-20 h-20 text-base-content opacity-40" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-primary font-mono">{data.username}</h1>
          <h2 className="text-xl text-base">{data.email}</h2>
        </div>
        
        {user._id === data._id && (
          <fieldset className="fieldset w-full mt-4 flex flex-col items-center">
            <legend className="fieldset-legend w-full flex-col items-center">Upload Resume</legend>
            <input type="file" className="file-input" />
            <label className="label">format: pdf</label>
          </fieldset>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
