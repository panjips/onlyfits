-- +goose Up
-- +goose StatementBegin

CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),  -- Optional session name/title
    summary TEXT,       -- Optional summary of the conversation
    metadata JSONB DEFAULT '{}',  -- Additional session metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_is_active ON chat_sessions(is_active);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,                  -- User: query, Assistant: answer
    context JSONB DEFAULT NULL,             -- User: WellnessAnalysisRequest context (optional)
    suggested_actions JSONB DEFAULT NULL,   -- Assistant: suggested_actions array
    metadata JSONB DEFAULT '{}',            -- Token usage, model info, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
-- Composite index for fetching messages in a session ordered by time
CREATE INDEX idx_chat_messages_session_created ON chat_messages(session_id, created_at ASC);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chat_sessions;
-- +goose StatementEnd
