import clsx from 'clsx'

import { ErrorText } from '@/shared/ui/Error/ErrorText'
import { Input } from 'antd'
import type { TextAreaProps } from 'antd/es/input'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import styles from './TextareaField.module.css'

interface TextareaFieldProps<T extends FieldValues> extends TextAreaProps {
  control: Control<T>
  name: FieldPath<T>
  isSuccessVisible?: boolean
}

export const TextareaField = <T extends FieldValues>({
  control,
  name,
  isSuccessVisible,
  className,
  ...props
}: TextareaFieldProps<T>) => {
  return (
    <div className={styles.field}>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState: { error, invalid, isTouched } }) => (
          <div>
            <Input.TextArea
              {...field}
              {...props}
              className={clsx(
                styles.textarea,
                {
                  [styles.textareaError]: invalid,
                  [styles.textareaSuccess]: isSuccessVisible && isTouched && !invalid,
                },
                className,
              )}
            />

            {error && <ErrorText error={error} />}
          </div>
        )}
      />
    </div>
  )
}
