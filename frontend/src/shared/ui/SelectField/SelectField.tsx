import clsx from 'clsx'

import { ErrorText } from '@/shared/ui/Error/ErrorText'
import type { SelectProps } from 'antd'
import { Select } from 'antd'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import styles from './SelectField.module.css'

interface SelectFieldProps<T extends FieldValues> extends SelectProps {
  control: Control<T>
  name: FieldPath<T>
  isSuccessVisible?: boolean
}

export const SelectField = <T extends FieldValues>({
  control,
  name,
  isSuccessVisible = true,
  className,
  ...props
}: SelectFieldProps<T>) => {
  return (
    <div className={styles.field}>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState: { error, invalid, isTouched } }) => (
          <div>
            <Select
              {...field}
              {...props}
              className={clsx(
                styles.select,
                {
                  [styles.selectError]: invalid,
                  [styles.selectSuccess]: isSuccessVisible && isTouched,
                },
                className,
              )}
              onChange={(value) => {
                field.onChange(value)
              }}
            />
            {error && <ErrorText error={error} />}
          </div>
        )}
      />
    </div>
  )
}
