-- name: CreateJob :one
INSERT INTO jobs (
  id,
  created_at,
  updated_at,
  company_name,
  title,
  description,
  languages,
  created_by
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: GetJobs :many
SELECT * from jobs;

-- name: GetJobByID :one
SELECT * FROM jobs WHERE id = $1;

-- name: DeleteJobByID :exec
DELETE FROM jobs WHERE id = $1;
