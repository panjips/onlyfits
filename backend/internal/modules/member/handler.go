package member

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"fitcore/internal/middleware"
	"fitcore/internal/modules/chat"
	"fitcore/internal/modules/user"
	"fitcore/internal/response"

	"github.com/go-chi/chi/v5"
	gojwt "github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type Handler struct {
	service Service
	userSvc user.Service
}

func NewHandler(service Service, userSvc user.Service) *Handler {
	return &Handler{
		service: service,
		userSvc: userSvc,
	}
}

func (h *Handler) RegisterRoutes(r chi.Router) {
	r.Route("/api/v1/members", func(r chi.Router) {
		r.Use(middleware.AuthMiddleware)
		r.Get("/{id}", h.GetMember)
		r.Get("/visitors/{branchId}", h.GetVisitorCount)
		r.Get("/attendance", h.GetAttendance)
		r.Get("/analytics", h.GetAnalytics)
		r.Post("/chat", h.Chat)
		r.Get("/chat/sessions", h.GetChatSessions)
		r.Post("/chat/sessions", h.CreateChatSession)
		r.Get("/chat/sessions/{sessionId}", h.GetChatSession)
		r.Delete("/chat/sessions/{sessionId}", h.DeleteChatSession)
		r.Get("/chat/sessions/{sessionId}/messages", h.GetChatMessages)

		r.Group(func(r chi.Router) {
			r.Use(middleware.RoleMiddleware("member"))
			r.Get("/qr", h.GetDataQR)
		})

		r.Group(func(r chi.Router) {
			r.Use(middleware.RoleMiddleware("admin", "staff"))
			r.Post("/scanner", h.Scanner)
			r.Get("/sessions/{branchId}", h.GetSessionActivities)
		})

		r.Group(func(r chi.Router) {
			r.Use(middleware.RoleMiddleware("admin", "staff"))
			r.Get("/", h.ListMembers)
			r.Get("/organization/{organizationId}", h.ListMembersByOrganization)
			r.Post("/", h.CreateMember)
			r.Put("/{id}", h.UpdateMember)
			r.Delete("/{id}", h.DeleteMember)
		})
	})
}

// GetChatSessions returns all chat sessions for the authenticated user
func (h *Handler) GetChatSessions(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserClaimsKey).(gojwt.MapClaims)
	if !ok {
		response.Unauthorized(w, "Invalid user context")
		return
	}

	userIDStr, _ := claims["id"].(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		response.Unauthorized(w, "Invalid user ID")
		return
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}

	sessions, err := h.service.GetChatSessions(r.Context(), userID, page, limit)
	if err != nil {
		log.Printf("Handler: GetChatSessions failed: %v", err)
		response.InternalServerError(w, "Failed to get chat sessions")
		return
	}

	response.Success(w, "Chat sessions retrieved successfully", sessions)
}

// CreateChatSession creates a new chat session for the authenticated user
func (h *Handler) CreateChatSession(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserClaimsKey).(gojwt.MapClaims)
	if !ok {
		response.Unauthorized(w, "Invalid user context")
		return
	}

	userIDStr, _ := claims["id"].(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		response.Unauthorized(w, "Invalid user ID")
		return
	}

	var req chat.CreateSessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		// Allow empty body for creating session without name
		req = chat.CreateSessionRequest{}
	}

	session, err := h.service.CreateChatSession(r.Context(), userID, &req)
	if err != nil {
		log.Printf("Handler: CreateChatSession failed: %v", err)
		response.InternalServerError(w, "Failed to create chat session")
		return
	}

	response.Success(w, "Chat session created successfully", session)
}

