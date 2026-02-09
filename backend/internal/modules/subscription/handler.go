package subscription

import (
	"encoding/json"
	"log"
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
	r.Route("/api/v1/subscriptions", func(r chi.Router) {
		r.Use(middleware.AuthMiddleware)

		r.Get("/", h.ListSubscriptions)
		r.Get("/{id}", h.GetSubscription)
		r.Get("/member/{memberId}/active", h.GetActiveSubscription)

		r.Group(func(r chi.Router) {
			r.Use(middleware.RoleMiddleware("super_admin", "admin", "staff"))
			r.Post("/", h.CreateSubscription)
			r.Put("/{id}", h.UpdateSubscription)
			r.Delete("/{id}", h.DeleteSubscription)
			r.Post("/member/{memberId}/renew", h.RenewSubscription)
			r.Post("/expire-old", h.ExpireOldSubscriptions)
		})
	})
}

func (h *Handler) CreateSubscription(w http.ResponseWriter, r *http.Request) {
	log.Printf("Handler: CreateSubscription request received for member ID: %s", r.URL.Query().Get("memberId"))

	var req CreateSubscriptionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Handler: CreateSubscription failed - invalid request payload: %v", err)
		response.BadRequest(w, "Invalid request payload", nil)
		return
	}

	if req.MemberID == uuid.Nil {
		log.Printf("Handler: CreateSubscription failed - MemberID is required")
		response.BadRequest(w, "MemberID is required", nil)
		return
	}

	log.Printf("Handler: Creating subscription for member ID: %s, start date: %s", req.MemberID, req.StartDate)

	sub, err := h.service.CreateSubscription(r.Context(), &req, "renewal")
	if err != nil {
		if err == ErrInvalidDateRange {
			log.Printf("Handler: CreateSubscription failed - invalid date range for member ID: %s", req.MemberID)
			response.BadRequest(w, err.Error(), nil)
			return
		}
		log.Printf("Handler: CreateSubscription failed - internal error for member ID: %s: %v", req.MemberID, err)
		response.InternalServerError(w, "Failed to create subscription")
		return
	}

	log.Printf("Handler: Subscription created successfully with ID: %s for member ID: %s", sub.ID, req.MemberID)
	response.Success(w, "Subscription created successfully", sub)
}

func (h *Handler) UpdateSubscription(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid subscription ID", nil)
		return
	}

	var req UpdateSubscriptionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request payload", nil)
		return
	}

	sub, err := h.service.UpdateSubscription(r.Context(), id, &req)
	if err != nil {
		if err == ErrSubscriptionNotFound {
			response.NotFound(w, err.Error())
			return
		}
		if err == ErrInvalidDateRange {
			response.BadRequest(w, err.Error(), nil)
			return
		}
		response.InternalServerError(w, "Failed to update subscription")
		return
	}
	response.Success(w, "Subscription updated successfully", sub.ToResponse())
}

func (h *Handler) DeleteSubscription(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid subscription ID", nil)
		return
	}

	if err := h.service.DeleteSubscription(r.Context(), id); err != nil {
		response.InternalServerError(w, "Failed to delete subscription")
		return
	}
	response.OK(w, "Subscription deleted successfully")
}

func (h *Handler) GetSubscription(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid subscription ID", nil)
		return
	}

	sub, err := h.service.GetSubscription(r.Context(), id)
	if err != nil {
		response.NotFound(w, "Subscription not found")
		return
	}
	response.Success(w, "Subscription retrieved successfully", sub.ToResponse())
}

func (h *Handler) GetActiveSubscription(w http.ResponseWriter, r *http.Request) {
	memberIDParam := chi.URLParam(r, "memberId")
	memberID, err := uuid.Parse(memberIDParam)
	if err != nil {
		response.BadRequest(w, "Invalid member ID", nil)
		return
	}

	sub, err := h.service.GetActiveSubscription(r.Context(), memberID)
	if err != nil {
		response.NotFound(w, "No active subscription found")
		return
	}
	response.Success(w, "Active subscription retrieved successfully", sub.ToResponse())
}

func (h *Handler) ListSubscriptions(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	filter := &SubscriptionListFilter{
		Page:  1,
		Limit: 10,
	}

	if page, err := strconv.Atoi(query.Get("page")); err == nil && page > 0 {
		filter.Page = page
	}

	if limit, err := strconv.Atoi(query.Get("limit")); err == nil && limit > 0 {
		filter.Limit = limit
	}

	if orgID := query.Get("organizationId"); orgID != "" {
		if id, err := uuid.Parse(orgID); err == nil {
			filter.OrganizationID = &id
		}
	}

	if branchID := query.Get("branchId"); branchID != "" {
		if id, err := uuid.Parse(branchID); err == nil {
			filter.BranchID = &id
		}
	}

	if memberID := query.Get("memberId"); memberID != "" {
		if id, err := uuid.Parse(memberID); err == nil {
			filter.MemberID = &id
		}
	}

	if status := query.Get("status"); status != "" {
		filter.Status = &status
	}

	subscriptions, err := h.service.ListSubscriptions(r.Context(), filter)
	if err != nil {
		response.InternalServerError(w, "Failed to list subscriptions")
		return
	}

	subResponses := make([]*SubscriptionResponse, len(subscriptions))
	for i, sub := range subscriptions {
		subResponses[i] = sub.ToResponse()
	}

	response.Success(w, "Subscriptions retrieved successfully", subResponses)
}

func (h *Handler) RenewSubscription(w http.ResponseWriter, r *http.Request) {
	memberIDParam := chi.URLParam(r, "memberId")
	memberID, err := uuid.Parse(memberIDParam)
	if err != nil {
		response.BadRequest(w, "Invalid member ID", nil)
		return
	}

	var req RenewSubscriptionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		// Allow empty body for renewing with same plan
		req = RenewSubscriptionRequest{}
	}

	sub, err := h.service.RenewSubscription(r.Context(), memberID, &req)
	if err != nil {
		if err == ErrNoActiveSubscription {
			response.NotFound(w, err.Error())
			return
		}
		if err == ErrPlanNotFound {
			response.NotFound(w, err.Error())
			return
		}
		response.InternalServerError(w, "Failed to renew subscription")
		return
	}
	response.Success(w, "Subscription renewed successfully", sub.ToResponse())
}

func (h *Handler) ExpireOldSubscriptions(w http.ResponseWriter, r *http.Request) {
	count, err := h.service.ExpireOldSubscriptions(r.Context())
	if err != nil {
		response.InternalServerError(w, "Failed to expire subscriptions")
		return
	}
	response.Success(w, "Subscriptions expired successfully", map[string]int64{"expiredCount": count})
}
