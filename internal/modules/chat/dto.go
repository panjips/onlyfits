package chat

import (
	"time"

	"github.com/google/uuid"
)

// CreateSessionRequest represents the request to create a new chat session
type CreateSessionRequest struct {
	Name     *string                `json:"name,omitempty"`
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

// UpdateSessionRequest represents the request to update a chat session
type UpdateSessionRequest struct {
	Name     *string `json:"name,omitempty"`
	Summary  *string `json:"summary,omitempty"`
	IsActive *bool   `json:"isActive,omitempty"`
}

// ChatSessionResponse represents the response for a chat session
type ChatSessionResponse struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"userId"`
	Name      *string   `json:"name,omitempty"`
	Summary   *string   `json:"summary,omitempty"`
	IsActive  bool      `json:"isActive"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// ChatSessionWithMessagesResponse represents a session with its messages
type ChatSessionWithMessagesResponse struct {
	Session  *ChatSessionResponse   `json:"session"`
	Messages []*ChatMessageResponse `json:"messages"`
}

// SessionListFilter represents filters for listing sessions
type SessionListFilter struct {
	UserID   uuid.UUID `json:"userId"`
	IsActive *bool     `json:"isActive,omitempty"`
	Page     int       `json:"page"`
	Limit    int       `json:"limit"`
}

// AddMessageRequest represents the request to add a message to a session
type AddMessageRequest struct {
	Role             string                 `json:"role" validate:"required,oneof=user assistant system"`
	Content          string                 `json:"content" validate:"required"`
	Context          map[string]interface{} `json:"context,omitempty"`          // For user messages: WellnessAnalysisRequest
	SuggestedActions []string               `json:"suggestedActions,omitempty"` // For assistant messages
	Metadata         map[string]interface{} `json:"metadata,omitempty"`         // Token usage, model info, etc.
}

// ChatMessageResponse represents the response for a chat message
type ChatMessageResponse struct {
	ID               uuid.UUID              `json:"id"`
	SessionID        uuid.UUID              `json:"sessionId"`
	Role             string                 `json:"role"`
	Content          string                 `json:"content"`
	Context          map[string]interface{} `json:"context,omitempty"`
	SuggestedActions []string               `json:"suggestedActions,omitempty"`
	CreatedAt        time.Time              `json:"createdAt"`
}

// MessageListFilter represents filters for listing messages
type MessageListFilter struct {
	SessionID uuid.UUID `json:"sessionId"`
	Role      *string   `json:"role,omitempty"`
	Page      int       `json:"page"`
	Limit     int       `json:"limit"`
}

// ConversationMessage represents a simplified message for AI context
type ConversationMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// ConversationHistory represents the conversation history for AI
type ConversationHistory struct {
	SessionID uuid.UUID             `json:"sessionId"`
	Messages  []ConversationMessage `json:"messages"`
}
