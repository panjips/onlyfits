package hash

import (
	"golang.org/x/crypto/bcrypt"
	"crypto/rand"
	"encoding/base64"
)

func HashPassword(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedBytes), nil
}

func VerifyPassword(hashedPassword, providedPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(providedPassword))
}

func GenerateRandomPassword(length int) (string, error) {
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b)[:length], nil
}