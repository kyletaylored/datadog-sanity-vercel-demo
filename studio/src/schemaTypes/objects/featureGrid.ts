import {defineField, defineType} from 'sanity'
import {ThListIcon, ControlsIcon} from '@sanity/icons'

const ICON_OPTIONS = [
  'Activity', 'BarChart3', 'Bell', 'Check', 'Code', 'Cpu',
  'Database', 'Eye', 'FileText', 'Filter', 'GitBranch', 'Globe',
  'Key', 'Layers', 'Lock', 'Map', 'Monitor', 'Package',
  'Search', 'Server', 'Settings', 'Shield', 'Sliders', 'Star',
  'Tag', 'Terminal', 'Truck', 'Users', 'Workflow', 'Zap',
]

export const featureGrid = defineType({
  name: 'featureGrid',
  title: 'Feature Grid',
  type: 'object',
  icon: ThListIcon,
  groups: [
    {name: 'content', default: true},
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
      name: 'columns',
      title: 'Columns',
      type: 'number',
      initialValue: 3,
      group: 'layout',
      options: {
        list: [
          {title: '2 columns', value: 2},
          {title: '3 columns', value: 3},
          {title: '4 columns', value: 4},
        ],
        layout: 'radio',
      },
    }),
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
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'object',
          name: 'featureItem',
          fields: [
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              description: 'Lucide icon name',
              options: {list: ICON_OPTIONS.map((v) => ({title: v, value: v}))},
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'href',
              title: 'Link (optional)',
              type: 'string',
            }),
          ],
          preview: {
            select: {title: 'title', subtitle: 'description'},
          },
        },
      ],
    }),
  ],
  preview: {
    select: {heading: 'heading'},
    prepare({heading}) {
      return {title: heading || 'Feature Grid', subtitle: 'Feature Grid'}
    },
  },
})
