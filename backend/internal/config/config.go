package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"

	_ "github.com/joho/godotenv/autoload"
)

type Config struct {
	App struct {
		Env       string
		Port      int
		JWTSecret string
		BaseURL   string
	}
	Database struct {
		Host     string
		Port     int
		User     string
		Password string
		Name     string
		Schema   string
		ConnStr  string
	}
	Email struct {
		ResendAPIKey string
		FromAddress  string
		FromName     string
	}
	Polar struct {
		AccessToken    string
		Env            string
		OrganizationID string
		WebhookSecret  string
	}
	Analytics struct {
		ServiceURL string
	}
}

var cfg *Config

func NewConfig() (*Config, error) {
	database := os.Getenv("DB_DATABASE")
	password := os.Getenv("DB_PASSWORD")
	username := os.Getenv("DB_USERNAME")
	dbPortStr := os.Getenv("DB_PORT")
	host := os.Getenv("DB_HOST")
	schema := os.Getenv("DB_SCHEMA")
	serverPortStr := os.Getenv("PORT")
	jwtSecret := os.Getenv("JWT_SECRET")
	env := os.Getenv("APP_ENV")
	baseURL := os.Getenv("APP_BASE_URL")

	// Email config
	resendAPIKey := os.Getenv("RESEND_API_KEY")
	emailFromAddress := os.Getenv("EMAIL_FROM_ADDRESS")
	emailFromName := os.Getenv("EMAIL_FROM_NAME")

	// Polar config
	polarAccessToken := os.Getenv("POLAR_ACCESS_TOKEN")
	polarEnv := os.Getenv("POLAR_ENV")
	polarOrganizationID := os.Getenv("POLAR_ORGANIZATION_ID")
	polarWebhookSecret := os.Getenv("POLAR_WEBHOOK_SECRET")

	// Analytics config
	analyticsServiceURL := os.Getenv("ANALYTICS_SERVICE_URL")

	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}
	if emailFromName == "" {
		emailFromName = "FitCore"
	}
	if analyticsServiceURL == "" {
		analyticsServiceURL = "http://localhost:8000/api/v1/analyze"
	}

	if database == "" || password == "" || username == "" || dbPortStr == "" || host == "" || schema == "" {
		return nil, errors.New("missing required environment variables")
	}

	if serverPortStr == "" {
		serverPortStr = "8080"
	}

	dbPort, err := strconv.Atoi(dbPortStr)
	if err != nil {
		return nil, fmt.Errorf("error parsing DB_PORT: %w", err)
	}

	serverPort, err := strconv.Atoi(serverPortStr)
	if err != nil {
		return nil, fmt.Errorf("error parsing SERVER_PORT: %w", err)
	}

	connStr := fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=disable&search_path=%s", username, password, host, dbPort, database, schema)


	return &Config{
		App: struct {
			Env       string
			Port      int
			JWTSecret string
			BaseURL   string
		}{
			Env:       env,
			Port:      serverPort,
			JWTSecret: jwtSecret,
			BaseURL:   baseURL,
		},
		Database: struct {
			Host     string
			Port     int
			User     string
			Password string
			Name     string
			Schema   string
			ConnStr  string
		}{
			Host:     host,
			Port:     dbPort,
			User:     username,
			Password: password,
			Name:     database,
			Schema:   schema,
			ConnStr:  connStr,
		},
		Email: struct {
			ResendAPIKey string
			FromAddress  string
			FromName     string
		}{
			ResendAPIKey: resendAPIKey,
			FromAddress:  emailFromAddress,
			FromName:     emailFromName,
		},
		Polar: struct {
			AccessToken    string
			Env            string
			OrganizationID string
			WebhookSecret  string
		}{
			AccessToken:    polarAccessToken,
			Env:            polarEnv,
			OrganizationID: polarOrganizationID,
			WebhookSecret:  polarWebhookSecret,
		},
		Analytics: struct {
			ServiceURL string
		}{
			ServiceURL: analyticsServiceURL,
		},
	}, nil
}

func Init() error {
	var err error
	cfg, err = NewConfig()
	return err
}

func Get() *Config {
	if cfg == nil {
		panic("config not initialized")
	}
	return cfg
}
