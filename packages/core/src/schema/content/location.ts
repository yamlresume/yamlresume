/**
 * MIT License
 *
 * Copyright (c) 2023–Present PPResume (https://ppresume.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
import { z } from 'zod/v4'

import { joinNonEmptyString } from '@/utils'
import { CountryOptionSchema, SizedStringSchema } from '../primitives'

/**
 * A zod schema for a city.
 */
export const CitySchema = SizedStringSchema('city', 2, 64).meta({
  title: 'City',
  description: 'The city where you are located.',
  examples: ['San Francisco', 'New York', 'London', 'Tokyo'],
})

/**
 * A zod schema for an address.
 */
export const AddressSchema = SizedStringSchema('address', 4, 256).meta({
  title: 'Address',
  description: 'Your full address including street, apartment, etc.',
  examples: [
    '123 Main Street, Apt 4B',
    '456 Oak Avenue',
    '789 Pine Road, Suite 100',
  ],
})

/**
 * A zod schema for a postal code.
 */
export const PostalCodeSchema = SizedStringSchema('postalCode', 2, 16).meta({
  title: 'Postal Code',
  description: 'Your postal or ZIP code.',
  examples: ['94102', '10001', 'SW1A 1AA', '100-0001'],
})

/**
 * A zod schema for a region.
 */
export const RegionSchema = SizedStringSchema('region', 2, 64).meta({
  title: 'Region',
  description: 'Your state, province, or region.',
  examples: ['California', 'New York', 'England', 'Tokyo'],
})

/**
 * A zod schema for a location item.
 */
export const LocationItemSchema = z.object({
  // required fields
  city: CitySchema,

  // optional fields
  address: AddressSchema.nullish(),
  country: CountryOptionSchema.nullish(),
  postalCode: PostalCodeSchema.nullish(),
  region: RegionSchema.nullish(),
})

/**
 * A zod schema for location.
 */
export const LocationSchema = z.object({
  location: LocationItemSchema.nullish().meta({
    title: 'Location',
    description: joinNonEmptyString(
      [
        'The location section contains your geographical information,',
        'such as city, address, country, and postal code.',
      ],
      ' '
    ),
  }),
})
