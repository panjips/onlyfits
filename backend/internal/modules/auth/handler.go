package auth

import (
	"encoding/json"
	"net/http"
	"time"

	"fitcore/internal/response"

	"github.com/go-chi/chi/v5"
)

const (
	refreshTokenCookieName = "refresh_token"
)

type Handler struct {
	service Service
}

func setRefreshTokenCookie(w http.ResponseWriter, value string, expiresAt time.Time) {
	http.SetCookie(w, &http.Cookie{
		Name:     refreshTokenCookieName,
		Value:    value,
		Path:     "/",
		Expires:  expiresAt,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	})
}

func clearRefreshTokenCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     refreshTokenCookieName,
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	})
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(r chi.Router) {
	r.Route("/api/v1/auth", func(r chi.Router) {
		r.Post("/login", h.Login)
		r.Post("/logout", h.Logout)
		r.Post("/refresh", h.RefreshToken)
		r.Post("/register", h.Register)
		r.Post("/forgot-password", h.ForgotPassword)
		r.Post("/reset-password", h.ResetPassword)
	})
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request payload", nil)
		return
	}

	if !response.ValidateStructAndWrite(w, &req) {
		return
	}

	_, err := h.service.Register(r.Context(), &req)
	if err != nil {
		switch err {
		case ErrEmailAlreadyExists:
			response.Conflict(w, "Email already registered", nil)
		default:
			response.InternalServerError(w, "Failed to register user")
		}
		return
	}

	response.Created(w, "Registration successful")
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request payload", nil)
		return
	}

	if !response.ValidateStructAndWrite(w, &req) {
		return
	}

	loginResp, err := h.service.Login(r.Context(), &req)
	if err != nil {
		switch err {
		case ErrInvalidCredentials:
			response.BadRequest(w, "Invalid email or password", nil)
		case ErrUserNotActive:
			response.Forbidden(w, "User account is not active")
		default:
			response.InternalServerError(w, "Failed to authenticate")
		}
		return
	}

	// Set refresh token as HTTP-only cookie
	setRefreshTokenCookie(w, loginResp.RefreshToken, loginResp.RefreshTokenExpiresAt)

	response.Success(w, "Login successful", loginResp)
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	refreshTokenCookie, err := r.Cookie(refreshTokenCookieName)
	if err != nil {
		response.BadRequest(w, "No refresh token found", nil)
		return
	}

	if err := h.service.Logout(r.Context(), refreshTokenCookie.Value); err != nil {
		switch err {
		case ErrInvalidToken:
			response.BadRequest(w, "Invalid refresh token", nil)
		case ErrTokenRevoked:
			response.BadRequest(w, "Token already revoked", nil)
		default:
			response.InternalServerError(w, "Failed to logout")
		}
		return
	}

	clearRefreshTokenCookie(w)

	response.OK(w, "Logged out successfully")
}

func (h *Handler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	refreshTokenCookie, err := r.Cookie(refreshTokenCookieName)
	if err != nil {
		response.Unauthorized(w, "No refresh token found")
		return
	}

	tokenResp, err := h.service.RefreshToken(r.Context(), refreshTokenCookie.Value)
	if err != nil {
		switch err {
		case ErrInvalidToken:
			clearRefreshTokenCookie(w)
			response.Unauthorized(w, "Invalid or expired refresh token")
		case ErrTokenRevoked:
			clearRefreshTokenCookie(w)
			response.Unauthorized(w, "Refresh token has been revoked")
		case ErrUserNotActive:
			response.Forbidden(w, "User account is not active")
		default:
			response.InternalServerError(w, "Failed to refresh token")
		}
		return
	}

	response.Success(w, "Token refreshed successfully", tokenResp)
}

func (h *Handler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req ForgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request payload", nil)
		return
	}

	if !response.ValidateStructAndWrite(w, &req) {
		return
	}

	err := h.service.ForgotPassword(r.Context(), &req)
	if err != nil {
		switch err {
		case ErrEmailServiceNotEnabled:
			response.InternalServerError(w, "Email service is not available")
			return
		default:
			response.OK(w, "If an account with that email exists, a password reset link has been sent")
			return
		}
	}

	response.OK(w, "If an account with that email exists, a password reset link has been sent")
}

func (h *Handler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req ResetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request payload", nil)
		return
	}

	if !response.ValidateStructAndWrite(w, &req) {
		return
	}

	err := h.service.ResetPassword(r.Context(), &req)
	if err != nil {
		switch err {
		case ErrInvalidResetToken:
			response.BadRequest(w, "Invalid or expired reset token", nil)
		case ErrResetTokenAlreadyUsed:
			response.BadRequest(w, "Reset token has already been used", nil)
		default:
			response.InternalServerError(w, "Failed to reset password")
		}
		return
	}

	clearRefreshTokenCookie(w)

	response.OK(w, "Password reset successful")
}
