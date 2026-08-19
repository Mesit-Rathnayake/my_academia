import React, { useState, useEffect, useContext } from 'react';
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
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import client from '../../api/client';
import { colors, spacing, radius, shadows } from '../../styles/theme';

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [gpaData, setGpaData] = useState(null);
  const [todayClasses, setTodayClasses] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Performance & GPA
      const gpaRes = await client.get('/gpa/calculate').catch(() => null);
      if (gpaRes?.data?.success) {
        setGpaData(gpaRes.data.data);
      }

      // 2. Fetch Timetable Entries
      const timetableRes = await client.get('/timetable').catch(() => null);
      if (timetableRes?.data) {
        const currentDayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon, ...
        // Map JS getDay (0=Sun) to our system (0=Mon, 1=Tue... 6=Sun)
        const mappedDay = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
        const classesToday = timetableRes.data.filter((c) => c.dayOfWeek === mappedDay);
        setTodayClasses(classesToday);
      }

      // 3. Fetch Exam Series / Exams
      const examRes = await client.get('/exam-series').catch(() => null);
      if (examRes?.data && Array.isArray(examRes.data)) {
        // Collect all exams from series
        let allExams = [];
        examRes.data.forEach((series) => {
          if (series.exams) {
            allExams = allExams.concat(series.exams);
          }
        });

        // Filter for upcoming dates
        const now = new Date();
        const futureExams = allExams
          .filter((e) => new Date(e.dateTime) >= now)
          .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

        setUpcomingExams(futureExams.slice(0, 3));
      }
    } catch (e) {
      console.warn('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getDaysRemaining = (dateString) => {
    const diffTime = new Date(dateString) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Top Greeting Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.firstName || 'Student'} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={36} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Syncing academic data...</Text>
          </View>
        ) : (
          <>
            {/* GPA Hero Card */}
            <View style={styles.gpaCard}>
              <View style={styles.gpaCardHeader}>
                <View>
                  <Text style={styles.gpaLabel}>Overall GPA (OGPA)</Text>
                  <Text style={styles.gpaValue}>
                    {gpaData?.ogpa !== undefined ? gpaData.ogpa.toFixed(2) : '—'}
                  </Text>
                </View>
                <View style={styles.classBadge}>
                  <Text style={styles.classBadgeText}>
                    {gpaData?.classification || 'Active'}
                  </Text>
                </View>
              </View>

              <View style={styles.gpaDivider} />

              <View style={styles.gpaStatsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Credits Counted</Text>
                  <Text style={styles.statVal}>{gpaData?.totalGpaCredits ?? '—'}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Completed Modules</Text>
                  <Text style={styles.statVal}>{gpaData?.modules?.length ?? '—'}</Text>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Schedule')}
              >
                <View style={[styles.actionIconBg, { backgroundColor: colors.primaryLight }]}>
                  <Feather name="calendar" size={22} color={colors.primary} />
                </View>
                <Text style={styles.actionTitle}>Class Timetable</Text>
                <Text style={styles.actionDesc}>View week plan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Performance')}
              >
                <View style={[styles.actionIconBg, { backgroundColor: colors.successLight }]}>
                  <Feather name="trending-up" size={22} color={colors.success} />
                </View>
                <Text style={styles.actionTitle}>GPA Analysis</Text>
                <Text style={styles.actionDesc}>Semesters & rules</Text>
              </TouchableOpacity>
            </View>

            {/* Today's Schedule Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Schedule</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
                  <Text style={styles.sectionLink}>View All</Text>
                </TouchableOpacity>
              </View>

              {todayClasses.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Feather name="coffee" size={28} color={colors.textMuted} />
                  <Text style={styles.emptyText}>No classes scheduled for today.</Text>
                </View>
              ) : (
                todayClasses.map((item, idx) => (
                  <View key={item.id || idx} style={styles.classCard}>
                    <View style={styles.classTimeBox}>
                      <Text style={styles.classTimeText}>{item.startTime}</Text>
                      <Text style={styles.classEndTimeText}>{item.endTime}</Text>
                    </View>
                    <View style={styles.classDetails}>
                      <Text style={styles.classTitle}>{item.type || item.moduleName || 'Lecture'}</Text>
                      <View style={styles.classMetaRow}>
                        <Feather name="map-pin" size={12} color={colors.textSecondary} />
                        <Text style={styles.classMetaText}>{item.location || 'Main Hall'}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Upcoming Exams Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Examinations</Text>
              </View>

              {upcomingExams.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Feather name="check-circle" size={28} color={colors.success} />
                  <Text style={styles.emptyText}>No upcoming exams in the schedule.</Text>
                </View>
              ) : (
                upcomingExams.map((exam, idx) => (
                  <View key={exam.id || idx} style={styles.examCard}>
                    <View style={styles.examIconBg}>
                      <MaterialCommunityIcons name="file-document-edit-outline" size={24} color={colors.warning} />
                    </View>
                    <View style={styles.examDetails}>
                      <Text style={styles.examTitle}>{exam.subject || exam.title || 'Exam'}</Text>
                      <Text style={styles.examDate}>
                        {new Date(exam.dateTime).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <View style={styles.examBadge}>
                      <Text style={styles.examBadgeText}>{getDaysRemaining(exam.dateTime)}</Text>
                    </View>
                  </View>
                ))
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  avatarButton: {
    padding: spacing.xs,
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
  gpaCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  gpaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gpaLabel: {
    color: '#c7d2fe',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gpaValue: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: spacing.xs,
    letterSpacing: -1,
  },
  classBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  classBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  gpaDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: spacing.md,
  },
  gpaStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#c7d2fe',
    fontSize: 11,
    fontWeight: '600',
  },
  statVal: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.sm,
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sectionLink: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  classCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    ...shadows.sm,
  },
  classTimeBox: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    marginRight: spacing.md,
    minWidth: 70,
  },
  classTimeText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  classEndTimeText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  classDetails: {
    flex: 1,
  },
  classTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  classMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  classMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  examCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    ...shadows.sm,
  },
  examIconBg: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  examDetails: {
    flex: 1,
  },
  examTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  examDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  examBadge: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  examBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
  },
});
