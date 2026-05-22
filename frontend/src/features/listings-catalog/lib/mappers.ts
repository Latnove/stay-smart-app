import type { IListingFilters } from '../model/useListingsStore'
import type { FiltersForm } from './validation'

export const mapFormFieldsToStore = (formFields: FiltersForm): IListingFilters => ({
  city: formFields.city || undefined,
  priceFrom: formFields.priceFrom ?? undefined,
  priceTo: formFields.priceTo ?? undefined,
  minGuests: formFields.minGuests ?? undefined,
  ratingFrom: formFields.rating?.[0] ?? undefined,
  ratingTo: formFields.rating?.[1] ?? undefined,
  category: formFields.category ?? undefined,
})

export const mapStoreFieldsToForm = (filters: IListingFilters): FiltersForm => ({
  city: filters.city ?? null,
  priceFrom: filters.priceFrom ?? null,
  priceTo: filters.priceTo ?? null,
  minGuests: filters.minGuests ?? null,

  rating:
    filters.ratingFrom !== undefined && filters.ratingTo !== undefined
      ? [filters.ratingFrom, filters.ratingTo]
      : [0, 5],

  category: filters.category?.map((el) => String(el)) ?? null,
})
