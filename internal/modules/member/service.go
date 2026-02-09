package member

import (
	"context"
	"fitcore/internal/config"
	"fitcore/internal/modules/cache"
	"fitcore/internal/modules/chat"
	"fitcore/internal/modules/plans"
	"fitcore/internal/modules/subscription"
	"fitcore/internal/modules/user"
	"fitcore/pkg/hash"
	"fitcore/pkg/jwt"
	"fmt"
	"log"
	"strings"
	"time"

	"bytes"
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
)

type Service interface {
	CreateMember(ctx context.Context, req *CreateMemberRequest) (*CreateMemberResponse, error)
	UpdateMember(ctx context.Context, id uuid.UUID, req *UpdateMemberRequest) (*Member, error)
	DeleteMember(ctx context.Context, id uuid.UUID) error
	GetMember(ctx context.Context, id uuid.UUID) (*Member, error)
	GetDataQR(ctx context.Context, id uuid.UUID) (*QRCodeResponse, error)
	ListMembers(ctx context.Context, page, limit int) ([]*Member, error)
	ListMembersByOrganization(ctx context.Context, organizationID uuid.UUID, page, limit int) ([]*Member, error)
	ListMembersWithFilter(ctx context.Context, filter *MemberListFilter, userRole string, userBranchIDs []uuid.UUID) ([]*Member, error)
	Scanner(ctx context.Context, token string) (*CheckIn, error)
	GetSessionActivities(ctx context.Context, branchID uuid.UUID) ([]*CheckInWithMemberResponse, error)
	GetVisitorCount(ctx context.Context, branchID uuid.UUID) (*VisitorCountResponse, error)
	GetAttendance(ctx context.Context, uid uuid.UUID, startDate, endDate string) ([]*Attendance, error)
	GetAnalytics(ctx context.Context, userID uuid.UUID) (*WellnessAnalysisResponse, error)
	Chat(ctx context.Context, userID uuid.UUID, query string) (*ChatbotResponse, error)

	// Chat session methods
	GetChatSessions(ctx context.Context, userID uuid.UUID, page, limit int) ([]*chat.ChatSessionResponse, error)
	CreateChatSession(ctx context.Context, userID uuid.UUID, req *chat.CreateSessionRequest) (*chat.ChatSessionResponse, error)
	GetChatSessionWithMessages(ctx context.Context, userID uuid.UUID, sessionID uuid.UUID, messageLimit int) (*chat.ChatSessionWithMessagesResponse, error)
	DeleteChatSession(ctx context.Context, userID uuid.UUID, sessionID uuid.UUID) error
	GetChatMessages(ctx context.Context, userID uuid.UUID, sessionID uuid.UUID, page, limit int) ([]*chat.ChatMessageResponse, error)
}

type serviceImpl struct {
	repo     Repository
	subSvc   subscription.Service
	plansSvc plans.Service
	userSvc  user.Service
	cacheSvc cache.Service
	chatSvc  chat.Service
}

func NewService(repo Repository, subSvc subscription.Service, plansSvc plans.Service, userSvc user.Service, cacheSvc cache.Service, chatSvc chat.Service) Service {
	return &serviceImpl{repo: repo, subSvc: subSvc, plansSvc: plansSvc, userSvc: userSvc, cacheSvc: cacheSvc, chatSvc: chatSvc}
}

