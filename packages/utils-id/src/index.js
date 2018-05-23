// @flow

import nanoid from 'nanoid'

export opaque type ID: string = string

export const idType = (value: any): ID => (value: ID)

export const uniqueID = (): ID => idType(nanoid())
