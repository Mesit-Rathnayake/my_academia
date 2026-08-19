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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import client from '../../api/client';
import { colors, spacing, radius, shadows } from '../../styles/theme';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ScheduleScreen() {
  const [selectedDay, setSelectedDay] = useState(0); // 0 = Mon, ... 6 = Sun
  const [timetable, setTimetable] = useState([]);
  const [examSeries, setExamSeries] = useState([]);
  const [activeTab, setActiveTab] = useState('classes'); // 'classes' | 'exams'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Set default day to today
  useEffect(() => {
    const day = new Date().getDay();
    setSelectedDay(day === 0 ? 6 : day - 1);
  }, []);

  const fetchData = async () => {
    try {
      const [tRes, eRes] = await Promise.all([
        client.get('/timetable').catch(() => ({ data: [] })),
        client.get('/exam-series').catch(() => ({ data: [] })),
      ]);

      setTimetable(tRes.data || []);
      setExamSeries(eRes.data || []);
    } catch (e) {
      console.warn('Error fetching schedule:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const dayClasses = timetable
    .filter((entry) => entry.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Academic Schedule</Text>
        <Text style={styles.headerSubtitle}>Classes, lectures & exam timetables</Text>

        {/* Classes vs Exams Switcher */}
        <View style={styles.tabToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'classes' && styles.toggleBtnActive]}
            onPress={() => setActiveTab('classes')}
          >
            <Feather
              name="calendar"
              size={16}
              color={activeTab === 'classes' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[styles.toggleText, activeTab === 'classes' && styles.toggleTextActive]}
            >
              Weekly Classes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'exams' && styles.toggleBtnActive]}
            onPress={() => setActiveTab('exams')}
          >
            <MaterialCommunityIcons
              name="file-document-edit-outline"
              size={16}
              color={activeTab === 'exams' ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.toggleText, activeTab === 'exams' && styles.toggleTextActive]}>
              Exam Series
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'classes' ? (
        <>
          {/* Day of Week Selector */}
          <View style={styles.daySelectorContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayList}>
              {DAYS.map((day, idx) => {
                const isSelected = selectedDay === idx;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                    onPress={() => setSelectedDay(idx)}
                  >
                    <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
            }
          >
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
            ) : dayClasses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Feather name="coffee" size={36} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No classes on this day</Text>
                <Text style={styles.emptySubtitle}>Enjoy your free time or catch up on studies.</Text>
              </View>
            ) : (
              dayClasses.map((item, idx) => (
                <View key={item.id || idx} style={styles.classCard}>
                  <View style={styles.timeColumn}>
                    <Text style={styles.startTime}>{item.startTime}</Text>
                    <View style={styles.timeLine} />
                    <Text style={styles.endTime}>{item.endTime}</Text>
                  </View>

                  <View style={styles.classCardBody}>
                    <View style={styles.classBadgeRow}>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>LECTURE</Text>
                      </View>
                    </View>

                    <Text style={styles.className}>{item.type || item.moduleName || 'Class'}</Text>

                    <View style={styles.metaRow}>
                      <Feather name="map-pin" size={13} color={colors.textSecondary} />
                      <Text style={styles.locationText}>{item.location || 'Lecture Hall'}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
          ) : examSeries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="calendar-blank" size={36} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No exam series scheduled</Text>
              <Text style={styles.emptySubtitle}>Exam timetables will appear here once added.</Text>
            </View>
          ) : (
            examSeries.map((series, idx) => (
              <View key={series.id || idx} style={styles.seriesCard}>
                <View style={styles.seriesHeader}>
                  <Text style={styles.seriesTitle}>{series.title || 'Exam Series'}</Text>
                  <Text style={styles.seriesCount}>{series.exams?.length || 0} Papers</Text>
                </View>

                {series.exams && series.exams.length > 0 ? (
                  series.exams.map((ex, eIdx) => (
                    <View key={ex.id || eIdx} style={styles.examItem}>
                      <View style={styles.examDot} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.examItemSubject}>{ex.subject || ex.title}</Text>
                        <Text style={styles.examItemDate}>
                          {new Date(ex.dateTime).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </Text>
                      </View>
                      {ex.location ? (
                        <View style={styles.examItemLocation}>
                          <Text style={styles.examItemLocationText}>{ex.location}</Text>
                        </View>
                      ) : null}
                    </View>
                  ))
                ) : (
                  <Text style={styles.noExamsText}>No papers added to this series yet.</Text>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderColor: colors.cardBorder,
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
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: colors.cardMuted,
    borderRadius: radius.md,
    padding: 4,
    marginTop: spacing.md,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  toggleBtnActive: {
    backgroundColor: colors.card,
    ...shadows.sm,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  daySelectorContainer: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: spacing.sm,
  },
  dayList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  dayButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.cardMuted,
    minWidth: 48,
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  dayTextSelected: {
    color: '#ffffff',
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  classCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.sm,
  },
  timeColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: spacing.md,
    borderRightWidth: 1,
    borderColor: colors.cardBorder,
    minWidth: 70,
  },
  startTime: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  timeLine: {
    width: 2,
    height: 16,
    backgroundColor: colors.primaryLight,
    marginVertical: 4,
  },
  endTime: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  classCardBody: {
    flex: 1,
    paddingLeft: spacing.md,
    justifyContent: 'center',
  },
  classBadgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  typeBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  typeBadgeText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  className: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  seriesCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.sm,
  },
  seriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.cardBorder,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  seriesTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
  },
  seriesCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  examItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.cardMuted,
  },
  examDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
    marginRight: spacing.md,
  },
  examItemSubject: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  examItemDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  examItemLocation: {
    backgroundColor: colors.cardMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.md,
  },
  examItemLocationText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  noExamsText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
