'use client'

import { useState, useEffect } from 'react'
import { Speaker, SpeakerWithSessions } from '@/types'
import { SpeakerList } from '@/components/speakers/SpeakerList'
import { SpeakerForm, SpeakerFormData } from '@/components/speakers/SpeakerForm'
import { SpeakerDetail } from '@/components/speakers/SpeakerDetail'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

interface SpeakersPageProps {
  params: { eventId: string }
}

export default function SpeakersPage({ params }: SpeakersPageProps) {
  const { eventId } = params

  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedSpeaker, setSelectedSpeaker] = useState<SpeakerWithSessions | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Initial load state
  const [showEmptyState, setShowEmptyState] = useState(false)

  // Fetch speakers
  useEffect(() => {
    async function fetchSpeakers() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/events/${eventId}/speakers`)
        const data = await response.json()
        setSpeakers(data)
        setShowEmptyState(data.length === 0)
      } catch (err) {
        console.error('Failed to load speakers:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSpeakers()
  }, [eventId])

  // Create speaker
  const handleCreate = async (data: SpeakerFormData) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/events/${eventId}/speakers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to create speaker')

      const newSpeaker = await response.json()
      setSpeakers((prev) => [...prev, newSpeaker])
      setShowCreateModal(false)
      setShowEmptyState(false)
    } catch (err) {
      console.error(err)
      alert('Failed to create speaker')
    } finally {
      setIsSaving(false)
    }
  }

  // Update speaker
  const handleUpdate = async (data: SpeakerFormData) => {
    if (!selectedSpeaker) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/events/${eventId}/speakers/${selectedSpeaker.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to update speaker')

      const updatedSpeaker = await response.json()
      setSpeakers((prev) =>
        prev.map((s) => (s.id === updatedSpeaker.id ? updatedSpeaker : s))
      )
      setSelectedSpeaker(updatedSpeaker)
      setIsEditing(false)
    } catch (err) {
      console.error(err)
      alert('Failed to update speaker')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete speaker
  const handleDelete = async () => {
    if (!selectedSpeaker) return
    if (!confirm('Are you sure you want to delete this speaker? This will also remove them from any sessions.')) return

    try {
      const response = await fetch(`/api/events/${eventId}/speakers/${selectedSpeaker.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete speaker')

      setSpeakers((prev) => prev.filter((s) => s.id !== selectedSpeaker.id))
      setShowDetailModal(false)
      setSelectedSpeaker(null)
      if (speakers.length === 1) {
        setShowEmptyState(true)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to delete speaker')
    }
  }

  // View speaker with sessions
  const handleSpeakerClick = async (speaker: Speaker) => {
    try {
      const response = await fetch(`/api/events/${eventId}/speakers/${speaker.id}`)
      const speakerWithSessions = await response.json()
      setSelectedSpeaker(speakerWithSessions)
      setIsEditing(false)
      setShowDetailModal(true)
    } catch (err) {
      console.error(err)
      alert('Failed to load speaker details')
    }
  }

  // Format speaker for form
  const formatSpeakerForForm = (speaker: SpeakerWithSessions): SpeakerFormData => ({
    name: speaker.name,
    email: speaker.email || '',
    avatar: speaker.avatar || '',
    bio: speaker.bio || '',
    company: speaker.company || '',
    jobTitle: speaker.jobTitle || '',
    linkedin: speaker.linkedin || '',
    twitter: speaker.twitter || '',
    website: speaker.website || '',
    featured: speaker.featured,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  // Empty state
  if (showEmptyState) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Add speakers</h1>
          <p className="text-slate-600 mt-1">
            Add the amazing people who will be presenting at your event.
          </p>
          <a href="#" className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center gap-1 mt-2">
            🎤 Learn how →
          </a>
        </div>

        <div className="space-y-4">
          {/* Import Option */}
          <Card variant="interactive" onClick={() => alert('Excel import coming soon!')}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Import via Excel file</h3>
                <p className="text-sm text-slate-500">
                  Download and update our pre-filled Excel template to add speakers in bulk.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Create Manually */}
          <Card variant="interactive" onClick={() => setShowCreateModal(true)}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <span className="text-2xl">✏️</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Create manually</h3>
                <p className="text-sm text-slate-500">Add a speaker on the next screen.</p>
              </div>
            </CardContent>
          </Card>

          {/* Invite Speakers */}
          <Card variant="interactive" onClick={() => alert('Speaker invites coming soon!')}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                <span className="text-2xl">📧</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Invite speakers</h3>
                <p className="text-sm text-slate-500">
                  Send invitations to speakers and let them fill in their own profiles.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Add Speaker"
          size="lg"
        >
          <SpeakerForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreateModal(false)}
            isLoading={isSaving}
          />
        </Modal>
      </div>
    )
  }

  // Speakers list view
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Speakers</h1>
          <p className="text-slate-600 mt-1">
            Manage your event speakers and their profiles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => alert('Export coming soon!')}>
            Export
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>+ Add Speaker</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-slate-900">{speakers.length}</p>
            <p className="text-sm text-slate-500">Total Speakers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-500">{speakers.filter(s => s.featured).length}</p>
            <p className="text-sm text-slate-500">Featured</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-500">{speakers.filter(s => s.bio).length}</p>
            <p className="text-sm text-slate-500">With Bio</p>
          </CardContent>
        </Card>
      </div>

      {/* Speakers List */}
      <SpeakerList
        speakers={speakers}
        onSpeakerClick={handleSpeakerClick}
        showFilters={true}
        showSearch={true}
        emptyMessage="No speakers yet. Add your first speaker!"
      />

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Speaker"
        size="lg"
      >
        <SpeakerForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          isLoading={isSaving}
        />
      </Modal>

      {/* Detail/Edit Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedSpeaker(null)
          setIsEditing(false)
        }}
        title={isEditing ? 'Edit Speaker' : selectedSpeaker?.name}
        size="lg"
      >
        {selectedSpeaker && (
          isEditing ? (
            <SpeakerForm
              initialData={formatSpeakerForForm(selectedSpeaker)}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              isLoading={isSaving}
            />
          ) : (
            <SpeakerDetail
              speaker={selectedSpeaker}
              isOrganizer={true}
              onEdit={() => setIsEditing(true)}
              onDelete={handleDelete}
            />
          )
        )}
      </Modal>
    </div>
  )
}