// GetChatSession returns a specific chat session with its messages
func (h *Handler) GetChatSession(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserClaimsKey).(gojwt.MapClaims)
	if !ok {
		response.Unauthorized(w, "Invalid user context")
		return
	}

	userIDStr, _ := claims["id"].(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		response.Unauthorized(w, "Invalid user ID")
		return
	}

	sessionIDParam := chi.URLParam(r, "sessionId")
	sessionID, err := uuid.Parse(sessionIDParam)
	if err != nil {
		response.BadRequest(w, "Invalid session ID", nil)
		return
	}

	messageLimit, _ := strconv.Atoi(r.URL.Query().Get("messageLimit"))
	if messageLimit < 1 {
		messageLimit = 50
	}

	session, err := h.service.GetChatSessionWithMessages(r.Context(), userID, sessionID, messageLimit)
	if err != nil {
		log.Printf("Handler: GetChatSession failed: %v", err)
		if err.Error() == "chat session not found" {
			response.NotFound(w, "Chat session not found")
			return
		}
		if err.Error() == "unauthorized access to chat session" {
			response.Unauthorized(w, "Unauthorized access to chat session")
			return
		}
		response.InternalServerError(w, "Failed to get chat session")
		return
	}

	response.Success(w, "Chat session retrieved successfully", session)
}

// DeleteChatSession deletes a chat session for the authenticated user
func (h *Handler) DeleteChatSession(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserClaimsKey).(gojwt.MapClaims)
	if !ok {
		response.Unauthorized(w, "Invalid user context")
		return
	}

	userIDStr, _ := claims["id"].(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		response.Unauthorized(w, "Invalid user ID")
		return
	}

	sessionIDParam := chi.URLParam(r, "sessionId")
	sessionID, err := uuid.Parse(sessionIDParam)
	if err != nil {
		response.BadRequest(w, "Invalid session ID", nil)
		return
	}

	err = h.service.DeleteChatSession(r.Context(), userID, sessionID)
	if err != nil {
		log.Printf("Handler: DeleteChatSession failed: %v", err)
		if err.Error() == "chat session not found" {
			response.NotFound(w, "Chat session not found")
			return
		}
		if err.Error() == "unauthorized access to chat session" {
			response.Unauthorized(w, "Unauthorized access to chat session")
			return
		}
		response.InternalServerError(w, "Failed to delete chat session")
		return
	}

	response.OK(w, "Chat session deleted successfully")
}

// GetChatMessages returns messages for a specific chat session
func (h *Handler) GetChatMessages(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserClaimsKey).(gojwt.MapClaims)
	if !ok {
		response.Unauthorized(w, "Invalid user context")
		return
	}

	userIDStr, _ := claims["id"].(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		response.Unauthorized(w, "Invalid user ID")
		return
	}

	sessionIDParam := chi.URLParam(r, "sessionId")
	sessionID, err := uuid.Parse(sessionIDParam)
	if err != nil {
		response.BadRequest(w, "Invalid session ID", nil)
		return
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 50
	}

	messages, err := h.service.GetChatMessages(r.Context(), userID, sessionID, page, limit)
	if err != nil {
		log.Printf("Handler: GetChatMessages failed: %v", err)
		if err.Error() == "chat session not found" {
			response.NotFound(w, "Chat session not found")
			return
		}
		if err.Error() == "unauthorized access to chat session" {
			response.Unauthorized(w, "Unauthorized access to chat session")
			return
		}
		response.InternalServerError(w, "Failed to get chat messages")
		return
	}

	response.Success(w, "Chat messages retrieved successfully", messages)
}

func (h *Handler) GetAnalytics(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserClaimsKey).(gojwt.MapClaims)
	if !ok {
		response.Unauthorized(w, "Invalid user context")
		return
	}

	userIDStr, _ := claims["id"].(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		response.Unauthorized(w, "Invalid user ID")
		return
	}

	analytics, err := h.service.GetAnalytics(r.Context(), userID)
	if err != nil {
		log.Printf("Handler: GetAnalytics failed: %v", err)
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, "Analytics retrieved successfully", analytics)
}

