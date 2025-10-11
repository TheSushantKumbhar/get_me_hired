// Package controllers
package controllers

import (
	"github.com/TheSushantKumbhar/get_me_hired/backend/models"
	"github.com/TheSushantKumbhar/get_me_hired/backend/repository"
	"github.com/gofiber/fiber/v2"
)

type JobController struct {
	Repo *repository.JobRepository
}

func NewJobController(repo *repository.JobRepository) *JobController {
	return &JobController{Repo: repo}
}

func (c *JobController) CreateJob(ctx *fiber.Ctx) error {
	var job models.Job

	if err := ctx.BodyParser(&job); err != nil {
		errText := "invalid request body"
		status := 400
		return ctx.Status(status).JSON(fiber.Map{"error": errText})
	}

	id, err := c.Repo.Insert(job)
	if err != nil {
		errText := "failed to insert job"
		status := 500
		return ctx.Status(status).JSON(fiber.Map{"error": errText})
	}

	return ctx.Status(201).JSON(fiber.Map{"_id": id.Hex()})
}

func (c *JobController) GetJob(ctx *fiber.Ctx) error {
	jobID := ctx.Params("id")

	job, err := c.Repo.FindByID(jobID)
	if err != nil {
		errText := "job not found"
		status := 404
		return ctx.Status(status).JSON(fiber.Map{"message": errText})
	}

	return ctx.JSON(job)
}

func (c *JobController) GetAllJobs(ctx *fiber.Ctx) error {
	jobs, err := c.Repo.FindAll()
	if err != nil {
		errText := "could not fetch jobs"
		status := 400
		return ctx.Status(status).JSON(fiber.Map{"message": errText})
	}

	return ctx.JSON(jobs)
}

func (c *JobController) UpdateJob(ctx *fiber.Ctx) error {
	var job models.Job
	jobID := ctx.Params("id")

	if err := ctx.BodyParser(&job); err != nil {
		errText := "error parsing job"
		status := 400
		return ctx.Status(status).JSON(fiber.Map{"message": errText})
	}

	// DOES NOT WORK FIX ASAP
	newJob, err := c.Repo.Update(jobID, job)
	if err != nil {
		errText := "error updating the job"
		status := 400
		return ctx.Status(status).JSON(fiber.Map{"message": errText})
	}

	return ctx.JSON(newJob)
}

func (c *JobController) DeleteJob(ctx *fiber.Ctx) error {
	jobID := ctx.Params("id")

	err := c.Repo.Delete(jobID)
	if err != nil {
		errText := "failed to delete job"
		status := 400
		return ctx.Status(status).JSON(fiber.Map{"message": errText})
	}

	return ctx.Status(200).JSON(fiber.Map{"message": "job deleted successfully"})
}
