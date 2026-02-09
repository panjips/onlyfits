export const DASHBOARD_DATA = {
    attendance_analysis: {
        score: 96,
        consistency_level: "High",
        score_explanation: "Your score of 96 out of 100 shows that you're doing an amazing job with your fitness habits! It's like getting an A+ on a project—you've put in the effort and it really shows.",
        pattern_insight: "You're mostly hitting your sessions during the week with a couple of spots on weekends, which suggests you're a Weekday Regular. This pattern indicates that you're making a routine out of your fitness, which is fantastic!",
        renewal_behavior_insight: "Since you don't currently have a membership, it looks like you're still exploring options to support your fitness journey.",
        positive_nudge: "It's fantastic that you've already completed 12 sessions in the last 30 days—keep up the great work!",
        recommendation: "Consider blocking out Wednesday at 7pm for a consistent workout slot!"
    },
    burnout_analysis: {
        risk_score: 56,
        risk_level: "Moderate",
        warning_signs: [
            "Engaged in 12 training sessions over the last 30 days, averaging 2.4 sessions per week.",
            "Log shows 10 training days without any rest days, indicating potential overtraining.",
            "Sessions average 75.5 minutes, nearing the threshold where recreational sessions typically become taxing."
        ],
        recovery_suggestion: "Incorporate at least 1 rest day per week to allow for recovery. Consider reducing session duration to under 90 minutes to avoid excessive strain. Mix lower-intensity sessions to maintain fitness with less risk of burnout.",
        key_metrics: {
            avg_sessions_per_week: 2.4,
            consecutive_training_days_max: 10,
            rest_days_last_30: 0
        }
    }
};
