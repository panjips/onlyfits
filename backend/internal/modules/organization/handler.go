package organization

import (
	"encoding/json"
	"net/http"
	"strconv"

	"fitcore/internal/middleware"
	"fitcore/internal/modules/branch"
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
	r.Route("/api/v1/organizations", func(r chi.Router) {
		r.Use(middleware.AuthMiddleware)

		r.Get("/", h.ListOrganizations)
		r.Get("/{id}", h.GetOrganization)
		r.Get("/{id}/branches", h.ListBranchesByOrganization)

		r.Group(func(r chi.Router) {
			r.Use(middleware.RoleMiddleware("super_admin"))
			r.Post("/", h.CreateOrganization)
			r.Put("/{id}", h.UpdateOrganization)
			r.Delete("/{id}", h.DeleteOrganization)
		})
	})
}

func (h *Handler) CreateOrganization(w http.ResponseWriter, r *http.Request) {
	var req CreateOrganizationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request payload", nil)
		return
	}

	// Basic validation (can use validator library ideally)
	if req.Name == "" || req.Slug == "" {
		response.BadRequest(w, "Name and Slug are required", nil)
		return
	}

	_, err := h.service.CreateOrganization(r.Context(), &req)
	if err != nil {
		response.InternalServerError(w, "Failed to create organization")
		return
	}
	response.Created(w, "Organization created successfully")
}

func (h *Handler) UpdateOrganization(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid organization ID", nil)
		return
	}

	var req UpdateOrganizationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request payload", nil)
		return
	}

	org, err := h.service.UpdateOrganization(r.Context(), id, &req)
	if err != nil {
		response.InternalServerError(w, "Failed to update organization")
		return
	}
	response.Success(w, "Organization updated successfully", org.ToResponse())
}

func (h *Handler) DeleteOrganization(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid organization ID", nil)
		return
	}

	if err := h.service.DeleteOrganization(r.Context(), id); err != nil {
		response.InternalServerError(w, "Failed to delete organization")
		return
	}
	response.OK(w, "Organization deleted successfully")
}

func (h *Handler) GetOrganization(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid organization ID", nil)
		return
	}

	org, err := h.service.GetOrganization(r.Context(), id)
	if err != nil {
		response.NotFound(w, "Organization not found")
		return
	}
	response.Success(w, "Organization retrieved successfully", org.ToResponse())
}

func (h *Handler) ListOrganizations(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	orgs, err := h.service.ListOrganizations(r.Context(), page, limit)
	if err != nil {
		response.InternalServerError(w, "Failed to list organizations")
		return
	}

	orgResponses := make([]*OrganizationResponse, len(orgs))
	for i, org := range orgs {
		res := org.ToResponse()
		res.UpdatedAt = nil // Remove updated_at from list response
		orgResponses[i] = res
	}

	response.Success(w, "Organizations retrieved successfully", orgResponses)
}

func (h *Handler) ListBranchesByOrganization(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	organizationID, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid organization ID", nil)
		return
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	branches, err := h.service.ListBranchesByOrganization(r.Context(), organizationID, page, limit)
	if err != nil {
		response.InternalServerError(w, "Failed to list branches")
		return
	}

	branchResponses := make([]*branch.BranchResponse, len(branches))
	for i, b := range branches {
		branchResponses[i] = b.ToResponse()
	}

	response.Success(w, "Branches retrieved successfully", branchResponses)
}
