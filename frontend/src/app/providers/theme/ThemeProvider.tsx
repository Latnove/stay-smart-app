import { ConfigProvider } from 'antd'
import { type ReactNode } from 'react'

interface IThemeProvider {
  children: ReactNode
}

export const ThemeProvider = ({ children }: IThemeProvider) => {
  const getCSSVar = (varName: string) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
    return value
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: getCSSVar('--color-primary'),
          colorSuccess: getCSSVar('--color-success'),
          colorError: getCSSVar('--color-error'),
          colorWarning: getCSSVar('--color-warning'),
          colorTextBase: getCSSVar('--color-text'),

          colorTextSecondary: getCSSVar('--color-text-half-shade'),
          colorTextTertiary: getCSSVar('--color-text-light'),
          colorTextDisabled: getCSSVar('--color-text-light'),

          colorBgBase: getCSSVar('--color-white'),
          colorBgContainer: getCSSVar('--color-bg-container'),
          colorBgLayout: getCSSVar('--color-bg-page'),
          colorBgElevated: getCSSVar('--color-white'),

          colorBorder: getCSSVar('--color-border'),
          colorBorderSecondary: getCSSVar('--color-border-dark'),

          colorSuccessBg: getCSSVar('--color-success-bg'),
          colorErrorBg: getCSSVar('--color-error-bg'),
          colorWarningBg: getCSSVar('--color-warning-bg'),

          boxShadow: getCSSVar('--shadow-sm'),
          boxShadowSecondary: getCSSVar('--shadow-md'),
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}
