/** Bookings and hackathon payments go to this WhatsApp number (+91 80743 08791). */
export const WHATSAPP_NUMBER = '918074308791';
export const WHATSAPP_DISPLAY = '+91 80743 08791';

/** wa.me link that opens a chat with the message already typed. */
export const whatsappHref = (message: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
