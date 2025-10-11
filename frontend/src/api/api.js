export const getJobs = async () => {
  const response = await fetch("http://localhost:3000/job");
  return await response.json();
};