func (s *serviceImpl) CreateMember(ctx context.Context, req *CreateMemberRequest) (*CreateMemberResponse, error) {
	if req.Email == "" {
		log.Printf("Service: CreateMember failed - email is required")
		return nil, fmt.Errorf("email is required")
	}

	user, err := s.userSvc.GetUserByEmail(ctx, req.Email)
	userExists := err == nil

	var isNewUser bool
	if req.CreateNewUser != nil {
		isNewUser = *req.CreateNewUser
		if isNewUser && userExists {
			log.Printf("Service: CreateMember failed - user with email %s already exists but CreateNewUser was set to true", req.Email)
			return nil, fmt.Errorf("user with email %s already exists", req.Email)
		}
		if !isNewUser && !userExists {
			log.Printf("Service: CreateMember failed - user with email %s doesn't exist but CreateNewUser was set to false", req.Email)
			return nil, fmt.Errorf("user with email %s doesn't exist", req.Email)
		}
	} else {
		isNewUser = !userExists
	}

	if isNewUser {
		log.Printf("Service: User with email %s doesn't exist, will create new user", req.Email)
	} else {
		log.Printf("Service: Creating member for existing user ID: %s", user.ID)
	}

	var dateOfBirth *time.Time
	if req.DateOfBirth != nil {
		parsed, err := time.Parse("2006-01-02", *req.DateOfBirth)
		if err != nil {
			return nil, err
		}
		dateOfBirth = &parsed
	}

	var joinDate *time.Time
	if req.JoinDate != nil {
		parsed, err := time.Parse("2006-01-02", *req.JoinDate)
		if err != nil {
			return nil, err
		}
		joinDate = &parsed
	} else {
		now := time.Now()
		joinDate = &now
	}

	status := MemberStatusLead
	if req.Status != nil {
		status = MemberStatus(*req.Status)
	}

	var member *Member

	if isNewUser {
		if req.HomeBranchID == nil {
			log.Printf("Service: CreateMember failed - HomeBranchID is required when creating new user")
			return nil, fmt.Errorf("HomeBranchID is required when creating new user")
		}

		member = &Member{
			UserID:         nil,
			OrganizationID: req.OrganizationID,
			HomeBranchID:   req.HomeBranchID,
			FirstName:      req.FirstName,
			LastName:       req.LastName,
			Phone:          req.Phone,
			DateOfBirth:    dateOfBirth,
			Status:         status,
			JoinDate:       joinDate,
			Notes:          req.Notes,
		}

		randPassword, err := hash.GenerateRandomPassword(8)
		if err != nil {
			return nil, err
		}

		hashedPassword, err := hash.HashPassword(randPassword)
		if err != nil {
			return nil, err
		}

		if err := s.repo.CreateWithUser(ctx, member, req.Email, hashedPassword); err != nil {
			log.Printf("Service: CreateMember failed - repository error when creating new user: %v", err)
			return nil, err
		}
		log.Printf("Service: Created new user and member with email: %s", req.Email)
	} else {
		member = &Member{
			UserID:         &user.ID,
			OrganizationID: req.OrganizationID,
			HomeBranchID:   req.HomeBranchID,
			FirstName:      req.FirstName,
			LastName:       req.LastName,
			Phone:          req.Phone,
			DateOfBirth:    dateOfBirth,
			Status:         status,
			JoinDate:       joinDate,
			Notes:          req.Notes,
		}

		if err := s.repo.Create(ctx, member); err != nil {
			log.Printf("Service: CreateMember failed - repository error for existing user ID %s: %v", member.UserID, err)
			return nil, err
		}
		log.Printf("Service: Created member for existing user ID: %s", user.ID)
	}

	plan, err := s.plansSvc.GetPlan(ctx, *req.PlanID)
	if err != nil {
		log.Printf("Service: CreateMember failed - plans service error for user ID %s: %v", member.UserID, err)
		return nil, err
	}

	subsReq := &subscription.CreateSubscriptionRequest{
		MemberID:  member.ID,
		PlanID:    &plan.ID,
		BranchID:  member.HomeBranchID,
		StartDate: *req.JoinDate,
	}

	resSub, err := s.subSvc.CreateSubscription(ctx, subsReq, "new")
	if err != nil {
		log.Printf("Service: CreateMember failed - subscription service error for member ID %s: %v", member.ID, err)
		return nil, err
	}

	resMember := &CreateMemberResponse{
		ID:             member.ID,
		SubscriptionID: resSub.ID,
		PlanID:         resSub.PlanID,
		BranchID:       resSub.BranchID,
		InvoiceID:      resSub.InvoiceID,
	}

	if isNewUser {
		log.Printf("Service: Member created successfully with ID: %s for new user with email: %s", member.ID, req.Email)
	} else {
		log.Printf("Service: Member created successfully with ID: %s for existing user ID: %s", member.ID, member.UserID)
	}
	return resMember, nil
}

