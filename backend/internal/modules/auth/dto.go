package auth

import (
	"time"

	"fitcore/internal/modules/user"
)

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type RegisterRequest struct {
	Email           string `json:"email" validate:"required,email"`
	Password        string `json:"password" validate:"required,min=6"`
	ConfirmPassword string `json:"confirmPassword" validate:"required,eqfield=Password"`
	FirstName       string `json:"firstName" validate:"required"`
	LastName        string `json:"lastName" validate:"required"`
}

type LoginResponse struct {
	AccessToken           string             `json:"accessToken"`
	RefreshToken          string             `json:"-"`
	AccessTokenExpiresAt  time.Time          `json:"-"`
	RefreshTokenExpiresAt time.Time          `json:"-"`
	User                  *user.UserResponse `json:"-"`
}

type TokenResponse struct {
	AccessToken          string    `json:"accessToken"`
	AccessTokenExpiresAt time.Time `json:"expiresAt"`
}

type RegisterResponse struct {
	User *user.UserResponse `json:"user"`
}

type AuthErrorResponse struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type ResetPasswordRequest struct {
	Token              string `json:"token" validate:"required"`
	NewPassword        string `json:"password" validate:"required,min=8"`
	ConfirmNewPassword string `json:"confirmPassword" validate:"required,min=8,eqfield=NewPassword"`
}
