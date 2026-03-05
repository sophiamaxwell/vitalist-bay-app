'use client'

import { useState } from 'react'
import { SessionFormData, SessionType, SESSION_TYPES, Track, Room, Speaker } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'

interface SessionFormProps {
  initialData?: Partial<SessionFormData>
  eventId: string
  tracks: Track[]
  rooms: Room[]
  speakers: Speaker[]
  onSubmit: (data: SessionFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function SessionForm({
  initialData,
  tracks,
  rooms,
  speakers,
  onSubmit,
  onCancel,
  isLoading = false,
}: SessionFormProps) {
  const [formData, setFormData] = useState<SessionFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    type: initialData?.type || 'TALK',
    trackId: initialData?.trackId || null,
    roomId: initialData?.roomId || null,
    speakerIds: initialData?.speakerIds || [],
    capacity: initialData?.capacity || null,
    streamUrl: initialData?.streamUrl || null,
    recordingUrl: initialData?.recordingUrl || null,
    isPublished: initialData?.isPublished ?? true,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof SessionFormData, string>>>({})

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SessionFormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required'
    }
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required'
    }
    if (formData.startTime && formData.endTime && new Date(formData.endTime) <= new Date(formData.startTime)) {
      newErrors.endTime = 'End time must be after start time'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      await onSubmit(formData)
    }
  }

  const toggleSpeaker = (speakerId: string) => {
    setFormData((prev) => ({
      ...prev,
      speakerIds: prev.speakerIds.includes(speakerId)
        ? prev.speakerIds.filter((id) => id !== speakerId)
        : [...prev.speakerIds, speakerId],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Basic Information</h3>
        
        <Input
          label="Session Title *"
          name="title"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="Enter session title"
          error={errors.title}
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the session content..."
          rows={4}
        />

        <Select
          label="Session Type"
          name="type"
          value={formData.type}
          onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as SessionType }))}
          options={SESSION_TYPES}
        />
      </div>

      {/* Schedule */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Schedule</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Time *"
            name="startTime"
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
            error={errors.startTime}
          />
          
          <Input
            label="End Time *"
            name="endTime"
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
            error={errors.endTime}
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Location & Track</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Room"
            name="roomId"
            value={formData.roomId || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, roomId: e.target.value || null }))}
            options={[
              { value: '', label: 'No room assigned' },
              ...rooms.map((room) => ({
                value: room.id,
                label: `${room.name}${room.capacity ? ` (${room.capacity} seats)` : ''}`,
              })),
            ]}
          />
          
          <Select
            label="Track"
            name="trackId"
            value={formData.trackId || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, trackId: e.target.value || null }))}
            options={[
              { value: '', label: 'No track' },
              ...tracks.map((track) => ({
                value: track.id,
                label: track.name,
              })),
            ]}
          />
        </div>

        <Input
          label="Capacity"
          name="capacity"
          type="number"
          value={formData.capacity || ''}
          onChange={(e) => setFormData((prev) => ({ ...prev, capacity: e.target.value ? parseInt(e.target.value) : null }))}
          placeholder="Maximum attendees (optional)"
        />
      </div>

      {/* Speakers */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Speakers</h3>
        
        {speakers.length === 0 ? (
          <p className="text-sm text-slate-500">No speakers available. Create speakers first.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {speakers.map((speaker) => (
              <label
                key={speaker.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  formData.speakerIds.includes(speaker.id)
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.speakerIds.includes(speaker.id)}
                  onChange={() => toggleSpeaker(speaker.id)}
                  className="sr-only"
                />
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600 flex-shrink-0">
                  {speaker.avatar ? (
                    <img src={speaker.avatar} alt={speaker.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    speaker.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{speaker.name}</p>
                  {speaker.company && (
                    <p className="text-xs text-slate-500 truncate">{speaker.company}</p>
                  )}
                </div>
                {formData.speakerIds.includes(speaker.id) && (
                  <svg className="w-5 h-5 text-emerald-500 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Streaming */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Streaming (Optional)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Stream URL"
            name="streamUrl"
            type="url"
            value={formData.streamUrl || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, streamUrl: e.target.value || null }))}
            placeholder="https://..."
          />
          
          <Input
            label="Recording URL"
            name="recordingUrl"
            type="url"
            value={formData.recordingUrl || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, recordingUrl: e.target.value || null }))}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Publishing */}
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isPublished}
            onChange={(e) => setFormData((prev) => ({ ...prev, isPublished: e.target.checked }))}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
        <span className="text-sm font-medium text-slate-700">Published</span>
        <span className="text-xs text-slate-500">(Visible to attendees)</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Session' : 'Create Session'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
