package module

import (
	"encoding/json"
	"net/http"
	"strconv"

	"fitcore/internal/middleware"
	"fitcore/internal/response"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(r chi.Router) {
	r.Route("/api/v1/modules", func(r chi.Router) {
		r.Use(middleware.AuthMiddleware)

		r.Get("/", h.ListModules)
		r.Get("/{id}", h.GetModule)

		r.Group(func(r chi.Router) {
			r.Use(middleware.RoleMiddleware("super_admin"))
			r.Post("/", h.CreateModule)
			r.Put("/{id}", h.UpdateModule)
			r.Delete("/{id}", h.DeleteModule)
		})
	})
}

func (h *Handler) CreateModule(w http.ResponseWriter, r *http.Request) {
	var req CreateModuleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request payload", nil)
		return
	}

	if req.Key == "" || req.Name == "" {
		response.BadRequest(w, "Key and Name are required", nil)
		return
	}

	_, err := h.service.CreateModule(r.Context(), &req)
	if err != nil {
		response.InternalServerError(w, "Failed to create module")
		return
	}
	response.Created(w, "Module created successfully")
}

func (h *Handler) UpdateModule(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid module ID", nil)
		return
	}

	var req UpdateModuleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request payload", nil)
		return
	}

	module, err := h.service.UpdateModule(r.Context(), id, &req)
	if err != nil {
		response.InternalServerError(w, "Failed to update module")
		return
	}
	response.Success(w, "Module updated successfully", module.ToResponse())
}

func (h *Handler) DeleteModule(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid module ID", nil)
		return
	}

	if err := h.service.DeleteModule(r.Context(), id); err != nil {
		response.InternalServerError(w, "Failed to delete module")
		return
	}
	response.OK(w, "Module deleted successfully")
}

func (h *Handler) GetModule(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid module ID", nil)
		return
	}

	module, err := h.service.GetModule(r.Context(), id)
	if err != nil {
		response.NotFound(w, "Module not found")
		return
	}
	response.Success(w, "Module retrieved successfully", module.ToResponse())
}

func (h *Handler) ListModules(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	modules, err := h.service.ListModules(r.Context(), page, limit)
	if err != nil {
		response.InternalServerError(w, "Failed to list modules")
		return
	}

	moduleResponses := make([]*ModuleResponse, len(modules))
	for i, m := range modules {
		moduleResponses[i] = m.ToResponse()
	}

	if page == 0 {
		page = 1
	}
	if limit == 0 {
		limit = 10
	}
	response.Success(w, "Modules retrieved successfully", moduleResponses)
}
