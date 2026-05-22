import { passwordValidation } from '@/shared/lib'
import z, { object } from 'zod'

export const newPasswordSchema = object({
  oldPassword: z.string().min(1, 'Это обязательное поле'),
  password: passwordValidation,
  passwordRepeat: z.string(),
}).superRefine(({ password, passwordRepeat, oldPassword }, ctx) => {
  if (password !== passwordRepeat) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Пароли должны совпадать',
      path: ['passwordRepeat'],
    })
  }

  if (password === oldPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Новый пароль должен отличаться от старого',
      path: ['password'],
    })
  }
})

export type newPasswordSchemaType = z.infer<typeof newPasswordSchema>
