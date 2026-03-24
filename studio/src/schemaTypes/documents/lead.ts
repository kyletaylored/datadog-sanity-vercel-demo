import {defineField, defineType} from 'sanity'
import {UsersIcon} from '@sanity/icons'

/**
 * Lead submission document — written server-side via /api/forms/lead.
 * Treat as read-only in Studio; do not edit submissions directly.
 */
export const lead = defineType({
  name: 'lead',
  title: 'Lead',
  type: 'document',
  icon: UsersIcon,
  // Submissions are created by the API, not manually in Studio.
  // Hide the "Create new" button by making __experimental_actions read-only.
  __experimental_actions: ['update', 'publish', 'delete'],
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'interestedIn',
      title: 'Interested In',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      readOnly: true,
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'source',
      title: 'Source Page',
      type: 'string',
      description: 'The page slug where the form was submitted from.',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'email',
      description: 'submittedAt',
    },
    prepare({title, subtitle, description}) {
      return {
        title: title || 'Unknown',
        subtitle: subtitle,
        description: description ? new Date(description).toLocaleString() : undefined,
      }
    },
  },
  orderings: [
    {
      title: 'Newest first',
      name: 'submittedAtDesc',
      by: [{field: 'submittedAt', direction: 'desc'}],
    },
  ],
})
