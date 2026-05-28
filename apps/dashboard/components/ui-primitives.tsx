import { useMemo, useState } from 'react'
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from 'react-native'
import { tokens } from '@odyssey/shared'
import { getPressableInteraction } from '../lib/pressable-state'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type BadgeTone = 'info' | 'success' | 'warning' | 'error' | 'neutral'

type FeedbackTone = 'info' | 'success' | 'warning' | 'error'

const buttonStyles = {
  primary: {
    backgroundColor: tokens.colors.brand[600],
    borderColor: tokens.colors.brand[600]
  },
  secondary: {
    backgroundColor: tokens.colors.neutral[50],
    borderColor: tokens.colors.neutral[200]
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: tokens.colors.neutral[200]
  }
} as const

const badgeStyles: Record<BadgeTone, { backgroundColor: string; borderColor: string; color: string }> = {
  info: {
    backgroundColor: tokens.colors.semantic.info.bg,
    borderColor: tokens.colors.semantic.info.border,
    color: tokens.colors.semantic.info.text
  },
  success: {
    backgroundColor: tokens.colors.semantic.success.bg,
    borderColor: tokens.colors.semantic.success.border,
    color: tokens.colors.semantic.success.text
  },
  warning: {
    backgroundColor: tokens.colors.semantic.warning.bg,
    borderColor: tokens.colors.semantic.warning.border,
    color: tokens.colors.semantic.warning.text
  },
  error: {
    backgroundColor: tokens.colors.semantic.error.bg,
    borderColor: tokens.colors.semantic.error.border,
    color: tokens.colors.semantic.error.text
  },
  neutral: {
    backgroundColor: tokens.colors.neutral[100],
    borderColor: tokens.colors.neutral[200],
    color: tokens.colors.neutral[700]
  }
}

const feedbackStyles: Record<FeedbackTone, { backgroundColor: string; borderColor: string; color: string }> = {
  info: {
    backgroundColor: tokens.colors.semantic.info.bg,
    borderColor: tokens.colors.semantic.info.border,
    color: tokens.colors.semantic.info.text
  },
  success: {
    backgroundColor: tokens.colors.semantic.success.bg,
    borderColor: tokens.colors.semantic.success.border,
    color: tokens.colors.semantic.success.text
  },
  warning: {
    backgroundColor: tokens.colors.semantic.warning.bg,
    borderColor: tokens.colors.semantic.warning.border,
    color: tokens.colors.semantic.warning.text
  },
  error: {
    backgroundColor: tokens.colors.semantic.error.bg,
    borderColor: tokens.colors.semantic.error.border,
    color: tokens.colors.semantic.error.text
  }
}

type ButtonSize = 'sm' | 'md'

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  style
}: {
  children: React.ReactNode
  onPress?: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  fullWidth?: boolean
  style?: object
}) {
  const resolvedStyle = buttonStyles[variant]
  const sizeStyle = size === 'sm' ? styles.buttonSm : styles.buttonMd

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={(state) => {
        const { pressed, hovered, focused } = getPressableInteraction(state)

        return [
          styles.button,
          sizeStyle,
          resolvedStyle,
          disabled && styles.buttonDisabled,
          fullWidth && styles.buttonFullWidth,
          hovered && !disabled && variant === 'primary' && styles.buttonPrimaryHovered,
          hovered && !disabled && variant !== 'primary' && styles.buttonSecondaryHovered,
          focused && styles.buttonFocused,
          pressed && styles.buttonPressed,
          style
        ]
      }}
    >
      <Text
        style={[
          styles.buttonText,
          size === 'sm' && styles.buttonTextSm,
          variant === 'primary'
            ? styles.buttonTextPrimary
            : variant === 'ghost'
              ? styles.buttonTextGhost
              : styles.buttonTextSecondary
        ]}
      >
        {children}
      </Text>
    </Pressable>
  )
}

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  const resolved = badgeStyles[tone]
  const displayLabel = label.charAt(0).toUpperCase() + label.slice(1)

  return (
    <View style={[styles.badge, { backgroundColor: resolved.backgroundColor, borderColor: resolved.borderColor }]}>
      <Text style={[styles.badgeText, { color: resolved.color }]}>{displayLabel}</Text>
    </View>
  )
}

