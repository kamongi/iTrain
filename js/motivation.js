// Motivation Engine — 50+ quotes from legends
// Displayed randomly on each session load

export const quotes = [
    // Arnold Schwarzenegger
    "The last three or four reps is what makes the muscle grow. — Arnold Schwarzenegger",
    "Strength does not come from winning. Your struggles develop your strengths. — Arnold Schwarzenegger",
    "The mind is the limit. As long as the mind can envision the fact that you can do something, you can do it. — Arnold Schwarzenegger",
    "The worst thing I can be is the same as everybody else. I hate that. — Arnold Schwarzenegger",
    "For me, life is continuously being hungry. The meaning of life is not simply to exist, to survive, but to move ahead, to go up, to achieve, to conquer. — Arnold Schwarzenegger",
    "You can't climb the ladder of success with your hands in your pockets. — Arnold Schwarzenegger",

    // Dr. John Rusin
    "Train the movement, not the muscle. Master the pattern first. — Dr. John Rusin",
    "Pain-free training isn't a luxury — it's a prerequisite. — Dr. John Rusin",
    "The goal isn't to survive the workout. It's to thrive because of it. — Dr. John Rusin",
    "Intelligent programming beats hard programming every single time. — Dr. John Rusin",
    "If you can't control the weight, the weight is controlling you. — Dr. John Rusin",
    "Longevity in the gym starts with respecting your joints today. — Dr. John Rusin",
    "The best program is one you can recover from. — Dr. John Rusin",
    "Stop chasing soreness. Start chasing performance. — Dr. John Rusin",

    // Josh Shepherd — Technical Cues
    "Brace like someone is about to punch you in the gut. Every rep. — Josh Shepherd",
    "Own the eccentric. The lowering phase is where strength is built. — Josh Shepherd",
    "If you can't pause it at the bottom, you don't own it yet. — Josh Shepherd",
    "Squeeze the bar like you're trying to leave fingerprints in steel. — Josh Shepherd",
    "Your warm-up sets should look identical to your work sets. Same intent. — Josh Shepherd",
    "Drive your feet through the floor. The ground is your foundation. — Josh Shepherd",
    "Slow is smooth, smooth is strong. — Josh Shepherd",
    "Pack your shoulders. Protect the joint. Move with intent. — Josh Shepherd",
    "A rep without tension is a wasted rep. — Josh Shepherd",
    "Control the weight on the way down. Explode on the way up. — Josh Shepherd",
    "Don't just lift the weight — own it through the entire range. — Josh Shepherd",

    // General Lifting Wisdom
    "The iron never lies to you. Two hundred pounds is always two hundred pounds. — Henry Rollins",
    "No citizen has a right to be an amateur in the matter of physical training. — Socrates",
    "The pain you feel today will be the strength you feel tomorrow.",
    "Discipline is choosing between what you want now and what you want most.",
    "You don't have to be extreme, just consistent.",
    "The only bad workout is the one that didn't happen.",
    "Small progress is still progress.",
    "Trust the process. The results will come.",
    "Showing up is 90% of the battle. The other 10% is not quitting.",
    "Your body can stand almost anything. It's your mind you have to convince.",
    "Fall in love with the process and the results will come.",
    "It's not about being the best. It's about being better than you were yesterday.",
    "Motivation gets you started. Habit keeps you going.",
    "The weight room is the great equalizer. Gravity doesn't care about your excuses.",
    "Respect the rest. Recovery is where growth happens.",
    "You are one workout away from a better mood.",
    "Consistency beats intensity. Every. Single. Time.",
    "The best time to plant a tree was 20 years ago. The second best time is now. Start lifting.",
    "Champions are made in the sessions nobody sees.",
    "Strong people are harder to kill and more useful in general. — Mark Rippetoe",
    "There is no reason to be alive if you can't do deadlift. — Jón Páll Sigmarsson",
    "Everybody wants to be a bodybuilder, but nobody wants to lift no heavy weights. — Ronnie Coleman",
    "To be number one, you have to train like you're number two. — Maurice Greene",
    "Success isn't always about greatness. It's about consistency. Consistent hard work leads to success.",
    "Once you learn to quit, it becomes a habit. — Vince Lombardi",
    "The clock is ticking. Are you becoming the person you want to be? — Greg Plitt",
    "Think of your workouts as important meetings you scheduled with yourself. — Unknown",
    "If something stands between you and your success, move it. Never be denied. — Dwayne Johnson",
    "I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times. — Bruce Lee",
    "Strong foundations first. Progress follows.",
    "Today's effort is tomorrow's PR.",
    "Earn your rest. Then take it fully."
];

/**
 * Returns a random motivational quote.
 */
export function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
}
