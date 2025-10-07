// Vercel serverless function to send push notifications
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { record } = req.body;

    // Only process if alert is being activated
    if (!record || !record.isActive) {
      return res.status(200).json({ message: 'Alert not active, skipping' });
    }

    // Get all push tokens from Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const tokensResponse = await fetch(`${supabaseUrl}/rest/v1/push_tokens?select=push_token`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    const tokens = await tokensResponse.json();

    if (!tokens || tokens.length === 0) {
      return res.status(200).json({ message: 'No push tokens found' });
    }

    // Format notification based on alert type
    const title = record.alertType === 'flood' ? 'Flood Alert' :
                  record.alertType === 'fire' ? 'Fire Alert' :
                  record.alertType === 'earthquake' ? 'Earthquake Alert' :
                  record.alertType === 'announcement' ? 'Important Announcement' :
                  'Emergency Alert';

    let body = record.alertDescription;
    if (record.riverLevel) body += ` (${record.riverLevel} meters)`;
    if (record.alertLocation) body += ` near ${record.alertLocation}`;

    // Build messages for Expo
    const messages = tokens.map(t => ({
      to: t.push_token,
      sound: 'default',
      title: title,
      body: body,
      data: {
        alertType: record.alertType,
        alertTitle: record.alertTitle,
        screen: 'dashboard'
      },
      priority: 'high',
      channelId: 'alerts'
    }));

    // Send to Expo Push API
    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages)
    });

    const result = await expoResponse.json();

    return res.status(200).json({
      success: true,
      message: `Sent ${tokens.length} notifications`,
      result
    });

  } catch (error) {
    console.error('Error sending notifications:', error);
    return res.status(500).json({ error: error.message });
  }
}
