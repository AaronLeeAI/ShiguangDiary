import type { StyleProp, ViewStyle } from 'react-native'

export interface CalendarDay {
  key: string
  day: number
  inCurrentMonth?: boolean
  isToday?: boolean
  selected?: boolean
  hasDiary?: boolean
}

export interface CalendarProps {
  title?: string
  weekdayLabels?: string[]
  days?: CalendarDay[]
  onPrev?: () => void
  onNext?: () => void
  onSelectDate?: (day: CalendarDay) => void
  style?: StyleProp<ViewStyle>
  testID?: string
}
