-- name: CreateUser :one
INSERT INTO users (
  id,
  created_at,
  updated_at,
  username,
  password,
  email,
  resume_path,
  parsed_resume
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: GetUserByUsername :one
SELECT * FROM users 
WHERE username = $1;

-- name: GetUserByID :one
SELECT id, created_at, updated_at, username, email, resume_path, parsed_resume FROM users
WHERE id = $1;
