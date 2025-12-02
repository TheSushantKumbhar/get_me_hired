package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/TheSushantKumbhar/get_me_hired/backend/api"
	"github.com/TheSushantKumbhar/get_me_hired/backend/handlers"
	"github.com/TheSushantKumbhar/get_me_hired/backend/internal/database"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"

	_ "github.com/lib/pq"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalln("error loading env: ", err)
	}
	portString := os.Getenv("PORT")
	if portString == "" {
		log.Fatalln("Port not found in env!")
	}
	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		log.Fatalln("db url not found in env!")
	}

	conn, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalln("error connecting to database, ", err)
	}

	db := database.New(conn)
	apiCfg := api.APIConfig{
		DB: db,
	}

	// seeds.SeedJobs(&apiCfg)
	// log.Println("inserted jobs in db!")

	h := handlers.Handler{
		APIConfig: &apiCfg,
	}

	m := Middleware{
		APIConfig: &apiCfg,
	}

	router := chi.NewRouter()
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	v1Router := chi.NewRouter()

	setupRoutes(v1Router, &h, &m)

	router.Mount("/v1", v1Router)

	srv := &http.Server{
		Handler: router,
		Addr:    ":" + portString,
	}

	log.Printf("Server Starting on PORT: %v\n", portString)
	err = srv.ListenAndServe()
	if err != nil {
		log.Fatal(err)
	}
}
