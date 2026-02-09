package resend

import (
	"context"
	"fmt"

	"github.com/resend/resend-go/v3"
)

type Client struct {
	client *resend.Client
}

func NewClient(apiKey string) (*Client, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("resend API key is required")
	}
	client := resend.NewClient(apiKey)
	return &Client{client: client}, nil
}

type SendEmailParams struct {
	From    string
	To      []string
	Subject string
	Html    string
	Text    string
	ReplyTo string
}

func (c *Client) SendEmail(ctx context.Context, params *SendEmailParams) (string, error) {
	req := &resend.SendEmailRequest{
		From:    params.From,
		To:      params.To,
		Subject: params.Subject,
		Html:    params.Html,
		Text:    params.Text,
		ReplyTo: params.ReplyTo,
	}

	sent, err := c.client.Emails.SendWithContext(ctx, req)
	if err != nil {
		return "", fmt.Errorf("failed to send email: %w", err)
	}

	return sent.Id, nil
}

func (c *Client) SendPasswordResetEmail(ctx context.Context, to, fromAddress, fromName, resetLink string) error {
	html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1c2536; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <!-- Main Container -->
    <div style="background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(133, 146, 173, 0.2);">
        <!-- Header with Brand Color -->
        <div style="background: #5d87ff; padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">%s</h1>
        </div>
        
        <!-- Content Section -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #1c2536; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
            <p style="color: rgba(90, 106, 133, 0.75); font-size: 15px; line-height: 24px; margin: 0 0 24px 0;">
                We received a request to reset your password. Click the button below to create a new password:
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
                <a href="%s" style="background: #5d87ff; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 9px 17.5px rgba(93, 135, 255, 0.15); transition: all 0.3s ease;">Reset Password</a>
            </div>
            
            <!-- Info Text -->
            <div style="background: rgba(93, 135, 255, 0.12); border-radius: 10px; padding: 16px; margin: 24px 0;">
                <p style="color: rgba(90, 106, 133, 0.75); font-size: 13px; line-height: 20px; margin: 0;">
                    <strong style="color: #1c2536; font-weight: 600;">Security Note:</strong> If you didn't request a password reset, you can safely ignore this email. This link will expire in 1 hour for your security.
                </p>
            </div>
            
            <!-- Divider -->
            <hr style="border: none; border-top: 1px solid #dfe5ef; margin: 32px 0;">
            
            <!-- Footer Link -->
            <div style="text-align: center;">
                <p style="color: rgba(90, 106, 133, 0.75); font-size: 12px; line-height: 18px; margin: 0 0 8px 0;">
                    If the button doesn't work, copy and paste this link into your browser:
                </p>
                <a href="%s" style="color: #5d87ff; font-size: 12px; word-break: break-all; text-decoration: none; font-weight: 500;">%s</a>
            </div>
        </div>
        
        <!-- Email Footer -->
        <div style="background: #f5f5f5; padding: 24px 30px; border-top: 1px solid #dfe5ef; text-align: center;">
            <p style="color: rgba(90, 106, 133, 0.75); font-size: 12px; line-height: 18px; margin: 0;">
                © 2026 %s. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`, fromName, resetLink, resetLink, resetLink, fromName)

	text := fmt.Sprintf(`
Reset Your Password

We received a request to reset your password. Visit the link below to create a new password:

%s

If you didn't request a password reset, you can safely ignore this email. This link will expire in 1 hour.

- %s Team
`, resetLink, fromName)

	params := &SendEmailParams{
		From:    fmt.Sprintf("%s <%s>", fromName, fromAddress),
		To:      []string{to},
		Subject: "Reset Your Password",
		Html:    html,
		Text:    text,
	}

	_, err := c.SendEmail(ctx, params)
	return err
}

func (c *Client) SendPaymentCheckoutEmail(ctx context.Context, to, fromAddress, fromName, checkoutURL string) error {
	html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Your Subscription Payment</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1c2536; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <!-- Main Container -->
    <div style="background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(133, 146, 173, 0.2);">
        <!-- Header with Brand Color -->
        <div style="background: #5d87ff; padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">%s</h1>
        </div>
        
        <!-- Content Section -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #1c2536; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">Complete Your Subscription Payment</h2>
            <p style="color: rgba(90, 106, 133, 0.75); font-size: 15px; line-height: 24px; margin: 0 0 24px 0;">
                Thank you for choosing our service! You're just one step away from activating your subscription. Click the button below to complete your payment securely:
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
                <a href="%s" style="background: #13deb9; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 9px 17.5px rgba(19, 222, 185, 0.15); transition: all 0.3s ease;">Proceed to Payment</a>
            </div>
            
            <!-- Features/Benefits -->
            <div style="background: rgba(19, 222, 185, 0.12); border-radius: 10px; padding: 20px; margin: 24px 0;">
                <p style="color: #1c2536; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">✓ What happens next?</p>
                <ul style="color: rgba(90, 106, 133, 0.75); font-size: 13px; line-height: 22px; margin: 0; padding-left: 20px;">
                    <li>Secure payment processing through Polar</li>
                    <li>Instant subscription activation</li>
                    <li>Email confirmation upon successful payment</li>
                    <li>Full access to all premium features</li>
                </ul>
            </div>
            
            <!-- Info Text -->
            <div style="background: rgba(93, 135, 255, 0.12); border-radius: 10px; padding: 16px; margin: 24px 0;">
                <p style="color: rgba(90, 106, 133, 0.75); font-size: 13px; line-height: 20px; margin: 0;">
                    <strong style="color: #1c2536; font-weight: 600;">Secure Payment:</strong> All transactions are securely processed through our payment partner Polar. Your payment information is encrypted and protected.
                </p>
            </div>
            
            <!-- Divider -->
            <hr style="border: none; border-top: 1px solid #dfe5ef; margin: 32px 0;">
            
            <!-- Footer Link -->
            <div style="text-align: center;">
                <p style="color: rgba(90, 106, 133, 0.75); font-size: 12px; line-height: 18px; margin: 0 0 8px 0;">
                    If the button doesn't work, copy and paste this link into your browser:
                </p>
                <a href="%s" style="color: #5d87ff; font-size: 12px; word-break: break-all; text-decoration: none; font-weight: 500;">%s</a>
            </div>
            
            <!-- Support Section -->
            <div style="margin-top: 24px; text-align: center;">
                <p style="color: rgba(90, 106, 133, 0.75); font-size: 12px; line-height: 18px; margin: 0;">
                    Need help? Contact our support team for assistance.
                </p>
            </div>
        </div>
        
        <!-- Email Footer -->
        <div style="background: #f5f5f5; padding: 24px 30px; border-top: 1px solid #dfe5ef; text-align: center;">
            <p style="color: rgba(90, 106, 133, 0.75); font-size: 12px; line-height: 18px; margin: 0;">
                © 2026 %s. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`, fromName, checkoutURL, checkoutURL, checkoutURL, fromName)

	text := fmt.Sprintf(`
Complete Your Subscription Payment

Thank you for choosing our service! You're just one step away from activating your subscription.

Visit the link below to complete your payment securely:

%s

What happens next?
- Secure payment processing through Polar
- Instant subscription activation
- Email confirmation upon successful payment
- Full access to all premium features

All transactions are securely processed through our payment partner Polar.

Need help? Contact our support team for assistance.

- %s Team
`, checkoutURL, fromName)

	params := &SendEmailParams{
		From:    fmt.Sprintf("%s <%s>", fromName, fromAddress),
		To:      []string{to},
		Subject: "Complete Your Subscription Payment",
		Html:    html,
		Text:    text,
	}

	_, err := c.SendEmail(ctx, params)
	return err
}

