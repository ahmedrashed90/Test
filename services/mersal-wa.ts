
/**
 * Mersal WhatsApp Integration Service
 */

interface Component {
  type: 'body' | 'header' | 'button';
  parameters: Array<{ type: 'text'; text: string }>;
}

export const sendMersalTemplate = async (
  phoneNumber: string,
  templateName: string,
  bodyParams: string[]
) => {
  const endpoint = "https://api.mersal.sa/v1/messages"; // مثال لنقطة النهاية
  const token = "YOUR_MERSAL_TOKEN"; // يتم تعيينه خارجياً

  const components: Component[] = [
    {
      type: 'body',
      parameters: bodyParams.map(text => ({ type: 'text', text }))
    }
  ];

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: phoneNumber,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'ar' },
          components
        }
      })
    });
    return await response.json();
  } catch (error) {
    console.error("Mersal WA Error:", error);
    return { error: true, message: error };
  }
};
