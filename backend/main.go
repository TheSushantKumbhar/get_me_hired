package main

import (
	"log"

	"github.com/TheSushantKumbhar/get_me_hired/backend/models"
	"github.com/TheSushantKumbhar/get_me_hired/backend/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalln("failed to load dotenv", err)
	}

	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello World!")
	})

	models.ConnectDatabase()

	routes.SetupJobRoutes(app)

	err = app.Listen(":3000")
	if err != nil {
		log.Fatalln("could not start the server!\n", err)
	}
}
