import {person} from './documents/person'
import {page} from './documents/page'
import {post} from './documents/post'
import {lead} from './documents/lead'
import {callToAction} from './objects/callToAction'
import {infoSection} from './objects/infoSection'
import {featureGrid} from './objects/featureGrid'
import {pricingTable} from './objects/pricingTable'
import {leadCaptureForm} from './objects/leadCaptureForm'
import {settings} from './singletons/settings'
import {link} from './objects/link'
import {blockContent} from './objects/blockContent'
import button from './objects/button'
import {blockContentTextOnly} from './objects/blockContentTextOnly'

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/studio/schema-types

export const schemaTypes = [
  // Singletons
  settings,
  // Documents
  page,
  post,
  person,
  lead,
  // Objects
  button,
  blockContent,
  blockContentTextOnly,
  infoSection,
  callToAction,
  featureGrid,
  pricingTable,
  leadCaptureForm,
  link,
]
