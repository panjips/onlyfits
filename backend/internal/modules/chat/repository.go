package chat

import (
	"context"
	"encoding/json"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	// Session operations
	CreateSession(ctx context.Context, session *ChatSession) error
	UpdateSession(ctx context.Context, session *ChatSession) error
	DeleteSession(ctx context.Context, id uuid.UUID) error
	GetSessionByID(ctx context.Context, id uuid.UUID) (*ChatSession, error)
	GetSessionsByUserID(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*ChatSession, error)
	GetActiveSessionByUserID(ctx context.Context, userID uuid.UUID) (*ChatSession, error)

	// Message operations
	AddMessage(ctx context.Context, message *ChatMessage) error
	GetMessagesBySessionID(ctx context.Context, sessionID uuid.UUID, limit, offset int) ([]*ChatMessage, error)
	GetRecentMessages(ctx context.Context, sessionID uuid.UUID, limit int) ([]*ChatMessage, error)
	DeleteMessagesBySessionID(ctx context.Context, sessionID uuid.UUID) error
}

type repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &repository{db: db}
}

func (r *repository) CreateSession(ctx context.Context, session *ChatSession) error {
	query := `
		INSERT INTO chat_sessions (user_id, name, summary, metadata, is_active)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`

	metadata := []byte("{}")
	if session.Metadata != nil {
		metadata = session.Metadata
	}

	return r.db.QueryRow(ctx, query,
		session.UserID,
		session.Name,
		session.Summary,
		metadata,
		session.IsActive,
	).Scan(&session.ID, &session.CreatedAt, &session.UpdatedAt)
}

func (r *repository) UpdateSession(ctx context.Context, session *ChatSession) error {
	query := `
		UPDATE chat_sessions
		SET name = $1, summary = $2, metadata = $3, is_active = $4, updated_at = NOW()
		WHERE id = $5
		RETURNING updated_at
	`

	metadata := []byte("{}")
	if session.Metadata != nil {
		metadata = session.Metadata
	}

	return r.db.QueryRow(ctx, query,
		session.Name,
		session.Summary,
		metadata,
		session.IsActive,
		session.ID,
	).Scan(&session.UpdatedAt)
}

func (r *repository) DeleteSession(ctx context.Context, id uuid.UUID) error {
	// Delete messages first (due to foreign key), then session
	_, err := r.db.Exec(ctx, `DELETE FROM chat_messages WHERE session_id = $1`, id)
	if err != nil {
		return err
	}

	_, err = r.db.Exec(ctx, `DELETE FROM chat_sessions WHERE id = $1`, id)
	return err
}

func (r *repository) GetSessionByID(ctx context.Context, id uuid.UUID) (*ChatSession, error) {
	query := `
		SELECT id, user_id, name, summary, metadata, is_active, created_at, updated_at
		FROM chat_sessions
		WHERE id = $1
	`

	var session ChatSession
	err := r.db.QueryRow(ctx, query, id).Scan(
		&session.ID,
		&session.UserID,
		&session.Name,
		&session.Summary,
		&session.Metadata,
		&session.IsActive,
		&session.CreatedAt,
		&session.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &session, nil
}

func (r *repository) GetSessionsByUserID(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*ChatSession, error) {
	query := `
		SELECT id, user_id, name, summary, metadata, is_active, created_at, updated_at
		FROM chat_sessions
		WHERE user_id = $1
		ORDER BY updated_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Query(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []*ChatSession
	for rows.Next() {
		var session ChatSession
		err := rows.Scan(
			&session.ID,
			&session.UserID,
			&session.Name,
			&session.Summary,
			&session.Metadata,
			&session.IsActive,
			&session.CreatedAt,
			&session.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		sessions = append(sessions, &session)
	}

	return sessions, rows.Err()
}

func (r *repository) GetActiveSessionByUserID(ctx context.Context, userID uuid.UUID) (*ChatSession, error) {
	query := `
		SELECT id, user_id, name, summary, metadata, is_active, created_at, updated_at
		FROM chat_sessions
		WHERE user_id = $1 AND is_active = true
		ORDER BY updated_at DESC
		LIMIT 1
	`

	var session ChatSession
	err := r.db.QueryRow(ctx, query, userID).Scan(
		&session.ID,
		&session.UserID,
		&session.Name,
		&session.Summary,
		&session.Metadata,
		&session.IsActive,
		&session.CreatedAt,
		&session.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &session, nil
}

func (r *repository) AddMessage(ctx context.Context, message *ChatMessage) error {
	query := `
		INSERT INTO chat_messages (session_id, role, content, context, suggested_actions, metadata)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at
	`

	// Handle nil JSON fields
	var contextJSON, suggestedActionsJSON, metadataJSON []byte
	var err error

	if message.Context != nil {
		contextJSON = message.Context
	}

	if message.SuggestedActions != nil {
		suggestedActionsJSON = message.SuggestedActions
	}

	if message.Metadata != nil {
		metadataJSON = message.Metadata
	} else {
		metadataJSON = []byte("{}")
	}

	err = r.db.QueryRow(ctx, query,
		message.SessionID,
		message.Role,
		message.Content,
		contextJSON,
		suggestedActionsJSON,
		metadataJSON,
	).Scan(&message.ID, &message.CreatedAt)

	if err != nil {
		return err
	}

	// Update session's updated_at timestamp
	_, err = r.db.Exec(ctx, `UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1`, message.SessionID)
	return err
}

func (r *repository) GetMessagesBySessionID(ctx context.Context, sessionID uuid.UUID, limit, offset int) ([]*ChatMessage, error) {
	query := `
		SELECT id, session_id, role, content, context, suggested_actions, metadata, created_at
		FROM chat_messages
		WHERE session_id = $1
		ORDER BY created_at ASC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Query(ctx, query, sessionID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return r.scanMessages(rows)
}

func (r *repository) GetRecentMessages(ctx context.Context, sessionID uuid.UUID, limit int) ([]*ChatMessage, error) {
	// Get the most recent messages, but return them in chronological order
	query := `
		SELECT id, session_id, role, content, context, suggested_actions, metadata, created_at
		FROM (
			SELECT id, session_id, role, content, context, suggested_actions, metadata, created_at
			FROM chat_messages
			WHERE session_id = $1
			ORDER BY created_at DESC
			LIMIT $2
		) sub
		ORDER BY created_at ASC
	`

	rows, err := r.db.Query(ctx, query, sessionID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return r.scanMessages(rows)
}

func (r *repository) DeleteMessagesBySessionID(ctx context.Context, sessionID uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM chat_messages WHERE session_id = $1`, sessionID)
	return err
}

func (r *repository) scanMessages(rows pgx.Rows) ([]*ChatMessage, error) {
	var messages []*ChatMessage
	for rows.Next() {
		var message ChatMessage
		var contextJSON, suggestedActionsJSON, metadataJSON []byte

		err := rows.Scan(
			&message.ID,
			&message.SessionID,
			&message.Role,
			&message.Content,
			&contextJSON,
			&suggestedActionsJSON,
			&metadataJSON,
			&message.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		if contextJSON != nil {
			message.Context = json.RawMessage(contextJSON)
		}
		if suggestedActionsJSON != nil {
			message.SuggestedActions = json.RawMessage(suggestedActionsJSON)
		}
		if metadataJSON != nil {
			message.Metadata = json.RawMessage(metadataJSON)
		}

		messages = append(messages, &message)
	}

	return messages, rows.Err()
}
