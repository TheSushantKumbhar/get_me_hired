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

	if err := models.InsertOneJob(job); err != nil {
		errText := "failed to insert job"
		status := 500
		return c.Status(status).JSON(fiber.Map{"error": errText})
	}

	return c.Status(200).JSON(fiber.Map{"message": "job created successfully"})
}
