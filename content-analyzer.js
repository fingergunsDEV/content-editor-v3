import { SentimentAnalyzer } from './sentiment-analyzer.js';
import { LinguisticAnalyzer } from './linguistic-analyzer.js';

export class ContentAnalyzer {
  constructor(editor) {
    this.editor = editor;
    this.sentimentAnalyzer = new SentimentAnalyzer();
    this.linguisticAnalyzer = new LinguisticAnalyzer();
    this.results = {
      keyword: null,
      sentiment: null,
      readability: null,
      linguistic: null
    };
    this.stopWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at']);
  }

  async analyze(keywords) {
    const text = this.editor.getText();
    if (!text.trim()) {
      throw new Error('Please enter some content to analyze');
    }

    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    
    // Run all analyses in parallel
    const [
      keywordResults,
      sentimentResults,
      linguisticResults,
      readabilityResults
    ] = await Promise.all([
      this.analyzeKeywords(words, keywords),
      this.analyzeSentiment(text),
      this.analyzeLinguistic(text),
      this.analyzeReadability(text, words)
    ]);

    // Display results
    this.displayResults(keywordResults, sentimentResults, linguisticResults, readabilityResults);
    
    // Return combined results for summary
    return {
      keywords: keywordResults,
      sentiment: sentimentResults,
      linguistic: linguisticResults,
      readability: readabilityResults
    };
  }

  async analyzeKeywords(words, keywords) {
    // Keyword density analysis
    const densityResults = keywords.map(keyword => {
      const count = words.filter(w => w === keyword).length;
      const density = (count / words.length) * 100;
      return { keyword, count, density: density.toFixed(2) };
    });

    // TF-IDF analysis
    const termFreq = {};
    words.filter(w => !this.stopWords.has(w)).forEach(word => {
      termFreq[word] = (termFreq[word] || 0) + 1;
    });

    const tfidfResults = Object.entries(termFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([term, freq]) => ({
        term,
        frequency: freq,
        score: (freq / words.length).toFixed(3)
      }));

    this.displayKeywordResults(densityResults, tfidfResults);
    return {
      density: densityResults,
      tfidf: tfidfResults
    };
  }

  async analyzeSentiment(text) {
    const results = this.sentimentAnalyzer.analyze(text);
    this.displaySentimentResults(results);
    return results;
  }

  async analyzeLinguistic(text) {
    const results = this.linguisticAnalyzer.analyze(text);
    this.linguisticAnalyzer.displayResults(results);
    return results;
  }

  async analyzeReadability(text, words) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const syllables = this.countSyllables(text);
    
    const results = {
      fleschKincaid: this.calculateFleschKincaid(words.length, sentences.length, syllables),
      avgSentenceLength: (words.length / sentences.length).toFixed(1),
      avgWordLength: (text.length / words.length).toFixed(1),
      totalWords: words.length,
      totalSentences: sentences.length
    };

