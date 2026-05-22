import { ErrorText } from '@/shared/ui/Error/ErrorText'
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { Input, type InputProps } from 'antd'
import clsx from 'clsx'
import type { ChangeEvent } from 'react'
import { Controller, type Control, type FieldPath, type FieldValues, type RegisterOptions } from 'react-hook-form'

import styles from './InputField.module.css'

interface IInputField<T extends FieldValues> extends InputProps {
  control: Control<T>
  name: FieldPath<T>
  visibleError?: boolean
  isSuccessVisible?: boolean
  rules?: RegisterOptions<T, FieldPath<T>>
}

export const InputField = <T extends FieldValues>({
  control,
  name,
  className,
  rules,
  visibleError = true,
  isSuccessVisible = false,
  type,
  ...props
}: IInputField<T>) => {
  return (
    <div className={clsx(styles.field, className)}>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field, fieldState: { error, isDirty } }) => {
          const commonProps = {
            ...props,
            ...field,
            type,
            className: clsx(
              styles.input,
              error && styles.inputError,
              isSuccessVisible && isDirty && !error && styles.inputSuccess,
            ),
            onBlur: field.onBlur,
            onChange: (event: ChangeEvent<HTMLInputElement>) => {
              const value = event.target.value

              if (type === 'number') {
                field.onChange(value === '' ? 0 : Number(value))
                return
              }

              field.onChange(value)
            },
          }

          return (
            <div className={styles.inputContainer}>
              {type === 'password' ? (
                <Input.Password
                  {...commonProps}
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone className={styles.icon} /> : <EyeInvisibleOutlined className={styles.icon} />
                  }
                />
              ) : (
                <Input {...commonProps} />
              )}

              {visibleError && <ErrorText error={error} />}
            </div>
          )
        }}
      />
    </div>
  )
}
