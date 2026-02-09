package auth

import (
	"context"
	"errors"
	"log"
	"time"

	"fitcore/internal/modules/user"
	"fitcore/pkg/email"
	"fitcore/pkg/hash"
	"fitcore/pkg/jwt"

	"github.com/google/uuid"
)

const (
	passwordResetTokenTTL = time.Hour
)

var (
	ErrInvalidCredentials     = errors.New("invalid email or password")
	ErrUserNotActive          = errors.New("user account is not active")
	ErrInvalidToken           = errors.New("invalid or expired token")
	ErrTokenRevoked           = errors.New("token has been revoked")
	ErrEmailAlreadyExists     = errors.New("email already registered")
	ErrInvalidResetToken      = errors.New("invalid or expired reset token")
	ErrResetTokenAlreadyUsed  = errors.New("reset token has already been used")
	ErrEmailServiceNotEnabled = errors.New("email service is not configured")
)

type Service interface {
	Login(ctx context.Context, req *LoginRequest) (*LoginResponse, error)
	Logout(ctx context.Context, refreshToken string) error
	RefreshToken(ctx context.Context, refreshToken string) (*TokenResponse, error)
	LogoutAll(ctx context.Context, userID uuid.UUID) error
	Register(ctx context.Context, req *RegisterRequest) (*RegisterResponse, error)
	ForgotPassword(ctx context.Context, req *ForgotPasswordRequest) error
	ResetPassword(ctx context.Context, req *ResetPasswordRequest) error
}

type serviceImpl struct {
	authRepo     Repository
	userRepo     user.Repository
	emailService *email.Service
}

func NewService(authRepo Repository, userRepo user.Repository, emailService *email.Service) Service {
	return &serviceImpl{
		authRepo:     authRepo,
		userRepo:     userRepo,
		emailService: emailService,
	}
}

func (s *serviceImpl) Login(ctx context.Context, req *LoginRequest) (*LoginResponse, error) {

	foundUser, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	if !foundUser.IsActive {
		return nil, ErrUserNotActive
	}

	if err := hash.VerifyPassword(foundUser.Password, req.Password); err != nil {
		return nil, ErrInvalidCredentials
	}

	loginTime := time.Now()

	accessToken, err := jwt.GenerateAccessToken(foundUser.ID.String(), foundUser.Email, foundUser.Role, loginTime)
	if err != nil {
		return nil, err
	}

	refreshToken, err := jwt.GenerateRefreshToken(foundUser.ID.String(), foundUser.Email, foundUser.Role, loginTime)
	if err != nil {
		return nil, err
	}

	_, err = s.authRepo.CreateRefreshToken(ctx, foundUser.ID, refreshToken.Token, refreshToken.ExpiresAt)
	if err != nil {
		return nil, err
	}

	if err := s.authRepo.UpdateLastLogin(ctx, foundUser.ID); err != nil {

	}

	return &LoginResponse{
		AccessToken:           accessToken.Token,
		RefreshToken:          refreshToken.Token,
		AccessTokenExpiresAt:  accessToken.ExpiresAt,
		RefreshTokenExpiresAt: refreshToken.ExpiresAt,
		User:                  foundUser.ToResponse(),
	}, nil
}

func (s *serviceImpl) Logout(ctx context.Context, refreshToken string) error {

	token, err := s.authRepo.GetRefreshToken(ctx, refreshToken)
	if err != nil {
		return ErrInvalidToken
	}

	if token.IsRevoked() {
		return ErrTokenRevoked
	}

	return s.authRepo.RevokeRefreshToken(ctx, refreshToken)
}

func (s *serviceImpl) RefreshToken(ctx context.Context, refreshToken string) (*TokenResponse, error) {

	token, err := s.authRepo.GetRefreshToken(ctx, refreshToken)
	if err != nil {
		return nil, ErrInvalidToken
	}

	if !token.IsValid() {
		if token.IsRevoked() {
			return nil, ErrTokenRevoked
		}
		return nil, ErrInvalidToken
	}

	foundUser, err := s.userRepo.GetByID(ctx, token.UserID)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	if !foundUser.IsActive {
		return nil, ErrUserNotActive
	}

	accessToken, err := jwt.GenerateAccessToken(foundUser.ID.String(), foundUser.Email, foundUser.Role, time.Now())
	if err != nil {
		return nil, err
	}

	return &TokenResponse{
		AccessToken:          accessToken.Token,
		AccessTokenExpiresAt: accessToken.ExpiresAt,
	}, nil
}

