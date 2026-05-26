import { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { tokens } from '@odyssey/shared'

/** Primary label in a table row (left column). */
export function CellPrimary({ children }: { children: ReactNode }) {
  return <Text style={styles.primary}>{children}</Text>
}

/** Secondary line under a primary label. */
export function CellSecondary({ children }: { children: ReactNode }) {
  return <Text style={styles.secondary}>{children}</Text>
}

/** Stacked primary + secondary in the first column. */
export function CellStack({ primary, secondary }: { primary: ReactNode; secondary?: ReactNode }) {
  return (
    <View style={styles.stack}>
      <Text style={styles.primary}>{primary}</Text>
      {secondary != null && secondary !== '' ? <Text style={styles.secondary}>{secondary}</Text> : null}
    </View>
  )
}

/** Right-aligned block for price, status, actions. */
export function CellEnd({ children }: { children: ReactNode }) {
  return <View style={styles.end}>{children}</View>
}

/** Monetary values — right-aligned, tabular figures. */
export function CellAmount({ children }: { children: ReactNode }) {
  return <Text style={styles.amount}>{children}</Text>
}

/** Muted metadata (dates, counts) on the right. */
export function CellMeta({ children }: { children: ReactNode }) {
  return <Text style={styles.meta}>{children}</Text>
}

/** Table action — understated text button, no icon. */
export function ActionLink({ children, onPress }: { children: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.action}>
      <Text style={styles.actionText}>{children}</Text>
    </Pressable>
  )
}

/** Stacked actions in the last column. */
export function CellActions({ children }: { children: ReactNode }) {
  return <View style={styles.actions}>{children}</View>
}

const styles = StyleSheet.create({
  stack: { gap: 1 },
  primary: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.neutral[900],
    lineHeight: 20
  },
  secondary: {
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.neutral[500],
    lineHeight: 16,
    marginTop: 1
  },
  end: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    alignSelf: 'flex-end'
  },
  amount: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.neutral[800],
    textAlign: 'right',
    fontVariant: ['tabular-nums']
  },
  meta: {
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.neutral[500],
    textAlign: 'right',
    lineHeight: 16
  },
  action: {
    paddingVertical: 2
  },
  actionText: {
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.brand[700],
    letterSpacing: 0.2
  },
  actions: {
    alignItems: 'flex-end',
    gap: 6
  }
})
