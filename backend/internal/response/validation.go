package response

import (
	"fmt"
	"net/http"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
)

// Global validator instance
var validate *validator.Validate

func init() {
	validate = validator.New(validator.WithRequiredStructEnabled())

	// Register function to get json tag name instead of struct field name
	validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})
}

// GetValidator returns the global validator instance
func GetValidator() *validator.Validate {
	return validate
}

// ValidationErrors represents a collection of validation errors
type ValidationErrors map[string][]string

// FieldError represents a single field validation error
type FieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ValidationDetails represents detailed validation error information
type ValidationDetails struct {
	Fields []FieldError `json:"fields,omitempty"`
	Count  int          `json:"count"`
}

// AddError adds a validation error for a specific field
func (ve ValidationErrors) AddError(field, message string) {
	if ve[field] == nil {
		ve[field] = make([]string, 0)
	}
	ve[field] = append(ve[field], message)
}

// HasErrors returns true if there are validation errors
func (ve ValidationErrors) HasErrors() bool {
	return len(ve) > 0
}

// ToFieldErrors converts ValidationErrors to a slice of FieldError
func (ve ValidationErrors) ToFieldErrors() []FieldError {
	var fieldErrors []FieldError

	for field, messages := range ve {
		for _, message := range messages {
			fieldErrors = append(fieldErrors, FieldError{
				Field:   field,
				Message: message,
			})
		}
	}

	return fieldErrors
}

// ToDetails converts ValidationErrors to ValidationDetails
func (ve ValidationErrors) ToDetails() *ValidationDetails {
	fieldErrors := ve.ToFieldErrors()
	return &ValidationDetails{
		Fields: fieldErrors,
		Count:  len(fieldErrors),
	}
}

// ErrorSummary creates a summary message of all validation errors
func (ve ValidationErrors) ErrorSummary() string {
	if !ve.HasErrors() {
		return ""
	}

	var messages []string
	for field, fieldErrors := range ve {
		for _, err := range fieldErrors {
			messages = append(messages, fmt.Sprintf("%s: %s", field, err))
		}
	}

	return strings.Join(messages, "; ")
}

// WriteValidationError writes a validation error response
func (ve ValidationErrors) WriteValidationError(w http.ResponseWriter) {
	if !ve.HasErrors() {
		return
	}

	details := ve.ToDetails()
	message := fmt.Sprintf("Validation failed for %d field(s)", details.Count)

	ValidationError(w, message, details)
}

// NewValidationErrors creates a new ValidationErrors instance
func NewValidationErrors() ValidationErrors {
	return make(ValidationErrors)
}

// ValidateStruct validates a struct using go-playground/validator
// Returns ValidationErrors if validation fails, nil otherwise
func ValidateStruct(s interface{}) ValidationErrors {
	err := validate.Struct(s)
	if err == nil {
		return nil
	}

	errors := NewValidationErrors()

	validationErrors, ok := err.(validator.ValidationErrors)
	if !ok {
		errors.AddError("_error", "Invalid validation error type")
		return errors
	}

	for _, fieldError := range validationErrors {
		field := fieldError.Field()
		message := getErrorMessage(fieldError)
		errors.AddError(field, message)
	}

	return errors
}

// ValidateStructAndWrite validates a struct and writes error response if validation fails
// Returns true if validation passed, false otherwise
func ValidateStructAndWrite(w http.ResponseWriter, s interface{}) bool {
	errors := ValidateStruct(s)
	if errors != nil && errors.HasErrors() {
		errors.WriteValidationError(w)
		return false
	}
	return true
}

