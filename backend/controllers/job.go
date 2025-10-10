// Package controllers
package controllers

import (
	"github.com/TheSushantKumbhar/get_me_hired/backend/models"
	"github.com/gofiber/fiber/v2"
)

func CreateJob(c *fiber.Ctx) error {
	var job models.Job

	if err := c.BodyParser(&job); err != nil {
		errText := "invalid request body"
		status := 400
		return c.Status(status).JSON(fiber.Map{"error": errText})
	}

	err := models.InsertOneJob(job)
	if err != nil {
		errText := "failed to insert job"
		status := 500
		return c.Status(status).JSON(fiber.Map{"error": errText})
	}

	return c.Status(200).JSON(fiber.Map{"message": "job created successfully"})
}

func GetJob(c *fiber.Ctx) error {
	jobID := c.Params("id")

	job, err := models.FindJobByID(jobID)
	if err != nil {
		errText := "job not found"
		status := 404
		return c.Status(status).JSON(fiber.Map{"message": errText})
	}

	return c.JSON(job)
}

func UpdateJob(c *fiber.Ctx) error {
	var job models.Job
	jobID := c.Params("id")

	if err := c.BodyParser(&job); err != nil {
		errText := "error parsing job"
		status := 400
		return c.Status(status).JSON(fiber.Map{"message": errText})
	}

	// DOES NOT WORK FIX ASAP
	newJob, err := models.UpdateJob(jobID, job)
	if err != nil {
		errText := "error updating the job"
		status := 400
		return c.Status(status).JSON(fiber.Map{"message": errText})
	}

	return c.JSON(newJob)
}

func DeleteJob(c *fiber.Ctx) error {
	jobID := c.Params("id")

	err := models.DeleteJob(jobID)
	if err != nil {
		errText := "failed to delete job"
		status := 400
		return c.Status(status).JSON(fiber.Map{"message": errText})
	}

	return c.Status(200).JSON(fiber.Map{"message": "job deleted successfully"})
}
