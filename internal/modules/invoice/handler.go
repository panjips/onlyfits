package invoice

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

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
	r.Route("/api/v1/invoices", func(r chi.Router) {
		r.Use(middleware.AuthMiddleware)

		r.Get("/", h.ListInvoices)
		r.Get("/{id}", h.GetInvoice)

		r.Group(func(r chi.Router) {
			r.Use(middleware.RoleMiddleware("super_admin", "admin"))
			r.Post("/", h.CreateInvoice)
			r.Put("/{id}", h.UpdateInvoice)
			r.Delete("/{id}", h.DeleteInvoice)
		})
	})
}

func (h *Handler) CreateInvoice(w http.ResponseWriter, r *http.Request) {
	log.Printf("Handler: CreateInvoice request received")

	var req CreateInvoiceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Handler: CreateInvoice failed - invalid request payload: %v", err)
		response.BadRequest(w, "Invalid request payload", nil)
		return
	}

	if req.MemberID == uuid.Nil {
		log.Printf("Handler: CreateInvoice failed - memberId is required")
		response.BadRequest(w, "memberId is required", nil)
		return
	}
	if req.Amount < 0 {
		log.Printf("Handler: CreateInvoice failed - amount must be >= 0, got: %f", req.Amount)
		response.BadRequest(w, "amount must be greater than or equal to 0", nil)
		return
	}
	if req.TaxAmount < 0 {
		log.Printf("Handler: CreateInvoice failed - taxAmount must be >= 0, got: %f", req.TaxAmount)
		response.BadRequest(w, "taxAmount must be greater than or equal to 0", nil)
		return
	}

	log.Printf("Handler: Creating invoice for member ID: %s, amount: %.2f", req.MemberID, req.Amount)
	inv, err := h.service.CreateInvoice(r.Context(), &req)
	if err != nil {
		log.Printf("Handler: CreateInvoice failed - service error for member ID %s: %v", req.MemberID, err)
		response.InternalServerError(w, "Failed to create invoice")
		return
	}

	log.Printf("Handler: Invoice created successfully with ID: %s for member ID: %s", inv.ID, req.MemberID)
	response.Success(w, "Invoice created successfully", inv.ToResponse())
}

func (h *Handler) UpdateInvoice(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid invoice ID", nil)
		return
	}

	var req UpdateInvoiceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request payload", nil)
		return
	}

	if req.Amount != nil && *req.Amount < 0 {
		response.BadRequest(w, "amount must be greater than or equal to 0", nil)
		return
	}
	if req.TaxAmount != nil && *req.TaxAmount < 0 {
		response.BadRequest(w, "taxAmount must be greater than or equal to 0", nil)
		return
	}

	inv, err := h.service.UpdateInvoice(r.Context(), id, &req)
	if err != nil {
		response.InternalServerError(w, "Failed to update invoice")
		return
	}
	response.Success(w, "Invoice updated successfully", inv.ToResponse())
}

func (h *Handler) DeleteInvoice(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid invoice ID", nil)
		return
	}

	if err := h.service.DeleteInvoice(r.Context(), id); err != nil {
		response.InternalServerError(w, "Failed to delete invoice")
		return
	}
	response.OK(w, "Invoice deleted successfully")
}

func (h *Handler) GetInvoice(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid invoice ID", nil)
		return
	}

	inv, err := h.service.GetInvoice(r.Context(), id)
	if err != nil {
		response.NotFound(w, "Invoice not found")
		return
	}
	response.Success(w, "Invoice retrieved successfully", inv.ToResponse())
}

func (h *Handler) ListInvoices(w http.ResponseWriter, r *http.Request) {
	// Pagination
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	// Filters
	var (
		branchIDParam       = r.URL.Query().Get("branchId")
		organizationIDParam = r.URL.Query().Get("organizationId")
		memberIDParam       = r.URL.Query().Get("memberId")
		subscriptionIDParam = r.URL.Query().Get("subscriptionId")
		statusParam         = r.URL.Query().Get("status")
		dateFieldParam      = r.URL.Query().Get("dateField")
		startDateParam      = r.URL.Query().Get("startDate")
		endDateParam        = r.URL.Query().Get("endDate")
	)

	var branchID *uuid.UUID
	if branchIDParam != "" {
		if bID, err := uuid.Parse(branchIDParam); err == nil {
			branchID = &bID
		} else {
			response.BadRequest(w, "Invalid branchId", nil)
			return
		}
	}

	var organizationID *uuid.UUID
	if organizationIDParam != "" {
		if oID, err := uuid.Parse(organizationIDParam); err == nil {
			organizationID = &oID
		} else {
			response.BadRequest(w, "Invalid organizationId", nil)
			return
		}
	}

	var memberID *uuid.UUID
	if memberIDParam != "" {
		if mID, err := uuid.Parse(memberIDParam); err == nil {
			memberID = &mID
		} else {
			response.BadRequest(w, "Invalid memberId", nil)
			return
		}
	}

	var subscriptionID *uuid.UUID
	if subscriptionIDParam != "" {
		if sID, err := uuid.Parse(subscriptionIDParam); err == nil {
			subscriptionID = &sID
		} else {
			response.BadRequest(w, "Invalid subscriptionId", nil)
			return
		}
	}

	var status *string
	if statusParam != "" {
		status = &statusParam
	}

	var startDate *time.Time
	if startDateParam != "" {
		if t, err := time.Parse(time.RFC3339, startDateParam); err == nil {
			startDate = &t
		} else {
			response.BadRequest(w, "Invalid startDate format, use RFC3339", nil)
			return
		}
	}

	var endDate *time.Time
	if endDateParam != "" {
		if t, err := time.Parse(time.RFC3339, endDateParam); err == nil {
			endDate = &t
		} else {
			response.BadRequest(w, "Invalid endDate format, use RFC3339", nil)
			return
		}
	}

	filter := ListInvoicesFilter{
		Page:           page,
		Limit:          limit,
		BranchID:       branchID,
		OrganizationID: organizationID,
		MemberID:       memberID,
		SubscriptionID: subscriptionID,
		Status:         status,
		DateField:      dateFieldParam,
		StartDate:      startDate,
		EndDate:        endDate,
	}

	invoices, err := h.service.ListInvoices(r.Context(), filter)
	if err != nil {
		response.InternalServerError(w, "Failed to list invoices")
		return
	}

	resp := make([]*InvoiceResponse, len(invoices))
	for i, inv := range invoices {
		resp[i] = inv.ToResponse()
	}

	response.Success(w, "Invoices retrieved successfully", resp)
}
