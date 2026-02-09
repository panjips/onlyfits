package response

import (
	"encoding/json"
	"net/http"
)

// Response represents a standard API response structure
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   *ErrorInfo  `json:"error,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
}

// ErrorInfo represents error information in API responses
type ErrorInfo struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

// Meta represents metadata information for paginated responses
type Meta struct {
	Page       int `json:"page,omitempty"`
	Limit      int `json:"limit,omitempty"`
	Total      int `json:"total,omitempty"`
	TotalPages int `json:"total_pages,omitempty"`
}

func OK(w http.ResponseWriter, message string) {
	response := Response{
		Success: true,
		Message: message,
	}
	writeJSON(w, http.StatusOK, response)
}

// Success creates a successful response
func Success(w http.ResponseWriter, message string, data interface{}) {
	response := Response{
		Success: true,
		Message: message,
		Data:    data,
	}
	writeJSON(w, http.StatusOK, response)
}

// SuccessWithMeta creates a successful response with metadata (for pagination)
func SuccessWithMeta(w http.ResponseWriter, message string, data interface{}, meta *Meta) {
	response := Response{
		Success: true,
		Message: message,
		Data:    data,
		Meta:    meta,
	}
	writeJSON(w, http.StatusOK, response)
}

// Created creates a 201 Created response
func Created(w http.ResponseWriter, message string) {
	response := Response{
		Success: true,
		Message: message,
	}
	writeJSON(w, http.StatusCreated, response)
}

// NoContent creates a 204 No Content response
func NoContent(w http.ResponseWriter) {
	w.WriteHeader(http.StatusNoContent)
}

// Error creates an error response
func Error(w http.ResponseWriter, statusCode int, code, message string, details interface{}) {
	response := Response{
		Success: false,
		Message: "Request failed",
		Error: &ErrorInfo{
			Code:    code,
			Message: message,
			Details: details,
		},
	}
	writeJSON(w, statusCode, response)
}

// BadRequest creates a 400 Bad Request response
func BadRequest(w http.ResponseWriter, message string, details interface{}) {
	Error(w, http.StatusBadRequest, "BAD_REQUEST", message, details)
}

// Unauthorized creates a 401 Unauthorized response
func Unauthorized(w http.ResponseWriter, message string) {
	Error(w, http.StatusUnauthorized, "UNAUTHORIZED", message, nil)
}

// Forbidden creates a 403 Forbidden response
func Forbidden(w http.ResponseWriter, message string) {
	Error(w, http.StatusForbidden, "FORBIDDEN", message, nil)
}

// NotFound creates a 404 Not Found response
func NotFound(w http.ResponseWriter, message string) {
	Error(w, http.StatusNotFound, "NOT_FOUND", message, nil)
}

// Conflict creates a 409 Conflict response
func Conflict(w http.ResponseWriter, message string, details interface{}) {
	Error(w, http.StatusConflict, "CONFLICT", message, details)
}

// ValidationError creates a 422 Unprocessable Entity response for validation errors
func ValidationError(w http.ResponseWriter, message string, details interface{}) {
	Error(w, http.StatusUnprocessableEntity, "VALIDATION_ERROR", message, details)
}

// InternalServerError creates a 500 Internal Server Error response
func InternalServerError(w http.ResponseWriter, message string) {
	Error(w, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", message, nil)
}

// ServiceUnavailable creates a 503 Service Unavailable response
func ServiceUnavailable(w http.ResponseWriter, message string) {
	Error(w, http.StatusServiceUnavailable, "SERVICE_UNAVAILABLE", message, nil)
}

// writeJSON writes JSON response to http.ResponseWriter
func writeJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	if err := json.NewEncoder(w).Encode(data); err != nil {
		// If JSON encoding fails, write a simple error response
		http.Error(w, "Internal server error", http.StatusInternalServerError)
	}
}

// CreateMeta creates metadata for paginated responses
func CreateMeta(page, limit, total int) *Meta {
	totalPages := (total + limit - 1) / limit // Calculate total pages with ceiling division
	return &Meta{
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}
}
