
/**
 * Gửi dữ liệu tới Webhook URL của ZÍCO.
 * Đã bao gồm sectionid để duy trì ngữ cảnh hội thoại.
 */
export const sendMessageToGemini = async (prompt: string, history: { role: string, parts: { text: string }[] }[], sectionId: string) => {
  // Cập nhật URL Webhook theo yêu cầu mới nhất: https://zicoantopho.antopho.com/webhook/thezico
  // Thêm sectionid vào URL như một query parameter để hỗ trợ tốt hơn cho các bộ lọc webhook
  const WEBHOOK_URL = `https://zicoantopho.antopho.com/webhook/thezico?sectionid=${encodeURIComponent(sectionId)}`;
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        history: history,
        sectionid: sectionId, // Gửi kèm trong body JSON
        metadata: {
          client: "VINCANZO ZÍCO Web Interface",
          timestamp: new Date().toISOString()
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Lỗi kết nối Webhook: ${response.status}`);
    }

    const data = await response.json();
    
    // Logic bóc tách phản hồi từ webhook
    let reply = "";
    if (typeof data === 'string') {
      reply = data;
    } else if (Array.isArray(data)) {
      const first = data[0];
      reply = first?.output || first?.text || first?.message || first?.data || JSON.stringify(first);
    } else if (data && typeof data === 'object') {
      reply = data.output || data.text || data.message || data.response || data.data || JSON.stringify(data);
    }

    return reply || "ZÍCO đã nhận được tín hiệu nhưng phản hồi trống.";
  } catch (error) {
    console.error("Webhook Error:", error);
    throw new Error("Không thể kết nối tới máy chủ ZÍCO. Vui lòng kiểm tra lại cấu hình Webhook.");
  }
};