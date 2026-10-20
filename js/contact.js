/* ============================================================
   CONTACT FORM
   Same validation/UX flow as the original inline submitForm():
   validates required fields, disables the button while "sending",
   writes to Firestore "messages" via contact-service.js, and shows
   a success message + toast either way (persisted or local-only).
   ============================================================ */
import { sendMessage } from "../firebase/contact-service.js";
import { toast } from "./animations.js";

export async function submitForm() {
  const name = document.getElementById('fn').value.trim();
  const email = document.getElementById('fe').value.trim();
  const company = document.getElementById('fc').value.trim();
  const msg = document.getElementById('fm').value.trim();
  const status = document.getElementById('cstatus');
  const btn = document.getElementById('cbtn');

  if (!name || !email || !msg) {
    status.style.color = '#f87171';
    status.textContent = '⚠ Name, email and message are required.';
    return;
  }

  btn.textContent = 'Sending...';
  btn.disabled = true;

  const { persisted } = await sendMessage({ name, email, company, message: msg });

  if (persisted) {
    status.style.color = 'var(--cyan)';
    status.textContent = '✓ Message sent! I will get back to you soon.';
  } else {
    status.style.color = 'var(--cyan)';
    status.textContent = '✓ Message received! (Firebase config needed to persist — see instructions)';
  }
  document.getElementById('cform').reset();
  toast('✓ Thanks ' + name + '! Will reply soon 🙌');

  btn.textContent = 'Send Message →';
  btn.disabled = false;
}

export function initContactForm() {
  window.submitForm = submitForm;
}
