import { addDays, isoDate } from '../lib/dates';
import type { Exam, MessMenuItem, Quiz, ServiceRequest, TimetableEntry, User } from '../types';
import { vitPois } from './vitPois';

export const DEMO_PIN = '1234';

export const users: User[] = [
  {
    id: 'stu-ananya',
    name: 'Ananya Rao',
    reg_no: '23BCE1847',
    hostel: 'Ladies Hostel – Block D',
    room: 'LD-406',
    role: 'student',
  },
  {
    id: 'warden-mehta',
    name: 'R. Mehta',
    reg_no: 'WDN001',
    hostel: 'MH Warden Office',
    room: 'MH-1',
    role: 'warden',
  },
];

const today = new Date();

export const exams: Exam[] = [
  {
    id: 'ex-1',
    subject: 'CSE2001 · Data Structures',
    date: isoDate(addDays(today, 6)),
    start_time: '09:30',
    end_time: '11:30',
    venue: 'SJT 1st Floor · Hall A',
  },
  {
    id: 'ex-2',
    subject: 'MAT2002 · Differential Equations',
    date: isoDate(addDays(today, 9)),
    start_time: '14:00',
    end_time: '16:00',
    venue: 'TT Gallery 2',
  },
  {
    id: 'ex-3',
    subject: 'ECE1001 · Digital Systems',
    date: isoDate(addDays(today, 12)),
    start_time: '09:30',
    end_time: '11:30',
    venue: 'SMV 102',
  },
];

export const quizzes: Quiz[] = [
  {
    id: 'qz-1',
    student_id: 'stu-ananya',
    subject: 'CSE2001',
    title: 'Trees & Heaps quiz',
    date_time: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 9, 0).toISOString(),
  },
];

const studentId = 'stu-ananya';

export const timetable: TimetableEntry[] = [
  { id: 'tt-1', student_id: studentId, day: 'Monday', start_time: '08:00', end_time: '08:50', subject: 'CSE2001 · DSA', room: 'SJT 301', faculty: 'Prof. Iyer' },
  { id: 'tt-2', student_id: studentId, day: 'Monday', start_time: '09:00', end_time: '09:50', subject: 'MAT2002 · DE', room: 'TT 204', faculty: 'Dr. Nair' },
  { id: 'tt-3', student_id: studentId, day: 'Monday', start_time: '11:00', end_time: '12:40', subject: 'CSE2001 Lab', room: 'SJT 416', faculty: 'Prof. Iyer' },
  { id: 'tt-4', student_id: studentId, day: 'Tuesday', start_time: '08:00', end_time: '08:50', subject: 'ECE1001 · Digital', room: 'SMV 112', faculty: 'Prof. Banerjee' },
  { id: 'tt-5', student_id: studentId, day: 'Tuesday', start_time: '10:00', end_time: '10:50', subject: 'ENG1002 · Soft Skills', room: 'MB 210', faculty: 'Ms. Kapoor' },
  { id: 'tt-6', student_id: studentId, day: 'Tuesday', start_time: '14:00', end_time: '14:50', subject: 'CSE1008 · Web Tech', room: 'SJT 221', faculty: 'Dr. Sen' },
  { id: 'tt-7', student_id: studentId, day: 'Wednesday', start_time: '09:00', end_time: '09:50', subject: 'CSE2001 · DSA', room: 'SJT 301', faculty: 'Prof. Iyer' },
  { id: 'tt-8', student_id: studentId, day: 'Wednesday', start_time: '11:00', end_time: '11:50', subject: 'MAT2002 · DE', room: 'TT 204', faculty: 'Dr. Nair' },
  { id: 'tt-9', student_id: studentId, day: 'Wednesday', start_time: '15:00', end_time: '16:40', subject: 'ECE1001 Lab', room: 'SMV 008', faculty: 'Prof. Banerjee' },
  { id: 'tt-10', student_id: studentId, day: 'Thursday', start_time: '08:00', end_time: '08:50', subject: 'CSE1008 · Web Tech', room: 'SJT 221', faculty: 'Dr. Sen' },
  { id: 'tt-11', student_id: studentId, day: 'Thursday', start_time: '10:00', end_time: '11:40', subject: 'STS2001 · Ques. Skills', room: 'TT 119', faculty: 'Mr. Joseph' },
  { id: 'tt-12', student_id: studentId, day: 'Friday', start_time: '08:00', end_time: '08:50', subject: 'CSE2001 · DSA', room: 'SJT 301', faculty: 'Prof. Iyer' },
  { id: 'tt-13', student_id: studentId, day: 'Friday', start_time: '09:00', end_time: '09:50', subject: 'MAT2002 · DE', room: 'TT 204', faculty: 'Dr. Nair' },
  { id: 'tt-14', student_id: studentId, day: 'Friday', start_time: '11:00', end_time: '11:50', subject: 'ECE1001 · Digital', room: 'SMV 112', faculty: 'Prof. Banerjee' },
  { id: 'tt-15', student_id: studentId, day: 'Friday', start_time: '17:00', end_time: '17:50', subject: 'ENG1002 · Soft Skills', room: 'MB 210', faculty: 'Ms. Kapoor' },
  { id: 'tt-16', student_id: studentId, day: 'Saturday', start_time: '09:00', end_time: '10:40', subject: 'Club hours / FLC', room: 'Student Plaza', faculty: 'Coordinator' },
];

