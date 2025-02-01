export class Editor {
  constructor() {
    this.editor = document.getElementById('editor');
    this.wordCount = document.getElementById('wordCount');
    this.charCount = document.getElementById('charCount');
    this.undoStack = [];
    this.redoStack = [];
    this.lastSavedContent = '';
    
    this.init();
  }

  init() {
    this.setupToolbarButtons();
    this.setupKeyboardShortcuts();
    this.setupEditorEvents();
    this.loadContent();
    this.startAutoSave();
  }

  setupToolbarButtons() {
    const buttons = {
      boldBtn: 'bold',
      italicBtn: 'italic',
      underlineBtn: 'underline',
      undoBtn: () => this.undo(),
      redoBtn: () => this.redo()
    };

    for (const [id, action] of Object.entries(buttons)) {
      const button = document.getElementById(id);
      if (button) {
        button.addEventListener('click', () => {
          if (typeof action === 'function') {
            action();
          } else {
            document.execCommand(action, false);
          }
          this.editor.focus();
        });
      }
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            document.execCommand('bold', false);
            break;
          case 'i':
            e.preventDefault();
            document.execCommand('italic', false);
            break;
          case 'u':
            e.preventDefault();
            document.execCommand('underline', false);
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              this.redo();
            } else {
              this.undo();
            }
            break;
          case 'y':
            e.preventDefault();
            this.redo();
            break;
        }
      }
    });
  }

  setupEditorEvents() {
    this.editor.addEventListener('input', () => {
      this.updateWordCount();
      this.saveState();
    });

    this.editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        document.execCommand('insertHTML', false, '&#009');
      }
    });
  }

  updateWordCount() {
    const text = this.editor.innerText;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    
    this.wordCount.textContent = `Words: ${words}`;
    this.charCount.textContent = `Characters: ${chars}`;
  }

  saveState() {
    const content = this.editor.innerHTML;
    if (content !== this.lastSavedContent) {
      this.undoStack.push(this.lastSavedContent);
      this.lastSavedContent = content;
      this.redoStack = [];
    }
  }

  undo() {
    if (this.undoStack.length > 0) {
      const content = this.undoStack.pop();
      this.redoStack.push(this.lastSavedContent);
      this.editor.innerHTML = content;
      this.lastSavedContent = content;
      this.updateWordCount();
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      const content = this.redoStack.pop();
      this.undoStack.push(this.lastSavedContent);
      this.editor.innerHTML = content;
      this.lastSavedContent = content;
      this.updateWordCount();
    }
  }

  loadContent() {
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
      this.editor.innerHTML = savedContent;
      this.lastSavedContent = savedContent;
      this.updateWordCount();
    }
  }

  startAutoSave() {
    setInterval(() => {
      localStorage.setItem('editorContent', this.editor.innerHTML);
    }, 5000);
  }

  getText() {
    return this.editor.innerText;
  }

  getHTML() {
    return this.editor.innerHTML;
  }
}

// Initialize editor
new Editor();