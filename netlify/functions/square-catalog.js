
const SQUARE_API_VERSION = process.env.SQUARE_API_VERSION || '2026-05-20';
const BASE = process.env.SQUARE_ENVIRONMENT === 'sandbox' ? 'https://connect.squareupsandbox.com' : 'https://connect.squareup.com';
function parseJsonEnv(name, fallback = {}) { try { return process.env[name] ? JSON.parse(process.env[name]) : fallback; } catch { return fallback; } }
function extractLocationId(url) {
  const match = String(url || '').match(/\/location\/([^/?#]+)/i);
  return match ? decodeURIComponent(match[1]) : '';
}
function serviceBookingUrl(baseUrl, serviceVariationId) {
  const cleanBase = String(baseUrl || '').replace(/[?#].*$/, '').replace(/\/services\/?$/i, '').replace(/\/+$/, '');
  return cleanBase && serviceVariationId ? `${cleanBase}/services/${encodeURIComponent(serviceVariationId)}` : cleanBase;
}
function isPresentAtLocation(obj, locationId) {
  if (!obj || !locationId) return true;
  if (Array.isArray(obj.absent_at_location_ids) && obj.absent_at_location_ids.includes(locationId)) return false;
  if (Array.isArray(obj.present_at_location_ids) && obj.present_at_location_ids.length) return obj.present_at_location_ids.includes(locationId);
  if (obj.present_at_all_locations === true) return true;
  return true;
}
exports.handler = async function () {
  const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300' };
  const bookingSiteUrl = process.env.SQUARE_BOOKING_SITE_URL || '';
  const primaryLocationId = process.env.SQUARE_PRIMARY_LOCATION_ID || extractLocationId(bookingSiteUrl) || '';
  const categoryBookingLinks = parseJsonEnv('SQUARE_CATEGORY_BOOKING_LINKS_JSON', {});
  const serviceBookingLinks = parseJsonEnv('SQUARE_SERVICE_BOOKING_LINKS_JSON', {});
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) return { statusCode: 200, headers, body: JSON.stringify({ status: 'missing_token', services: [], categories: [], bookingSiteUrl, primaryLocationId, categoryBookingLinks }) };
  try {
    const resp = await fetch(`${BASE}/v2/catalog/search-catalog-items`, {
      method: 'POST',
      headers: { 'Square-Version': SQUARE_API_VERSION, 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_types: ['APPOINTMENTS_SERVICE'], include_deleted_objects: false, include_related_objects: true })
    });
    if (!resp.ok) {
      const err = await resp.text();
      return { statusCode: 200, headers, body: JSON.stringify({ status: 'square_error', error: err, services: [], categories: [], bookingSiteUrl, primaryLocationId, categoryBookingLinks }) };
    }
    const json = await resp.json();
    const related = [...(json.related_objects || []), ...(json.items || [])];
    const byId = Object.fromEntries(related.map(o => [o.id, o]));
    const cats = {};
    const services = [];
    for (const item of json.items || []) {
      if (!isPresentAtLocation(item, primaryLocationId)) continue;
      const d = item.item_data || {};
      const catId = d.categories?.[0]?.id || d.category_id;
      const catObj = catId ? byId[catId] : null;
      const categoryName = catObj?.category_data?.name || 'Services';
      const categoryKey = categoryName.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      cats[categoryKey] = { key: categoryKey, name: categoryName };
      for (const vid of d.variations || []) {
        const v = typeof vid === 'string' ? byId[vid] : vid;
        if (!v || !v.item_variation_data || !isPresentAtLocation(v, primaryLocationId)) continue;
        const vd = v.item_variation_data;
        const name = vd.name && vd.name !== 'Regular' ? `${d.name} - ${vd.name}` : d.name;
        const priceMoney = vd.price_money || null;
        const price = priceMoney ? new Intl.NumberFormat('en-US',{style:'currency',currency:priceMoney.currency || 'USD'}).format((priceMoney.amount || 0)/100) : '';
        const durationMs = vd.service_duration || vd.available_for_booking ? vd.service_duration : null;
        const duration = durationMs ? `${Math.round(durationMs/60000)} min` : '';
        const bookingUrl = serviceBookingLinks[v.id] || serviceBookingLinks[name] || serviceBookingLinks[d.name] || categoryBookingLinks[categoryKey] || serviceBookingUrl(bookingSiteUrl, v.id) || bookingSiteUrl;
        services.push({ id: v.id, itemId: item.id, name, categoryKey, categoryName, description: d.description || '', price, duration, bookingUrl });
      }
    }
    return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok', bookingSiteUrl, primaryLocationId, categoryBookingLinks, categories: Object.values(cats), services }) };
  } catch (error) {
    return { statusCode: 200, headers, body: JSON.stringify({ status: 'exception', error: error.message, services: [], categories: [], bookingSiteUrl, primaryLocationId, categoryBookingLinks }) };
  }
};
