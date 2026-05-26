import { Link, usePathname } from 'expo-router'
import { ReactNode } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { tokens } from '@odyssey/shared'
import { getPressableInteraction } from '../lib/pressable-state'

const NAV: Array<{
  section: string
  items: Array<{ href: '/' | '/orders' | '/menu' | '/crm' | '/settings' | '/ui-library'; label: string }>
}> = [
  {
    section: 'Operations',
    items: [
      { href: '/', label: 'Overview' },
      { href: '/orders', label: 'Orders' },
      { href: '/menu', label: 'Menu' },
      { href: '/crm', label: 'Customers' }
    ]
  },
  {
    section: 'System',
    items: [
      { href: '/settings', label: 'Settings' },
      { href: '/ui-library', label: 'Components' }
    ]
  }
]

export function AppShell({
  title,
  subtitle,
  children,
  actions,
  tabs
}: {
  title: string
  subtitle?: string
  children: ReactNode
  actions?: ReactNode
  tabs?: ReactNode
}) {
  const pathname = usePathname()

  return (
    <View style={styles.root}>
      <View style={styles.sidebar}>
        <View style={styles.brandBlock}>
          <Image source={require('../assets/Ody.png')} style={styles.logoImage} resizeMode="contain" />
          <View style={styles.brandCopy}>
            <Text style={styles.venue}>Ody</Text>
            <Text style={styles.role}>Restaurant experience</Text>
          </View>
        </View>

        <View style={styles.navContainer}>
          {NAV.map((group) => (
            <View key={group.section} style={styles.navGroup}>
              <Text style={styles.navSection}>{group.section}</Text>
              {group.items.map((item) => {
                const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

                return (
                  <Link key={item.href} href={item.href} asChild>
                    <Pressable
                      style={(state) => {
                        const { hovered } = getPressableInteraction(state)
                        return [
                          styles.navItem,
                          active && styles.navItemActive,
                          hovered && !active && styles.navItemHover
                        ]
                      }}
                    >
                      <View style={styles.navItemContent}>
                        <View style={[styles.navAccent, active && styles.navAccentActive]} />
                        <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
                      </View>
                    </Pressable>
                  </Link>
                )
              })}
            </View>
          ))}
        </View>

        <View style={styles.sidebarFooter}>
          <Text style={styles.footerLabel}>Ody dashboard</Text>
          <Text style={styles.footerVersion}>v0.0.1</Text>
        </View>
      </View>

      <ScrollView style={styles.main} contentContainerStyle={styles.mainInner} showsVerticalScrollIndicator={false}>
        <View style={styles.pageTop}>
          <View style={styles.pageHeading}>
            <Text style={styles.pageTitle}>{title}</Text>
            {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
          </View>
          {actions ? <View style={styles.pageActions}>{actions}</View> : null}
        </View>
        {tabs}
        <View style={styles.pageContent}>{children}</View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: tokens.colors.canvas, height: '100%', width: '100%' },
  sidebar: {
    width: 280,
    backgroundColor: tokens.colors.surface,
    borderRightWidth: 1,
    borderRightColor: tokens.border.subtle,
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 22
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: tokens.border.subtle
  },
  brandCopy: {
    flex: 1,
    marginLeft: 14
  },
  venue: {
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.neutral[900],
    letterSpacing: -0.4,
    lineHeight: 24
  },
  role: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.medium,
    color: tokens.colors.neutral[600],
    lineHeight: 20,
    marginTop: 4
  },
  navContainer: {
    gap: 18,
    marginBottom: 24
  },
  navGroup: {
    gap: 10,
    padding: 16,
    borderRadius: tokens.radius.xl,
    backgroundColor: tokens.colors.neutral[50],
    borderWidth: 1,
    borderColor: tokens.border.subtle
  },
  navSection: {
    fontSize: 10,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10
  },
  navItem: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: tokens.radius.xl,
    backgroundColor: 'transparent'
  },
  navItemHover: {
    backgroundColor: tokens.colors.neutral[100]
  },
  navItemActive: {
    backgroundColor: tokens.colors.brand[50],
    borderColor: tokens.colors.brand[200],
    borderWidth: 1
  },
  navItemContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  navAccent: {
    width: 5,
    height: 30,
    borderRadius: tokens.radius.sm,
    backgroundColor: 'transparent',
    marginRight: 12
  },
  navAccentActive: {
    backgroundColor: tokens.colors.brand[500]
  },
  navLabel: {
    color: tokens.colors.neutral[700],
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.medium
  },
  navLabelActive: {
    color: tokens.colors.neutral[900],
    fontWeight: tokens.typography.weights.semibold
  },
  main: { flex: 1, minWidth: 0 },
  mainInner: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: tokens.layout.contentPadding,
    paddingTop: 26,
    paddingBottom: 32
  },
  pageTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 22,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.neutral[200]
  },
  pageHeading: {
    flex: 1,
    minWidth: 0,
    gap: 6
  },
  pageTitle: {
    fontSize: tokens.typography.sizes['2xl'],
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.neutral[900],
    letterSpacing: -0.6
  },
  pageSubtitle: {
    fontSize: tokens.typography.sizes.sm,
    color: tokens.colors.neutral[600],
    lineHeight: 20,
    maxWidth: 520
  },
  pageActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4
  },
  sidebarFooter: {
    marginTop: 'auto',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: tokens.border.subtle,
    gap: 6
  },
  footerLabel: {
    color: tokens.colors.neutral[500],
    fontSize: tokens.typography.sizes.xs,
    lineHeight: 16
  },
  footerVersion: {
    color: tokens.colors.brand[500],
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.semibold
  },
  pageContent: {
    width: '100%',
    gap: tokens.layout.gridGap
  },
  logoImage: {
    width: 52,
    height: 52,
    borderRadius: tokens.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: '#172247'
  }
})
