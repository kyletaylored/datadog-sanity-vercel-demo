import {defineField, defineType} from 'sanity'
import {EnvelopeIcon, ControlsIcon} from '@sanity/icons'

export const leadCaptureForm = defineType({
  name: 'leadCaptureForm',
  title: 'Lead Capture Form',
  type: 'object',
  icon: EnvelopeIcon,
  groups: [
    {name: 'content', default: true},
    {name: 'fields', title: 'Form Fields'},
    {name: 'layout', icon: ControlsIcon},
  ],
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Button Label',
      type: 'string',
      initialValue: 'Get in touch',
      group: 'content',
    }),
    defineField({
      name: 'successMessage',
      title: 'Success Message',
      type: 'string',
      initialValue: "Thanks! We'll be in touch soon.",
      group: 'content',
    }),
    // Form field toggles
    defineField({
      name: 'showCompany',
      title: 'Show Company field',
      type: 'boolean',
      initialValue: true,
      group: 'fields',
    }),
    defineField({
      name: 'showInterest',
      title: 'Show "Interested In" field',
      type: 'boolean',
      initialValue: true,
      group: 'fields',
    }),
    defineField({
      name: 'interestOptions',
      title: 'Interest Options',
      type: 'array',
      of: [{type: 'string'}],
      initialValue: ['APM', 'RUM', 'Log Management', 'Infrastructure', 'Security'],
      hidden: ({parent}) => !parent?.showInterest,
      group: 'fields',
    }),
    defineField({
      name: 'showMessage',
      title: 'Show Message field',
      type: 'boolean',
      initialValue: false,
      group: 'fields',
    }),
    // Layout
    defineField({
      name: 'background',
      title: 'Background',
      type: 'string',
      initialValue: 'gray',
      group: 'layout',
      options: {
        list: [
          {title: 'White', value: 'white'},
          {title: 'Gray', value: 'gray'},
          {title: 'Dark', value: 'dark'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'containerWidth',
      title: 'Container Width',
      type: 'string',
      initialValue: 'boxed',
      group: 'layout',
      options: {
        list: [
          {title: 'Boxed', value: 'boxed'},
          {title: 'Full width', value: 'full'},
        ],
        layout: 'radio',
      },
    }),
  ],
  preview: {
    select: {heading: 'heading'},
    prepare({heading}) {
      return {title: heading || 'Lead Capture Form', subtitle: 'Lead Capture Form'}
    },
  },
})
