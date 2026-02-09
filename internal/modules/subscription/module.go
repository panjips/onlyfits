package subscription

import (
	"fitcore/internal/modules/invoice"
	"fitcore/internal/modules/plans"
	"fitcore/internal/modules/user"
	"fitcore/pkg/email"
	"fitcore/pkg/polar"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Provider struct {
	Handler    *Handler
	Service    Service
	Repository Repository
}

func NewProvider(db *pgxpool.Pool, plansSvc plans.Service, polarSvc *polar.Service, invoiceSvc invoice.Service, emailSvc *email.Service, userRepo user.Repository) *Provider {
	repo := NewRepository(db)
	service := NewService(repo, plansSvc, invoiceSvc, polarSvc, *emailSvc, userRepo)
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
