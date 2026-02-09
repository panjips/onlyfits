package polar

import (
	"context"
	"fitcore/internal/config"
	"log"

	polargo "github.com/polarsource/polar-go"
	"github.com/polarsource/polar-go/models/components"
	"github.com/polarsource/polar-go/models/operations"
)

type Service struct {
	client         *polargo.Polar
	organizationID string
}

func NewService() *Service {
	cfg := config.Get()

	client := polargo.New(
		polargo.WithServer(cfg.Polar.Env),
		polargo.WithSecurity(cfg.Polar.AccessToken),
	)

	return &Service{
		client:         client,
		organizationID: cfg.Polar.OrganizationID,
	}
}

func NewProductionService() *Service {
	cfg := config.Get()

	client := polargo.New(
		polargo.WithSecurity(cfg.Polar.AccessToken),
	)

	return &Service{
		client: client,
	}
}

type ProductUpdateParams struct {
	Name        *string
	Description *string
	Price       *int64
}

func (s *Service) GetClient() *polargo.Polar {
	return s.client
}

func (s *Service) ListOrganizations(ctx context.Context, page, limit int64) (*operations.OrganizationsListResponse, error) {
	return s.client.Organizations.List(ctx, nil, polargo.Int64(page), polargo.Int64(limit), nil)
}

func (s *Service) ListProducts(ctx context.Context) (*operations.ProductsListResponse, error) {
	return s.client.Products.List(ctx, operations.ProductsListRequest{
		OrganizationID: polargo.Pointer(operations.CreateProductsListQueryParamOrganizationIDFilterStr(s.organizationID)),
	})
}

func (s *Service) GetProduct(ctx context.Context, productID string) (*operations.ProductsGetResponse, error) {
	return s.client.Products.Get(ctx, productID)
}

func (s *Service) CreateCheckout(ctx context.Context, productIDs []string, customerEmail string, successURL string, paymentType string) (*operations.CheckoutsCreateResponse, error) {
	var paymentTypeStr string
	if paymentType != "" {
		paymentTypeStr = paymentType
	}
	metadata := map[string]components.CheckoutCreateMetadata{
		"payment_type": components.CreateCheckoutCreateMetadataStr(paymentTypeStr),
	}

	return s.client.Checkouts.Create(ctx, components.CheckoutCreate{
		Products:      productIDs,
		CustomerEmail: polargo.String(customerEmail),
		SuccessURL:    polargo.String(successURL),
		Metadata:      metadata,
	})
}

func (s *Service) CreateCheckoutWithDiscount(ctx context.Context, productIDs []string, customerEmail string, successURL string, discountID string) (*operations.CheckoutsCreateResponse, error) {
	return s.client.Checkouts.Create(ctx, components.CheckoutCreate{
		Products:      productIDs,
		CustomerEmail: polargo.String(customerEmail),
		SuccessURL:    polargo.String(successURL),
		DiscountID:    polargo.String(discountID),
	})
}

func (s *Service) GetCheckout(ctx context.Context, checkoutID string) (*operations.CheckoutsGetResponse, error) {
	return s.client.Checkouts.Get(ctx, checkoutID)
}

func (s *Service) ListCustomers(ctx context.Context) (*operations.CustomersListResponse, error) {
	return s.client.Customers.List(ctx, operations.CustomersListRequest{
		OrganizationID: polargo.Pointer(operations.CreateCustomersListQueryParamOrganizationIDFilterStr(s.organizationID)),
	})
}

func (s *Service) GetCustomer(ctx context.Context, customerID string) (*operations.CustomersGetResponse, error) {
	return s.client.Customers.Get(ctx, customerID)
}

func (s *Service) ListSubscriptions(ctx context.Context) (*operations.SubscriptionsListResponse, error) {
	return s.client.Subscriptions.List(ctx, operations.SubscriptionsListRequest{
		OrganizationID: polargo.Pointer(operations.CreateOrganizationIDFilterStr(s.organizationID)),
	})
}

func (s *Service) GetSubscription(ctx context.Context, subscriptionID string) (*operations.SubscriptionsGetResponse, error) {
	return s.client.Subscriptions.Get(ctx, subscriptionID)
}

func (s *Service) ListOrders(ctx context.Context) (*operations.OrdersListResponse, error) {
	return s.client.Orders.List(ctx, operations.OrdersListRequest{
		OrganizationID: polargo.Pointer(operations.CreateOrdersListQueryParamOrganizationIDFilterStr(s.organizationID)),
	})
}

func (s *Service) GetOrder(ctx context.Context, orderID string) (*operations.OrdersGetResponse, error) {
	return s.client.Orders.Get(ctx, orderID)
}

func (s *Service) CreateProduct(ctx context.Context, price int64, name, description string) (*operations.ProductsCreateResponse, error) {
	res, err := s.client.Products.Create(ctx, components.ProductCreate{
		ProductCreateOneTime: &components.ProductCreateOneTime{
			Name:        name,
			Description: &description,
			Prices: []components.ProductCreateOneTimePrices{
				components.CreateProductCreateOneTimePricesFixed(
					components.ProductPriceFixedCreate{
						PriceAmount:   price,
						PriceCurrency: polargo.String("usd"),
					},
				),
			},
		},
	})

	if err != nil {
		return nil, err
	}

	log.Printf("Product %s created with price: %v", res.Product.Name, res.Product.Prices)
	return res, err
}

func (s *Service) InactiveProduct(ctx context.Context, productID string) (*operations.ProductsUpdateResponse, error) {
	res, err := s.client.Products.Update(ctx, productID, components.ProductUpdate{
		IsArchived: polargo.Bool(true),
	})

	if err != nil {
		log.Fatal(err)
	}

	return res, err
}

func (s *Service) UpdateProduct(ctx context.Context, productID string, params ProductUpdateParams) (*operations.ProductsUpdateResponse, error) {
	update := components.ProductUpdate{}

	if params.Name != nil {
		update.Name = params.Name
	}

	if params.Description != nil {
		update.Description = params.Description
	}

	if params.Price != nil {
		update.Prices = []components.ProductUpdatePrices{
			components.CreateProductUpdatePricesTwo(
				components.CreateTwoFixed(components.ProductPriceFixedCreate{
					PriceAmount:   *params.Price,
					PriceCurrency: polargo.String("usd"),
				}),
			),
		}
	}

	if params.Price == nil {
		update.Prices = []components.ProductUpdatePrices{
			components.CreateProductUpdatePricesExistingProductPrice(
				components.ExistingProductPrice{
					ID: productID,
				},
			),
		}
	}

	res, err := s.client.Products.Update(ctx, productID, update)
	if err != nil {
		return nil, err
	}

	return res, nil
}