export function StatusBanner({
  tone = 'info',
  title,
  body
}: {
  tone?: FeedbackTone
  title: string
  body?: string
}) {
  const resolved = feedbackStyles[tone]

  return (
    <View style={[styles.banner, { backgroundColor: resolved.backgroundColor, borderColor: resolved.borderColor }]}>
      <Text style={[styles.bannerTitle, { color: resolved.color }]}>{title}</Text>
      {body ? <Text style={[styles.bannerBody, { color: resolved.color }]}>{body}</Text> : null}
    </View>
  )
}

export function ToastCard({
  tone = 'info',
  title,
  body
}: {
  tone?: FeedbackTone
  title: string
  body?: string
}) {
  return <StatusBanner tone={tone} title={title} body={body} />
}

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search…'
}: {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}) {
  return (
    <View style={styles.searchWrap}>
      <Text style={styles.searchIcon}>⌕</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={tokens.colors.neutral[400]}
        style={styles.searchInput}
      />
    </View>
  )
}

export function TextLink({ children, onPress }: { children: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Text style={styles.textLink}>{children}</Text>
    </Pressable>
  )
}

export function IconButton({
  label,
  onPress,
  disabled
}: {
  label: string
  onPress?: () => void
  disabled?: boolean
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={(state) => {
        const { hovered, pressed } = getPressableInteraction(state)

        return [
          styles.iconButton,
          (hovered || pressed) && styles.iconButtonHovered,
          disabled && styles.buttonDisabled
        ]
      }}
      accessibilityLabel={label}
    >
      <Text style={styles.iconButtonLabel}>+</Text>
    </Pressable>
  )
}

export function InputField({
  label,
  helperText,
  error,
  ...props
}: React.ComponentProps<typeof TextInput> & {
  label: string
  helperText?: string
  error?: string
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...props}
        style={[styles.input, error ? styles.inputError : null, props.style]}
        placeholderTextColor={tokens.colors.neutral[400]}
      />
      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
}

export function ToggleField({
  label,
  helperText,
  value,
  onValueChange
}: {
  label: string
  helperText?: string
  value: boolean
  onValueChange: (value: boolean) => void
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  )
}

