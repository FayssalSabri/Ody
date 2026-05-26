import { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { tokens } from '@odyssey/shared'

const cardBase = {
  backgroundColor: tokens.colors.surface,
  borderRadius: tokens.radius.lg,
  borderWidth: 1,
  borderColor: tokens.border.subtle,
  overflow: 'hidden' as const
}

export function MetricCard({
  label,
  value,
  hint,
  accent = 'default'
}: {
  label: string
  value: string | number
  hint?: string
  accent?: 'default' | 'warning' | 'brand'
}) {
  return (
    <View style={[styles.metric, accent === 'brand' && styles.metricBrand, accent === 'warning' && styles.metricWarn]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {hint ? <Text style={styles.metricHint}>{hint}</Text> : null}
    </View>
  )
}

export function MetricGrid({ children }: { children: ReactNode }) {
  return <View style={styles.metricGrid}>{children}</View>
}

export function Card({
  title,
  subtitle,
  children,
  action,
  flush
}: {
  title?: string
  subtitle?: string
  children: ReactNode
  action?: ReactNode
  flush?: boolean
}) {
  return (
    <View style={cardBase}>
      {title ? (
        <View style={styles.cardHead}>
          <View style={styles.cardHeadText}>
            <Text style={styles.cardTitle}>{title}</Text>
            {subtitle ? <Text style={styles.cardSub}>{subtitle}</Text> : null}
          </View>
          {action}
        </View>
      ) : null}
      <View style={[styles.cardBody, flush && styles.cardBodyFlush]}>{children}</View>
    </View>
  )
}

export const ContentCard = Card
export const Panel = Card

export function DetailCard({
  title,
  badge,
  children,
  footer
}: {
  title: string
  badge?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <View style={cardBase}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>{title}</Text>
        {badge}
      </View>
      <View style={styles.cardBody}>{children}</View>
      {footer ? <View style={styles.cardFoot}>{footer}</View> : null}
    </View>
  )
}

export const DetailPanel = DetailCard

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kv}>
      <Text style={styles.kvLabel}>{label}</Text>
      <Text style={styles.kvValue}>{value}</Text>
    </View>
  )
}

export function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {children}
    </View>
  )
}

export function LineItemRow({ name, quantity, subtotal }: { name: string; quantity: number; subtotal: string }) {
  return (
    <View style={styles.line}>
      <View style={styles.lineMain}>
        <Text style={styles.lineName}>{name}</Text>
        <Text style={styles.lineQty}>×{quantity}</Text>
      </View>
      <Text style={styles.linePrice}>{subtotal}</Text>
    </View>
  )
}

export function ListRow({ leading, trailing }: { leading: ReactNode; trailing?: ReactNode }) {
  return (
    <View style={styles.listRow}>
      <View style={styles.listLead}>{leading}</View>
      {trailing ? <View style={styles.listTrail}>{trailing}</View> : null}
    </View>
  )
}

export function FilterCard({ children }: { children: ReactNode }) {
  return (
    <View style={[cardBase, styles.filterCard]}>
      <View style={styles.filterInner}>{children}</View>
    </View>
  )
}

export const Toolbar = FilterCard
export function ToolbarGroup({ children, grow }: { children: ReactNode; grow?: boolean }) {
  return <View style={[styles.filterGroup, grow && styles.filterGrow]}>{children}</View>
}

const styles = StyleSheet.create({
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  metric: { ...cardBase, flex: 1, minWidth: 160, padding: 20, gap: 6 },
  metricBrand: { borderColor: tokens.colors.brand[200], backgroundColor: tokens.colors.brand[50] },
  metricWarn: { borderColor: tokens.colors.semantic.warning.border, backgroundColor: tokens.colors.semantic.warning.bg },
  metricLabel: { fontSize: tokens.typography.sizes.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.weights.medium, textTransform: 'uppercase', letterSpacing: 0.5 },
  metricValue: { fontSize: 26, fontWeight: tokens.typography.weights.bold, color: tokens.colors.neutral[900], letterSpacing: -0.5 },
  metricHint: { fontSize: tokens.typography.sizes.xs, color: tokens.colors.semantic.warning.text },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: tokens.border.subtle,
    gap: 12
  },
  cardHeadText: { flex: 1, gap: 2 },
  cardTitle: { fontSize: tokens.typography.sizes.md, fontWeight: tokens.typography.weights.semibold, color: tokens.colors.neutral[900] },
  cardSub: { fontSize: tokens.typography.sizes.xs, color: tokens.colors.neutral[500] },
  cardBody: { padding: 16, gap: 12 },
  cardBodyFlush: { padding: 0 },
  cardFoot: { padding: 20, borderTopWidth: 1, borderTopColor: tokens.border.subtle, backgroundColor: tokens.colors.neutral[50], gap: 12 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  kvLabel: { fontSize: tokens.typography.sizes.sm, color: tokens.colors.neutral[500] },
  kvValue: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.neutral[900],
    textAlign: 'right',
    flex: 1,
    fontVariant: ['tabular-nums']
  },
  section: { gap: 8, marginTop: 4 },
  sectionLabel: { fontSize: 10, fontWeight: tokens.typography.weights.semibold, color: tokens.colors.neutral[400], textTransform: 'uppercase', letterSpacing: 0.6 },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: tokens.border.subtle },
  lineMain: { flex: 1, gap: 2 },
  lineName: { fontSize: tokens.typography.sizes.sm, fontWeight: tokens.typography.weights.medium, color: tokens.colors.neutral[900] },
  lineQty: { fontSize: tokens.typography.sizes.xs, color: tokens.colors.neutral[500] },
  linePrice: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.neutral[800],
    textAlign: 'right',
    minWidth: 72,
    fontVariant: ['tabular-nums']
  },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: tokens.border.subtle, gap: 12 },
  listLead: { flex: 1, gap: 2 },
  listTrail: { alignItems: 'flex-end', justifyContent: 'center', gap: 6, flexShrink: 0 },
  filterCard: {},
  filterInner: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: 16, padding: 16 },
  filterGroup: { gap: 6, minWidth: 140 },
  filterGrow: { flex: 1, minWidth: 200 }
})
