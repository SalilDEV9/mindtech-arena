/**
 * MINDMIND Cyber Arena - Tactical Kit & HUD Alert System
 * Manages tactical lifelines, floating notifications, and HUD updates (Credits & Store removed)
 */

class TacticalKitSystem {
  constructor() {
    this.storageKey = 'mindmind_tactical_kit_v2';
    this.defaultState = {
      inventory: {
        chrono_stasis: 1, // 1 Tactical Freeze
        data_purge: 1,    // 1 Tactical 50/50
        cyber_lens: 1,    // 1 Tactical Diagnostic Hint
        firewall_shield: 0,
        codex_unlocked: true // Codex is free for all teams
      }
    };
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          inventory: {
            ...this.defaultState.inventory,
            ...(parsed.inventory || {})
          }
        };
      }
    } catch (e) {
      console.warn("Using default tactical kit state:", e);
    }
    return JSON.parse(JSON.stringify(this.defaultState));
  }

  saveState() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    this.updateHUD();
  }

  resetStore() {
    this.state = JSON.parse(JSON.stringify(this.defaultState));
    this.saveState();
  }

  // Compatibility stubs for legacy credit callers
  getCredits() {
    return 0;
  }

  addCredits(amount, reason = "") {
    // Credits system removed - purely score and time bonus based
  }

  spendCredits(amount) {
    return true;
  }

  getInventoryCount(itemId) {
    if (itemId === 'codex_unlocked') return 1;
    return this.state.inventory[itemId] || 0;
  }

  hasPerk(itemId) {
    if (itemId === 'codex_unlocked') return true;
    return (this.state.inventory[itemId] || 0) > 0;
  }

  consumePerk(itemId) {
    if (itemId === 'codex_unlocked') return true;

    if ((this.state.inventory[itemId] || 0) > 0) {
      this.state.inventory[itemId] -= 1;
      this.saveState();
      if (window.soundEngine) window.soundEngine.playPowerup();
      return true;
    }
    return false;
  }

  showFloatingHUDNotification(text) {
    const container = document.getElementById('floating-alerts-container');
    if (!container) return;

    const cleanText = String(text || '');
    const alert = document.createElement('div');
    alert.className = 'cyber-alert-chip animate-slide-up';
    alert.innerHTML = `<span class="icon">•</span> <span class="text">${cleanText}</span>`;
    container.appendChild(alert);

    setTimeout(() => {
      alert.classList.add('fade-out');
      setTimeout(() => alert.remove(), 400);
    }, 2400);
  }

  // Alias for backward compatibility
  showFloatingCreditNotification(text) {
    this.showFloatingHUDNotification(text);
  }

  updateHUD() {
    // Update consumable badges in perk bar
    ['chrono_stasis', 'data_purge', 'cyber_lens', 'firewall_shield'].forEach(perk => {
      const badge = document.getElementById(`perk-badge-${perk}`);
      if (badge) {
        const count = this.state.inventory[perk] || 0;
        badge.textContent = count;
        const btn = badge.closest('.perk-action-btn');
        if (btn) {
          btn.disabled = count <= 0;
          btn.classList.toggle('disabled-perk', count <= 0);
        }
      }
    });

  }

  renderShopCatalog() {
    // Store removed
  }
}

// Global Tactical Kit Instance (aliased to armoryStore for compatibility)
window.armoryStore = new TacticalKitSystem();
