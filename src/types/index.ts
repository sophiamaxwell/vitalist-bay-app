// Session types with relations
export interface SessionWithRelations {
  id: string
  eventId: string
  trackId: string | null
  roomId: string | null
  title: string
  description: string | null
  startTime: Date
  endTime: Date
  type: SessionType
  streamUrl: string | null
  recordingUrl: string | null
  capacity: number | null
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
  track?: Track | null
  room?: Room | null
  speakers?: SessionSpeakerWithSpeaker[]
}

export interface SessionSpeakerWithSpeaker {
  id: string
  sessionId: string
  speakerId: string
  role: string
  sortOrder: number
  speaker: Speaker
}

export interface Speaker {
  id: string
  eventId: string
  userId: string | null
  name: string
  email: string | null
  avatar: string | null
  bio: string | null
  company: string | null
  jobTitle: string | null
  linkedin: string | null
  twitter: string | null
  website: string | null
  featured: boolean
  sortOrder: number
}

// Speaker with sessions for detail view
export interface SpeakerWithSessions extends Speaker {
  sessions?: SessionSpeakerWithSession[]
}

export interface SessionSpeakerWithSession {
  id: string
  sessionId: string
  speakerId: string
  role: string
  sortOrder: number
  session: {
    id: string
    title: string
    startTime: Date
    endTime: Date
    type: SessionType
    room?: { name: string } | null
    track?: { name: string; color: string } | null
  }
}

export interface Track {
  id: string
  eventId: string
  name: string
  color: string
  sortOrder: number
}

export interface Room {
  id: string
  eventId: string
  name: string
  capacity: number | null
  floor: string | null
  sortOrder: number
}

export type SessionType = 
  | 'TALK'
  | 'PANEL'
  | 'WORKSHOP'
  | 'KEYNOTE'
  | 'NETWORKING'
  | 'BREAK'
  | 'OTHER'

export const SESSION_TYPES: { value: SessionType; label: string }[] = [
  { value: 'KEYNOTE', label: 'Keynote' },
  { value: 'TALK', label: 'Talk' },
  { value: 'PANEL', label: 'Panel Discussion' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'NETWORKING', label: 'Networking' },
  { value: 'BREAK', label: 'Break' },
  { value: 'OTHER', label: 'Other' },
]

// Form types
export interface SessionFormData {
  title: string
  description: string
  startTime: string
  endTime: string
  type: SessionType
  trackId: string | null
  roomId: string | null
  speakerIds: string[]
  capacity: number | null
  streamUrl: string | null
  recordingUrl: string | null
  isPublished: boolean
}

// Personal Agenda types
export interface PersonalAgendaItem {
  id: string
  sessionId: string
  userId: string
  session: SessionWithRelations
  addedAt: Date
}

// Re-export registration types
export * from './registration'
