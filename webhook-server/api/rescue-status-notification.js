// Vercel serverless function to send rescue status update notifications
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { record, old_record, reverted } = req.body;

    // Validate request data
    if (!record || !record.status) {
      return res.status(200).json({ message: 'No valid record or status, skipping' });
    }

    // Skip if status didn't change
    if (old_record && record.status === old_record.status) {
      return res.status(200).json({ message: 'Status unchanged, skipping' });
    }

    // Detect if status reverted (e.g., from 3→2 or 2→1)
    const isReverted = reverted || (old_record && record.status < old_record.status);

    // Skip if status not in range and not reverted
    if (!isReverted && (record.status < 1 || record.status > 3)) {
      return res.status(200).json({ message: 'Status not eligible for notification, skipping' });
    }

    // Get Supabase credentials
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Fetch user's push token
    const tokensResponse = await fetch(
      `${supabaseUrl}/rest/v1/push_tokens?select=push_token&user_id=eq.${record.userID}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const tokens = await tokensResponse.json();

    if (!tokens || tokens.length === 0) {
      return res.status(200).json({ message: 'No push token found for this user' });
    }

    // Define normal status messages
    const statusMessages = {
      1: {
        title: 'Rescue Request Received',
        body: 'Your rescue request has been received by the response team. Help is being coordinated.',
        emoji: '📋',
      },
      2: {
        title: 'Rescue Team Notified',
        body: 'Your request has been shared with rescue teams in your area.',
        emoji: '🚨',
      },
      3: {
        title: 'Rescue Team On The Way',
        body: 'A rescue team is on the way to your location. Please stay safe and wait for assistance.',
        emoji: '🚑',
      },
    };

    // Define revert message
    const revertMessage = {
      title: 'Rescue Status Reverted',
      body: 'Your rescue request status has been reverted. Please wait for further updates.',
      emoji: '↩️',
    };

    // Choose which message to send
    const message = isReverted ? revertMessage : statusMessages[record.status];

    if (!message) {
      return res.status(200).json({ message: 'Invalid status, skipping' });
    }

    // Build notification payload
    const notifications = tokens.map((t) => ({
      to: t.push_token,
      icon: 'notification-icon',
      sound: 'default',
      title: `${message.emoji} ${message.title}`,
      body: message.body,
      data: {
        type: 'rescue_status_update',
        status: record.status,
        userID: record.userID,
        screen: 'home',
        reverted: isReverted,
      },
      priority: 'high',
      channelId: 'alerts',
      android: {
        color: '#0060ff',
        priority: 'max',
        sound: 'default',
        vibrate: true,
      },
      image: 'https://ubjzyfxedngrsewkaccy.supabase.co/storage/v1/object/public/assets/blue-icon.png',
    }));

    // Send to Expo Push API
    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notifications),
    });

    const result = await expoResponse.json();

    return res.status(200).json({
      success: true,
      message: isReverted
        ? 'Sent revert notification to user'
        : 'Sent rescue status notification to user',
      status: record.status,
      result,
    });
  } catch (error) {
    console.error('Error sending rescue status notification:', error);
    return res.status(500).json({ error: error.message });
  }
}
