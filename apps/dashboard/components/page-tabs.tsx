import { Pressable, StyleSheet, Text, View } from 'react-native'
import { tokens } from '@odyssey/shared'
import { getPressableInteraction } from '../lib/pressable-state'

export function PageTabs<T extends string>({
  tabs,
  value,
  onChange
}: {
  tabs: Array<{ id: T; label: string }>
  value: T
  onChange: (id: T) => void
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        {tabs.map((tab) => {
          const active = tab.id === value
          return (
            <Pressable
              key={tab.id}
              onPress={() => onChange(tab.id)}
              style={(state) => {
                const { hovered } = getPressableInteraction(state)
                return [styles.tab, active && styles.tabActive, hovered && !active && styles.tabHover]
              }}
            >
              <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  track: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: tokens.colors.neutral[100],
    borderRadius: tokens.radius.lg,
    padding: 4,
    gap: 4
  },
  tab: { paddingVertical: 9, paddingHorizontal: 20, borderRadius: tokens.radius.md },
  tabActive: { backgroundColor: tokens.colors.surface, borderWidth: 1, borderColor: tokens.colors.neutral[200] },
  tabHover: { backgroundColor: tokens.colors.neutral[50] },
  label: { fontSize: tokens.typography.sizes.sm, fontWeight: tokens.typography.weights.medium, color: tokens.colors.neutral[500] },
  labelActive: { color: tokens.colors.brand[700], fontWeight: tokens.typography.weights.semibold }
})
