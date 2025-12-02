// Package models
package models

import (
	"time"

	"github.com/TheSushantKumbhar/get_me_hired/backend/internal/database"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `json:"id"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	ResumePath   string    `json:"resume_path"`
	ParsedResume string    `json:"parsed_resume"`
}

func DatabaseUserToUser(dbUser database.User) User {
	resumePathStr := ""
	if dbUser.ResumePath.Valid {
		resumePathStr = dbUser.ResumePath.String
	}

	parsedResumeStr := ""
	if dbUser.ParsedResume.Valid {
		parsedResumeStr = dbUser.ParsedResume.String
	}

	return User{
		ID:           dbUser.ID,
		CreatedAt:    dbUser.CreatedAt,
		UpdatedAt:    dbUser.UpdatedAt,
		Username:     dbUser.Username,
		Email:        dbUser.Email,
		ResumePath:   resumePathStr,
		ParsedResume: parsedResumeStr,
	}
}

func DatabaseUserIDRowToUser(dbUser database.GetUserByIDRow) User {
	resumePathStr := ""
	if dbUser.ResumePath.Valid {
		resumePathStr = dbUser.ResumePath.String
	}

	parsedResumeStr := ""
	if dbUser.ParsedResume.Valid {
		parsedResumeStr = dbUser.ParsedResume.String
	}

	return User{
		ID:           dbUser.ID,
		CreatedAt:    dbUser.CreatedAt,
		UpdatedAt:    dbUser.UpdatedAt,
		Username:     dbUser.Username,
		Email:        dbUser.Email,
		ResumePath:   resumePathStr,
		ParsedResume: parsedResumeStr,
	}
}
