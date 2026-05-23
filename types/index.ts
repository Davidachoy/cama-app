export type ServiceRecord = {
  id: string;
  name: string;
  duration_min: number;
  price_colones: number;
  is_active: boolean;
  created_at: string;
};

export type BookingStatus =
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type BookingRecord = {
  id: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  service_id: string | null;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  notes: string | null;
  google_event_id: string | null;
  created_at: string;
  service?: ServiceRecord;
};

export type PaymentMethod = "sinpe" | "cash" | "transfer";
export type PaymentSource = "manual" | "gmail_parsed";

export type PaymentRecord = {
  id: string;
  booking_id: string | null;
  amount_colones: number;
  paid_at: string;
  method: PaymentMethod;
  source: PaymentSource;
  raw_email_id: string | null;
  notes: string | null;
  created_at: string;
  booking?: BookingRecord;
};

export type ReminderRecord = {
  id: string;
  title: string;
  description: string | null;
  remind_at: string;
  is_completed: boolean;
  google_event_id: string | null;
  created_at: string;
};

export type PushSubscriptionRecord = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
};

export type GmailPaymentCandidate = {
  email_id: string;
  subject: string;
  from: string;
  date: string;
  amount_colones: number;
  method: PaymentMethod;
  raw_snippet: string;
};
