package member

import (
	"fitcore/internal/modules/cache"
	"fitcore/internal/modules/chat"
	"fitcore/internal/modules/plans"
	"fitcore/internal/modules/subscription"
	"fitcore/internal/modules/user"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Provider struct {
	Handler    *Handler
	Service    Service
	Repository Repository
}

func NewProvider(db *pgxpool.Pool, userSvc user.Service, subSvc subscription.Service, plansSvc plans.Service, cacheSvc cache.Service, chatSvc chat.Service) *Provider {
	repo := NewRepository(db)
	service := NewService(repo, subSvc, plansSvc, userSvc, cacheSvc, chatSvc)
	handler := NewHandler(service, userSvc)

	return &Provider{
		Handler:    handler,
		Service:    service,
		Repository: repo,
	}
}

func (m *Provider) RegisterRoutes(r chi.Router) {
	m.Handler.RegisterRoutes(r)
}
