import {defineField, defineType} from 'sanity'
import {TagIcon, ControlsIcon} from '@sanity/icons'

export const pricingTable = defineType({
  name: 'pricingTable',
  title: 'Pricing Table',
  type: 'object',
  icon: TagIcon,
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
      name: 'background',
      title: 'Background',
      type: 'string',
      initialValue: 'white',
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
      name: 'tiers',
      title: 'Tiers',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'object',
          name: 'pricingTier',
          fields: [
            defineField({
              name: 'name',
              title: 'Tier Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'price',
              title: 'Price',
              type: 'string',
              description: 'e.g. $299 or Custom',
            }),
            defineField({
              name: 'period',
              title: 'Period',
              type: 'string',
              description: 'e.g. per month or contact us',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'string',
            }),
            defineField({
              name: 'features',
              title: 'Features',
              type: 'array',
              of: [{type: 'string'}],
            }),
            defineField({
              name: 'ctaLabel',
              title: 'CTA Label',
              type: 'string',
              initialValue: 'Get started',
            }),
            defineField({
              name: 'ctaHref',
              title: 'CTA Link',
              type: 'string',
              initialValue: '/lab',
            }),
            defineField({
              name: 'highlighted',
              title: 'Highlighted',
              type: 'boolean',
              description: 'Renders with a black background to draw attention',
              initialValue: false,
            }),
          ],
          preview: {
            select: {title: 'name', subtitle: 'price'},
          },
        },
      ],
    }),
  ],
  preview: {
    select: {heading: 'heading'},
    prepare({heading}) {
      return {title: heading || 'Pricing Table', subtitle: 'Pricing Table'}
    },
  },
})
