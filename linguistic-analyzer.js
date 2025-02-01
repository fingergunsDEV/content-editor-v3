export class LinguisticAnalyzer {
  constructor() {
    // Load natural language processing library
    this.loadNLP();
  }

  async loadNLP() {
    // Load additional NLP models if needed
    await Promise.all([
      import('https://unpkg.com/compromise@latest/builds/compromise.min.js'),
      import('https://unpkg.com/compromise-numbers@latest/builds/compromise-numbers.min.js')
    ]);
  }

  analyze(text) {
    const doc = window.nlp(text);
    
    return {
      grammar: this.analyzeGrammar(doc),
      partsOfSpeech: this.analyzePartsOfSpeech(doc),
      vocabulary: this.analyzeVocabulary(doc),
      complexity: this.analyzeComplexity(text)
    };
  }

  analyzeGrammar(doc) {
    const sentences = doc.sentences().out('array');
    
    return {
      sentenceTypes: this.getSentenceTypes(sentences),
      verbTenses: this.getVerbTenses(doc),
      clauses: this.analyzeClauses(sentences)
    };
  }

  getSentenceTypes(sentences) {
    return {
      declarative: sentences.filter(s => /[.]\s*$/.test(s)).length,
      interrogative: sentences.filter(s => /[?]\s*$/.test(s)).length,
      exclamatory: sentences.filter(s => /[!]\s*$/.test(s)).length,
      imperative: sentences.filter(s => /^(Please |Let |Do |Don't)/.test(s)).length
    };
  }

  getVerbTenses(doc) {
    return {
      present: doc.match('#PresentTense').length,
      past: doc.match('#PastTense').length,
      future: doc.match('#Future').length
    };
  }

  analyzeClauses(sentences) {
    return {
      simple: sentences.filter(s => !(/,|;|but|and|or|nor|for|so|yet/.test(s))).length,
      compound: sentences.filter(s => /(and|or|but|nor|for|so|yet)/.test(s)).length,
      complex: sentences.filter(s => /(because|although|if|when|while|unless|after|before)/.test(s)).length
    };
  }

  analyzePartsOfSpeech(doc) {
    return {
      nouns: doc.nouns().length,
      verbs: doc.verbs().length,
      adjectives: doc.match('#Adjective').length,
      adverbs: doc.match('#Adverb').length,
      pronouns: doc.match('#Pronoun').length,
      prepositions: doc.match('#Preposition').length
    };
  }

  analyzeVocabulary(doc) {
    const words = doc.terms().out('array');
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    
    return {
      totalWords: words.length,
      uniqueWords: uniqueWords.size,
      lexicalDensity: (uniqueWords.size / words.length * 100).toFixed(1),
      averageWordLength: (words.join('').length / words.length).toFixed(1),
      longWords: words.filter(w => w.length > 6).length
    };
  }

  analyzeComplexity(text) {
    const words = text.split(/\s+/);
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const syllables = this.countSyllables(text);

    return {
      fleschKincaid: this.calculateFleschKincaid(words.length, sentences.length, syllables),
      averageSentenceLength: (words.length / sentences.length).toFixed(1),
      averageWordLength: (text.length / words.length).toFixed(1),
      syllablesPerWord: (syllables / words.length).toFixed(1)
    };
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

  displayResults(results) {
    const linguisticPanel = document.getElementById('linguistic-panel');
    
    // Grammar Analysis
    const grammarHtml = `
      <div class="metric-card">
        <h4>Grammar Analysis</h4>
        <div class="metric-item">
          <span>Sentence Types:</span>
          <div class="metric-value">
            <div>Declarative: ${results.grammar.sentenceTypes.declarative}</div>
            <div>Interrogative: ${results.grammar.sentenceTypes.interrogative}</div>
            <div>Exclamatory: ${results.grammar.sentenceTypes.exclamatory}</div>
            <div>Imperative: ${results.grammar.sentenceTypes.imperative}</div>
          </div>
        </div>
      </div>
    `;

    // Parts of Speech Distribution
    const posChart = document.getElementById('posChart');
    new Chart(posChart, {
      type: 'radar',
      data: {
        labels: Object.keys(results.partsOfSpeech),
        datasets: [{
          label: 'Distribution',
          data: Object.values(results.partsOfSpeech),
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2
        }]
      },
      options: {
        scales: {
          r: {
            beginAtZero: true
          }
        }
      }
    });

    // Vocabulary Analysis
    const vocabularyHtml = `
      <div class="metric-card">
        <h4>Vocabulary Analysis</h4>
        <div class="metric-item">
          <span>Total Words:</span>
          <span class="metric-value">${results.vocabulary.totalWords}</span>
        </div>
        <div class="metric-item">
          <span>Unique Words:</span>
          <span class="metric-value">${results.vocabulary.uniqueWords}</span>
        </div>
        <div class="metric-item">
          <span>Lexical Density:</span>
          <span class="metric-value">${results.vocabulary.lexicalDensity}%</span>
        </div>
        <div class="metric-item">
          <span>Long Words:</span>
          <span class="metric-value">${results.vocabulary.longWords}</span>
        </div>
      </div>
    `;

    // Update the panel content
    linguisticPanel.innerHTML = grammarHtml + 
      '<div class="linguistic-chart"><canvas id="posChart"></canvas></div>' + 
      vocabularyHtml;
  }
}