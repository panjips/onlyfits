package email

import (
	"context"
	"fmt"
	"log"
	"time"

	"fitcore/infrastructure/resend"
	"fitcore/internal/config"
)

type Service struct {
	client      *resend.Client
	fromAddress string
	fromName    string
	baseURL     string
}

type ResetToken struct {
	Token     string
	Email     string
	ExpiresAt time.Time
}

func NewService() (*Service, error) {
	cfg := config.Get()

	if cfg.Email.ResendAPIKey == "" {
		return nil, fmt.Errorf("RESEND_API_KEY is not configured")
	}

	if cfg.Email.FromAddress == "" {
		return nil, fmt.Errorf("EMAIL_FROM_ADDRESS is not configured")
	}

	client, err := resend.NewClient(cfg.Email.ResendAPIKey)
	if err != nil {
		return nil, fmt.Errorf("failed to create resend client: %w", err)
	}

	return &Service{
		client:      client,
		fromAddress: cfg.Email.FromAddress,
		fromName:    cfg.Email.FromName,
		baseURL:     cfg.App.BaseURL,
	}, nil
}

func (s *Service) SendPasswordResetEmail(ctx context.Context, email, token string) error {
	resetLink := fmt.Sprintf("%s/reset-password?token=%s", s.baseURL, token)

	err := s.client.SendPasswordResetEmail(ctx, email, s.fromAddress, s.fromName, resetLink)
	if err != nil {
		return fmt.Errorf("failed to send password reset email: %w", err)
	}

	return nil
}

func (s *Service) SendPaymentEmail(ctx context.Context, email, checkoutURL string) error {

	err := s.client.SendPaymentCheckoutEmail(ctx, email, s.fromAddress, s.fromName, checkoutURL)
	if err != nil {
		return fmt.Errorf("failed to send payment email: %w", err)
	}

	return nil
}

func (s *Service) SendWelcomeEmail(ctx context.Context, email string, password string, loginURL string) error {

	err := s.client.SendWelcomeCredentialsEmail(ctx, email, s.fromAddress, s.fromName, email, password, loginURL)
	if err != nil {
		log.Printf("Failed to send welcome email: %v", err)
		// Don't fail the checkout completion for email failure
	}

	return nil
}

func (s *Service) SendEmail(ctx context.Context, to, subject, htmlContent, textContent string) error {
	params := &resend.SendEmailParams{
		From:    fmt.Sprintf("%s <%s>", s.fromName, s.fromAddress),
		To:      []string{to},
		Subject: subject,
		Html:    htmlContent,
		Text:    textContent,
	}

	_, err := s.client.SendEmail(ctx, params)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}
