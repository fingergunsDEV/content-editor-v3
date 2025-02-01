export class SentimentAnalyzer {
  constructor() {
    // Sentiment word lists
    this.positive = new Set(['good', 'great', 'awesome', 'excellent', 'happy', 'love', 'wonderful', 'fantastic']);
    this.negative = new Set(['bad', 'poor', 'terrible', 'awful', 'hate', 'horrible', 'disappointing', 'sad']);
    this.intensifiers = new Set(['very', 'extremely', 'really', 'quite', 'absolutely']);
  }

  analyze(text) {
    const sentences = text.toLowerCase().match(/[^.!?]+[.!?]+/g) || [];
    const sentimentScores = sentences.map(sentence => this.analyzeSentence(sentence));
    
    const overallScore = sentimentScores.reduce((sum, score) => sum + score, 0) / sentences.length;
    
    return {
      score: overallScore,
      label: this.getSentimentLabel(overallScore),
      sentences: sentimentScores,
      distribution: {
        positive: sentimentScores.filter(score => score > 0).length,
        neutral: sentimentScores.filter(score => score === 0).length,
        negative: sentimentScores.filter(score => score < 0).length
      }
    };
  }

  analyzeSentence(sentence) {
    const words = sentence.split(/\s+/);
    let score = 0;
    let intensifier = 1;

    words.forEach((word, i) => {
      if (this.intensifiers.has(word)) {
        intensifier = 2;
        return;
      }

      if (this.positive.has(word)) {
        score += 1 * intensifier;
      } else if (this.negative.has(word)) {
        score -= 1 * intensifier;
      }

      intensifier = 1; // Reset intensifier for next word
    });

    // Normalize score to range [-1, 1]
    return score === 0 ? 0 : score / Math.abs(score);
  }

  getSentimentLabel(score) {
    if (score > 0.5) return 'Very Positive';
    if (score > 0) return 'Positive';
    if (score === 0) return 'Neutral';
    if (score > -0.5) return 'Negative';
    return 'Very Negative';
  }
}