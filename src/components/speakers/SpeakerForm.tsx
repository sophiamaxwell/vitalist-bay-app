'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

export interface SpeakerFormData {
  name: string
  email: string
  avatar: string
  bio: string
  company: string
  jobTitle: string
  linkedin: string
  twitter: string
  website: string
  featured: boolean
}

interface SpeakerFormProps {
  initialData?: Partial<SpeakerFormData>
  onSubmit: (data: SpeakerFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function SpeakerForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: SpeakerFormProps) {
  const [formData, setFormData] = useState<SpeakerFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    avatar: initialData?.avatar || '',
    bio: initialData?.bio || '',
    company: initialData?.company || '',
    jobTitle: initialData?.jobTitle || '',
    linkedin: initialData?.linkedin || '',
    twitter: initialData?.twitter || '',
    website: initialData?.website || '',
    featured: initialData?.featured ?? false,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof SpeakerFormData, string>>>({})

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SpeakerFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (formData.linkedin && !formData.linkedin.startsWith('http')) {
      newErrors.linkedin = 'Please enter a full URL'
    }
    if (formData.twitter && !formData.twitter.startsWith('http')) {
      newErrors.twitter = 'Please enter a full URL'
    }
    if (formData.website && !formData.website.startsWith('http')) {
      newErrors.website = 'Please enter a full URL'
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Photo */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Profile Photo</h3>
        
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-semibold text-slate-600 overflow-hidden flex-shrink-0">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : formData.name ? (
              formData.name.charAt(0).toUpperCase()
            ) : (
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <Input
              label="Photo URL"
              name="avatar"
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData((prev) => ({ ...prev, avatar: e.target.value }))}
              placeholder="https://example.com/photo.jpg"
              hint="Enter a URL for the speaker's photo"
            />
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Basic Information</h3>
        
        <Input
          label="Full Name *"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Enter speaker's name"
          error={errors.name}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="speaker@example.com"
          error={errors.email}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Job Title"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={(e) => setFormData((prev) => ({ ...prev, jobTitle: e.target.value }))}
            placeholder="e.g., CEO, Research Director"
          />
          
          <Input
            label="Company"
            name="company"
            value={formData.company}
            onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
            placeholder="e.g., Acme Inc."
          />
        </div>

        <Textarea
          label="Bio"
          name="bio"
          value={formData.bio}
          onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
          placeholder="Tell attendees about this speaker..."
          rows={4}
        />
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Social Links</h3>
        
        <Input
          label="LinkedIn"
          name="linkedin"
          type="url"
          value={formData.linkedin}
          onChange={(e) => setFormData((prev) => ({ ...prev, linkedin: e.target.value }))}
          placeholder="https://linkedin.com/in/username"
          error={errors.linkedin}
          leftIcon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          }
        />
        
        <Input
          label="X (Twitter)"
          name="twitter"
          type="url"
          value={formData.twitter}
          onChange={(e) => setFormData((prev) => ({ ...prev, twitter: e.target.value }))}
          placeholder="https://x.com/username"
          error={errors.twitter}
          leftIcon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          }
        />
        
        <Input
          label="Website"
          name="website"
          type="url"
          value={formData.website}
          onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
          placeholder="https://example.com"
          error={errors.website}
          leftIcon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          }
        />
      </div>

      {/* Featured */}
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
        <span className="text-sm font-medium text-slate-700">Featured Speaker</span>
        <span className="text-xs text-slate-500">(Highlighted at the top)</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
        <Button type="submit" loading={isLoading}>
          {initialData?.name ? 'Update Speaker' : 'Create Speaker'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
