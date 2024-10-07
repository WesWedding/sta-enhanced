export default class STAChatMessage extends ChatMessage {
  /** @override */
  _rollExpanded = true;

  /** @override */
  async getHTML() {
    const html = await super.getHTML();
    // Since we're starting expanded, we need to add a style attribute to tooltips to avoid
    // a broken hide animation on the first click.
    html.find('.dice-tooltip').addClass('expanded').css('display', 'block');
    return html;
  }
}