func (s *serviceImpl) UpdateMember(ctx context.Context, id uuid.UUID, req *UpdateMemberRequest) (*Member, error) {
	member, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.UserID != nil {
		member.UserID = req.UserID
	}
	if req.HomeBranchID != nil {
		member.HomeBranchID = req.HomeBranchID
	}
	if req.FirstName != "" {
		member.FirstName = req.FirstName
	}
	if req.LastName != "" {
		member.LastName = req.LastName
	}
	if req.Phone != nil {
		member.Phone = req.Phone
	}
	if req.DateOfBirth != nil {
		parsed, err := time.Parse("2006-01-02", *req.DateOfBirth)
		if err != nil {
			return nil, err
		}
		member.DateOfBirth = &parsed
	}
	if req.Status != nil {
		member.Status = MemberStatus(*req.Status)
	}
	if req.JoinDate != nil {
		parsed, err := time.Parse("2006-01-02", *req.JoinDate)
		if err != nil {
			return nil, err
		}
		member.JoinDate = &parsed
	}
	if req.Notes != nil {
		member.Notes = req.Notes
	}

	if err := s.repo.Update(ctx, member); err != nil {
		return nil, err
	}
	return member, nil
}

func (s *serviceImpl) DeleteMember(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

func (s *serviceImpl) GetMember(ctx context.Context, id uuid.UUID) (*Member, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *serviceImpl) GetAttendance(ctx context.Context, uid uuid.UUID, startDate, endDate string) ([]*Attendance, error) {
	log.Printf("Service: GetAttendance started for userID: %s, startDate: %s, endDate: %s", uid, startDate, endDate)

	member, err := s.repo.GetByUserID(ctx, uid)
	if err != nil {
		log.Printf("Service: GetAttendance failed - unable to get member by userID %s: %v", uid, err)
		return nil, err
	}

	log.Printf("Service: GetAttendance found member - memberID: %s for userID: %s", member.ID, uid)

	attendance, err := s.repo.GetAttendance(ctx, member.ID, startDate, endDate)
	if err != nil {
		log.Printf("Service: GetAttendance failed - unable to get attendance for memberID %s: %v", member.ID, err)
		return nil, err
	}

	log.Printf("Service: GetAttendance succeeded for memberID: %s, userID: %s", member.ID, uid)
	return attendance, nil
}

func (s *serviceImpl) GetDataQR(ctx context.Context, id uuid.UUID) (*QRCodeResponse, error) {
	member, err := s.repo.GetByUserID(ctx, id)
	if err != nil {
		return nil, err
	}

	activity, err := s.repo.GetSessionActivity(ctx, member.ID)

	if err != nil || (activity != nil && activity.CheckOutTime != nil) {
		token, err := jwt.GenerateQrToken(id.String(), member.ID.String(), "check-in", time.Now())
		if err != nil {
			return nil, err
		}

		return &QRCodeResponse{
			Token: *token,
		}, nil
	}

	token, err := jwt.GenerateQrToken(id.String(), activity.MemberID.String(), "check-out", time.Now())
	if err != nil {
		return nil, err
	}

	return &QRCodeResponse{
		Token: *token,
	}, nil
}

func (s *serviceImpl) Scanner(ctx context.Context, token string) (*CheckIn, error) {
	log.Printf("Scanner: Starting scan process")

	claims, err := jwt.ValidateToken(token)
	if err != nil {
		log.Printf("Scanner: Token validation failed - %v", err)
		return nil, fmt.Errorf("invalid or expired QR code: %w", err)
	}
	log.Printf("Scanner: Token validated successfully, claims: %+v", claims)

	strUserID, ok := claims["uid"].(string)
	if !ok {
		log.Printf("Scanner: Missing or invalid user ID in claims")
		return nil, fmt.Errorf("invalid QR code: missing user ID")
	}

	strMemberID, ok := claims["mid"].(string)
	if !ok {
		log.Printf("Scanner: Missing or invalid member ID in claims")
		return nil, fmt.Errorf("invalid QR code: missing member ID")
	}

	qrType, ok := claims["type"].(string)
	if !ok {
		log.Printf("Scanner: Missing or invalid type in claims")
		return nil, fmt.Errorf("invalid QR code: missing type")
	}
	log.Printf("Scanner: Extracted claims - userID: %s, memberID: %s, type: %s", strUserID, strMemberID, qrType)

	qrData := &ClaimQr{
		UID:  uuid.MustParse(strUserID),
		MID:  uuid.MustParse(strMemberID),
		Type: qrType,
	}

	if qrData.Type == "check-in" {
		log.Printf("Scanner: Processing CHECK-IN for member %s", qrData.MID)

		subscription, err := s.subSvc.GetActiveSubscription(ctx, qrData.MID)
		if err != nil {
			log.Printf("Scanner: Failed to get active subscription for member %s - %v", qrData.MID, err)
			return nil, fmt.Errorf("no active subscription found: %w", err)
		}
		log.Printf("Scanner: Found active subscription %s for member %s", subscription.ID, qrData.MID)

		members, err := s.repo.GetByID(ctx, qrData.MID)
		if err != nil {
			log.Printf("Scanner: Failed to get member by ID %s - %v", qrData.MID, err)
			return nil, fmt.Errorf("member not found: %w", err)
		}
		log.Printf("Scanner: Found member %s, HomeBranchID: %v", qrData.MID, members.HomeBranchID)

		if members.HomeBranchID == nil {
			log.Printf("Scanner: Member %s has no home branch assigned", qrData.MID)
			return nil, fmt.Errorf("member has no home branch assigned")
		}

		checkIn := &CheckIn{
			MemberID:       qrData.MID,
			SubscriptionID: subscription.ID,
			BranchID:       *members.HomeBranchID,
			Method:         "qr",
		}
		log.Printf("Scanner: Creating check-in record: %+v", checkIn)

		err = s.repo.UpsertSessionActivity(ctx, checkIn)
		if err != nil {
			log.Printf("Scanner: Failed to upsert session activity for check-in - %v", err)
			return nil, fmt.Errorf("failed to record check-in: %w", err)
		}

		log.Printf("Scanner: CHECK-IN successful for member %s at branch %s", qrData.MID, *members.HomeBranchID)
		return checkIn, nil
	}
	log.Printf("Scanner: Processing CHECK-OUT for member %s", qrData.MID)

	activity, err := s.repo.GetSessionActivity(ctx, qrData.MID)
	if err != nil {
		log.Printf("Scanner: Failed to get session activity for member %s - %v", qrData.MID, err)
		return nil, fmt.Errorf("no active check-in session found: %w", err)
	}
	log.Printf("Scanner: Found active session %s for member %s", activity.ID, qrData.MID)

	now := time.Now()
	checkIn := &CheckIn{
		ID:             activity.ID,
		MemberID:       activity.MemberID,
		SubscriptionID: activity.SubscriptionID,
		BranchID:       activity.BranchID,
		Method:         "qr",
		CheckOutTime:   &now,
	}
	log.Printf("Scanner: Creating check-out record: %+v", checkIn)

	err = s.repo.UpsertSessionActivity(ctx, checkIn)
	if err != nil {
		log.Printf("Scanner: Failed to upsert session activity for check-out - %v", err)
		return nil, fmt.Errorf("failed to record check-out: %w", err)
	}

	log.Printf("Scanner: CHECK-OUT successful for member %s at %s", qrData.MID, now.Format(time.RFC3339))
	return checkIn, nil
}

func (s *serviceImpl) ListMembers(ctx context.Context, page, limit int) ([]*Member, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit
	return s.repo.List(ctx, limit, offset)
}

func (s *serviceImpl) ListMembersByOrganization(ctx context.Context, organizationID uuid.UUID, page, limit int) ([]*Member, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit
	return s.repo.ListByOrganizationID(ctx, organizationID, limit, offset)
}

func (s *serviceImpl) GetSessionActivities(ctx context.Context, branchID uuid.UUID) ([]*CheckInWithMemberResponse, error) {
	checkIns, err := s.repo.GetSessionActivities(ctx, branchID)
	if err != nil {
		log.Printf("Service: GetSessionActivities failed - repository error: %v", err)
		return nil, err
	}

	responses := make([]*CheckInWithMemberResponse, len(checkIns))
	for i, checkIn := range checkIns {
		responses[i] = checkIn.ToResponse()
	}

	log.Printf("Service: GetSessionActivities succeeded - found %d active sessions for branch %s", len(checkIns), branchID)
	return responses, nil
}

func (s *serviceImpl) GetVisitorCount(ctx context.Context, branchID uuid.UUID) (*VisitorCountResponse, error) {
	count, err := s.repo.GetVisitorCount(ctx, branchID)
	if err != nil {
		log.Printf("Service: GetVisitorCount failed - repository error: %v", err)
		return nil, err
	}

	log.Printf("Service: GetVisitorCount succeeded - found %d visitors for branch %s", count, branchID)
	return &VisitorCountResponse{
		Count:    count,
		BranchID: branchID.String(),
	}, nil
}

func (s *serviceImpl) ListMembersWithFilter(ctx context.Context, filter *MemberListFilter, userRole string, userBranchIDs []uuid.UUID) ([]*Member, error) {
	switch userRole {
	case "staff":
		if len(userBranchIDs) == 0 {
			return []*Member{}, nil
		}
		if len(userBranchIDs) > 0 {
			filter.BranchID = &userBranchIDs[0]
		}
	case "admin":
	case "super_admin":
	default:
		return []*Member{}, nil
	}

	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 10
	}

	return s.repo.ListWithFilter(ctx, filter)
}

