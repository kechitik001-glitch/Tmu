// netlify/functions/notify-signup.js

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body || '{}');

    if (data['bot-field']) {
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    const interests = Array.isArray(data.interests) && data.interests.length
      ? data.interests.join(', ')
      : '—';

    const ageRange = data.age_range_min && data.age_range_max
      ? `${data.age_range_min} – ${data.age_range_max}`
      : '—';

    const message = [
      '🆕 New Signup on FIND TRUE LOVE',
      '━━━━━━━━━━━━━━━━━━━━',
      `👤 Name: ${data.name || '—'}`,
      `⚧ Gender: ${data.gender || '—'}`,
      `🎯 Looking for: ${data.relationship_goal_top || '—'}`,
      '',
      `📍 Country: ${data.country || '—'}`,
      `🏙 City: ${data.city || '—'}`,
      `✈️ Preferred location: ${data.pref_country || 'Anywhere'}`,
      '',
      `🎓 Education: ${data.education || '—'}`,
      `💼 Occupation: ${data.occupation || '—'}`,
      `📏 Preferred age: ${ageRange}`,
      `🎨 Interests: ${interests}`,
      `🚬 Smoking: ${data.smoking || '—'}`,
      `🍷 Drinking: ${data.drinking || '—'}`,
      '',
      `📧 Email: ${data.email || '—'}`,
      `📞 Phone: ${data.phone || '—'}`,
      `💬 Preferred contact: ${data.contact_method || '—'}`,
      '',
      `🔞 18+: ${data.age_confirmed || '—'}`,
      `✅ Consent: ${data.consent ? 'Yes' : 'No'}`,
      '',
      `⏰ ${new Date().toUTCString()}`
    ].join('\n');

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: 'Server is not configured for Telegram.' })
      };
    }

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          disable_web_page_preview: true
        })
      }
    );

    const result = await response.json();

    if (!result.ok) {
      console.error('Telegram send failed:', result);
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: result.description || 'Telegram rejected the message.' })
      };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'Server error.' })
    };
  }
};
