# Star Trek Adventures: Enhanced #
Find this on Foundry: https://foundryvtt.com/packages/sta-enhanced

A plugin that enhances the [Unofficial Star Trek Adventures system](https://foundryvtt.com/packages/sta)
with fresher tab-based navigation to improve readability, organization, and
a few new bells and whistles.

## How to Switch Sheets
1. Open your character sheet
2. Click on "Sheet" at the top of the sheet
3. Click the current sheet
4. Select either the _Enhanced STA (1st Ed)_ or _Enhanced STA (2nd Ed)_ sheets
5. Click "Save Sheet Configuration"

![](docs\how-to-switch.gif)

## Requirements
- Foundry v12 or later
- Foundry v12 Client or Latest Chrome, Firefox, or Safari

## New Features and Updates ##

### Tabs! ###
The sheet provided by the system is a single page and very cramped, requiring
the squishing a lot of a lot of detail into the lower section of the sheet.
Several official Foundry Systems use tabs manage this issue, moving details
to additional tabs and allowing the inputs to have breathing room.

Many sheet elements live in dedicated tabs now.

- Details
  - Species, assignment, rank, traits, personality (new!),
    items, Gender/Pronouns (new!)
- Reputation
  - Fields related to the reputation system goes here.
- Biography
  - The environment and upbringing, Backstory (new!), and other biographical fields go here.
- Notes
  - The Notes field has been given an entire tab, so that there is plenty of room for notes.

### New fields! ###
The introduction of tabs also means we have space to add additional fields that can
help you flesh out your character more without having to rely on Journal pages
or external notes.

- Personality: It can be helpful to write this down, especially if you're a GM
  and have to switch between several characters or otherwise need a reminder to
  get in-character.
- Backstory: The Notes field provided by the System was really tiny, but there
  is also a difference between a Biography and Notes.  Put your fancy backstory
  here, instead.  Plenty of space is given for this purpose.
- Pronouns: Originally not included in the STA system, this field is now provided
  on the 2E sheets.  This plugin makes sure 1E players have access to this field
  as well.

### New Editors ###
Text editors have been updated from the TinyMCE editor to ProseMirror (TinyMCE
will eventually get deprecated).  A side effect of this means that the minimum
supporting Foundry version supported is Foundry v10.
