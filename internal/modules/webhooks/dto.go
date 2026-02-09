package webhooks

import "time"

type PolarWebhookEventDTO struct {
	Type      string           `json:"type"`
	Timestamp time.Time        `json:"timestamp"`
	Data      CheckoutDataDTO `json:"data"`
}

type CheckoutDataDTO struct {
	ID                          string                 `json:"id"`
	CreatedAt                   time.Time              `json:"created_at"`
	ModifiedAt                  time.Time              `json:"modified_at"`
	PaymentProcessor            string                 `json:"payment_processor"`
	Status                      string                 `json:"status"`
	ClientSecret                string                 `json:"client_secret"`
	URL                         string                 `json:"url"`
	ExpiresAt                   time.Time              `json:"expires_at"`
	SuccessURL                  string                 `json:"success_url"`
	ReturnURL                   string                 `json:"return_url"`
	EmbedOrigin                 string                 `json:"embed_origin"`

	Amount                      int64                  `json:"amount"`
	DiscountAmount              int64                  `json:"discount_amount"`
	NetAmount                   int64                  `json:"net_amount"`
	TaxAmount                   int64                  `json:"tax_amount"`
	TotalAmount                 int64                  `json:"total_amount"`
	Currency                    string                 `json:"currency"`

	OrganizationID              string                 `json:"organization_id"`
	ProductID                   string                 `json:"product_id"`
	ProductPriceID              string                 `json:"product_price_id"`
	DiscountID                  string                 `json:"discount_id"`

	CustomerID                   string                `json:"customer_id"`
	CustomerName                 string                `json:"customer_name"`
	CustomerEmail                string                `json:"customer_email"`
	CustomerIPAddress            string                `json:"customer_ip_address"`

	Metadata                     map[string]any        `json:"metadata"`

	ExternalCustomerID           string                `json:"external_customer_id"`
	CustomerExternalID           string                `json:"customer_external_id"`

	Products                     []ProductDTO          `json:"products"`
	Product                      *ProductDTO           `json:"product,omitempty"`
	ProductPrice                 *PriceDTO             `json:"product_price,omitempty"`
	Prices                       map[string]any        `json:"prices"`

	SubscriptionID               string                `json:"subscription_id"`

	Seats                        int                   `json:"seats"`
	PricePerSeat                 int64                 `json:"price_per_seat"`
}

type ProductDTO struct {
	ID                     string        `json:"id"`
	CreatedAt              time.Time     `json:"created_at"`
	ModifiedAt             time.Time     `json:"modified_at"`
	Name                   string        `json:"name"`
	Description            string        `json:"description"`
	IsArchived              bool          `json:"is_archived"`
	OrganizationID          string        `json:"organization_id"`

	Prices                 []PriceDTO    `json:"prices"`
}

type PriceDTO struct {
	ID                string    `json:"id"`
	CreatedAt         time.Time `json:"created_at"`
	ModifiedAt        time.Time `json:"modified_at"`
	Source            string    `json:"source"`
	AmountType        string    `json:"amount_type"`
	IsArchived        bool      `json:"is_archived"`
	ProductID         string    `json:"product_id"`
	Type              string    `json:"type"`
	PriceCurrency     string    `json:"price_currency"`
	PriceAmount       int64     `json:"price_amount"`
}