func (s *serviceImpl) GetAnalytics(ctx context.Context, userID uuid.UUID) (*WellnessAnalysisResponse, error) {
	// 0. Check Cache
	cacheKey := fmt.Sprintf("analytic:%s", userID.String())
	var cachedResponse WellnessAnalysisResponse
	if err := s.cacheSvc.Get(ctx, cacheKey, &cachedResponse); err == nil {
		log.Printf("Service: GetAnalytics - Cache hit for key: %s", cacheKey)
		return &cachedResponse, nil
	}

	// 1. Get Member
	member, err := s.repo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// 2. Prepare User Profile
	age := 0
	if member.DateOfBirth != nil {
		age = int(time.Since(*member.DateOfBirth).Hours() / 24 / 365)
	}

	// Default to "Unknown" as Gender is not in Member struct
	gender := "Unknown"

	var joinDateStr *string
	if member.JoinDate != nil {
		s := member.JoinDate.Format("2006-01-02")
		joinDateStr = &s
	}

	userProfile := UserProfile{
		UserID:   member.ID.String(),
		Age:      age,
		Gender:   gender,
		JoinDate: joinDateStr,
	}

	// 3. Activity Data
	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -30)

	attendance, err := s.GetAttendance(ctx, userID, startDate.Format("2006-01-02"), endDate.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}

	checkins := []string{}
	totalDuration := 0.0
	totalSessions := 0

	for _, a := range attendance {
		if a.IsAttendance {
			checkins = append(checkins, a.Date)
			totalDuration += float64(a.Duration)
			totalSessions++
		}
	}

	avgDurationMinutes := 0.0
	if totalSessions > 0 {
		// Assuming Duration is in minutes based on context, if seconds divide by 60
		avgDurationMinutes = totalDuration / float64(totalSessions)
	}

	activityData := ActivityData{
		Last30DaysCheckins:      checkins,
		AverageDurationMinutes:  avgDurationMinutes,
		TotalSessionsLast30Days: totalSessions,
	}

	// 4. Membership Info
	// Get Active Subscription
	sub, err := s.subSvc.GetActiveSubscription(ctx, member.ID)

	var membershipInfo *MembershipInfo
	if err == nil && sub != nil {
		daysUntil := int(time.Until(sub.EndDate).Hours() / 24)
		membershipInfo = &MembershipInfo{
			DaysUntilRenewal: daysUntil,
			RenewalHistory:   []string{}, // Can be populated if needed
		}
	}

	reqPayload := WellnessAnalysisRequest{
		UserProfile:    userProfile,
		ActivityData:   activityData,
		MembershipInfo: membershipInfo,
	}

	// 5. Call FastAPI
	fastApiUrl := config.Get().Analytics.ServiceURL + "/wellness"

	bodyBytes, err := json.Marshal(reqPayload)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", fastApiUrl, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Service: GetAnalytics failed to call FastAPI: %v", err)
		return nil, fmt.Errorf("failed to call analytics service")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Service: GetAnalytics FastAPI returned status: %d", resp.StatusCode)
		return nil, fmt.Errorf("analytics service returned error")
	}

	var analysis WellnessAnalysisResponse
	if err := json.NewDecoder(resp.Body).Decode(&analysis); err != nil {
		return nil, err
	}

	// 6. Set Cache (e.g., 24 hours)
	if err := s.cacheSvc.Set(ctx, cacheKey, analysis, 24*time.Hour); err != nil {
		log.Printf("Service: GetAnalytics failed to set cache: %v", err)
	}

	return &analysis, nil
}

