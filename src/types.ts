export interface RSVP {
  id?: string;
  name: string;
  attendance: 'present' | 'absent';
  message: string;
  timestamp: any;
  likes: number;
  likedBy: string[]; // Array of userIds (localStorage)
}

export interface GuestInfo {
  name: string;
}
