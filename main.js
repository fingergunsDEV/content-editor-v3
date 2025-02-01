import { Editor } from './editor.js';
import { ContentAnalyzer } from './analyzer/content-analyzer.js';
import { ThemeManager } from './theme-manager.js';

const editor = new Editor();
const analyzer = new ContentAnalyzer(editor);
const themeManager = new ThemeManager();

// Initialize theme manager
document.querySelectorAll('.theme-btn').forEach(button => {
  button.addEventListener('click', () => {
    const theme = button.dataset.theme;
    themeManager.setTheme(theme);
    
    // Update active state
    document.querySelectorAll('.theme-btn').forEach(btn => 
      btn.classList.toggle('active', btn === button));
  });
});

// Set up tab switching
document.querySelectorAll('.nav-tab').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.nav-tab').forEach(btn => 
      btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => 
      panel.classList.remove('active'));
    
    button.classList.add('active');
    const panelId = `${button.dataset.tab}-panel`;
    document.getElementById(panelId)?.classList.add('active');
  });
});

// Enhance the analysis trigger
document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const keywords = document.getElementById('keywordsInput').value
    .toLowerCase()
    .split(',')
    .map(k => k.trim())
    .filter(k => k);

  if (!keywords.length) {
    alert('Please enter at least one keyword to analyze');
    return;
  }

  try {
    const button = document.getElementById('analyzeBtn');
    button.disabled = true;
    button.textContent = 'Analyzing...';
    
    await analyzer.analyze(keywords);
    
    // Auto-switch to keywords tab after analysis
    document.querySelector('.nav-tab[data-tab="keywords"]').click();
    
    // Update summary in side menu
    updateAnalysisSummary(analyzer.getAnalysisSummary());
  } catch (error) {
    console.error('Analysis failed:', error);
    alert('Analysis failed. Please try again.');
  } finally {
    const button = document.getElementById('analyzeBtn');
    button.disabled = false;
    button.textContent = 'Analyze Content';
  }
});

function updateAnalysisSummary(summary) {
  const summaryHtml = `
    <div class="metric-card">
      <div class="metric-item">
        <span>Overall Score</span>
        <span class="metric-value ${summary.overallScore >= 70 ? 'quality-good' : 'quality-warning'}">
          ${summary.overallScore}/100
        </span>
      </div>
      <div class="metric-item">
        <span>Keyword Optimization</span>
        <span class="metric-value ${summary.keywordScore >= 70 ? 'quality-good' : 'quality-warning'}">
          ${summary.keywordScore}/100
        </span>
      </div>
      <div class="metric-item">
        <span>Readability</span>
        <span class="metric-value ${summary.readabilityScore >= 70 ? 'quality-good' : 'quality-warning'}">
          ${summary.readabilityScore}/100
        </span>
      </div>
      <div class="metric-item">
        <span>Content Quality</span>
        <span class="metric-value ${summary.contentScore >= 70 ? 'quality-good' : 'quality-warning'}">
          ${summary.contentScore}/100
        </span>
      </div>
      <div class="metric-item">
        <span>Sentiment</span>
        <span class="metric-value ${summary.sentimentScore >= 0 ? 'quality-good' : 'quality-warning'}">
          ${summary.sentimentLabel} (${summary.sentimentScore})
        </span>
      </div>
    </div>
  `;
  
  document.getElementById('summaryResults').innerHTML = summaryHtml;
}

// Initialize with sample text if editor is empty
if (!editor.getText().trim()) {
  editor.setContent(`Sample text for analysis. Enter your content here...`);
}