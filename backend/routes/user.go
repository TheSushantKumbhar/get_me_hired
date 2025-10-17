package routes

import (
	"github.com/TheSushantKumbhar/get_me_hired/backend/controllers"
	"github.com/gofiber/fiber/v2"
)

func SetupUserRoutes(app *fiber.App, controller *controllers.UserController) {
	app.Get("/user/:username", controller.FindUserByUsername)
}
