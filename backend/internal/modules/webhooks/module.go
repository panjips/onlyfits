package webhooks

import (
	"fitcore/internal/modules/invoice"
	"fitcore/internal/modules/member"
	"fitcore/internal/modules/subscription"
	"fitcore/internal/modules/user"
	"fitcore/pkg/email"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Provider struct {
	Handler *Handler
	Service Service
}

func NewProvider(db *pgxpool.Pool, invSvc invoice.Service, subSvc subscription.Service, memberSvc member.Service, emailSvc email.Service, userSvc user.Service, userRepo user.Repository) *Provider {
	service := NewService(invSvc, subSvc, memberSvc, emailSvc, userSvc, userRepo)
	handler := NewHandler(service)

	return &Provider{
		Handler: handler,
		Service: service,
	}
}

func (m *Provider) RegisterRoutes(r chi.Router) {
	m.Handler.RegisterRoutes(r)
}
