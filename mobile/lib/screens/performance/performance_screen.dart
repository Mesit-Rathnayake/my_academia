import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/academic_provider.dart';
import '../../theme/app_theme.dart';

class PerformanceScreen extends StatefulWidget {
  const PerformanceScreen({super.key});

  @override
  State<PerformanceScreen> createState() => _PerformanceScreenState();
}

class _PerformanceScreenState extends State<PerformanceScreen> {
  final Set<String> _expandedSemesters = {};

  Color _getGradeColor(String grade) {
    if (grade.startsWith('A')) return AppTheme.success;
    if (grade.startsWith('B')) return AppTheme.secondary;
    if (grade.startsWith('C')) return AppTheme.warning;
    return AppTheme.danger;
  }

  @override
  Widget build(BuildContext context) {
    final academic = Provider.of<AcademicProvider>(context);
    final gpa = academic.performance;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Academic Performance'),
      ),
      body: RefreshIndicator(
        onRefresh: () => academic.fetchDashboardData(),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero OGPA Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.primary,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primary.withOpacity(0.35),
                      blurRadius: 16,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'CUMULATIVE GPA (OGPA)',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFFC7D2FE), letterSpacing: 0.5),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              gpa != null ? gpa.ogpa.toStringAsFixed(2) : '—',
                              style: const TextStyle(fontSize: 44, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -1),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.white.withOpacity(0.3)),
                          ),
                          child: Text(
                            gpa?.classification ?? 'In Progress',
                            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _statItem('Total Credits', '${gpa?.totalCredits ?? '—'}'),
                          Container(width: 1, height: 24, color: Colors.white.withOpacity(0.2)),
                          _statItem('GPA Credits', '${gpa?.totalGpaCredits ?? '—'}'),
                          Container(width: 1, height: 24, color: Colors.white.withOpacity(0.2)),
                          _statItem('Weighted Points', gpa != null ? gpa.totalWeightedPoints.toStringAsFixed(1) : '—'),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              const Text(
                'Semester SGPA Breakdown',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 12),

              if (gpa == null || gpa.semesters.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppTheme.card,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.cardBorder),
                  ),
                  child: const Center(
                    child: Text('No semester records found.', style: TextStyle(color: AppTheme.textSecondary)),
                  ),
                )
              else
                ...gpa.semesters.entries.map((entry) {
                  final semKey = entry.key;
                  final semData = entry.value;
                  final isExpanded = _expandedSemesters.contains(semKey);
                  final semModules = gpa.modules.where((m) => m.semester.toString() == semKey).toList();

                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: AppTheme.card,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppTheme.cardBorder),
                    ),
                    child: Column(
                      children: [
                        ListTile(
                          onTap: () {
                            setState(() {
                              if (isExpanded) {
                                _expandedSemesters.remove(semKey);
                              } else {
                                _expandedSemesters.add(semKey);
                              }
                            });
                          },
                          leading: Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: AppTheme.primaryLight,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Center(
                              child: Text('S$semKey', style: const TextStyle(fontWeight: FontWeight.w900, color: AppTheme.primary)),
                            ),
                          ),
                          title: Text('Semester $semKey', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                          subtitle: Text('${semData.credits} Credits Counted', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                semData.sgpa.toStringAsFixed(2),
                                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.primary),
                              ),
                              const SizedBox(width: 8),
                              Icon(isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, color: AppTheme.textSecondary),
                            ],
                          ),
                        ),

                        if (isExpanded) ...[
                          const Divider(height: 1, color: AppTheme.cardBorder),
                          Padding(
                            padding: const EdgeInsets.all(12),
                            child: semModules.isEmpty
                                ? const Padding(
                                    padding: EdgeInsets.all(8.0),
                                    child: Text('No module grades available.', style: TextStyle(color: AppTheme.textSecondary, fontStyle: FontStyle.italic)),
                                  )
                                : Column(
                                    children: semModules.map((mod) => Container(
                                          margin: const EdgeInsets.only(bottom: 6),
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                          decoration: BoxDecoration(
                                            color: AppTheme.background,
                                            borderRadius: BorderRadius.circular(10),
                                            border: Border.all(color: AppTheme.cardBorder),
                                          ),
                                          child: Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      '${mod.moduleCode.isNotEmpty ? "${mod.moduleCode} - " : ""}${mod.moduleName}',
                                                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
                                                    ),
                                                    Text(
                                                      '${mod.credits} Credits • ${mod.isGpa ? "GPA" : "Non-GPA"}',
                                                      style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              Container(
                                                width: 36,
                                                height: 36,
                                                decoration: BoxDecoration(
                                                  color: _getGradeColor(mod.grade).withOpacity(0.12),
                                                  borderRadius: BorderRadius.circular(8),
                                                ),
                                                child: Center(
                                                  child: Text(
                                                    mod.grade.isNotEmpty ? mod.grade : '—',
                                                    style: TextStyle(
                                                      fontSize: 14,
                                                      fontWeight: FontWeight.w900,
                                                      color: _getGradeColor(mod.grade),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        )).toList(),
                                  ),
                          ),
                        ],
                      ],
                    ),
                  );
                }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _statItem(String label, String value) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFFC7D2FE), fontWeight: FontWeight.w600)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Colors.white)),
      ],
    );
  }
}