func (s *serviceImpl) LogoutAll(ctx context.Context, userID uuid.UUID) error {
	return s.authRepo.RevokeAllUserTokens(ctx, userID)
}

func (s *serviceImpl) Register(ctx context.Context, req *RegisterRequest) (*RegisterResponse, error) {
	log.Printf("Register attempt for email: %s", req.Email)
	defaultRole := "member"
	existingUser, _ := s.userRepo.GetByEmail(ctx, req.Email)
	if existingUser != nil {
		log.Printf("Registration failed: email already exists (%s)", req.Email)
		return nil, ErrEmailAlreadyExists
	}

	hashPassword, err := hash.HashPassword(req.Password)
	if err != nil {
		log.Printf("Registration failed: password hashing error for email %s: %v", req.Email, err)
		return nil, err
	}

	user := &user.User{
		Email:     req.Email,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Password:  hashPassword,
		Role:      defaultRole,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		log.Printf("Registration failed: could not create user for email %s: %v", req.Email, err)
		return nil, err
	}

	log.Printf("User registered successfully: %s", req.Email)
	return &RegisterResponse{
		User: user.ToResponse(),
	}, nil
}

func (s *serviceImpl) ForgotPassword(ctx context.Context, req *ForgotPasswordRequest) error {
	log.Printf("Password reset requested for email: %s", req.Email)

	if s.emailService == nil {
		log.Printf("Email service not configured")
		return ErrEmailServiceNotEnabled
	}

	foundUser, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {

		log.Printf("Password reset: user not found for email %s", req.Email)
		return nil
	}

	if !foundUser.IsActive {
		log.Printf("Password reset: user not active for email %s", req.Email)
		return nil
	}

	expiresAt := time.Now().Add(passwordResetTokenTTL)
	resetToken, err := s.authRepo.CreatePasswordResetToken(ctx, foundUser.ID, expiresAt)
	if err != nil {
		log.Printf("Password reset: failed to store token: %v", err)
		return err
	}

	log.Printf("Password reset token created for email %s", resetToken.Token)

	err = s.emailService.SendPasswordResetEmail(ctx, req.Email, resetToken.Token)
	if err != nil {
		log.Printf("Password reset: failed to send email: %v", err)
		return err
	}

	log.Printf("Password reset email sent to: %s", req.Email)
	return nil
}

func (s *serviceImpl) ResetPassword(ctx context.Context, req *ResetPasswordRequest) error {
	log.Printf("Password reset attempt with token")

	resetToken, err := s.authRepo.GetPasswordResetToken(ctx, req.Token)
	if err != nil {
		log.Printf("Password reset: invalid token")
		return ErrInvalidResetToken
	}

	if resetToken.IsExpired() {
		log.Printf("Password reset: token expired")
		return ErrInvalidResetToken
	}

	if resetToken.IsUsed() {
		log.Printf("Password reset: token already used")
		return ErrResetTokenAlreadyUsed
	}

	foundUser, err := s.userRepo.GetByID(ctx, resetToken.UserID)
	if err != nil {
		log.Printf("Password reset: user not found for token")
		return ErrInvalidResetToken
	}

	hashedPassword, err := hash.HashPassword(req.NewPassword)
	if err != nil {
		log.Printf("Password reset: failed to hash password: %v", err)
		return err
	}

	err = s.userRepo.UpdatePassword(ctx, foundUser.ID, hashedPassword)
	if err != nil {
		log.Printf("Password reset: failed to update password: %v", err)
		return err
	}

	err = s.authRepo.MarkPasswordResetTokenUsed(ctx, req.Token)
	if err != nil {
		log.Printf("Password reset: failed to mark token as used: %v", err)

	}

	err = s.authRepo.RevokeAllUserTokens(ctx, foundUser.ID)
	if err != nil {
		log.Printf("Password reset: failed to revoke tokens: %v", err)

	}

	log.Printf("Password reset successful for user: %s", foundUser.Email)
	return nil
}
