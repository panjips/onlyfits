package cache

import (
	"context"
	"encoding/json"
	"errors"
	"time"
)

var ErrCacheMiss = errors.New("cache: key not found")

type Service interface {
	Set(ctx context.Context, key string, value any, ttl time.Duration) error
	Get(ctx context.Context, key string, dest any) error
	Delete(ctx context.Context, key string) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) Set(ctx context.Context, key string, value any, ttl time.Duration) error {
	bytes, err := json.Marshal(value)
	if err != nil {
		return err
	}
	expiresAt := time.Now().Add(ttl)
	return s.repo.Set(ctx, key, bytes, expiresAt)
}

func (s *service) Get(ctx context.Context, key string, dest any) error {
	bytes, err := s.repo.Get(ctx, key)
	if err != nil {
		return err
	}
	if bytes == nil {
		return ErrCacheMiss
	} // Return ErrCacheMiss if not found

	return json.Unmarshal(bytes, dest)
}

func (s *service) Delete(ctx context.Context, key string) error {
	return s.repo.Delete(ctx, key)
}
