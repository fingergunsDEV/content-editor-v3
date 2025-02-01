export class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.loadSavedTheme();
  }

  loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
  }

  setTheme(theme) {
    // Remove all theme classes
    document.body.classList.remove(
      'theme-light',
      'theme-dark',
      'theme-gradient',
      'theme-glass',
      'theme-neomorphic'
    );
    
    // Add new theme class
    document.body.classList.add(`theme-${theme}`);
    
    // Save theme preference
    localStorage.setItem('theme', theme);
    this.currentTheme = theme;

    // Special handling for glass theme
    if (theme === 'glass') {
      document.body.style.background = 'url(https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D) center/cover fixed';
    } else {
      document.body.style.background = '';
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }
}