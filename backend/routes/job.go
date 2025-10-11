// Package routes
package routes

import (
	"github.com/TheSushantKumbhar/get_me_hired/backend/controllers"
	"github.com/gofiber/fiber/v2"
)

func SetupJobRoutes(app *fiber.App, controller *controllers.JobController) {
	jobGroup := app.Group("/job")

	jobGroup.Get("/", controller.GetAllJobs)
	jobGroup.Get("/:id", controller.GetJob)
	jobGroup.Post("/", controller.CreateJob)
	jobGroup.Put("/:id", controller.UpdateJob)
	jobGroup.Delete("/:id", controller.DeleteJob)
}
