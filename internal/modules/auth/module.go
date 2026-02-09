package auth

import (
	"fitcore/internal/modules/user"
	"fitcore/pkg/email"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Module struct {
	Handler    *Handler
	Service    Service
	Repository Repository
}

// NewModule creates a new auth module
// emailService can be nil if email functionality is not needed (password reset will be disabled)
func NewModule(db *pgxpool.Pool, userRepo user.Repository, emailService *email.Service) *Module {
	authRepo := NewRepository(db)
	service := NewService(authRepo, userRepo, emailService)
	handler := NewHandler(service)

	return &Module{
		Handler:    handler,
		Service:    service,
		Repository: authRepo,
	}
}

func (m *Module) RegisterRoutes(r chi.Router) {
	m.Handler.RegisterRoutes(r)
}
