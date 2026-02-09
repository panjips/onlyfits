package branch

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
	r.Route("/api/v1/branches", func(r chi.Router) {
		r.Use(middleware.AuthMiddleware)

		r.Get("/", h.ListBranches)
		r.Get("/{id}", h.GetBranch)

		r.Group(func(r chi.Router) {
			r.Use(middleware.RoleMiddleware("super_admin", "admin"))
			r.Post("/", h.CreateBranch)
			r.Put("/{id}", h.UpdateBranch)
			r.Delete("/{id}", h.DeleteBranch)
		})
	})
}

func (h *Handler) CreateBranch(w http.ResponseWriter, r *http.Request) {
	var req CreateBranchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request payload", nil)
		return
	}

	if req.Name == "" || req.OrganizationID == uuid.Nil {
		response.BadRequest(w, "Name and OrganizationID are required", nil)
		return
	}

	_, err := h.service.CreateBranch(r.Context(), &req)
	if err != nil {
		response.InternalServerError(w, "Failed to create branch")
		return
	}
	response.Created(w, "Branch created successfully")
}

func (h *Handler) UpdateBranch(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid branch ID", nil)
		return
	}

	var req UpdateBranchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request payload", nil)
		return
	}

	branch, err := h.service.UpdateBranch(r.Context(), id, &req)
	if err != nil {
		response.InternalServerError(w, "Failed to update branch")
		return
	}
	response.Success(w, "Branch updated successfully", branch.ToResponse())
}

func (h *Handler) DeleteBranch(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid branch ID", nil)
		return
	}

	if err := h.service.DeleteBranch(r.Context(), id); err != nil {
		response.InternalServerError(w, "Failed to delete branch")
		return
	}
	response.OK(w, "Branch deleted successfully")
}

func (h *Handler) GetBranch(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid branch ID", nil)
		return
	}

	branch, err := h.service.GetBranch(r.Context(), id)
	if err != nil {
		response.NotFound(w, "Branch not found")
		return
	}
	response.Success(w, "Branch retrieved successfully", branch.ToResponse())
}

func (h *Handler) ListBranches(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	branches, err := h.service.ListBranches(r.Context(), page, limit)
	if err != nil {
		response.InternalServerError(w, "Failed to list branches")
		return
	}

	branchResponses := make([]*BranchResponse, len(branches))
	for i, branch := range branches {
		res := branch.ToResponse()
		res.UpdatedAt = nil // Remove updated_at from list response
		branchResponses[i] = res
	}

	response.Success(w, "Branches retrieved successfully", branchResponses)
}
