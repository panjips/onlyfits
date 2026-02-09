package webhooks

import (
	"encoding/json"
	"fitcore/internal/config"
	"fitcore/internal/response"
	"io"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	standardwebhooks "github.com/standard-webhooks/standard-webhooks/libraries/go"
)

type Handler struct {
	service Service
	webhook *standardwebhooks.Webhook
}

func NewHandler(service Service) *Handler {
	cfg := config.Get().Polar.WebhookSecret

	var wh *standardwebhooks.Webhook
	var err error
	if wh, err = standardwebhooks.NewWebhookRaw([]byte(cfg)); err != nil {
		log.Printf("Failed to create webhook with base64 secret, trying raw secret: %v", err)
	} else {
		log.Println("Successfully created webhook instance with base64 secret")
	}

	return &Handler{
		service: service,
		webhook: wh,
	}
}

func (h *Handler) RegisterRoutes(r chi.Router) {
	r.Route("/api/v1/webhooks", func(r chi.Router) {
		r.Post("/checkout/created", h.CompleteCheckout)
	})
}

func (h *Handler) CompleteCheckout(w http.ResponseWriter, r *http.Request) {
	log.Printf("Handler: CompleteCheckout request received from %s", r.RemoteAddr)

	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("Handler: Failed to read request body: %v", err)
		response.BadRequest(w, "Invalid request body", nil)
		return
	}
	defer r.Body.Close()

	if !h.validateWebhookSignature(r, body) {
		log.Printf("Handler: Invalid webhook signature from %s", r.RemoteAddr)
		response.Unauthorized(w, "Invalid webhook signature")
		return
	}

	var payload PolarWebhookEventDTO
	if err := json.Unmarshal(body, &payload); err != nil {
		log.Printf("Handler: Failed to unmarshal webhook payload: %v", err)
		response.BadRequest(w, "Invalid JSON payload", nil)
		return
	}

	if err := h.service.CompleteCheckout(r.Context(), &payload); err != nil {
		log.Printf("Handler: Failed to complete checkout: %v", err)
		response.InternalServerError(w, "Failed to complete checkout")
		return
	}

	log.Printf("Handler: Checkout completed successfully")
	response.OK(w, "Checkout completed successfully")
}

func (h *Handler) validateWebhookSignature(r *http.Request, body []byte) bool {
	if h.webhook == nil {
		log.Println("Webhook instance not initialized, skipping signature validation")
		return false
	}

	if err := h.webhook.Verify(body, r.Header); err != nil {
		log.Printf("Webhook signature validation failed: %v", err)
		return false
	}

	return true
}
