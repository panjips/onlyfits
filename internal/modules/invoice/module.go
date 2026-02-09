package invoice

import (
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Provider wires the invoice module components together and exposes route registration.
type Provider struct {
	Handler    *Handler
	Service    Service
	Repository Repository
}

// NewProvider constructs a fully-wired invoice module with the given DB pool and optional external services.
// Pass any non-nil dependencies through deps to be accessible by the service layer.
func NewProvider(db *pgxpool.Pool) *Provider {
	repo := NewRepository(db)
	service := NewService(repo)
	handler := NewHandler(service)

	return &Provider{
		Handler:    handler,
		Service:    service,
		Repository: repo,
	}
}

// RegisterRoutes mounts the invoice module HTTP handlers onto the given router.
func (p *Provider) RegisterRoutes(r chi.Router) {
	p.Handler.RegisterRoutes(r)
}
