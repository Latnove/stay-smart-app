import { passwordValidation } from '@/shared/lib'
import z, { object } from 'zod'

export const registerSchema = object({
  username: z.string().min(4, 'Минимальная длина 4 символа').max(20, 'Максимальная длина 20 символов'),
  email: z.email('Укажите существующую почту').min(1, 'Это обязательное поле'),
  password: passwordValidation,
  repeatPassword: z.string(),
  captcha: z.string().min(1, 'Пройдите капчу'),
}).refine(({ repeatPassword, password }) => repeatPassword === password, {
  message: 'Пароли не совпадают',
  path: ['repeatPassword'],
})

export const loginSchema = object({
  email: z.string().min(1, 'Это обязательное поле'),
  password: z.string().min(1, 'Это обязательное поле'),
  captcha: z.string().min(1, 'Пройдите капчу'),
})

export type RegisterType = z.infer<typeof registerSchema>
export type LoginType = z.infer<typeof loginSchema>
