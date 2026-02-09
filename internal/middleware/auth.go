package middleware

import (
	"context"
	"net/http"

	"fitcore/pkg/jwt"

	gojwt "github.com/golang-jwt/jwt/v5"
)

type contextKey string

const (
	UserClaimsKey contextKey = "userClaims"
)

// AuthMiddleware validates the JWT token from Authorization header and sets the user claims in the context
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Unauthorized: missing authorization header", http.StatusUnauthorized)
			return
		}

		// Check for Bearer prefix
		const bearerPrefix = "Bearer "
		if len(authHeader) < len(bearerPrefix) || authHeader[:len(bearerPrefix)] != bearerPrefix {
			http.Error(w, "Unauthorized: invalid authorization header format", http.StatusUnauthorized)
			return
		}

		tokenString := authHeader[len(bearerPrefix):]
		if tokenString == "" {
			http.Error(w, "Unauthorized: missing access token", http.StatusUnauthorized)
			return
		}

		claims, err := jwt.ValidateToken(tokenString)
		if err != nil {
			http.Error(w, "Unauthorized: "+err.Error(), http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserClaimsKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func RoleMiddleware(allowedRoles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := r.Context().Value(UserClaimsKey).(gojwt.MapClaims)
			if !ok {
				http.Error(w, "Unauthorized: claims not found", http.StatusUnauthorized)
				return
			}

			userRole, ok := claims["role"].(string)
			if !ok {
				http.Error(w, "Forbidden: invalid role in token", http.StatusForbidden)
				return
			}

			for _, role := range allowedRoles {
				if role == userRole {
					next.ServeHTTP(w, r)
					return
				}
			}

			http.Error(w, "Forbidden: insufficient permissions", http.StatusForbidden)
		})
	}
}
