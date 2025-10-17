import { useParams } from "react-router-dom";
import { getUserByUsername } from "../api/api";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";

function ProfilePage() {
  const { username } = useParams();
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => getUserByUsername(username),
  });

  if (error) return <h1 className="pt-[5vh]">error!: {error}</h1>;
  if (isLoading) return <h1 className="pt-[5vh]">Loading</h1>;

  return (
    <div className="pt-[5vh] max-w-3/4">
      <h1 className="text-2xl">{data.username}</h1>
      <h2 className="text-xl">{data.email}</h2>
      {user.id === data.id && (
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Upload Resume</legend>
          <input type="file" className="file-input" />
          <label className="label">format: pdf</label>
        </fieldset>
      )}
    </div>
  );
}

export default ProfilePage;
