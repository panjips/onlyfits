package chat

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/google/uuid"
)

var (
	ErrSessionNotFound = errors.New("chat session not found")
	ErrUnauthorized    = errors.New("unauthorized access to chat session")
)

type Service interface {
	// Session operations
	CreateSession(ctx context.Context, userID uuid.UUID, req *CreateSessionRequest) (*ChatSessionResponse, error)
	UpdateSession(ctx context.Context, userID uuid.UUID, sessionID uuid.UUID, req *UpdateSessionRequest) (*ChatSessionResponse, error)
	DeleteSession(ctx context.Context, userID uuid.UUID, sessionID uuid.UUID) error
	GetSession(ctx context.Context, userID uuid.UUID, sessionID uuid.UUID) (*ChatSessionResponse, error)
	GetSessionWithMessages(ctx context.Context, userID uuid.UUID, sessionID uuid.UUID, messageLimit int) (*ChatSessionWithMessagesResponse, error)
	ListSessions(ctx context.Context, userID uuid.UUID, page, limit int) ([]*ChatSessionResponse, error)
	GetOrCreateActiveSession(ctx context.Context, userID uuid.UUID) (*ChatSessionResponse, error)

	// Message operations
	AddUserMessage(ctx context.Context, sessionID uuid.UUID, content string, context map[string]interface{}) (*ChatMessageResponse, error)
	AddAssistantMessage(ctx context.Context, sessionID uuid.UUID, content string, suggestedActions []string, metadata map[string]interface{}) (*ChatMessageResponse, error)
	AddSystemMessage(ctx context.Context, sessionID uuid.UUID, content string) (*ChatMessageResponse, error)
	GetMessages(ctx context.Context, sessionID uuid.UUID, page, limit int) ([]*ChatMessageResponse, error)
	GetConversationHistory(ctx context.Context, sessionID uuid.UUID, limit int) (*ConversationHistory, error)
	ClearMessages(ctx context.Context, userID uuid.UUID, sessionID uuid.UUID) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) CreateSession(ctx context.Context, userID uuid.UUID, req *CreateSessionRequest) (*ChatSessionResponse, error) {
	session := &ChatSession{
		UserID:   userID,
		Name:     req.Name,
		IsActive: true,
	}

	if req.Metadata != nil {
		metadataJSON, err := json.Marshal(req.Metadata)
		if err != nil {
			return nil, err
		}
		session.Metadata = metadataJSON
	}

	if err := s.repo.CreateSession(ctx, session); err != nil {
		return nil, err
	}

	return session.ToResponse(), nil
}

func (s *service) UpdateSession(ctx context.Context, userID uuid.UUID, sessionID uuid.UUID, req *UpdateSessionRequest) (*ChatSessionResponse, error) {
	session, err := s.repo.GetSessionByID(ctx, sessionID)
	if err != nil {
		return nil, err
	}
	if session == nil {
		return nil, ErrSessionNotFound
	}

	// Verify ownership
	if session.UserID != userID {
		return nil, ErrUnauthorized
	}

	// Apply updates
	if req.Name != nil {
		session.Name = req.Name
	}
	if req.Summary != nil {
		session.Summary = req.Summary
	}
	if req.IsActive != nil {
		session.IsActive = *req.IsActive
	}

	if err := s.repo.UpdateSession(ctx, session); err != nil {
		return nil, err
	}

	return session.ToResponse(), nil
}

func (s *service) DeleteSession(ctx context.Context, userID uuid.UUID, sessionID uuid.UUID) error {
	session, err := s.repo.GetSessionByID(ctx, sessionID)
	if err != nil {
		return err
	}
	if session == nil {
		return ErrSessionNotFound
	}

	// Verify ownership
	if session.UserID != userID {
		return ErrUnauthorized
	}

	return s.repo.DeleteSession(ctx, sessionID)
}

func (s *service) GetSession(ctx context.Context, userID uuid.UUID, sessionID uuid.UUID) (*ChatSessionResponse, error) {
	session, err := s.repo.GetSessionByID(ctx, sessionID)
	if err != nil {
		return nil, err
	}
	if session == nil {
		return nil, ErrSessionNotFound
	}

	// Verify ownership
	if session.UserID != userID {
		return nil, ErrUnauthorized
	}

	return session.ToResponse(), nil
}

