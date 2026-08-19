import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { colors, spacing, radius, shadows } from '../../styles/theme';

export default function PerformanceScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSemester, setExpandedSemester] = useState(null);

  const fetchPerformance = async () => {
    try {
      const res = await client.get('/gpa/calculate');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (e) {
      console.warn('Error fetching GPA calculation:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPerformance();
  };

  const toggleSemester = (sem) => {
    setExpandedSemester(expandedSemester === sem ? null : sem);
  };

  const getGradeColor = (grade) => {
    if (!grade) return colors.textSecondary;
    if (grade.startsWith('A')) return colors.success;
    if (grade.startsWith('B')) return colors.secondary;
    if (grade.startsWith('C')) return colors.warning;
    return colors.danger;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Academic Performance</Text>
          <Text style={styles.headerSubtitle}>Real-time GPA computation & semester records</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Computing GPA and classifications...</Text>
          </View>
        ) : (
          <>
            {/* Top OGPA Display */}
            <View style={styles.ogpaHero}>
              <View style={styles.ogpaTop}>
                <View>
                  <Text style={styles.ogpaHeading}>Cumulative GPA (OGPA)</Text>
                  <Text style={styles.ogpaNumber}>
                    {data?.ogpa !== undefined ? data.ogpa.toFixed(2) : '—'}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{data?.classification || 'In Progress'}</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Total Credits</Text>
                  <Text style={styles.statNumber}>{data?.totalCredits ?? '—'}</Text>
                </View>
                <View style={styles.statSeparator} />
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>GPA Credits</Text>
                  <Text style={styles.statNumber}>{data?.totalGpaCredits ?? '—'}</Text>
                </View>
                <View style={styles.statSeparator} />
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Weighted Points</Text>
                  <Text style={styles.statNumber}>
                    {data?.totalWeightedPoints ? data.totalWeightedPoints.toFixed(1) : '—'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Semester Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Semester SGPA Breakdown</Text>

              {data?.semesters && Object.keys(data.semesters).length > 0 ? (
                Object.entries(data.semesters).map(([semKey, semData]) => {
                  const isExpanded = expandedSemester === semKey;
                  const modulesInSem = (data.modules || []).filter(
                    (m) => String(m.semester) === String(semKey)
                  );

                  return (
                    <View key={semKey} style={styles.semesterCard}>
                      <TouchableOpacity
                        style={styles.semesterHeader}
                        onPress={() => toggleSemester(semKey)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.semesterLeft}>
                          <View style={styles.semNumberBadge}>
                            <Text style={styles.semNumberText}>S{semKey}</Text>
                          </View>
                          <View>
                            <Text style={styles.semTitle}>Semester {semKey}</Text>
                            <Text style={styles.semCredits}>{semData.credits} Credits Counted</Text>
                          </View>
                        </View>

                        <View style={styles.semesterRight}>
                          <Text style={styles.sgpaText}>
                            {semData.sgpa !== undefined ? semData.sgpa.toFixed(2) : '—'}
                          </Text>
                          <Feather
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={colors.textSecondary}
                          />
                        </View>
                      </TouchableOpacity>

                      {isExpanded ? (
                        <View style={styles.moduleList}>
                          {modulesInSem.length === 0 ? (
                            <Text style={styles.noModules}>No module grades in this semester.</Text>
                          ) : (
                            modulesInSem.map((mod, idx) => (
                              <View key={mod.id || idx} style={styles.moduleRow}>
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.moduleCode}>
                                    {mod.moduleCode || 'MOD'} - {mod.moduleName}
                                  </Text>
                                  <Text style={styles.moduleCredits}>
                                    {mod.credits} Credits • {mod.isGpa ? 'GPA' : 'Non-GPA'}
                                  </Text>
                                </View>
                                <View
                                  style={[
                                    styles.gradeBadge,
                                    { backgroundColor: `${getGradeColor(mod.grade)}15` },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.gradeText,
                                      { color: getGradeColor(mod.grade) },
                                    ]}
                                  >
                                    {mod.grade || '—'}
                                  </Text>
                                </View>
                              </View>
                            ))
                          )}
                        </View>
                      ) : null}
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Feather name="bar-chart-2" size={36} color={colors.textMuted} />
                  <Text style={styles.emptyText}>No semester performance data available.</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  ogpaHero: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  ogpaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ogpaHeading: {
    color: '#c7d2fe',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ogpaNumber: {
    fontSize: 44,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: spacing.xs,
    letterSpacing: -1,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: '#c7d2fe',
    fontSize: 11,
    fontWeight: '600',
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  statSeparator: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  semesterCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    ...shadows.sm,
  },
  semesterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  semesterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  semNumberBadge: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  semNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  semTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  semCredits: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  semesterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sgpaText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  moduleList: {
    borderTopWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.sm,
  },
  moduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.sm + 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  moduleCode: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  moduleCredits: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  gradeBadge: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '900',
  },
  noModules: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