func (s *serviceImpl) Chat(ctx context.Context, userID uuid.UUID, query string) (*ChatbotResponse, error) {

	member, err := s.repo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	session, err := s.chatSvc.GetOrCreateActiveSession(ctx, userID)
	if err != nil {
		return nil, err
	}

	age := 0
	if member.DateOfBirth != nil {
		age = int(time.Since(*member.DateOfBirth).Hours() / 24 / 365)
	}

	gender := "Unknown"

	var joinDateStr *string
	if member.JoinDate != nil {
		s := member.JoinDate.Format("2006-01-02")
		joinDateStr = &s
	}

	userProfile := UserProfile{
		UserID:   member.ID.String(),
		Age:      age,
		Gender:   gender,
		JoinDate: joinDateStr,
	}

	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -30)

	attendance, err := s.GetAttendance(ctx, userID, startDate.Format("2006-01-02"), endDate.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}

	checkins := []string{}
	totalDuration := 0.0
	totalSessions := 0

	for _, a := range attendance {
		if a.IsAttendance {
			checkins = append(checkins, a.Date)
			totalDuration += float64(a.Duration)
			totalSessions++
		}
	}

	avgDurationMinutes := 0.0
	if totalSessions > 0 {
		avgDurationMinutes = totalDuration / float64(totalSessions)
	}

	activityData := ActivityData{
		Last30DaysCheckins:      checkins,
		AverageDurationMinutes:  avgDurationMinutes,
		TotalSessionsLast30Days: totalSessions,
	}

	sub, err := s.subSvc.GetActiveSubscription(ctx, member.ID)

	var membershipInfo *MembershipInfo
	if err == nil && sub != nil {
		daysUntil := int(time.Until(sub.EndDate).Hours() / 24)
		membershipInfo = &MembershipInfo{
			DaysUntilRenewal: daysUntil,
			RenewalHistory:   []string{},
		}
	}

	reqPayload := ChatbotRequest{
		Query: query,
		Context: WellnessAnalysisRequest{
			UserProfile:    userProfile,
			ActivityData:   activityData,
			MembershipInfo: membershipInfo,
		},
	}

	contextData := map[string]interface{}{
		"user_profile":    userProfile,
		"activity_data":   activityData,
		"membership_info": membershipInfo,
	}
	_, err = s.chatSvc.AddUserMessage(ctx, session.ID, query, contextData)
	if err != nil {
		return nil, err
	}

	chatURL := config.Get().Analytics.ServiceURL
	chatURL = strings.Replace(chatURL, "/analyze", "/chat", 1)

	bodyBytes, err := json.Marshal(reqPayload)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", chatURL, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Service: Chat failed to call FastAPI: %v", err)
		return nil, fmt.Errorf("failed to call chat service")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Service: Chat FastAPI returned status: %d", resp.StatusCode)
		return nil, fmt.Errorf("chat service returned error")
	}

	var chatResponse ChatbotResponse
	if err := json.NewDecoder(resp.Body).Decode(&chatResponse); err != nil {
		return nil, err
	}

	_, err = s.chatSvc.AddAssistantMessage(ctx, session.ID, chatResponse.Answer, chatResponse.SuggestedActions, nil)
	if err != nil {
		return nil, err
	}

	return &chatResponse, nil
}