func (h *Handler) GetAttendance(w http.ResponseWriter, r *http.Request) {
	log.Printf("Handler: GetAttendance request received from %s", r.RemoteAddr)

	startDate := r.URL.Query().Get("startDate")
	endDate := r.URL.Query().Get("endDate")

	log.Printf("Handler: GetAttendance request parsed - startDate: %s, endDate: %s", startDate, endDate)

	if startDate == "" || endDate == "" {
		log.Printf("Handler: GetAttendance failed - missing required fields: startDate=%s, endDate=%s", startDate, endDate)
		response.BadRequest(w, "startDate and endDate are required", nil)
		return
	}

	// Extract user ID from JWT claims
	claims, ok := r.Context().Value(middleware.UserClaimsKey).(gojwt.MapClaims)
	if !ok {
		log.Printf("Handler: GetAttendance failed - invalid user context")
		response.Unauthorized(w, "Invalid user context")
		return
	}

	userIDStr, _ := claims["id"].(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		log.Printf("Handler: GetAttendance failed - invalid user ID: %v", err)
		response.Unauthorized(w, "Invalid user ID")
		return
	}

	log.Printf("Handler: GetAttendance processing for userID: %s", userID)

	// Call service to get attendance
	attendance, err := h.service.GetAttendance(r.Context(), userID, startDate, endDate)
	if err != nil {
		log.Printf("Handler: GetAttendance failed - service error: %v", err)
		response.InternalServerError(w, "Failed to get attendance")
		return
	}

	log.Printf("Handler: GetAttendance succeeded for userID: %s", userID)
	response.Success(w, "Attendance retrieved successfully", attendance)
}

func (h *Handler) CreateMember(w http.ResponseWriter, r *http.Request) {
	log.Printf("Handler: CreateMember request received from %s", r.RemoteAddr)

	var req CreateMemberRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Handler: CreateMember failed - invalid JSON payload: %v", err)
		response.BadRequest(w, "Invalid request payload", err.Error())
		return
	}

	log.Printf("Handler: CreateMember request parsed - email: %s, firstName: %s, lastName: %s, orgID: %s",
		req.Email, req.FirstName, req.LastName, req.OrganizationID)

	if req.FirstName == "" || req.LastName == "" {
		log.Printf("Handler: CreateMember failed - missing required fields: firstName=%s, lastName=%s", req.FirstName, req.LastName)
		response.BadRequest(w, "FirstName and LastName are required", nil)
		return
	}

	if req.OrganizationID == uuid.Nil {
		log.Printf("Handler: CreateMember failed - missing organizationID")
		response.BadRequest(w, "OrganizationID is required", nil)
		return
	}

	resp, err := h.service.CreateMember(r.Context(), &req)
	if err != nil {
		log.Printf("Handler: CreateMember failed - service error: %v", err)
		response.InternalServerError(w, "Failed to create member")
		return
	}

	log.Printf("Handler: CreateMember succeeded - memberID: %s", resp.ID)
	response.Success(w, "Success create member", resp)
}

func (h *Handler) UpdateMember(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid member ID", nil)
		return
	}

	var req UpdateMemberRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request payload", nil)
		return
	}

	member, err := h.service.UpdateMember(r.Context(), id, &req)
	if err != nil {
		response.InternalServerError(w, "Failed to update member")
		return
	}
	response.Success(w, "Member updated successfully", member.ToResponse())
}

func (h *Handler) DeleteMember(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid member ID", nil)
		return
	}

	if err := h.service.DeleteMember(r.Context(), id); err != nil {
		response.InternalServerError(w, "Failed to delete member")
		return
	}
	response.OK(w, "Member deleted successfully")
}

func (h *Handler) GetMember(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(w, "Invalid member ID", nil)
		return
	}

	member, err := h.service.GetMember(r.Context(), id)
	if err != nil {
		response.NotFound(w, "Member not found")
		return
	}
	response.Success(w, "Member retrieved successfully", member.ToResponse())
}

func (h *Handler) Scanner(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request payload", err.Error())
		return
	}

	if req.Token == "" {
		response.BadRequest(w, "Token is required", nil)
		return
	}

	_, err := h.service.Scanner(r.Context(), req.Token)
	if err != nil {
		response.InternalServerError(w, err.Error())
		return
	}

	response.OK(w, "Scan processed successfully")
}

func (h *Handler) GetSessionActivities(w http.ResponseWriter, r *http.Request) {
	branchIDParam := chi.URLParam(r, "branchId")
	branchID, err := uuid.Parse(branchIDParam)
	if err != nil {
		response.BadRequest(w, "Invalid branch ID", nil)
		return
	}

	sessions, err := h.service.GetSessionActivities(r.Context(), branchID)
	if err != nil {
		response.InternalServerError(w, "Failed to get session activities")
		return
	}

	response.Success(w, "Session activities retrieved successfully", sessions)
}

