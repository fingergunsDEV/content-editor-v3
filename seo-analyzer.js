export class SEOAnalyzer {
  constructor(editor) {
    this.editor = editor;
    this.stopWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', ]);
  }

  analyze() {
    const keywords = document.getElementById('keywordsInput').value
      .toLowerCase()
      .split(',')
      .map(k => k.trim())
      .filter(k => k);

    const text = this.editor.getText().toLowerCase();
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;

    const densityResults = this.calculateKeywordDensity(words, keywords);
    this.displayDensityResults(densityResults);

    const tfidfScores = this.calculateTFIDF(words);
    this.displayTFIDFResults(tfidfScores);

    const qualityMetrics = this.analyzeContentQuality(words, keywords);
    this.displayQualityResults(qualityMetrics);
  }

  calculateKeywordDensity(words, keywords) {
    const results = {};
    keywords.forEach(keyword => {
      const count = words.filter(word => word === keyword).length;
      const density = (count / words.length) * 100;
      results[keyword] = {
        count,
        density: density.toFixed(2)
      };
    });
    return results;
  }

  calculateTFIDF(words) {
    const termFreq = {};
    const filtered = words.filter(word => !this.stopWords.has(word));
    
    filtered.forEach(word => {
      termFreq[word] = (termFreq[word] || 0) + 1;
    });

    return Object.entries(termFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([term, freq]) => ({
        term,
        score: (freq / words.length).toFixed(3)
      }));
  }

  analyzeContentQuality(words, keywords) {
    const metrics = {
      totalWords: words.length,
      avgWordLength: (words.join('').length / words.length).toFixed(1),
      keywordDensityStatus: 'good',
      contentLengthStatus: 'good',
      warnings: []
    };

    keywords.forEach(keyword => {
      const density = (words.filter(w => w === keyword).length / words.length) * 100;
      if (density > 5) {
        metrics.keywordDensityStatus = 'warning';
        metrics.warnings.push(`High keyword density (${density.toFixed(1)}%) for "${keyword}"`);
      }
    });

    if (words.length < 300) {
      metrics.contentLengthStatus = 'warning';
      metrics.warnings.push('Content length is below recommended minimum (300 words)');
    }

    return metrics;
  }

  displayDensityResults(results) {
    const container = document.getElementById('densityResults');
    container.innerHTML = Object.entries(results)
      .map(([keyword, data]) => `
        <div class="metric-item">
          <span>"${keyword}"</span>
          <span class="metric-value">${data.density}% (${data.count} occurrences)</span>
        </div>
      `).join('');
  }

  displayTFIDFResults(scores) {
    const container = document.getElementById('tfidfResults');
    container.innerHTML = scores
      .map(({term, score}) => `
        <div class="metric-item">
          <span>${term}</span>
          <span class="metric-value">${score}</span>
        </div>
      `).join('');
  }

  displayQualityResults(metrics) {
    const container = document.getElementById('qualityResults');
    container.innerHTML = `
      <div class="metric-item">
        <span>Word Count</span>
        <span class="metric-value ${metrics.contentLengthStatus}">${metrics.totalWords}</span>
      </div>
      <div class="metric-item">
        <span>Average Word Length</span>
        <span class="metric-value">${metrics.avgWordLength} chars</span>
      </div>
      ${metrics.warnings.map(warning => `
        <div class="metric-item quality-warning">
          <span>⚠️ ${warning}</span>
        </div>
      `).join('')}
    `;
  }
}