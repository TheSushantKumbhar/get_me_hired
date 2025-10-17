export const getJobs = async () => {
  const response = await fetch("http://localhost:3000/job");
  return await response.json();
};

export const getJobByID = async (jobID) => {
  const response = await fetch(`http://localhost:3000/job/${jobID}`);
  return await response.json();
};

export const getUserByUsername = async (username) => {
  const response = await fetch(`http://localhost:3000/user/${username}`);
  return await response.json();
};
