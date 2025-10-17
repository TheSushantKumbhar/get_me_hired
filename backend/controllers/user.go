package controllers

import (
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
	var data map[string]string

	if err := ctx.BodyParser(&data); err != nil {
		errText := "invalid request body"
		status := 400
		return ctx.Status(status).JSON(fiber.Map{"error": errText})
	}

	password, err := bcrypt.GenerateFromPassword([]byte(data["password"]), 14)
	if err != nil {
		errText := "failed to encrypt the password"
		status := 400
		return ctx.Status(status).JSON(fiber.Map{"error": errText})
	}

	user := models.User{
		Username: data["username"],
		Email:    data["email"],
		Password: password,
	}

	id, err := c.Repo.Insert(user)
	if err != nil {
		errText := "user already exists"
		status := 400
		return ctx.Status(status).JSON(fiber.Map{"error": errText})
	}

	return ctx.Status(201).JSON(fiber.Map{"_id": id})
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
