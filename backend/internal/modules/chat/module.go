package chat

import (
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Module struct {
	Service    Service
	Repository Repository
}

func NewModule(db *pgxpool.Pool) *Module {
	repo := NewRepository(db)
	svc := NewService(repo)

	return &Module{
		Service:    svc,
		Repository: repo,
	}
}

func (m *Module) RegisterRoutes(r chi.Router) {

}
