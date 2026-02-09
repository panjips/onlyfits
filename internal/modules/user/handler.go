package user

import (
	"encoding/json"
	"log"
	"net/http"

	"fitcore/internal/middleware"
	"fitcore/internal/response"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(r chi.Router) {
	r.Route("/api/v1/users", func(r chi.Router) {
		r.Use(middleware.AuthMiddleware)

		r.Get("/profile", h.GetProfile)
		r.Get("/{id}", h.GetUser)
		r.Get("/email/{email}", h.GetUserByEmail)
		r.Put("/{id}", h.UpdateUser)
		r.Post("/{id}/change-password", h.ChangePassword)

		r.Group(func(r chi.Router) {
			r.Use(middleware.RoleMiddleware("super_admin", "admin", "staff"))
			r.Get("/", h.ListUser)
		})

		r.Group(func(r chi.Router) {
			r.Use(middleware.RoleMiddleware("super_admin", "admin"))
			r.Post("/", h.CreateUser)
			r.Delete("/{id}", h.DeleteUser)
		})
	})
}

func (h *Handler) GetProfile(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserClaimsKey).(jwt.MapClaims)
	if !ok {
		response.Unauthorized(w, "Unauthorized")
		return
	}

	userIDStr, ok := claims["id"].(string)
	if !ok {
		response.Unauthorized(w, "Invalid token claims")
		return
	}

	userRoleStr, ok := claims["role"].(string)
	if !ok {
		response.Unauthorized(w, "Invalid token claims")
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		response.Unauthorized(w, "Invalid user ID in token")
		return
	}

	user, err := h.service.ProfileByRole(r.Context(), userID, userRoleStr)
	if err != nil {
		switch err {
		case ErrUserNotFound:
			response.NotFound(w, "User not found")
		default:
			response.InternalServerError(w, "Failed to retrieve user")
		}
		return
	}

	response.Success(w, "User retrieved successfully", user)
}

func (h *Handler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var req CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request payload", nil)
		return
	}

	if !response.ValidateStructAndWrite(w, &req) {
		return
	}

	_, err := h.service.CreateUser(r.Context(), &req)
	if err != nil {
		switch err {
		case ErrEmailAlreadyUsed:
			response.Conflict(w, err.Error(), nil)
		default:
			response.InternalServerError(w, "Failed to create user")
		}
		return
	}

	response.Created(w, "User created successfully")
}

func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid user ID", nil)
		return
	}

	user, err := h.service.GetUserByID(r.Context(), id)
	if err != nil {
		switch err {
		case ErrUserNotFound:
			response.NotFound(w, "User not found")
		default:
			response.InternalServerError(w, "Failed to retrieve user")
		}
		return
	}

	response.Success(w, "User retrieved successfully", user.ToResponse())
}

func (h *Handler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid user ID", nil)
		return
	}

	var req UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request payload", nil)
		return
	}

	if !response.ValidateStructAndWrite(w, &req) {
		return
	}

	user, err := h.service.UpdateUser(r.Context(), id, &req)
	if err != nil {
		switch err {
		case ErrUserNotFound:
			response.NotFound(w, "User not found")
		case ErrEmailAlreadyUsed:
			response.Conflict(w, err.Error(), nil)
		default:
			response.InternalServerError(w, "Failed to update user")
		}
		return
	}

	response.Success(w, "User updated successfully", user.ToResponse())
}

func (h *Handler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid user ID", nil)
		return
	}

	if err := h.service.DeleteUser(r.Context(), id); err != nil {
		switch err {
		case ErrUserNotFound:
			response.NotFound(w, "User not found")
		default:
			response.InternalServerError(w, "Failed to delete user")
		}
		return
	}

	response.OK(w, "User deleted successfully")
}

func (h *Handler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid user ID", nil)
		return
	}

	var req ChangePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request payload", nil)
		return
	}

	if !response.ValidateStructAndWrite(w, &req) {
		return
	}

	if err := h.service.ChangePassword(r.Context(), id, req.OldPassword, req.NewPassword); err != nil {
		switch err {
		case ErrUserNotFound:
			response.NotFound(w, "User not found")
		case ErrInvalidPassword:
			response.BadRequest(w, "Invalid old password", nil)
		default:
			response.InternalServerError(w, "Failed to change password")
		}
		return
	}

	response.Success(w, "Password changed successfully", nil)
}

func (h *Handler) ListUser(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserClaimsKey).(jwt.MapClaims)
	if !ok {
		response.Unauthorized(w, "Unauthorized")
		return
	}

	role, _ := claims["role"].(string)

	// Parse query parameters into filter query struct
	filterQuery := &UserListFilterQuery{
		OrganizationID: r.URL.Query().Get("organizationId"),
		BranchID:       r.URL.Query().Get("branchId"),
		Role:           r.URL.Query().Get("role"),
		Page:           r.URL.Query().Get("page"),
		Limit:          r.URL.Query().Get("limit"),
	}

	// Convert to proper filter with validation
	filter, err := filterQuery.ToFilter()
	if err != nil {
		response.BadRequest(w, err.Error(), nil)
		return
	}

	log.Printf("Filter: %+v", filter)

	// Apply role-based access control
	if role == "super_admin" {
		// super_admin can access all users, no additional restrictions
	} else if role == "admin" {
		// admin must provide organizationId
		if filter.OrganizationID == nil {
			response.BadRequest(w, "Organization ID is required for admin", nil)
			return
		}
	} else {
		response.Forbidden(w, "Access denied")
		return
	}

	users, err := h.service.ListUsersWithFilter(r.Context(), filter)
	if err != nil {
		response.InternalServerError(w, "Failed to list users")
		return
	}

	userResponses := make([]*UserResponse, len(users))
	for i, user := range users {
		userResponses[i] = user.ToResponse()
	}

	response.Success(w, "Users retrieved successfully", userResponses)
}

func (h *Handler) GetUserByEmail(w http.ResponseWriter, r *http.Request) {
	email := chi.URLParam(r, "email")
	if email == "" {
		response.BadRequest(w, "Email parameter is required", nil)
		return
	}

	user, err := h.service.GetUserByEmail(r.Context(), email)
	if err != nil {
		switch err {
		case ErrUserNotFound:
			response.NotFound(w, "User not found")
		default:
			response.InternalServerError(w, "Failed to retrieve user")
		}
		return
	}

	response.Success(w, "User retrieved successfully", user.ToResponse())
}