func (s *service) GetSessionWithMessages(ctx context.Context, userID uuid.UUID, sessionID uuid.UUID, messageLimit int) (*ChatSessionWithMessagesResponse, error) {
	session, err := s.repo.GetSessionByID(ctx, sessionID)
	if err != nil {
		return nil, err
	}
	if session == nil {
		return nil, ErrSessionNotFound
	}

	// Verify ownership
	if session.UserID != userID {
		return nil, ErrUnauthorized
	}

	messages, err := s.repo.GetRecentMessages(ctx, sessionID, messageLimit)
	if err != nil {
		return nil, err
	}

	messageResponses := make([]*ChatMessageResponse, len(messages))
	for i, msg := range messages {
		messageResponses[i] = msg.ToResponse()
	}

	return &ChatSessionWithMessagesResponse{
		Session:  session.ToResponse(),
		Messages: messageResponses,
	}, nil
}

func (s *service) ListSessions(ctx context.Context, userID uuid.UUID, page, limit int) ([]*ChatSessionResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	sessions, err := s.repo.GetSessionsByUserID(ctx, userID, limit, offset)
	if err != nil {
		return nil, err
	}

	responses := make([]*ChatSessionResponse, len(sessions))
	for i, session := range sessions {
		responses[i] = session.ToResponse()
	}

	return responses, nil
}

func (s *service) GetOrCreateActiveSession(ctx context.Context, userID uuid.UUID) (*ChatSessionResponse, error) {
	// Try to find an existing active session
	session, err := s.repo.GetActiveSessionByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	if session != nil {
		return session.ToResponse(), nil
	}

	// Create a new session if none exists
	return s.CreateSession(ctx, userID, &CreateSessionRequest{})
}

func (s *service) AddUserMessage(ctx context.Context, sessionID uuid.UUID, content string, msgContext map[string]interface{}) (*ChatMessageResponse, error) {
	message := &ChatMessage{
		SessionID: sessionID,
		Role:      RoleUser,
		Content:   content,
	}

	if msgContext != nil {
		contextJSON, err := json.Marshal(msgContext)
		if err != nil {
			return nil, err
		}
		message.Context = contextJSON
	}

	if err := s.repo.AddMessage(ctx, message); err != nil {
		return nil, err
	}

	return message.ToResponse(), nil
}

func (s *service) AddAssistantMessage(ctx context.Context, sessionID uuid.UUID, content string, suggestedActions []string, metadata map[string]interface{}) (*ChatMessageResponse, error) {
	message := &ChatMessage{
		SessionID: sessionID,
		Role:      RoleAssistant,
		Content:   content,
	}

	if suggestedActions != nil {
		actionsJSON, err := json.Marshal(suggestedActions)
		if err != nil {
			return nil, err
		}
		message.SuggestedActions = actionsJSON
	}

	if metadata != nil {
		metadataJSON, err := json.Marshal(metadata)
		if err != nil {
			return nil, err
		}
		message.Metadata = metadataJSON
	}

	if err := s.repo.AddMessage(ctx, message); err != nil {
		return nil, err
	}

	return message.ToResponse(), nil
}

func (s *service) AddSystemMessage(ctx context.Context, sessionID uuid.UUID, content string) (*ChatMessageResponse, error) {
	message := &ChatMessage{
		SessionID: sessionID,
		Role:      RoleSystem,
		Content:   content,
	}

	if err := s.repo.AddMessage(ctx, message); err != nil {
		return nil, err
	}

	return message.ToResponse(), nil
}

func (s *service) GetMessages(ctx context.Context, sessionID uuid.UUID, page, limit int) ([]*ChatMessageResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	offset := (page - 1) * limit

	messages, err := s.repo.GetMessagesBySessionID(ctx, sessionID, limit, offset)
	if err != nil {
		return nil, err
	}

	responses := make([]*ChatMessageResponse, len(messages))
	for i, msg := range messages {
		responses[i] = msg.ToResponse()
	}

	return responses, nil
}

func (s *service) GetConversationHistory(ctx context.Context, sessionID uuid.UUID, limit int) (*ConversationHistory, error) {
	if limit < 1 {
		limit = 20
	}

	messages, err := s.repo.GetRecentMessages(ctx, sessionID, limit)
	if err != nil {
		return nil, err
	}

	conversationMessages := make([]ConversationMessage, len(messages))
	for i, msg := range messages {
		conversationMessages[i] = ConversationMessage{
			Role:    string(msg.Role),
			Content: msg.Content,
		}
	}

	return &ConversationHistory{
		SessionID: sessionID,
		Messages:  conversationMessages,
	}, nil
}

func (s *service) ClearMessages(ctx context.Context, userID uuid.UUID, sessionID uuid.UUID) error {
	session, err := s.repo.GetSessionByID(ctx, sessionID)
	if err != nil {
		return err
	}
	if session == nil {
		return ErrSessionNotFound
	}

	// Verify ownership
	if session.UserID != userID {
		return ErrUnauthorized
	}

	return s.repo.DeleteMessagesBySessionID(ctx, sessionID)
}
