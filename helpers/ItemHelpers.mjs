/**
 * Get the number of damage dice appropriate for the item.
 *
 * @param {Item} item
 * @return {number} The number of challene dice.
 */
export function getNumDamageDiceFor(item) {
  const DAMAGE_ITEMS = Object.freeze(['characterweapon', 'shipweapon']);
  if (!DAMAGE_ITEMS.includes(item.type)) return 0;

  const actor = item.actor;
  let actorSecurity = 0;
  if (actor.system.disciplines) {
    actorSecurity = parseInt(actor.system.disciplines.security.value);
  }
  else if (actor.system.departments) {
    actorSecurity = parseInt(actor.system.departments.security.value);
  }
  let scaleDamage = 0;
  if (item.system.includescale && actor.system.scale) scaleDamage = parseInt(actor.system.scale);
  return item.system.damage + actorSecurity + scaleDamage;
}
