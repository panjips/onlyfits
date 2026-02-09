package chat

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// MessageRole represents the role of a message sender
type MessageRole string

const (
	RoleUser      MessageRole = "user"
	RoleAssistant MessageRole = "assistant"
	RoleSystem    MessageRole = "system"
)

// ChatSession represents a conversation session for a user
type ChatSession struct {
	ID        uuid.UUID       `db:"id"`
	UserID    uuid.UUID       `db:"user_id"`
	Name      *string         `db:"name"`
	Summary   *string         `db:"summary"`
	Metadata  json.RawMessage `db:"metadata"`
	IsActive  bool            `db:"is_active"`
	CreatedAt time.Time       `db:"created_at"`
	UpdatedAt time.Time       `db:"updated_at"`
}

// ToResponse converts ChatSession entity to response DTO
func (s *ChatSession) ToResponse() *ChatSessionResponse {
	return &ChatSessionResponse{
		ID:        s.ID,
		UserID:    s.UserID,
		Name:      s.Name,
		Summary:   s.Summary,
		IsActive:  s.IsActive,
		CreatedAt: s.CreatedAt,
		UpdatedAt: s.UpdatedAt,
	}
}

// ChatMessage represents a single message in a chat session
type ChatMessage struct {
	ID               uuid.UUID       `db:"id"`
	SessionID        uuid.UUID       `db:"session_id"`
	Role             MessageRole     `db:"role"`
	Content          string          `db:"content"`
	Context          json.RawMessage `db:"context"`
	SuggestedActions json.RawMessage `db:"suggested_actions"`
	Metadata         json.RawMessage `db:"metadata"`
	CreatedAt        time.Time       `db:"created_at"`
}

// ToResponse converts ChatMessage entity to response DTO
func (m *ChatMessage) ToResponse() *ChatMessageResponse {
	var suggestedActions []string
	if m.SuggestedActions != nil {
		_ = json.Unmarshal(m.SuggestedActions, &suggestedActions)
	}

	var context map[string]interface{}
	if m.Context != nil {
		_ = json.Unmarshal(m.Context, &context)
	}

	return &ChatMessageResponse{
		ID:               m.ID,
		SessionID:        m.SessionID,
		Role:             string(m.Role),
		Content:          m.Content,
		Context:          context,
		SuggestedActions: suggestedActions,
		CreatedAt:        m.CreatedAt,
	}
}