    this.displayReadabilityResults(results);
    return results;
  }

  async analyzeEntities(text) {
    const doc = window.nlp(text);
    
    const entities = {
      people: doc.people().out('array'),
      organizations: doc.organizations().out('array'),
      places: doc.places().out('array')
    };

    this.displayEntityResults(entities);
    return entities;
  }

  getAnalysisSummary() {
    const keywordScore = this.calculateKeywordScore();
    const readabilityScore = this.calculateReadabilityScore();
    const contentScore = this.calculateContentScore();
    const sentimentScore = this.results.sentiment ? this.results.sentiment.score : 0;

    const overallScore = Math.round(
      (keywordScore + readabilityScore + contentScore) / 3
    );

    return {
      overallScore,
      keywordScore,
      readabilityScore,
      contentScore,
      sentimentScore,
      sentimentLabel: this.getSentimentLabel(sentimentScore)
    };
  }

  calculateKeywordScore() {
    if (!this.results.keyword) return 0;
    
    const metrics = this.results.keyword;
    let score = 100;

    // Penalize for keyword stuffing
    if (metrics.density[0].density > 5) {
      score -= (metrics.density[0].density - 5) * 10;
    }
    
    // Penalize for low keyword presence
    if (metrics.density[0].density < 1) {
      score -= (1 - metrics.density[0].density) * 20;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  calculateReadabilityScore() {
    if (!this.results.readability) return 0;
    
    const metrics = this.results.readability;
    let score = 100;

    // Penalize for extreme reading levels
    if (metrics.fleschKincaid < 30 || metrics.fleschKincaid > 70) {
      score -= 20;
    }

    // Penalize for very long sentences
    if (metrics.avgSentenceLength > 25) {
      score -= 15;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  calculateContentScore() {
    if (!this.results.linguistic) return 0;
    
    const metrics = this.results.linguistic;
    let score = 100;

    // Penalize for low vocabulary diversity
    if (metrics.vocabulary.lexicalDensity < 40) {
      score -= 20;
    }

    // Penalize for lack of structural variety
    if (Object.values(metrics.grammar.sentenceTypes).some(count => count === 0)) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  displayResults(keywordResults, sentimentResults, linguisticResults, readabilityResults) {
    this.displayKeywordResults(keywordResults.density, keywordResults.tfidf);
    this.displaySentimentResults(sentimentResults);
    this.linguisticAnalyzer.displayResults(linguisticResults);
    this.displayReadabilityResults(readabilityResults);
  }

  getSentimentLabel(score) {
    if (score > 0.5) return 'Very Positive';
    if (score > 0) return 'Positive';
    if (score === 0) return 'Neutral';
    if (score > -0.5) return 'Negative';
    return 'Very Negative';
  }

  displaySentimentResults(results) {
    // Update sentiment chart
    const ctx = document.getElementById('sentimentChart');
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Positive', 'Neutral', 'Negative'],
          datasets: [{
            data: [
              results.distribution.positive,
              results.distribution.neutral,
              results.distribution.negative
            ],
            backgroundColor: ['#4caf50', '#ffd700', '#f44336']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }

    // Update sentiment metrics
    document.getElementById('sentimentResults').innerHTML = `
      <div class="metric-item">
        <span>Overall Sentiment</span>
        <span class="metric-value ${results.score >= 0 ? 'quality-good' : 'quality-warning'}">
          ${results.label} (${results.score.toFixed(2)})
        </span>
      </div>
      <div class="metric-item">
        <span>Sentence Distribution</span>
        <div class="metric-value">
          <div>Positive: ${results.distribution.positive}</div>
          <div>Neutral: ${results.distribution.neutral}</div>
          <div>Negative: ${results.distribution.negative}</div>
        </div>
      </div>
    `;
  }

  displayKeywordResults(densityResults, tfidfResults) {
    const densityHtml = densityResults
      .map(({ keyword, count, density }) => `
        <div class="metric-item">
          <span>"${keyword}"</span>
          <span class="metric-value ${density > 5 ? 'quality-warning' : 'quality-good'}">
            ${density}% (${count} occurrences)
          </span>
        </div>
      `)
      .join('');

    const tfidfHtml = tfidfResults
      .map(({ term, frequency, score }) => `
        <div class="metric-item">
          <span>${term}</span>
          <span class="metric-value">${frequency} (${score})</span>
        </div>
      `)
      .join('');

    document.getElementById('densityResults').innerHTML = densityHtml;
    document.getElementById('tfidfResults').innerHTML = tfidfHtml;
  }

  displayEntityResults(entities) {
    const createEntityTags = (items) => items
      .map(item => `<span class="entity-tag">${item}</span>`)
      .join('');

    document.querySelector('#peopleEntities .entity-tags').innerHTML = 
      createEntityTags(entities.people);
    document.querySelector('#organizationEntities .entity-tags').innerHTML = 
      createEntityTags(entities.organizations);
    document.querySelector('#locationEntities .entity-tags').innerHTML = 
      createEntityTags(entities.places);
  }

  displayReadabilityResults(results) {
    const readabilityScore = results.fleschKincaid;
    let readabilityLevel = 'Easy';
    if (readabilityScore < 30) readabilityLevel = 'Very Difficult';
    else if (readabilityScore < 50) readabilityLevel = 'Difficult';
    else if (readabilityScore < 60) readabilityLevel = 'Fairly Difficult';
    else if (readabilityScore < 70) readabilityLevel = 'Standard';

    document.getElementById('readabilityResults').innerHTML = `
      <div class="metric-item">
        <span>Readability Score</span>
        <span class="metric-value">${readabilityScore} - ${readabilityLevel}</span>
      </div>
      <div class="metric-item">
        <span>Average Sentence Length</span>
        <span class="metric-value">${results.avgSentenceLength} words</span>
      </div>
      <div class="metric-item">
        <span>Average Word Length</span>
        <span class="metric-value">${results.avgWordLength} characters</span>
      </div>
    `;

    // Add quality assessment
    const qualityIssues = [];
    if (results.totalWords < 300) {
      qualityIssues.push('Content length is below recommended minimum (300 words)');
    }
    if (results.avgSentenceLength > 25) {
      qualityIssues.push('Average sentence length is too high (aim for 15-20 words)');
    }

    document.getElementById('qualityResults').innerHTML = qualityIssues.length ? 
      qualityIssues.map(issue => `
        <div class="metric-item quality-warning">
          <span> ${issue}</span>
        </div>
      `).join('') :
      '<div class="metric-item quality-good"> No major content issues detected</div>';
  }

  countSyllables(text) {
    return text.toLowerCase()
      .replace(/[^a-z]/g, '')
      .replace(/[^aeiouy]*[aeiouy]+/g, 'a')
      .length;
  }

  calculateFleschKincaid(words, sentences, syllables) {
    return Math.round(206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words));
  }
}