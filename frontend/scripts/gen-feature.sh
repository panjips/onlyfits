#!/bin/bash

# Check if feature name is provided
if [ -z "$1" ]; then
  echo "Usage: npm run gen:feature <feature-name>"
  exit 1
fi

# Convert to lowercase and replace spaces/hyphens with underscores or hyphens as preferred
# For now, we'll just use the name as provided
FEATURE_NAME=$1
FEATURES_DIR="src/features"
FEATURE_PATH="$FEATURES_DIR/$FEATURE_NAME"

# Check if feature already exists
if [ -d "$FEATURE_PATH" ]; then
  echo "Error: Feature '$FEATURE_NAME' already exists at $FEATURE_PATH"
  exit 1
fi

echo "Creating feature: $FEATURE_NAME..."

# Create core directories
mkdir -p "$FEATURE_PATH/api"
mkdir -p "$FEATURE_PATH/components"
mkdir -p "$FEATURE_PATH/hooks"
mkdir -p "$FEATURE_PATH/pages"
mkdir -p "$FEATURE_PATH/types"
mkdir -p "$FEATURE_PATH/schemas"
mkdir -p "$FEATURE_PATH/utils"

# Create barrel files (index.ts) for each directory
cat <<EOF > "$FEATURE_PATH/api/index.ts"
// Export your API hooks (TanStack Query) and fetch functions here
EOF

cat <<EOF > "$FEATURE_PATH/components/index.ts"
// Export your feature-specific components here
EOF

cat <<EOF > "$FEATURE_PATH/hooks/index.ts"
// Export your feature-specific hooks here
EOF

cat <<EOF > "$FEATURE_PATH/pages/index.ts"
// Export your page-level components here
EOF

cat <<EOF > "$FEATURE_PATH/types/index.ts"
// Export your feature-specific TypeScript types/interfaces here
EOF

cat <<EOF > "$FEATURE_PATH/schemas/index.ts"
// Export your Zod schemas here
EOF

cat <<EOF > "$FEATURE_PATH/utils/index.ts"
// Export your feature-specific utility functions here
EOF

# Create main entry point index.ts
cat <<EOF > "$FEATURE_PATH/index.ts"
export * from './api';
export * from './components';
export * from './hooks';
export * from './pages';
export * from './types';
export * from './schemas';
EOF

echo "✅ Feature '$FEATURE_NAME' created successfully!"
echo "Structure:"
echo "  $FEATURE_PATH/"
echo "  ├── api/"
echo "  ├── components/"
echo "  ├── hooks/"
echo "  ├── pages/"
echo "  ├── types/"
echo "  ├── schemas/"
echo "  ├── utils/"
echo "  └── index.ts"