func (h *Handler) GetDataQR(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserClaimsKey).(gojwt.MapClaims)
	if !ok {
		response.Unauthorized(w, "Invalid user context")
		return
	}

	userIDStr, _ := claims["id"].(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		response.Unauthorized(w, "Invalid user ID")
		return
	}

	token, err := h.service.GetDataQR(r.Context(), userID)
	if err != nil {
		response.NotFound(w, "Member not found")
		return
	}
	response.Success(w, "Qr token retrieved successfully", token)
}

func (h *Handler) ListMembers(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserClaimsKey).(gojwt.MapClaims)
	if !ok {
		response.Unauthorized(w, "Invalid user context")
		return
	}

	userRole, _ := claims["role"].(string)
	userIDStr, _ := claims["id"].(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		response.Unauthorized(w, "Invalid user ID")
		return
	}

	filter := &MemberListFilter{}

	if orgID := r.URL.Query().Get("organizationId"); orgID != "" {
		parsed, err := uuid.Parse(orgID)
		if err == nil {
			filter.OrganizationID = &parsed
		}
	}

	if branchID := r.URL.Query().Get("branchId"); branchID != "" {
		parsed, err := uuid.Parse(branchID)
		if err == nil {
			filter.BranchID = &parsed
		}
	}

	if status := r.URL.Query().Get("status"); status != "" {
		filter.Status = &status
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	filter.Page = page
	filter.Limit = limit

	var userBranchIDs []uuid.UUID
	if userRole == "staff" {
		userBranchIDs, err = h.userSvc.GetUserBranchIDs(r.Context(), userID, userRole)
		if err != nil {
			response.InternalServerError(w, "Failed to get user branches")
			return
		}
	}

	members, err := h.service.ListMembersWithFilter(r.Context(), filter, userRole, userBranchIDs)
	if err != nil {
		response.InternalServerError(w, "Failed to list members")
		return
	}

	memberResponses := make([]*MemberResponse, len(members))
	for i, member := range members {
		memberResponses[i] = member.ToResponse()
	}

	response.Success(w, "Members retrieved successfully", memberResponses)
}

func (h *Handler) GetVisitorCount(w http.ResponseWriter, r *http.Request) {
	branchIDParam := chi.URLParam(r, "branchId")
	branchID, err := uuid.Parse(branchIDParam)
	if err != nil {
		response.BadRequest(w, "Invalid branch ID", nil)
		return
	}

	visitorCount, err := h.service.GetVisitorCount(r.Context(), branchID)
	if err != nil {
		response.InternalServerError(w, "Failed to get visitor count")
		return
	}

	response.Success(w, "Visitor count retrieved successfully", visitorCount)
}

func (h *Handler) ListMembersByOrganization(w http.ResponseWriter, r *http.Request) {
	orgIDParam := chi.URLParam(r, "organizationId")
	organizationID, err := uuid.Parse(orgIDParam)
	if err != nil {
		response.BadRequest(w, "Invalid organization ID", nil)
		return
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	members, err := h.service.ListMembersByOrganization(r.Context(), organizationID, page, limit)
	if err != nil {
		response.InternalServerError(w, "Failed to list members")
		return
	}

	memberResponses := make([]*MemberResponse, len(members))
	for i, member := range members {
		memberResponses[i] = member.ToResponse()
	}

	response.Success(w, "Members retrieved successfully", memberResponses)
}

func (h *Handler) Chat(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserClaimsKey).(gojwt.MapClaims)
	if !ok {
		response.Unauthorized(w, "Invalid user context")
		return
	}

	userIDStr, _ := claims["id"].(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		response.Unauthorized(w, "Invalid user ID")
		return
	}

	var req struct {
		Query string `json:"query"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request payload", err.Error())
		return
	}

	if req.Query == "" {
		response.BadRequest(w, "Query is required", nil)
		return
	}

	resp, err := h.service.Chat(r.Context(), userID, req.Query)
	if err != nil {
		log.Printf("Handler: Chat failed: %v", err)
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, "Chat processed successfully", resp)
}