const menus: Record<string, Record<string, string[]>> = {
  Breakfast: {
    0: ['Idli', 'Sambar', 'Coconut chutney', 'Boiled egg', 'Tea / coffee'],
    1: ['Masala dosa', 'Sambar', 'Tomato chutney', 'Bread omelette', 'Filter coffee'],
    2: ['Poha', 'Jalebi', 'Sprouts', 'Banana', 'Milk'],
    3: ['Puri', 'Aloo masala', 'Curd', 'Boiled egg', 'Tea'],
    4: ['Upma', 'Coconut chutney', 'Vada', 'Fruit bowl', 'Coffee'],
    5: ['Aloo paratha', 'Curd', 'Pickle', 'Boiled egg', 'Tea'],
    6: ['Chole bhatura', 'Onion salad', 'Cut fruit', 'Coffee'],
  },
  Lunch: {
    0: ['Steamed rice', 'Sambar', 'Cabbage poriyal', 'Rasam', 'Curd', 'Papad', 'Banana'],
    1: ['Jeera rice', 'Dal tadka', 'Paneer butter masala', 'Chapati', 'Salad', 'Payasam'],
    2: ['Veg biryani', 'Raita', 'Aloo gobi', 'Chapati', 'Gulab jamun'],
    3: ['Steamed rice', 'Rasam', 'Beans carrot', 'Sambar', 'Curd rice', 'Appalam'],
    4: ['Veg fried rice', 'Manchurian', 'Dal fry', 'Chapati', 'Ice cream'],
    5: ['Steamed rice', 'Sambar', 'Bhindi fry', 'Rasam', 'Curd', 'Halwa'],
    6: ['Special meals', 'Chicken / paneer gravy', 'Veg kurma', 'Chapati', 'Payasam'],
  },
  Snacks: {
    0: ['Samosa', 'Mint chutney', 'Tea'],
    1: ['Vada pav', 'Tea'],
    2: ['Bhel puri', 'Coffee'],
    3: ['Corn chaat', 'Tea'],
    4: ['Paniyaram', 'Chutney', 'Coffee'],
    5: ['Maggi', 'Tea'],
    6: ['Pakora', 'Sauce', 'Coffee'],
  },
  Dinner: {
    0: ['Chapati', 'Dal tadka', 'Mix veg', 'Steamed rice', 'Rasam', 'Curd'],
    1: ['Parotta', 'Veg kurma', 'Chicken gravy / paneer', 'Salad'],
    2: ['Chapati', 'Chole', 'Jeera rice', 'Raita', 'Kheer'],
    3: ['Dosa', 'Sambar', 'Chutney', 'Veg stew'],
    4: ['Chapati', 'Palak paneer', 'Dal', 'Rice', 'Rasam'],
    5: ['Fried rice', 'Gobi manchurian', 'Soup'],
    6: ['Chapati', 'Egg curry / veg korma', 'Rice', 'Pickle', 'Ice cream'],
  },
};

export const messMenu: MessMenuItem[] = Array.from({ length: 7 }).flatMap((_, i) => {
  const date = isoDate(addDays(today, i));
  const key = addDays(today, i).getDay();
  return (['Breakfast', 'Lunch', 'Snacks', 'Dinner'] as const).map((meal) => ({
    id: `mess-${date}-${meal}`,
    date,
    meal,
    items: menus[meal][key],
  }));
});

export const locations = vitPois;

export const serviceRequests: ServiceRequest[] = [];