// ============================================
// Chat Session Methods
// ============================================

func (s *serviceImpl) GetChatSessions(ctx context.Context, userID uuid.UUID, page, limit int) ([]*chat.ChatSessionResponse, error) {
	return s.chatSvc.ListSessions(ctx, userID, page, limit)
}

func (s *serviceImpl) CreateChatSession(ctx context.Context, userID uuid.UUID, req *chat.CreateSessionRequest) (*chat.ChatSessionResponse, error) {
	return s.chatSvc.CreateSession(ctx, userID, req)
}

func (s *serviceImpl) GetChatSessionWithMessages(ctx context.Context, userID uuid.UUID, sessionID uuid.UUID, messageLimit int) (*chat.ChatSessionWithMessagesResponse, error) {
	return s.chatSvc.GetSessionWithMessages(ctx, userID, sessionID, messageLimit)
}

func (s *serviceImpl) DeleteChatSession(ctx context.Context, userID uuid.UUID, sessionID uuid.UUID) error {
	return s.chatSvc.DeleteSession(ctx, userID, sessionID)
}

func (s *serviceImpl) GetChatMessages(ctx context.Context, userID uuid.UUID, sessionID uuid.UUID, page, limit int) ([]*chat.ChatMessageResponse, error) {
	// First verify the user has access to this session
	_, err := s.chatSvc.GetSession(ctx, userID, sessionID)
	if err != nil {
		return nil, err
	}

	return s.chatSvc.GetMessages(ctx, sessionID, page, limit)
}
