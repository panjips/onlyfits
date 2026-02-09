package plans

import (
	"fitcore/pkg/polar"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Provider struct {
	Handler    *Handler
	Service    Service
	Repository Repository
}

func NewProvider(db *pgxpool.Pool, polarSvc *polar.Service) *Provider {
	repo := NewRepository(db)
	service := NewService(repo, polarSvc)
	handler := NewHandler(service)

	return &Provider{
		Handler:    handler,
		Service:    service,
		Repository: repo,
	}
}

func (m *Provider) RegisterRoutes(r chi.Router) {
	m.Handler.RegisterRoutes(r)
}
