package plans

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
	r.Route("/api/v1/plans", func(r chi.Router) {
		r.Use(middleware.AuthMiddleware)

		r.Get("/", h.ListPlans)
		r.Get("/{id}", h.GetPlan)
		r.Get("/organization/{organizationId}", h.ListPlansByOrganization)

		r.Group(func(r chi.Router) {
			r.Use(middleware.RoleMiddleware("super_admin", "admin"))
			r.Post("/", h.CreatePlan)
			r.Put("/{id}", h.UpdatePlan)
			r.Delete("/{id}", h.DeletePlan)
		})
	})
}

func (h *Handler) CreatePlan(w http.ResponseWriter, r *http.Request) {
	var req CreatePlanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request payload", nil)
		return
	}

	if req.Name == "" || req.OrganizationID == uuid.Nil {
		response.BadRequest(w, "Name and OrganizationID are required", nil)
		return
	}

	if req.Price < 0 {
		response.BadRequest(w, "Price must be greater than or equal to 0", nil)
		return
	}

	if req.DurationDays <= 0 {
		response.BadRequest(w, "DurationDays must be greater than 0", nil)
		return
	}

	_, err := h.service.CreatePlan(r.Context(), &req)
	if err != nil {
		response.InternalServerError(w, "Failed to create plan")
		return
	}
	response.Created(w, "Plan created successfully")
}

func (h *Handler) UpdatePlan(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid plan ID", nil)
		return
	}

	var req UpdatePlanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request payload", nil)
		return
	}

	if req.Price != nil && *req.Price < 0 {
		response.BadRequest(w, "Price must be greater than or equal to 0", nil)
		return
	}

	if req.DurationDays != nil && *req.DurationDays <= 0 {
		response.BadRequest(w, "DurationDays must be greater than 0", nil)
		return
	}

	plan, err := h.service.UpdatePlan(r.Context(), id, &req)
	if err != nil {
		response.InternalServerError(w, "Failed to update plan")
		return
	}
	response.Success(w, "Plan updated successfully", plan.ToResponse())
}

func (h *Handler) DeletePlan(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid plan ID", nil)
		return
	}

	if err := h.service.DeletePlan(r.Context(), id); err != nil {
		response.InternalServerError(w, "Failed to delete plan")
		return
	}
	response.OK(w, "Plan deleted successfully")
}

func (h *Handler) GetPlan(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid plan ID", nil)
		return
	}

	plan, err := h.service.GetPlan(r.Context(), id)
	if err != nil {
		response.NotFound(w, "Plan not found")
		return
	}
	response.Success(w, "Plan retrieved successfully", plan.ToResponse())
}

func (h *Handler) ListPlans(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	plans, err := h.service.ListPlans(r.Context(), page, limit)
	if err != nil {
		response.InternalServerError(w, "Failed to list plans")
		return
	}

	planResponses := make([]*PlanResponse, len(plans))
	for i, plan := range plans {
		planResponses[i] = plan.ToResponse()
	}

	response.Success(w, "Plans retrieved successfully", planResponses)
}

func (h *Handler) ListPlansByOrganization(w http.ResponseWriter, r *http.Request) {
	orgIDParam := chi.URLParam(r, "organizationId")
	organizationID, err := uuid.Parse(orgIDParam)
	if err != nil {
		response.BadRequest(w, "Invalid organization ID", nil)
		return
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	plans, err := h.service.ListPlansByOrganization(r.Context(), organizationID, page, limit)
	if err != nil {
		response.InternalServerError(w, "Failed to list plans")
		return
	}

	planResponses := make([]*PlanResponse, len(plans))
	for i, plan := range plans {
		planResponses[i] = plan.ToResponse()
	}

	response.Success(w, "Plans retrieved successfully", planResponses)
}
