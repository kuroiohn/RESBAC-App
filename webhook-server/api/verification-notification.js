// Vercel serverless function to send user verification notifications
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { record, old_record } = req.body;

    // Log the incoming data for debugging
    console.log('Verification webhook received:', JSON.stringify({ record, old_record }));

    // Only process if record exists
    if (!record) {
      return res.status(200).json({ message: 'No valid record, skipping' });
    }

    // Only send notification when user is verified
    if (!record.isVerified) {
      return res.status(200).json({ message: 'User not verified, skipping' });
    }

    // If old_record exists, check if verification status actually changed
    if (old_record && record.isVerified === old_record.isVerified) {
      return res.status(200).json({ message: 'Verification status unchanged, skipping' });
    }

    // Get Supabase credentials
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Get the specific user's push token
    console.log('Looking for push token for userID:', record.userID);
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
    console.log('Push tokens found:', tokens);

    if (!tokens || tokens.length === 0) {
      return res.status(200).json({ message: 'No push token found for this user' });
    }

    // Build notification payload
    const notifications = tokens.map(t => ({
      to: t.push_token,
      icon: 'notification-icon',
      sound: 'default',
      title: 'Account Verified! ✓',
      body: 'Your identity has been verified by the admin. You now have full access to all features.',
      data: {
        type: 'user_verification',
        isVerified: true,
        userID: record.userID,
        screen: 'profile',
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
      message: `Sent verification notification to user`,
      result
    });

  } catch (error) {
    console.error('Error sending verification notification:', error);
    return res.status(500).json({ error: error.message });
  }
}