export function SelectField({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select an option',
  helperText,
  error
}: {
  label: string
  value: string | null
  options: Array<{ label: string; value: string }>
  onSelect: (value: string) => void
  placeholder?: string
  helperText?: string
  error?: string
}) {
  const [open, setOpen] = useState(false)
  const currentLabel = useMemo(() => options.find((option) => option.value === value)?.label ?? placeholder, [options, placeholder, value])

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable onPress={() => setOpen(true)} style={[styles.selectTrigger, error ? styles.inputError : null]}>
        <Text style={styles.selectText}>{currentLabel}</Text>
      </Pressable>
      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Modal transparent visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <View style={styles.dropdownSheet}>
            {options.map((option) => (
              <Pressable
                key={option.value}
                style={styles.dropdownOption}
                onPress={() => {
                  onSelect(option.value)
                  setOpen(false)
                }}
              >
                <Text style={styles.dropdownOptionText}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

export function SectionCard({
  title,
  subtitle,
  children
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      <View style={styles.sectionBody}>{children}</View>
    </View>
  )
}

export function SkeletonBlock({ height = 16, width = '100%' as const }: { height?: number; width?: `${number}%` | number }) {
  return <View style={[styles.skeleton, { height, width }]} />
}

export type TableColumn<T> = {
  key: string
  header: string
  /** Grows to fill remaining row width (use for the primary label column). */
  flex?: number
  /** Fixed column width — use for price, status, and actions. */
  width?: number
  minWidth?: number
  align?: 'left' | 'right'
  render: (row: T) => React.ReactNode
}

function tableColumnStyle(column: Pick<TableColumn<unknown>, 'flex' | 'width' | 'minWidth'>) {
  if (column.width != null) {
    return { width: column.width, flexGrow: 0, flexShrink: 0 }
  }
  return { flex: column.flex ?? 1, minWidth: column.minWidth ?? 0 }
}

export function DataTable<T extends { id: number | string }>({
  columns,
  rows,
  onRowPress,
  selectedRowId,
  emptyMessage = 'No rows to display.'
}: {
  columns: TableColumn<T>[]
  rows: T[]
  onRowPress?: (row: T) => void
  selectedRowId?: number | string | null
  emptyMessage?: string
}) {
  if (rows.length === 0) {
    return <Text style={styles.tableEmpty}>{emptyMessage}</Text>
  }

  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        {columns.map((column) => (
          <Text
            key={column.key}
            style={[
              styles.tableHeaderCell,
              tableColumnStyle(column),
              column.align === 'right' && styles.tableHeaderCellRight
            ]}
          >
            {column.header}
          </Text>
        ))}
      </View>
      {rows.map((row) => {
        const isSelected = selectedRowId !== undefined && selectedRowId !== null && row.id === selectedRowId

        return (
          <Pressable
            key={row.id}
            onPress={onRowPress ? () => onRowPress(row) : undefined}
            style={(state) => {
              const { pressed, hovered, focused } = getPressableInteraction(state)

              return [
                styles.tableRow,
                isSelected && styles.tableRowSelected,
                hovered && !isSelected && styles.tableRowHovered,
                focused && styles.tableRowFocused,
                pressed && styles.tableRowPressed
              ]
            }}
          >
            {columns.map((column) => (
              <View
                key={column.key}
                style={[
                  styles.tableCell,
                  tableColumnStyle(column),
                  column.align === 'right' && styles.tableCellRight
                ]}
              >
                {column.render(row)}
              </View>
            ))}
          </Pressable>
        )
      })}
    </View>
  )
}

export function ModalSheet({
  title,
  visible,
  onClose,
  children
}: {
  title: string
  visible: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => undefined}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>
          </View>
          <View style={styles.modalBody}>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const webTransition = Platform.OS === 'web' ? { transition: 'all 0.2s ease-in-out' } : {}

const styles = StyleSheet.create({
  button: {
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...webTransition
  },
  buttonSm: {
    paddingVertical: 8,
    paddingHorizontal: 14
  },
  buttonMd: {
    paddingVertical: 10,
    paddingHorizontal: 18
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.neutral[50],
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    borderColor: tokens.border.subtle,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 8,
    marginBottom: 4
  },
  searchIcon: {
    color: tokens.colors.neutral[400],
    fontSize: 18
  },
  searchInput: {
    flex: 1,
    fontSize: tokens.typography.sizes.sm,
    color: tokens.colors.neutral[900],
    padding: 0
  },
  textLink: {
    color: tokens.colors.brand[700],
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.semibold
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.brand[600],
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconButtonHovered: {
    backgroundColor: tokens.colors.brand[700]
  },
  iconButtonLabel: {
    color: tokens.colors.neutral[0],
    fontSize: 22,
    fontWeight: tokens.typography.weights.medium,
    lineHeight: 24
  },
  buttonDisabled: {
    opacity: 0.5,
    ...(Platform.OS === 'web' ? { cursor: 'not-allowed' as any } : {})
  },
  buttonPrimaryHovered: {
    backgroundColor: tokens.colors.brand[700],
    borderColor: tokens.colors.brand[700]
  },
  buttonSecondaryHovered: {
    backgroundColor: tokens.colors.neutral[50]
  },
  buttonFocused: {
    borderColor: tokens.colors.brand[500],
    borderWidth: 2
  },
  buttonPressed: {
    transform: [{ scale: 0.99 }]
  },
  buttonFullWidth: {
    width: '100%'
  },
  buttonText: {
    fontWeight: tokens.typography.weights.semibold,
    fontSize: tokens.typography.sizes.sm
  },
  buttonTextSm: {
    fontSize: 13
  },
  buttonTextPrimary: {
    color: tokens.colors.neutral[0]
  },
  buttonTextSecondary: {
    color: tokens.colors.brand[700]
  },
  buttonTextGhost: {
    color: tokens.colors.brand[700]
  },
  badge: {
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start'
  },
  badgeText: {
    fontSize: 11,
    fontWeight: tokens.typography.weights.semibold,
    letterSpacing: 0.2
  },
  banner: {
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    padding: tokens.spacing[3]
  },
  bannerTitle: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.semibold
  },
  bannerBody: {
    marginTop: tokens.spacing[1],
    fontSize: tokens.typography.sizes.sm
  },
  fieldContainer: {
    gap: tokens.spacing[2]
  },
  fieldLabel: {
    color: tokens.colors.neutral[700],
    fontWeight: tokens.typography.weights.medium,
    fontSize: tokens.typography.sizes.sm
  },
  input: {
    borderWidth: 1,
    borderColor: tokens.border.subtle,
    backgroundColor: tokens.colors.neutral[0],
    borderRadius: tokens.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: tokens.typography.sizes.sm,
    color: tokens.colors.neutral[900]
  },
  inputError: {
    borderColor: tokens.colors.semantic.error.border
  },
  helperText: {
    color: tokens.colors.neutral[500],
    fontSize: tokens.typography.sizes.sm
  },
  errorText: {
    color: tokens.colors.semantic.error.text,
    fontSize: tokens.typography.sizes.sm
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: tokens.spacing[4]
  },
  toggleCopy: {
    flex: 1
  },
  selectTrigger: {
    borderWidth: 1,
    borderColor: tokens.border.subtle,
    backgroundColor: tokens.colors.neutral[50],
    borderRadius: tokens.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11
  },
  selectText: {
    color: tokens.colors.neutral[800],
    fontSize: tokens.typography.sizes.sm
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.22)',
    justifyContent: 'center',
    padding: tokens.spacing[4]
  },
  dropdownSheet: {
    backgroundColor: tokens.colors.neutral[0],
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing[2],
    gap: tokens.spacing[2]
  },
  dropdownOption: {
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[2],
    borderRadius: tokens.radius.md
  },
  dropdownOptionText: {
    color: tokens.colors.neutral[900]
  },
  sectionCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing[4],
    borderWidth: 1,
    borderColor: tokens.border.subtle,
    ...(Platform.OS === 'web' ? { boxShadow: tokens.shadow.sm } : {})
  },
  sectionTitle: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.neutral[900]
  },
  sectionSubtitle: {
    marginTop: tokens.spacing[1],
    color: tokens.colors.neutral[600]
  },
  sectionBody: {
    marginTop: tokens.spacing[3],
    gap: tokens.spacing[3]
  },
  skeleton: {
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.neutral[100]
  },
  modalSheet: {
    backgroundColor: tokens.colors.neutral[0],
    borderRadius: tokens.radius.xl,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.15,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    elevation: tokens.elevation[4],
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { boxShadow: tokens.shadow.modal } : {})
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing[4],
    paddingTop: tokens.spacing[4],
    paddingBottom: tokens.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: tokens.border.subtle
  },
  modalBody: {
    padding: tokens.spacing[4],
    gap: tokens.spacing[3]
  },
  modalTitle: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.neutral[900]
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.neutral[100]
  },
  modalCloseText: {
    color: tokens.colors.neutral[600],
    fontSize: tokens.typography.sizes.sm
  },
  table: {
    backgroundColor: tokens.colors.surface,
    overflow: 'hidden',
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.neutral[200],
    ...(Platform.OS === 'web' ? { boxShadow: tokens.shadow.card } : {})
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.neutral[100],
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.neutral[200],
    gap: 8
  },
  tableHeaderCell: {
    color: tokens.colors.neutral[500],
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.semibold,
    letterSpacing: 0.3,
    textTransform: 'uppercase'
  },
  tableHeaderCellRight: {
    textAlign: 'right'
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: tokens.border.subtle,
    gap: 8
  },
  tableRowSelected: {
    backgroundColor: tokens.colors.brand[50]
  },
  tableRowHovered: {
    backgroundColor: tokens.colors.neutral[50]
  },
  tableRowFocused: {
    borderColor: tokens.border.focus,
    borderWidth: 1
  },
  tableRowPressed: {
    backgroundColor: tokens.colors.neutral[100]
  },
  tableCell: {
    justifyContent: 'center'
  },
  tableCellRight: {
    alignItems: 'flex-end'
  },
  tableEmpty: {
    color: tokens.colors.neutral[600],
    padding: tokens.spacing[4]
  }
})
