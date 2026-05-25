import { Request, Response } from 'express';
import { z } from 'zod';

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(500, 'Message too long'),
});

const demoResponses: Record<string, string> = {
  'application': 'You can apply for 8 government services: National ID, Military Exemption, Birth Certificate, Passport, Tax Payment, Traffic Fine, Health Insurance, and Social Insurance. Just click "Apply Now" from the home page!',
  'national id': 'The National ID service lets you renew, replace lost/damaged cards, or apply for a first-time ID. You need your full Arabic name, birth date, marital status, profession, address, and mother\'s name.',
  'military': 'Military Exemption service covers exemption certificates, student postponement, travel permits, and service completion certificates. Status: currently we process these within 3-5 business days.',
  'birth certificate': 'Birth Certificate copies can be requested digitally. Processing time is typically 2-3 business days, and documents are dispatched via Egypt Post.',
  'passport': 'Passport Services include new applications, renewals, and emergency travel documents. You will need passport photos and your old passport for renewals.',
  'tax': 'Tax Payment (ETA) allows you to pay income tax, property tax, and VAT online. You need your tax registration number for electronic payments.',
  'traffic': 'Traffic Violations service lets you check and pay fines by license plate number or violation reference. Payment can be made by card or bank transfer.',
  'health': 'Health Insurance (UHIA) covers individual, family, and corporate health coverage plans. You can enroll or check your coverage status online.',
  'social insurance': 'Social Insurance services handle employee registration, contribution payments, and pension calculations through the government portal.',
  'track': 'To track an application, go to the home page and enter your 11-character tracking code (e.g., MG-1024-5896) in the search bar. You can view the full status history.',
  'appointment': 'You can book appointments at Civil Registry, Passport Office, Traffic Department, Social Insurance, Health Insurance, Tax Authority, or Military Recruitment. Available time slots are 30-minute windows from 9:00 AM.',
  'cancel appointment': 'To cancel an appointment, go to the Appointments section and click "Cancel" on any scheduled appointment. Only future appointments can be cancelled.',
  'complaint': 'To submit feedback or a complaint, go to the Feedback section. Categories include Service Quality, Technical Issue, Suggestion, Staff Conduct, and Delay Complaint.',
  'user': 'Current registered users:\n- Zeyad Ahmed Ali (Citizen)\n- Nour Hassan Fahmy (Citizen)\n- General Khaled Mahmoud (Administrator)',
  'zeyad': 'Zeyad Ahmed Ali is a citizen user with email zeyad@gmail.com. He has submitted applications for National ID (MG-1024-5896) and Military Exemption (MG-3054-9981).',
  'nour': 'Nour Hassan Fahmy is a citizen user with email nour.hassan@gmail.com. She has a completed Birth Certificate application (MG-9082-1144) and submitted a service quality complaint.',
  'admin': 'General Khaled Mahmoud is the system administrator (admin@misrgate.gov.eg). He manages all applications, complaints, appointments, and user activity oversight.',
  'status': 'Application statuses: PENDING (awaiting review), UNDER_REVIEW (document audit), APPROVED (certified), REJECTED (discarded), COMPLETED (printed & dispatched).',
  'tracking': 'Tracking codes follow the format MG-XXXX-XXXX (e.g., MG-1024-5896). You can track any application publicly from the home page without logging in.',
  'hello': 'Hello! I am MisrGate AI Assistant. I can help you with services, applications, appointments, and more. Type a question to get started!',
  'hi': 'Hi there! Welcome to MisrGate. Ask me anything about government services, applications, or user accounts.',
  'help': 'I can answer questions about:\n\u2022 8 government services (National ID, Passport, Tax, etc.)\n\u2022 Application tracking and statuses\n\u2022 Appointment booking\n\u2022 Complaints and feedback\n\u2022 User accounts\n\nJust type your question in natural language!',
};

function findBestResponse(message: string): string {
  const lower = message.toLowerCase().trim();

  if (lower === '' || lower === 'hello' || lower === 'hi' || lower === 'hey') {
    return demoResponses['hello'];
  }

  if (lower === 'help' || lower === 'what can you do' || lower === 'commands') {
    return demoResponses['help'];
  }

  const matchedKeys = Object.keys(demoResponses).filter(key =>
    lower.includes(key)
  );

  if (matchedKeys.length > 0) {
    matchedKeys.sort((a, b) => b.length - a.length);
    return demoResponses[matchedKeys[0]];
  }

  return 'I\'m not sure I understand. I can help with services, tracking, appointments, complaints, and user info. Try typing "help" to see what I can do!';
}

export const chat = async (req: Request, res: Response) => {
  try {
    const { message } = chatSchema.parse(req.body);
    const reply = findBestResponse(message);

    return res.json({
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Chatbot error:', error);
    return res.status(500).json({ error: 'An error occurred.' });
  }
};
