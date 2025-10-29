package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/TheSushantKumbhar/get_me_hired/backend/models"
	"github.com/TheSushantKumbhar/get_me_hired/backend/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

const secretKey = "secret"

type UserController struct {
	Repo *repository.UserRepository
}

func NewUserController(repo *repository.UserRepository) *UserController {
	return &UserController{Repo: repo}
}

func (c *UserController) Register(ctx *fiber.Ctx) error {
	username := ctx.FormValue("username")
	email := ctx.FormValue("email")
	passwordStr := ctx.FormValue("password")

	resumeFile, err := ctx.FormFile("resume")
	if err != nil {
		errText := "failed to retrieve resume file"
		log.Println(err)
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": errText})
	}

	password, err := bcrypt.GenerateFromPassword([]byte(passwordStr), 14)
	if err != nil {
		errText := "failed to encrypt the password"
		status := 400
		return ctx.Status(status).JSON(fiber.Map{"error": errText})
	}

	ext := filepath.Ext(resumeFile.Filename)
	tempPath := fmt.Sprintf("../store/user/resume/resume_%s", username, ext)
	if err := ctx.SaveFile(resumeFile, tempPath); err != nil {
		log.Println("some error idk")
		return ctx.Status(500).JSON(fiber.Map{"error": "failed to save temp file"})
	}

	// add upload to cloud later
	/*
		resumeURL, err := models.UploadToCloudinary(tempPath, "get_me_hired/users/resume")
		if err != nil {
			errText := "failed to upload to cloudinary"
			status := 400
			return ctx.Status(status).JSON(fiber.Map{"error": errText})
		}
	*/
	resumeURL := tempPath

	parsedResume, err := parseResume(resumeURL)
	if err != nil {
		log.Println("error parsing resume: ", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to parse resume"})
	}

	user := models.User{
		Username:     username,
		Email:        email,
		Password:     password,
		ResumePath:   resumeURL,
		ParsedResume: parsedResume,
	}

	id, err := c.Repo.Insert(user)
	if err != nil {
		log.Println("some more error idk")
		errText := "user already exists"
		status := 400
		return ctx.Status(status).JSON(fiber.Map{"error": errText})
	}

	return ctx.Status(201).JSON(fiber.Map{"_id": id, "resumePath": resumeURL})
}

func parseResume(path string) (string, error) {
	data := map[string]string{
		"resume_path": path,
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		return "", fmt.Errorf("failed to encode json %v", err)
	}

	baseURL := os.Getenv("LLM_SERVER_URL")
	url := fmt.Sprintf("%v/parse", baseURL)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to reach parser: %v", err)
	}
	defer func() {
		if cerr := resp.Body.Close(); cerr != nil {
			log.Printf("failed to close response body %v", cerr)
		}
	}()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read parsed response: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("parser returned error: %s", string(body))
	}

	return string(body), nil
}

func (c *UserController) Login(ctx *fiber.Ctx) error {
	var data map[string]string

	if err := ctx.BodyParser(&data); err != nil {
		errText := "invalid request body"
		status := 400
		return ctx.Status(status).JSON(fiber.Map{"error": errText})
	}

	user, err := c.Repo.FindByUsername(data["username"])
	if err != nil {
		errText := "user not found"
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": errText})
	}

	err = bcrypt.CompareHashAndPassword(user.Password, []byte(data["password"]))
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "incorrect username / password"})
	}

	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.RegisteredClaims{
		Issuer:    user.ID.Hex(),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24)), // 1 day
	})

	token, err := claims.SignedString([]byte(secretKey))
	if err != nil {
		errText := "could not login"
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": errText})
	}

	cookie := fiber.Cookie{
		Name:     "jwt",
		Value:    token,
		Expires:  time.Now().Add(time.Hour * 24), // 1 day
		HTTPOnly: true,
	}

	ctx.Cookie(&cookie)

	return ctx.JSON(fiber.Map{
		"message": "login success",
	})
}

func (c *UserController) User(ctx *fiber.Ctx) error {
	cookie := ctx.Cookies("jwt")

	token, err := jwt.ParseWithClaims(cookie, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})
	if err != nil {
		errText := "unauthenticated"
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": errText})
	}

	claims := token.Claims.(*jwt.RegisteredClaims)

	user, err := c.Repo.FindByID(claims.Issuer)
	if err != nil {
		errText := "user not found"
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": errText})
	}

	return ctx.JSON(user)
}

func (c *UserController) FindUserByUsername(ctx *fiber.Ctx) error {
	username := ctx.Params("username")

	user, err := c.Repo.FindByUsername(username)
	if err != nil {
		errText := "user not found"
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": errText})
	}

	return ctx.JSON(user)
}

func (c *UserController) Logout(ctx *fiber.Ctx) error {
	cookie := fiber.Cookie{
		Name:     "jwt",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HTTPOnly: true,
	}

	ctx.Cookie(&cookie)
	return ctx.JSON(fiber.Map{"message": "logout success"})
}
