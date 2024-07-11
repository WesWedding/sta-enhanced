/**
 * @file
 * Actions to take during the 'setup' hook.
 */

export const Setup = {
  listen() {
    Hooks.once('setup', () => {
      // Make it more likely for players to see the handy map notes a GM might place.
      game.settings.settings.get('core.notesDisplayToggle').default = true;
    });
  },
};
