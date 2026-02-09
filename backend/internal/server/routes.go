package server

import (
	"encoding/json"
	"log"
	"net/http"

	"fitcore/internal/modules/auth"
	"fitcore/internal/modules/branch"
	"fitcore/internal/modules/cache"
	"fitcore/internal/modules/chat"
	"fitcore/internal/modules/invoice"
	"fitcore/internal/modules/member"
	"fitcore/internal/modules/module"
	"fitcore/internal/modules/organization"
	"fitcore/internal/modules/plans"
	"fitcore/internal/modules/subscription"
	"fitcore/internal/modules/user"
	"fitcore/internal/modules/webhooks"
	"fitcore/pkg/email"
	"fitcore/pkg/polar"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func (s *Server) RegisterRoutes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	var emailService *email.Service
	emailSvc, err := email.NewService()
	if err != nil {
		log.Printf("Email service not configured: %v (password reset will be disabled)", err)
	} else {
		emailService = emailSvc
		log.Println("Email service initialized successfully")
	}

	polarService := polar.NewService()
	log.Printf("Polar service initialized: %v", polarService != nil)

	userModule := user.NewModule(s.db.GetPool())
	chatModule := chat.NewModule(s.db.GetPool())
	cacheModule := cache.NewModule(s.db.GetPool())
	authModule := auth.NewModule(s.db.GetPool(), userModule.Repository, emailService)
	organizationModule := organization.NewModule(s.db.GetPool())
	moduleModule := module.NewProvider(s.db.GetPool())
	branchModule := branch.NewProvider(s.db.GetPool())
	plansModule := plans.NewProvider(s.db.GetPool(), polarService)
	invoiceModule := invoice.NewProvider(s.db.GetPool())
	subscriptionModule := subscription.NewProvider(s.db.GetPool(), plansModule.Service, polarService, invoiceModule.Service, emailService, userModule.Repository)
	memberModule := member.NewProvider(s.db.GetPool(), userModule.Service, subscriptionModule.Service, plansModule.Service, cacheModule.Service, chatModule.Service)
	webhooksModule := webhooks.NewProvider(s.db.GetPool(), invoiceModule.Service, subscriptionModule.Service, memberModule.Service, *emailService, userModule.Service, userModule.Repository)

	userModule.RegisterRoutes(r)
	cacheModule.RegisterRoutes(r)
	authModule.RegisterRoutes(r)
	organizationModule.RegisterRoutes(r)
	moduleModule.RegisterRoutes(r)
	branchModule.RegisterRoutes(r)
	plansModule.RegisterRoutes(r)
	memberModule.RegisterRoutes(r)
	subscriptionModule.RegisterRoutes(r)
	invoiceModule.RegisterRoutes(r)
	webhooksModule.RegisterRoutes(r)

	r.Get("/", s.HelloWorldHandler)
	r.Get("/health", s.healthHandler)

	return r
}

func (s *Server) HelloWorldHandler(w http.ResponseWriter, r *http.Request) {
	resp := make(map[string]string)
	resp["message"] = "Hello World"

	jsonResp, err := json.Marshal(resp)
	if err != nil {
		log.Fatalf("error handling JSON marshal. Err: %v", err)
	}

	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write(jsonResp)
}

func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	jsonResp, _ := json.Marshal(s.db.Health())
	_, _ = w.Write(jsonResp)
}
