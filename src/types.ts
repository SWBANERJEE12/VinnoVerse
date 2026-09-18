export type Role = 'student' | 'warden' | 'admin';

export type ServiceCategory =
  | 'Room cleaning'
  | 'Toilet cleaning'
  | 'Maintenance/repair'
  | 'Other';

export type ServiceStatus = 'Submitted' | 'Accepted' | 'In Progress' | 'Completed';

export type Meal = 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';

export type PoiFilter = 'Academic' | 'Food' | 'Hostel' | 'Sports' | 'Services';

/** @deprecated Use CampusPoi */
export type LocationCategory = PoiFilter;

export type Weekday =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type User = {
  id: string;
  name: string;
  reg_no: string;
  hostel: string;
  room: string;
  role: Role;
};

export type StatusEvent = {
  status: ServiceStatus;
  at: string;
};

export type ServiceRequest = {
  id: string;
  student_id: string;
  category: ServiceCategory;
  description: string;
  location: string;
  status: ServiceStatus;
  created_at: string;
  updated_at: string;
  image_uri?: string | null;
  timeline: StatusEvent[];
};

export type MessMenuItem = {
  id: string;
  date: string;
  meal: Meal;
  items: string[];
};

export type CampusPoi = {
  id: string;
  name: string;
  category: PoiFilter;
  latitude: number;
  longitude: number;
  description: string;
  keywords: string[];
};

/** @deprecated Use CampusPoi */
export type CampusLocation = CampusPoi;

export type TimetableEntry = {
  id: string;
  student_id: string;
  day: Weekday;
  start_time: string;
  end_time: string;
  subject: string;
  room: string;
  faculty: string;
};

export type Exam = {
  id: string;
  subject: string;
  date: string;
  start_time: string;
  end_time: string;
  venue: string;
};

export type Quiz = {
  id: string;
  student_id: string;
  subject: string;
  title: string;
  date_time: string;
};
