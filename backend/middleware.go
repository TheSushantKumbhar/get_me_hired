package main

import (
	"net/http"

	"github.com/TheSushantKumbhar/get_me_hired/backend/api"
	"github.com/TheSushantKumbhar/get_me_hired/backend/handlers"
	"github.com/TheSushantKumbhar/get_me_hired/backend/models"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type Middleware struct {
	*api.APIConfig
}

var secretKey string = "hello world"

type authedHandler func(http.ResponseWriter, *http.Request, models.User)

func (m Middleware) middlwareAuth(next authedHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("jwt")
		if err != nil {
			handlers.RespondWithErr(w, http.StatusUnauthorized, "unauthorized")
			return
		}

		tokenString := cookie.Value

		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			return []byte(secretKey), nil
		})
		if err != nil || !token.Valid {
			handlers.RespondWithErr(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}

		claims := token.Claims.(*jwt.RegisteredClaims)
		userID, err := uuid.Parse(claims.Issuer)
		if err != nil {
			handlers.RespondWithErr(w, http.StatusUnauthorized, "user id invalid")
			return
		}
		u, err := m.DB.GetUserByID(r.Context(), userID)
		if err != nil {
			handlers.RespondWithErr(w, http.StatusNotFound, "user not found")
			return
		}

		next(w, r, models.DatabaseUserIDRowToUser(u))
	}
}
