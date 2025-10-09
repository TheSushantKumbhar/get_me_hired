// Package routes
package routes

import (
	"github.com/TheSushantKumbhar/get_me_hired/backend/controllers"
	"github.com/gofiber/fiber/v2"
)

func SetupJobRoutes(app *fiber.App) {
	jobGroup := app.Group("/job")

	jobGroup.Post("/", controllers.CreateJob)
}
