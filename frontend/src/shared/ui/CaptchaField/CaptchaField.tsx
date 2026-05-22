import { Turnstile, type TurnstileProps } from '@marsidev/react-turnstile'
import { Skeleton } from 'antd'
import { useEffect, useState } from 'react'
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  type UseFormClearErrors,
  type UseFormSetError,
} from 'react-hook-form'
import { ErrorText } from '../Error/ErrorText'
import styles from './CapthcaField.module.css'

interface ICaptchaField<T extends FieldValues> extends Omit<TurnstileProps, 'siteKey'> {
  control: Control<T>
  name: FieldPath<T>
  setError: UseFormSetError<T>
  clearErrors: UseFormClearErrors<T>
  className?: string
  siteKey?: string
}

const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

const getCaptchaErrorMessage = (code?: string) => {
  if (code === '110200') {
    return 'Домен не добавлен в Cloudflare Turnstile'
  }

  if (code === '110100' || code === '110110' || code === '400020') {
    return 'Неверный ключ Cloudflare Turnstile'
  }

  return 'Произошла ошибка, попробуйте еще раз'
}

export const CaptchaField = <T extends FieldValues>({
  control,
  name,
  className,
  setError,
  clearErrors,
  ...props
}: ICaptchaField<T>) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  useEffect(() => {
    const timerRef = setTimeout(() => {
      setIsLoaded(true)
    }, 800)

    return () => clearTimeout(timerRef)
  }, [])

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className={className}>
          {!isLoaded && (
            <Skeleton.Input
              className={styles.skeleton}
              active
              style={{
                width: '100%',
                height: '65px',
                borderRadius: '8px',
              }}
            />
          )}
          <ErrorText error={error} />

          <Turnstile
            {...props}
            options={{ ...props.options, size: !isLoaded ? 'invisible' : props.options?.size || 'compact' }}
            className={styles.captcha}
            siteKey={props.siteKey || siteKey}
            onSuccess={(token) => {
              field.onChange(token)
              clearErrors(name)
            }}
            onError={(code) => {
              field.onChange('')
              setError(name, {
                message: getCaptchaErrorMessage(code),
              })
            }}
            onExpire={() => {
              field.onChange('')
              setError(name, {
                message: 'Капча истекла, подтвердите еще раз',
              })
            }}
          />
        </div>
      )}
    />
  )
}