func (c *Client) SendWelcomeCredentialsEmail(ctx context.Context, to, fromAddress, fromName, email, password, loginURL string) error {
	html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to %s - Your Account is Ready!</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1c2536; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <!-- Main Container -->
    <div style="background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(133, 146, 173, 0.2);">
        <!-- Header with Success Color -->
        <div style="background: linear-gradient(135deg, #13deb9 0%%, #5d87ff 100%%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">🎉 Welcome to %s!</h1>
        </div>
        
        <!-- Content Section -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #1c2536; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">Your Account is Ready!</h2>
            <p style="color: rgba(90, 106, 133, 0.75); font-size: 15px; line-height: 24px; margin: 0 0 24px 0;">
                Thank you for your payment! Your subscription has been successfully activated. Below are your login credentials to access your account:
            </p>
            
            <!-- Credentials Box -->
            <div style="background: rgba(19, 222, 185, 0.08); border: 2px solid rgba(19, 222, 185, 0.3); border-radius: 10px; padding: 24px; margin: 24px 0;">
                <p style="color: #1c2536; font-size: 14px; font-weight: 600; margin: 0 0 16px 0;">🔑 Your Login Credentials</p>
                
                <div style="margin-bottom: 16px;">
                    <p style="color: rgba(90, 106, 133, 0.75); font-size: 13px; margin: 0 0 4px 0; font-weight: 500;">Email Address:</p>
                    <p style="color: #1c2536; font-size: 15px; font-weight: 600; margin: 0; font-family: 'Courier New', monospace; background: #ffffff; padding: 10px 12px; border-radius: 6px; border: 1px solid #dfe5ef;">%s</p>
                </div>
                
                <div>
                    <p style="color: rgba(90, 106, 133, 0.75); font-size: 13px; margin: 0 0 4px 0; font-weight: 500;">Temporary Password:</p>
                    <p style="color: #1c2536; font-size: 15px; font-weight: 600; margin: 0; font-family: 'Courier New', monospace; background: #ffffff; padding: 10px 12px; border-radius: 6px; border: 1px solid #dfe5ef;">%s</p>
                </div>
            </div>
            
            <!-- Security Warning -->
            <div style="background: rgba(246, 181, 30, 0.12); border-radius: 10px; padding: 16px; margin: 24px 0;">
                <p style="color: rgba(90, 106, 133, 0.75); font-size: 13px; line-height: 20px; margin: 0;">
                    <strong style="color: #f6b51e; font-weight: 600;">⚠️ Important Security Notice:</strong> Please change your password after your first login for security purposes. You can do this in your account settings.
                </p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
                <a href="%s" style="background: #13deb9; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 9px 17.5px rgba(19, 222, 185, 0.15); transition: all 0.3s ease;">Login to Your Account</a>
            </div>
            
            <!-- Features/Benefits -->
            <div style="background: rgba(93, 135, 255, 0.12); border-radius: 10px; padding: 20px; margin: 24px 0;">
                <p style="color: #1c2536; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">✨ What's included in your subscription:</p>
                <ul style="color: rgba(90, 106, 133, 0.75); font-size: 13px; line-height: 22px; margin: 0; padding-left: 20px;">
                    <li>Full access to all premium features</li>
                    <li>Priority customer support</li>
                    <li>Regular updates and new features</li>
                    <li>Secure and reliable service</li>
                </ul>
            </div>
            
            <!-- Divider -->
            <hr style="border: none; border-top: 1px solid #dfe5ef; margin: 32px 0;">
            
            <!-- Footer Link -->
            <div style="text-align: center;">
                <p style="color: rgba(90, 106, 133, 0.75); font-size: 12px; line-height: 18px; margin: 0 0 8px 0;">
                    If the button doesn't work, copy and paste this link into your browser:
                </p>
                <a href="%s" style="color: #5d87ff; font-size: 12px; word-break: break-all; text-decoration: none; font-weight: 500;">%s</a>
            </div>
            
            <!-- Support Section -->
            <div style="margin-top: 24px; text-align: center;">
                <p style="color: rgba(90, 106, 133, 0.75); font-size: 12px; line-height: 18px; margin: 0;">
                    Need help getting started? Contact our support team - we're here to help!
                </p>
            </div>
        </div>
        
        <!-- Email Footer -->
        <div style="background: #f5f5f5; padding: 24px 30px; border-top: 1px solid #dfe5ef; text-align: center;">
            <p style="color: rgba(90, 106, 133, 0.75); font-size: 12px; line-height: 18px; margin: 0;">
                © 2026 %s. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`, fromName, fromName, email, password, loginURL, loginURL, loginURL, fromName)

	text := fmt.Sprintf(`
Welcome to %s - Your Account is Ready!

Thank you for your payment! Your subscription has been successfully activated.

YOUR LOGIN CREDENTIALS
=======================

Email Address: %s
Temporary Password: %s

IMPORTANT SECURITY NOTICE
=========================
Please change your password after your first login for security purposes. You can do this in your account settings.

LOGIN NOW
=========
Visit the link below to access your account:

%s

WHAT'S INCLUDED IN YOUR SUBSCRIPTION
=====================================
- Full access to all premium features
- Priority customer support
- Regular updates and new features
- Secure and reliable service

Need help getting started? Contact our support team - we're here to help!

- %s Team
`, fromName, email, password, loginURL, fromName)

	params := &SendEmailParams{
		From:    fmt.Sprintf("%s <%s>", fromName, fromAddress),
		To:      []string{to},
		Subject: fmt.Sprintf("Welcome to %s - Your Account is Ready!", fromName),
		Html:    html,
		Text:    text,
	}

	_, err := c.SendEmail(ctx, params)
	return err
}
