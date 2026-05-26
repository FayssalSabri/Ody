import type { PressableStateCallbackType } from 'react-native'

type WebPressableState = PressableStateCallbackType & {
  hovered?: boolean
  focused?: boolean
}

export function getPressableInteraction(state: PressableStateCallbackType) {
  const webState = state as WebPressableState

  return {
    pressed: state.pressed,
    hovered: Boolean(webState.hovered),
    focused: Boolean(webState.focused)
  }
}
