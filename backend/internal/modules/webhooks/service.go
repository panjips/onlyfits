package webhooks

import (
	"context"
	"fitcore/internal/config"
	"fitcore/internal/modules/invoice"
	"fitcore/internal/modules/member"
	"fitcore/internal/modules/subscription"
	"fitcore/internal/modules/user"
	"fitcore/pkg/email"
	"fitcore/pkg/hash"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
)

type Service interface {
	CompleteCheckout(ctx context.Context, req *PolarWebhookEventDTO) error
}

type serviceImpl struct {
	invoiceSvc      invoice.Service
	subscriptionSvc subscription.Service
	memberSvc       member.Service
	emailSvc        email.Service
	userSvc         user.Service
	userRepo        user.Repository
}

func NewService(invoiceSvc invoice.Service, subscriptionSvc subscription.Service, memberSvc member.Service, emailSvc email.Service, userSvc user.Service, userRepo user.Repository) Service {
	return &serviceImpl{
		invoiceSvc:      invoiceSvc,
		subscriptionSvc: subscriptionSvc,
		memberSvc:       memberSvc,
		emailSvc:        emailSvc,
		userSvc:         userSvc,
		userRepo:        userRepo,
	}
}

func (s *serviceImpl) CompleteCheckout(ctx context.Context, req *PolarWebhookEventDTO) error {
	if req.Data.Status != "succeeded" {
		return nil
	}
	log.Printf("Service: Starting checkout completion for checkout ID: %s", req.Data.ID)

	log.Printf("Service: Parsing external ID from webhook data: %s", req.Data.ID)
	var externalID *uuid.UUID
	if parsedID, err := uuid.Parse(req.Data.ID); err == nil {
		externalID = &parsedID
		log.Printf("Service: Successfully parsed external ID: %s", parsedID)
	} else {
		log.Printf("Service: Invalid external ID format, setting to nil: %v", err)
		externalID = nil
	}

	if externalID == nil {
		log.Printf("Service: External ID is nil, cannot find invoice")
		return fmt.Errorf("external ID is nil")
	}

	log.Printf("Service: Retrieving invoice by external ID: %s", *externalID)
	inv, err := s.invoiceSvc.GetInvoiceByExternalID(ctx, *externalID)
	if err != nil {
		log.Printf("Service: Failed to get invoice by external ID %s: %v", *externalID, err)
		return err
	}
	log.Printf("Service: Found invoice ID: %s for external ID: %s", inv.ID, *externalID)

	log.Printf("Service: Updating invoice %s status to paid", inv.ID)
	paidAt := time.Now()
	status := "paid"
	reqInvoice := &invoice.UpdateInvoiceRequest{
		Status: &status,
		PaidAt: &paidAt,
	}

	_, err = s.invoiceSvc.UpdateInvoice(ctx, inv.ID, reqInvoice)
	if err != nil {
		log.Printf("Service: Failed to update invoice %s status to paid: %v", inv.ID, err)
		return err
	}
	log.Printf("Service: Successfully updated invoice %s status to paid", inv.ID)

	if inv.SubscriptionID != nil {
		log.Printf("Service: Invoice has subscription ID: %s, updating subscription status", *inv.SubscriptionID)

		activeStatus := "active"
		reqSubscription := &subscription.UpdateSubscriptionRequest{
			Status: &activeStatus,
		}

		_, err = s.subscriptionSvc.UpdateSubscription(ctx, *inv.SubscriptionID, reqSubscription)
		if err != nil {
			log.Printf("Service: Failed to update subscription %s status to active: %v", *inv.SubscriptionID, err)
			return err
		}
		log.Printf("Service: Successfully updated subscription %s status to active", *inv.SubscriptionID)

		log.Printf("Service: Retrieving subscription details for ID: %s", *inv.SubscriptionID)
		sub, err := s.subscriptionSvc.GetSubscription(ctx, *inv.SubscriptionID)
		if err != nil {
			log.Printf("Service: Failed to get subscription %s: %v", *inv.SubscriptionID, err)
			return err
		}
		log.Printf("Service: Found subscription with member ID: %s", sub.MemberID)

		log.Printf("Service: Updating member %s status to active", sub.MemberID)
		activeMemberStatus := "active"
		reqMember := &member.UpdateMemberRequest{
			Status: &activeMemberStatus,
		}

		_, err = s.memberSvc.UpdateMember(ctx, sub.MemberID, reqMember)
		if err != nil {
			log.Printf("Service: Failed to update member %s status to active: %v", sub.MemberID, err)
			return err
		}
		log.Printf("Service: Successfully updated member %s status to active", sub.MemberID)

		paymentType := req.Data.Metadata["payment_type"]
		log.Printf("Service: Processing payment type: %s", paymentType)

		if paymentType == "" {
			log.Printf("Service: Payment type is empty, cannot proceed with member setup")
			return fmt.Errorf("payment type is empty")
		}

		if paymentType == "new" {
			log.Printf("Service: Processing new member setup for member ID: %s", sub.MemberID)

			member, err := s.memberSvc.GetMember(ctx, sub.MemberID)
			if err != nil {
				log.Printf("Service: Failed to get member %s: %v", sub.MemberID, err)
				return err
			}
			log.Printf("Service: Retrieved member details for user ID: %s", *member.UserID)

			log.Printf("Service: Generating random password for new user")
			newPassword, err := hash.GenerateRandomPassword(8)
			if err != nil {
				log.Printf("Service: Failed to generate random password: %v", err)
				return err
			}
			log.Printf("Service: Successfully generated random password")

			log.Printf("Service: Retrieving user details by member ID: %s", member.ID)
			user, err := s.userRepo.GetUserByMemberID(ctx, member.ID)
			if err != nil {
				log.Printf("Service: Failed to get user by member ID %s: %v", member.ID, err)
				return err
			}
			log.Printf("Service: Found user email: %s", user.Email)

			log.Printf("Service: Hashing password for user ID: %s", *member.UserID)
			hashedPassword, err := hash.HashPassword(newPassword)
			if err != nil {
				log.Printf("Service: Failed to hash password: %v", err)
				return err
			}
			log.Printf("Service: Successfully hashed password")

			log.Printf("Service: Updating password for user ID: %s", *member.UserID)
			err = s.userRepo.UpdatePassword(ctx, *member.UserID, hashedPassword)
			if err != nil {
				log.Printf("Service: Failed to update password for user %s: %v", *member.UserID, err)
				return err
			}
			log.Printf("Service: Successfully updated password for user %s", *member.UserID)

			// Send welcome email asynchronously to avoid blocking the webhook response
			log.Printf("Service: Scheduling async welcome email to: %s", user.Email)
			baseURL := config.Get().App.BaseURL
			loginUrl := fmt.Sprintf("%s/login", baseURL)

			go func(email, password, url string) {
				// Create a new context for the background operation
				bgCtx := context.Background()
				if err := s.emailSvc.SendWelcomeEmail(bgCtx, email, password, url); err != nil {
					log.Printf("Service: Async welcome email failed for %s: %v", email, err)
				} else {
					log.Printf("Service: Successfully sent welcome email to %s", email)
				}
			}(user.Email, newPassword, loginUrl)
		} else {
			log.Printf("Service: Payment type is '%s', skipping new member setup", paymentType)
		}

		log.Printf("Service: Successfully completed checkout: invoice %s, subscription %s, member %s", inv.ID, sub.ID, sub.MemberID)
	} else {
		log.Printf("Service: No subscription ID found for invoice %s, skipping subscription and member updates", inv.ID)
	}

	log.Printf("Service: Checkout completion finished successfully for checkout ID: %s", req.Data.ID)
	return nil
}