// getErrorMessage returns a human-readable error message for a validation error
func getErrorMessage(fe validator.FieldError) string {
	field := formatFieldName(fe.Field())

	switch fe.Tag() {
	case "required":
		return fmt.Sprintf("%s is required", field)
	case "email":
		return fmt.Sprintf("%s must be a valid email address", field)
	case "min":
		return fmt.Sprintf("%s must be at least %s characters long", field, fe.Param())
	case "max":
		return fmt.Sprintf("%s must not exceed %s characters", field, fe.Param())
	case "len":
		return fmt.Sprintf("%s must be exactly %s characters long", field, fe.Param())
	case "eqfield":
		return fmt.Sprintf("%s must match %s", field, formatFieldName(fe.Param()))
	case "nefield":
		return fmt.Sprintf("%s must not match %s", field, formatFieldName(fe.Param()))
	case "gtfield":
		return fmt.Sprintf("%s must be greater than %s", field, formatFieldName(fe.Param()))
	case "gtefield":
		return fmt.Sprintf("%s must be greater than or equal to %s", field, formatFieldName(fe.Param()))
	case "ltfield":
		return fmt.Sprintf("%s must be less than %s", field, formatFieldName(fe.Param()))
	case "ltefield":
		return fmt.Sprintf("%s must be less than or equal to %s", field, formatFieldName(fe.Param()))
	case "alpha":
		return fmt.Sprintf("%s must contain only alphabetic characters", field)
	case "alphanum":
		return fmt.Sprintf("%s must contain only alphanumeric characters", field)
	case "numeric":
		return fmt.Sprintf("%s must be a valid number", field)
	case "number":
		return fmt.Sprintf("%s must be a valid number", field)
	case "hexadecimal":
		return fmt.Sprintf("%s must be a valid hexadecimal", field)
	case "hexcolor":
		return fmt.Sprintf("%s must be a valid hex color", field)
	case "rgb":
		return fmt.Sprintf("%s must be a valid RGB color", field)
	case "rgba":
		return fmt.Sprintf("%s must be a valid RGBA color", field)
	case "url":
		return fmt.Sprintf("%s must be a valid URL", field)
	case "uri":
		return fmt.Sprintf("%s must be a valid URI", field)
	case "uuid":
		return fmt.Sprintf("%s must be a valid UUID", field)
	case "uuid3":
		return fmt.Sprintf("%s must be a valid UUID v3", field)
	case "uuid4":
		return fmt.Sprintf("%s must be a valid UUID v4", field)
	case "uuid5":
		return fmt.Sprintf("%s must be a valid UUID v5", field)
	case "contains":
		return fmt.Sprintf("%s must contain '%s'", field, fe.Param())
	case "containsany":
		return fmt.Sprintf("%s must contain at least one of '%s'", field, fe.Param())
	case "excludes":
		return fmt.Sprintf("%s must not contain '%s'", field, fe.Param())
	case "excludesall":
		return fmt.Sprintf("%s must not contain any of '%s'", field, fe.Param())
	case "startswith":
		return fmt.Sprintf("%s must start with '%s'", field, fe.Param())
	case "endswith":
		return fmt.Sprintf("%s must end with '%s'", field, fe.Param())
	case "ip":
		return fmt.Sprintf("%s must be a valid IP address", field)
	case "ipv4":
		return fmt.Sprintf("%s must be a valid IPv4 address", field)
	case "ipv6":
		return fmt.Sprintf("%s must be a valid IPv6 address", field)
	case "datetime":
		return fmt.Sprintf("%s must be a valid datetime in format %s", field, fe.Param())
	case "json":
		return fmt.Sprintf("%s must be valid JSON", field)
	case "jwt":
		return fmt.Sprintf("%s must be a valid JWT token", field)
	case "lowercase":
		return fmt.Sprintf("%s must be lowercase", field)
	case "uppercase":
		return fmt.Sprintf("%s must be uppercase", field)
	case "oneof":
		return fmt.Sprintf("%s must be one of: %s", field, fe.Param())
	case "gt":
		return fmt.Sprintf("%s must be greater than %s", field, fe.Param())
	case "gte":
		return fmt.Sprintf("%s must be greater than or equal to %s", field, fe.Param())
	case "lt":
		return fmt.Sprintf("%s must be less than %s", field, fe.Param())
	case "lte":
		return fmt.Sprintf("%s must be less than or equal to %s", field, fe.Param())
	case "eq":
		return fmt.Sprintf("%s must be equal to %s", field, fe.Param())
	case "ne":
		return fmt.Sprintf("%s must not be equal to %s", field, fe.Param())
	case "boolean":
		return fmt.Sprintf("%s must be a boolean value", field)
	default:
		return fmt.Sprintf("%s failed validation on '%s' rule", field, fe.Tag())
	}
}

// formatFieldName converts snake_case or camelCase field names to a more readable format
func formatFieldName(field string) string {
	// Replace underscores with spaces and capitalize first letter
	field = strings.ReplaceAll(field, "_", " ")
	if len(field) > 0 {
		return strings.ToUpper(field[:1]) + field[1:]
	}
	return field
}

// RegisterCustomValidation registers a custom validation function
func RegisterCustomValidation(tag string, fn validator.Func) error {
	return validate.RegisterValidation(tag, fn)
}

// RegisterCustomValidationWithMessage registers a custom validation with a custom message handler
func RegisterCustomValidationWithMessage(tag string, fn validator.Func, message string) error {
	return validate.RegisterValidation(tag, fn)
}
