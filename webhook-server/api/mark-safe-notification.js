// Vercel serverless function to send mark as safe notifications
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { record, old_record } = req.body;

    // Only process if record exists
    if (!record) {
      return res.status(200).json({ message: 'No valid record, skipping' });
    }

    // Only send notification when user is marked as safe (markAsSafe is not null)
    if (!record.markAsSafe) {
      return res.status(200).json({ message: 'User not marked safe, skipping' });
    }

    // If old_record exists, check if markAsSafe status actually changed from null to a date
    if (old_record) {
      const wasAlreadySafe = old_record.markAsSafe !== null;
      if (wasAlreadySafe) {
        return res.status(200).json({ message: 'User was already marked safe, skipping' });
      }
    }

    // Get Supabase credentials
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Get the specific user's push token
    const tokensResponse = await fetch(
      `${supabaseUrl}/rest/v1/push_tokens?select=push_token&user_id=eq.${record.userID}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );

    const tokens = await tokensResponse.json();

    if (!tokens || tokens.length === 0) {
      return res.status(200).json({ message: 'No push token found for this user' });
    }

    // Build notification payload
    const notifications = tokens.map(t => ({
      to: t.push_token,
      icon: 'notification-icon',
      sound: 'default',
      title: 'You\'re Marked as Safe! ✓',
      body: 'Your status has been updated. You are now marked as safe in the system.',
      data: {
        type: 'mark_as_safe',
        markedSafe: true,
        userID: record.userID,
        screen: 'home',
      },
      priority: 'high',
      channelId: 'alerts',
      android: {
        color: '#00C853',
        priority: 'high',
        sound: 'default',
        vibrate: true
      },
      image: 'https://ubjzyfxedngrsewkaccy.supabase.co/storage/v1/object/public/assets/blue-icon.png'
    }));

    // Send to Expo Push API
    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notifications)
    });

    const result = await expoResponse.json();

    return res.status(200).json({
      success: true,
      message: `Sent mark as safe notification to user`,
      result
    });

  } catch (error) {
    console.error('Error sending mark as safe notification:', error);
    return res.status(500).json({ error: error.message });
  }
}
