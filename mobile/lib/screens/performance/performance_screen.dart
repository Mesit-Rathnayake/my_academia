import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../providers/academic_provider.dart';
import '../../theme/app_theme.dart';

class PerformanceScreen extends StatefulWidget {
  const PerformanceScreen({super.key});

  @override
  State<PerformanceScreen> createState() => _PerformanceScreenState();
}

class _PerformanceScreenState extends State<PerformanceScreen> {
  final Set<String> _expandedSemesters = {};
  double _targetGpa = 3.70;
  final _degreeCreditsController = TextEditingController(text: '140');

  @override
  void dispose() {
    _degreeCreditsController.dispose();
    super.dispose();
  }

  Color _getGradeColor(String grade) {
    if (grade.startsWith('A')) return AppTheme.success;
    if (grade.startsWith('B')) return AppTheme.secondary;
    if (grade.startsWith('C')) return AppTheme.warning;
    return AppTheme.danger;
  }

  void _calculateTargetGpa() {
    final credits = int.tryParse(_degreeCreditsController.text) ?? 140;
    Provider.of<AcademicProvider>(context, listen: false).calculateProjection(_targetGpa, credits);
  }

  @override
  Widget build(BuildContext context) {
    final academic = Provider.of<AcademicProvider>(context);
    final gpa = academic.performance;
    final projection = academic.projectionResult;

    // Prepare chart spots
    List<FlSpot> spots = [];
    if (gpa != null && gpa.semesters.isNotEmpty) {
      final sortedKeys = gpa.semesters.keys.toList()..sort((a, b) => int.parse(a).compareTo(int.parse(b)));
      for (var key in sortedKeys) {
        final semNum = double.tryParse(key) ?? 1.0;
        final semGpa = gpa.semesters[key]?.sgpa ?? 0.0;
        spots.add(FlSpot(semNum, semGpa));
      }
    }

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
              const SizedBox(height: 20),

              // GPA Trend Line Chart
              if (spots.length >= 2) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.card,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppTheme.cardBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('SGPA Progression Trend', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.textPrimary)),
                      const SizedBox(height: 16),
                      SizedBox(
                        height: 160,
                        child: LineChart(
                          LineChartData(
                            minY: 0.0,
                            maxY: 4.0,
                            gridData: FlGridData(
                              show: true,
                              drawVerticalLine: false,
                              horizontalInterval: 1.0,
                              getDrawingHorizontalLine: (val) => const FlLine(color: AppTheme.cardBorder, strokeWidth: 1),
                            ),
                            titlesData: FlTitlesData(
                              rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                              topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                              bottomTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  getTitlesWidget: (val, _) => Text('S${val.toInt()}', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                                ),
                              ),
                              leftTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  interval: 1.0,
                                  reservedSize: 28,
                                  getTitlesWidget: (val, _) => Text(val.toStringAsFixed(0), style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                                ),
                              ),
                            ),
                            borderData: FlBorderData(show: false),
                            lineBarsData: [
                              LineChartBarData(
                                spots: spots,
                                isCurved: true,
                                color: AppTheme.primary,
                                barWidth: 3,
                                isStrokeCapRound: true,
                                dotData: const FlDotData(show: true),
                                belowBarData: BarAreaData(
                                  show: true,
                                  color: AppTheme.primary.withOpacity(0.12),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // "What Do I Need?" Calculator Section
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.card,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.cardBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.calculate_outlined, color: AppTheme.primary, size: 22),
                        SizedBox(width: 8),
                        Text('"What Do I Need?" Calculator', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Calculate the average SGPA you need in remaining credits to achieve your target degree class.',
                      style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                    ),
                    const SizedBox(height: 16),

                    // Target OGPA Select
                    const Text('TARGET OGPA', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.textSecondary)),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      decoration: BoxDecoration(
                        color: AppTheme.background,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.cardBorder),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<double>(
                          value: _targetGpa,
                          isExpanded: true,
                          items: const [
                            DropdownMenuItem(value: 4.00, child: Text('4.00 - Perfect')),
                            DropdownMenuItem(value: 3.70, child: Text('3.70 - First Class')),
                            DropdownMenuItem(value: 3.30, child: Text('3.30 - Second Upper')),
                            DropdownMenuItem(value: 3.00, child: Text('3.00 - Second Lower')),
                            DropdownMenuItem(value: 2.00, child: Text('2.00 - General Pass')),
                          ],
                          onChanged: (val) => setState(() => _targetGpa = val ?? 3.70),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Degree Credits
                    const Text('TOTAL DEGREE CREDITS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.textSecondary)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _degreeCreditsController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(hintText: 'e.g. 140'),
                    ),
                    const SizedBox(height: 16),

                    SizedBox(
                      width: double.infinity,
                      height: 46,
                      child: ElevatedButton(
                        onPressed: academic.isProjecting ? null : _calculateTargetGpa,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: academic.isProjecting
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : const Text('Calculate Projection', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
                      ),
                    ),

                    // Result Banner
                    if (projection != null) ...[
                      const SizedBox(height: 16),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: (projection['isPossible'] == true) ? AppTheme.successLight : AppTheme.dangerLight,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: (projection['isPossible'] == true) ? const Color(0xFFA7F3D0) : const Color(0xFFFECACA),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              (projection['isPossible'] == true)
                                  ? '🎉 Target Achievable!'
                                  : '⚠️ Target Out of Reach',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w900,
                                color: (projection['isPossible'] == true) ? AppTheme.success : AppTheme.danger,
                              ),
                            ),
                            const SizedBox(height: 6),
                            if (projection['requiredAverage'] != null)
                              Text(
                                'You need an average SGPA of ${(projection['requiredAverage'] as num).toStringAsFixed(2)} over your remaining credits to reach $_targetGpa OGPA.',
                                style: const TextStyle(fontSize: 13, height: 1.4, color: AppTheme.textPrimary),
                              )
                            else
                              const Text('Remaining credits are insufficient to reach this target.'),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Semester Breakdown Accordion
              const Text('Semester SGPA Breakdown', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppTheme.textPrimary)),
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
                  child: const Center(child: Text('No semester records found.', style: TextStyle(color: AppTheme.textSecondary))),
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
                            decoration: BoxDecoration(color: AppTheme.primaryLight, borderRadius: BorderRadius.circular(10)),
                            child: Center(child: Text('S$semKey', style: const TextStyle(fontWeight: FontWeight.w900, color: AppTheme.primary))),
                          ),
                          title: Text('Semester $semKey', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                          subtitle: Text('${semData.credits} Credits Counted', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(semData.sgpa.toStringAsFixed(2), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.primary)),
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
                                                    Text('${mod.credits} Credits • ${mod.isGpa ? "GPA" : "Non-GPA"}', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
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
                                                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: _getGradeColor(mod.grade)),
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
