# Changes

## v1.0.0

### 2nd Edition Character Sheets Added!
2nd Edition can now benefit from the tabbed character sheet design this module
provides.  The newer 2nd Edition character sheet fields introduced into the
sheet, as follows:
- 2E Character sheet added "Role" field to top of sheet near name.
- Biography tab now supports "Career Path," "Experience," and "Career Events."


### Other Changes
- Moved Rank to top of 2E sheet, so its easier to reference on the fly when
  addressing a character.
- Migrating module-provided "gender" field to the new System "pronouns" field

## v0.3.1

### Extras Tab and Maximum Stress Field
The up/down arrows next to the stress pips on the character sheet could be
confused for increasing stress after taking damage, so they have been removed
and the adjustments to maximum stress can be made in the new "Extas" tab.

### Styles and Labels
- Adjusted "Biography" field to "Backstory" to make intent clearer,
  differentiate from tab name.
- Notes tab header has spacing consistent with other tabs.

## v0.3.0
### Tab Reorganization
#### Belongings Tab Removed
Items have been moved from the "Belongings" tab back into the main/details tab
to ease use of items during gameplay; it was annoying and even confusing to
have to switch tabs around to make use of them during a Task roll while also
keeping track of Focuses, Values, etc that might also apply.

#### Notes Tab Added
Notes has its own home now, to give it maximum space for players to keep
running notes on their characters.

### Bug Fixes
- Fixed: Tabs can't be switched on a locked Compendium character.

### Known Issues
The styles on the Notes tab are a little funkier than normal and need to
be fixed up a bit.  Font sizes are smaller, for instance.

## v0.2.0
### Reputation Roller
Make reputation more convenient by rolling from the character sheet, and
getting a convenient report of the results.  The roll button has appeared
near the Acclaim and Reprimand (Honor and Dishonor, for Klingons).
![reputation-tab-roller.png](docs%2Freputation-tab-roller.png)
![rep-roller-dialog.png](docs%2Frep-roller-dialog.png)
![rep-roll.png](docs%2Frep-roll.png)

After rolling, you can save the results directly to the character sheet that
initiated the roll.

### Dropping support for v10 and v11
The roller is using a v12-only UI window tyoe, and those other versions are
many years old at this point.  The goal of this module is to release a v1.0
utilizing the most up-to-date APIs so that it remains viable for many years
before components need to be reworked to fit the ever-changing Foundry VTT
world.

### Misc
- Bugfix: Data migration does not trigger on first run, does not report incorrect version numbers [#23](https://github.com/WesWedding/sta-enhanced/issues/23)
- Bugfix: Discipline order did not match System [#29](https://github.com/WesWedding/sta-enhanced/issues/29).
- Bugfix: Injuries, Focuses did not display descriptions when clicked. [#28](https://github.com/WesWedding/sta-enhanced/issues/28)
- Dropped: Custom item chat card implementation (was ported directly into the System)

## v0.1.9
### Reputation System Update
Fields for Acclaim/Reprimand added to the sheet.

Support for the newer Klingon/Digest reputation system has been added.

## v0.1.8
Bugfix: System updates broke the Enhanced sheets.

## v0.1.7
### New Item Chat Cards
The STA System item chat cards have been completely replaced with a cleaner
implementation and a nicer layout, with clearer information.

Cards generated by clicking on a Value, Belonging, Talent, or Focus will now
be explicitly labelled with the "type" of the Item being displayed.  No more
confusion about whether a Player is trying to show a Focus or a Value!

All items that had descriptions excluded from cards now have them included,
too.  Chat cards also include Escalation and Opportunity costs.

Note: Challenge rolls and Task rolls generated by clicking buttons on the
character sheet still use the old somewhat messy layout.

### Other Changes
* Fixed: The Notes field shows HTML tags.  E.g. `"<p>A note</p>"` instead
  of being formatted correctly.
* Cards generated by directly clicking items on Character Sheets share a
  single Handlebars template, allowing a clean separation of code and
  presentation.  Hopefully something to push to the System in the future!

## v0.1.6
### Weapon belonging updates
You can now tell whether a weapon has Qualities and Effects at a glance.  If a
Weapon belonging has a description, you can click the weapon to reveal it just
like you would on a Talent.

### Other changes
* Plugin sets the "show map notes" to default to true, to improve the discoverability of map notes.
* Tab buttons are more accessible; can be used via keyboard navigation and screen readers.

### Bugfixes
* Mouse-clicking on the button to increase max/min stress was not working (keyboards worked).
* Input listeners were added to sheets that a player wouldn't be able to edit if they wanted to.

## v0.1.5
### Added partial support for STA System v1.2 and up

Supports the new "Stress Modifier" addition to characters, but a replacement
for the 2nd Edition character sheets has not beed provided.  You may modify
your maximum Stress by clicking the up/down buttons next to the "Stress Track"
title, located directly above the track itself.
