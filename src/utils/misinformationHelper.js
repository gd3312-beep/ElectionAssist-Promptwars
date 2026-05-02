/**
 * Checks for common misinformation keywords locally.
 * Returns a warning string if found, otherwise null.
 */
export function checkMisinformation(text) {
  const lowerText = text.toLowerCase();
  
  const rules = [
    {
      keywords: ["vote by text", "text to vote", "sms voting"],
      warning: "Warning: You cannot vote via text message in official elections. Voting is done in person or via official mail-in ballots."
    },
    {
      keywords: ["election cancelled", "postponed election", "delayed election"],
      warning: "Warning: Always verify election date changes with your official local election board. Do not trust social media rumors about cancellations."
    },
    {
      keywords: ["vote twice", "vote online"],
      warning: "Warning: Voting online is generally not permitted for federal/state elections, and voting twice is illegal."
    }
  ];

  for (const rule of rules) {
    if (rule.keywords.some(kw => lowerText.includes(kw))) {
      return rule.warning;
    }
  }

  return null;
}
