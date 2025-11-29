// Vercel serverless function to send mark as safe notifications
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { record, old_record } = req.body;

    console.log("Mark Safe Webhook received:", JSON.stringify({ new: record, old: old_record }));

    // Only process if record exists
    if (!record) {
      return res.status(200).json({ message: 'No valid record, skipping' });
    }

    // Determine the type of update
    const isMarkedSafe = !!record.markAsSafe; // True if date exists
    const wasMarkedSafe = old_record && !!old_record.markAsSafe; // True if date existed before

    let notificationTitle = '';
    let notificationBody = '';
    let isReset = false;

    // SCENARIO 1: User marked as safe (New: Date, Old: Null)
    if (isMarkedSafe && !wasMarkedSafe) {
      notificationTitle = 'You\'re Marked as Safe! ✓';
      notificationBody = 'Your status has been updated. You are now marked as safe in the system.';
    }
    // SCENARIO 2: Safety status reset/cancelled (New: Null, Old: Date)
    else if (!isMarkedSafe && wasMarkedSafe) {
      notificationTitle = 'Safety Status Updated';
      notificationBody = 'Your safety status has been updated.';
      isReset = true;
    }
    // SCENARIO 3: No change or invalid state -> Skip
    else {
      console.log("Skipping: No relevant change in markAsSafe status");
      return res.status(200).json({ message: 'Status unchanged or not relevant, skipping' });
    }

    // Get Supabase credentials
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log(`Fetching token for UserID: ${record.userID}`);

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
    console.log(`Tokens found: ${JSON.stringify(tokens)}`);

    if (!tokens || tokens.length === 0) {
      console.error(`ERROR: No push token found for user ${record.userID}`);
      return res.status(200).json({ message: 'No push token found for this user' });
    }

    // Build notification payload
    const notifications = tokens.map(t => ({
      to: t.push_token,
      icon: 'notification-icon',
      sound: 'default',
      title: notificationTitle,
      body: notificationBody,
      data: {
        type: 'mark_as_safe',
        markedSafe: isMarkedSafe,
        isReset: isReset,
        userID: record.userID,
        screen: 'home',
      },
      priority: 'high',
      channelId: 'alerts',
      android: {
        color: isReset ? '#FFA000' : '#00C853',
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
    console.log("Expo Result:", JSON.stringify(result));

    return res.status(200).json({
      success: true,
      message: `Sent ${isReset ? 'reset' : 'marked safe'} notification to user`,
      result
    });

  } catch (error) {
    console.error('Error sending mark as safe notification:', error);
    return res.status(500).json({ error: error.message });
  }
}