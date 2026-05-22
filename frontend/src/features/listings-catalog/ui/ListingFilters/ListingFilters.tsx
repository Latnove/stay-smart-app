import { ListingCategoriesRecord } from '@/entities/listing'
import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { ErrorText } from '@/shared/ui/Error/ErrorText'
import { InputField } from '@/shared/ui/InputField/InputField'
import { zodResolver } from '@hookform/resolvers/zod'
import { Checkbox, Slider } from 'antd'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import { useEffect, useMemo, type FC } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useShallow } from 'zustand/shallow'
import { mapFormFieldsToStore, mapStoreFieldsToForm } from '../../lib/mappers'
import { filtersSchema, type FiltersForm } from '../../lib/validation'
import type { IListingFilters } from '../../model/useListingsStore'
import { actionFilters, selectFilters, useListingsStore } from '../../model/useListingsStore'
import styles from './ListingFilters.module.css'

interface IListingFiltersProps {
  className?: string
}

export const ListingFilters: FC<IListingFiltersProps> = ({ className }) => {
  const {
    handleSubmit,
    control,
    formState: { isDirty, isValid, errors },
    reset,
  } = useForm({
    defaultValues: {
      category: null,
      city: null,
      minGuests: null,
      priceFrom: null,
      priceTo: null,
      rating: [0, 5],
    },
    resolver: zodResolver(filtersSchema),
    mode: 'onBlur',
  })
  const { resetFilters, setFilters } = useListingsStore(useShallow(actionFilters))
  const filters = useListingsStore(useShallow(selectFilters))
  const mapped = useMemo(() => mapStoreFieldsToForm(filters), [filters])

  useEffect(() => {
    reset(mapped)
  }, [reset, mapped])

  const onSubmit = (values: FiltersForm) => {
    const storeFields: IListingFilters = mapFormFieldsToStore(values)

    setFilters(storeFields)
  }

  const onReset = () => {
    reset()
    resetFilters()
  }

  return (
    <div className={clsx(styles.filters, className)}>
      <div className={styles.container}>
        <Title level={3} className={styles.title}>
          Фильтры для подбора
        </Title>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.fieldWrapper}>
            <Title level={4} className={styles.fieldTitle}>
              Введите город
            </Title>
            <InputField name='city' control={control} placeholder='Москва' size='medium' />
          </div>

          <div className={styles.fieldWrapper}>
            <Title level={4} className={styles.fieldTitle}>
              Введите цену
            </Title>

            <div>
              {(errors.priceTo || errors.priceFrom) && <ErrorText error={errors.priceTo || errors.priceFrom} />}
              <div className={styles.fields}>
                <InputField
                  name='priceFrom'
                  control={control}
                  placeholder='0'
                  type='number'
                  size='medium'
                  visibleError={false}
                />

                <InputField
                  name='priceTo'
                  control={control}
                  placeholder='100000'
                  type='number'
                  size='medium'
                  visibleError={false}
                />
              </div>
            </div>
          </div>

          <div className={styles.fieldWrapper}>
            <Title level={4} className={styles.fieldTitle}>
              Минимальное число гостей
            </Title>

            <InputField name='minGuests' control={control} placeholder='2' type='number' size='medium' />
          </div>

          <div className={styles.fieldWrapper}>
            <Title level={4} className={styles.fieldTitle}>
              Тип жилья
            </Title>

            {errors.category && <ErrorText error={errors.category} />}
            <Controller
              control={control}
              name='category'
              render={({ field }) => (
                <Checkbox.Group
                  value={field.value ?? undefined}
                  options={Object.entries(ListingCategoriesRecord).map(([key, value]) => ({
                    value: key,
                    label: value.text,
                  }))}
                  onChange={field.onChange}
                  className={styles.checkbox}
                />
              )}
            />
          </div>

          <div className={styles.fieldWrapper}>
            <Title level={4} className={styles.fieldTitle}>
              Выберите рейтинг
            </Title>

            <Controller
              control={control}
              name='rating'
              render={({ field }) => {
                const value = [field.value?.[0] ?? 0, field.value?.[1] ?? 5]

                return (
                  <Slider
                    range={{ draggableTrack: true }}
                    min={0}
                    max={5}
                    marks={{
                      0: '0',
                      5: '5',
                    }}
                    tooltip={{
                      formatter: (v) => `${v} ★`,
                    }}
                    value={value}
                    onChange={(val: number | number[]) => {
                      if (Array.isArray(val)) {
                        field.onChange(val as [number, number])
                      }
                    }}
                  />
                )
              }}
            />
          </div>

          <div className={styles.buttons}>
            <ButtonField
              className={styles.primaryButton}
              onClick={handleSubmit(onSubmit)}
              disabled={!(isDirty && isValid)}
              isPrimary
              size='medium'
              type={!(isDirty && isValid) ? 'dashed' : 'primary'}
            >
              Применить
            </ButtonField>
            <ButtonField
              className={styles.secondaryButton}
              isSecondary
              variant='outlined'
              size='medium'
              onClick={onReset}
            >
              Сбросить
            </ButtonField>
          </div>
        </form>
      </div>
    </div>
  )
}
