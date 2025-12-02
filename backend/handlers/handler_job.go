package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/TheSushantKumbhar/get_me_hired/backend/internal/database"
	"github.com/TheSushantKumbhar/get_me_hired/backend/models"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (h Handler) HandlerGetJobs(w http.ResponseWriter, r *http.Request) {
	jobs, err := h.DB.GetJobs(r.Context())
	if err != nil {
		RespondWithErr(w, http.StatusNotFound, "jobs not found")
		return
	}

	respondWithJSON(w, http.StatusOK, models.DatabaseJobsToJobs(jobs))
}

func (h Handler) HandlerCreateJob(w http.ResponseWriter, r *http.Request, user models.User) {
	type Parameters struct {
		CompanyName string   `json:"company_name"`
		Title       string   `json:"title"`
		Description string   `json:"description"`
		Languages   []string `json:"languages"`
	}

	params := Parameters{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&params)
	if err != nil {
		RespondWithErr(w, http.StatusBadRequest, "could not decode json")
		return
	}

	job, err := h.DB.CreateJob(r.Context(), database.CreateJobParams{
		ID:          uuid.New(),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		CompanyName: params.CompanyName,
		Title:       params.Title,
		Description: params.Description,
		Languages:   params.Languages,
		CreatedBy:   user.ID,
	})
	if err != nil {
		RespondWithErr(w, http.StatusInternalServerError, "could not create job")
		return
	}

	respondWithJSON(w, http.StatusCreated, models.DatabaseJobToJob(job))
}

func (h Handler) HandlerGetJobByID(w http.ResponseWriter, r *http.Request) {
	jobIDStr := chi.URLParam(r, "id")
	jobID, err := uuid.Parse(jobIDStr)
	if err != nil {
		RespondWithErr(w, http.StatusBadRequest, "invalid job id")
		return
	}

	job, err := h.DB.GetJobByID(r.Context(), jobID)
	if err != nil {
		RespondWithErr(w, http.StatusNotFound, "job not found")
		return
	}

	respondWithJSON(w, http.StatusOK, models.DatabaseJobToJob(job))
}
