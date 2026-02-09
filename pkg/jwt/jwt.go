package jwt

import (
	"errors"
	"fitcore/internal/config"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const (
	refreshTokenTTL = time.Hour * 24 * 7
	accessTokenTTL  = time.Minute * 10
	qrTokenTTL      = time.Minute * 1
)

type RefreshToken struct {
	Token     string
	ExpiresAt time.Time
}

type QrToken struct {
	Token string
}

var (
	ErrInvalidToken = errors.New("invalid token")
	ErrExpiredToken = errors.New("token has expired")
)

func GenerateAccessToken(userID, email, role string, exp time.Time) (*RefreshToken, error) {
	expirationTime := exp.Add(accessTokenTTL)

	claims := jwt.MapClaims{
		"id":    userID,
		"email": email,
		"role":  role,
		"exp":   expirationTime.Unix(),
		"iat":   time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(config.Get().App.JWTSecret))
	if err != nil {
		return nil, err
	}

	return &RefreshToken{
		Token:     tokenString,
		ExpiresAt: expirationTime,
	}, nil
}

func GenerateRefreshToken(userID, email, role string, exp time.Time) (*RefreshToken, error) {
	expirationTime := exp.Add(refreshTokenTTL)

	claims := jwt.MapClaims{
		"id":    userID,
		"email": email,
		"role":  role,
		"exp":   expirationTime.Unix(),
		"iat":   time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(config.Get().App.JWTSecret))
	if err != nil {
		return nil, err
	}

	return &RefreshToken{
		Token:     tokenString,
		ExpiresAt: expirationTime,
	}, nil
}

func GenerateQrToken(userID, memberID, qrType string, exp time.Time) (*string, error) {
	expirationTime := exp.Add(qrTokenTTL)

	claims := jwt.MapClaims{
		"uid":  userID,
		"mid":  memberID,
		"type": qrType,
		"exp":  expirationTime.Unix(),
		"iat":  time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(config.Get().App.JWTSecret))
	if err != nil {
		return nil, err
	}

	return &tokenString, nil
}

func ValidateToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return []byte(config.Get().App.JWTSecret), nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, ErrInvalidToken
}
