package main

import (
	"log"
	"os"

	"github.com/TheSushantKumbhar/get_me_hired/backend/controllers"
	"github.com/TheSushantKumbhar/get_me_hired/backend/models"
	"github.com/TheSushantKumbhar/get_me_hired/backend/repository"
	"github.com/TheSushantKumbhar/get_me_hired/backend/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalln("failed to load dotenv", err)
	}

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173, http://localhost:5174",
		AllowMethods:     "*",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: true,
	}))

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello World!")
	})

	client := models.ConnectDatabase()
	// models.InitCloudinary()
	dbName := os.Getenv("MONGODB_NAME")

	jobRepo := repository.NewJobRepository(client, dbName)
	jobController := controllers.NewJobController(jobRepo)

	userRepo := repository.NewUserRepository(client, dbName)
	userController := controllers.NewUserController(userRepo)

	routes.SetupJobRoutes(app, jobController)
	routes.SetupAuthRoutes(app, userController)
	routes.SetupUserRoutes(app, userController)

	err = app.Listen(":3000")
	if err != nil {
		log.Fatalln("could not start the server!\n", err)
	}
}
