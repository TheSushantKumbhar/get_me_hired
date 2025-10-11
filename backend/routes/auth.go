package routes

import (
	"github.com/TheSushantKumbhar/get_me_hired/backend/controllers"
	"github.com/gofiber/fiber/v2"
)

func SetupAuthRoutes(app *fiber.App, controller *controllers.UserController) {
	app.Post("/register", controller.Register)
	app.Post("/login", controller.Login)
	app.Get("/user", controller.User)
	app.Get("/logout", controller.Logout)
}
